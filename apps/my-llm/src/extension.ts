import * as vscode from 'vscode';
import { streamText, tool, jsonSchema } from 'ai';
import type { LanguageModel, ModelMessage, ToolSet } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

type ApiProtocol = 'openai' | 'openai-compatible';

const REASONING_EFFORTS = ['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'] as const;
type ReasoningEffort = (typeof REASONING_EFFORTS)[number];

interface ModelConfig {
  id: string;
  name?: string;
  family?: string;
  version?: string;
  apiProtocol?: ApiProtocol;
  maxInputTokens?: number;
  maxOutputTokens?: number;
  toolCalling?: boolean;
  imageInput?: boolean;
  pricing?: ModelPricing;
  defaultReasoningEffort?: ReasoningEffort;
  reasoningEfforts?: ReasoningEffort[];
}

interface ModelPricing {
  input?: number;
  output?: number;
  cacheRead?: number;
}

interface ModelMetadata {
  c?: number;
  o?: number;
  t?: boolean;
  i?: boolean;
  pin?: number;
  pout?: number;
  pc?: number;
}

interface MetadataCache {
  fetchedAt: number;
  models: Record<string, ModelMetadata>;
}

const METADATA_KEY = 'my-llm.metadata';
const METADATA_URL = 'https://models.dev/api.json';

interface AutoModelsCache {
  [providerId: string]: { fetchedAt: number; ids: string[] };
}

const AUTOMODELS_KEY = 'my-llm.automodels';

interface ProviderConfig {
  id: string;
  name?: string;
  baseUrl: string;
  apiKey: string;
  apiProtocol?: ApiProtocol;
  models?: ModelConfig[];
}

interface ResolvedModel {
  id: string;
  name: string;
  detail: string;
  tooltip?: string;
  family: string;
  version: string;
  baseUrl: string;
  apiKey: string;
  protocol: ApiProtocol;
  maxInputTokens: number;
  maxOutputTokens: number;
  toolCalling: boolean;
  imageInput: boolean;
  inputCost?: number;
  outputCost?: number;
  cacheCost?: number;
  defaultReasoningEffort?: ReasoningEffort;
  reasoningEfforts?: ReasoningEffort[];
}

type ProviderType = vscode.LanguageModelChatProvider<vscode.LanguageModelChatInformation>;

class LLMProvider implements ProviderType {
  private readonly onChange = new vscode.EventEmitter<void>();
  readonly onDidChangeLanguageModelChatInformation: vscode.Event<void> = this.onChange.event;

  private readonly toolNames = new Map<string, string>();
  private readonly pendingToolNames = new Set<string>();

  private metadata?: MetadataCache;
  private autoModels?: AutoModelsCache;
  private readonly fetchingModels = new Set<string>();
  private readonly fetchFailed = new Set<string>();

  constructor(private readonly context: vscode.ExtensionContext) {
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('my-llm.providers')) {
        this.onChange.fire();
      }
    });
  }

  private getConfigs(): ProviderConfig[] {
    return vscode.workspace.getConfiguration('my-llm').get<ProviderConfig[]>('providers', []);
  }

  loadCachedMetadata(): void {
    this.metadata = this.context.globalState.get<MetadataCache>(METADATA_KEY);
    this.autoModels = this.context.globalState.get<AutoModelsCache>(AUTOMODELS_KEY);
  }

  /* models 未配置（缺省或空数组）的 provider：从 GET {baseUrl}/models 自动发现模型。
     每个会话首次 provide 时拉取一次并写入 globalState；先返回缓存列表，拉完触发 onChange 刷新。 */
  private refreshAutoModels(): void {
    for (const p of this.getConfigs()) {
      if (p.models?.length || this.fetchingModels.has(p.id) || this.fetchFailed.has(p.id)) continue;
      this.fetchAutoModels(p);
    }
  }

  private async fetchAutoModels(p: ProviderConfig): Promise<void> {
    this.fetchingModels.add(p.id);
    try {
      const url = `${p.baseUrl.replace(/\/+$/, '')}/models`;
      const r = await fetch(url, { headers: { Authorization: `Bearer ${p.apiKey}` } });
      if (!r.ok) throw new Error(`${url} responded ${r.status}`);
      const raw = (await r.json()) as { data?: { id?: unknown }[] };
      const ids = [...new Set((raw.data ?? []).map((m) => String(m.id)).filter((id) => id && !/\s/.test(id)))];
      this.autoModels = { ...this.autoModels, [p.id]: { fetchedAt: Date.now(), ids } };
      await this.context.globalState.update(AUTOMODELS_KEY, this.autoModels);
      this.onChange.fire();
    } catch (e) {
      this.fetchFailed.add(p.id);
      const msg = e instanceof Error ? e.message : String(e);
      const cause = e instanceof Error ? unwrapCause(e) : '';
      vscode.window.showWarningMessage(`My LLM: failed to fetch models for provider "${p.id}": ${msg}${cause}`);
    } finally {
      this.fetchingModels.delete(p.id);
    }
  }

  async patchModel(): Promise<void> {
    try {
      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'My LLM: fetching models.dev metadata' },
        async () => {
          const r = await fetch(METADATA_URL);
          if (!r.ok) throw new Error(`models.dev responded ${r.status}`);
          const raw = (await r.json()) as Record<string, { models?: Record<string, RawModelsDevModel> }>;
          this.metadata = flattenModelsDev(raw);
          await this.context.globalState.update(METADATA_KEY, this.metadata);
          this.onChange.fire();
        }
      );
      vscode.window.showInformationMessage('My LLM: model metadata patched from models.dev');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const cause = e instanceof Error ? unwrapCause(e) : '';
      vscode.window.showErrorMessage(`My LLM: failed to patch model metadata: ${msg}${cause}`);
    }
  }

  private matchMetadata(id: string): ModelMetadata | undefined {
    const models = this.metadata?.models;
    if (!models) return undefined;
    const key = id.toLowerCase();
    if (models[key]) return models[key];
    let best: string | undefined;
    for (const k of Object.keys(models)) {
      if ((k.includes(key) || key.includes(k)) && (best === undefined || k.length > best.length)) best = k;
    }
    return best ? models[best] : undefined;
  }

  private resolveModels(): ResolvedModel[] {
    const out: ResolvedModel[] = [];
    for (const p of this.getConfigs()) {
      const list: ModelConfig[] = p.models?.length
        ? p.models
        : (this.autoModels?.[p.id]?.ids ?? []).map((id) => ({ id }));
      for (const m of list) {
        const meta = this.matchMetadata(m.id);
        const pricing = m.pricing ?? metaPricing(meta);
        out.push({
          id: m.id,
          name: m.name ?? m.id,
          detail: p.name ?? p.id,
          tooltip: pricingTooltip(pricing),
          family: m.family ?? m.id,
          version: m.version ?? '1.0.0',
          baseUrl: p.baseUrl,
          apiKey: p.apiKey,
          protocol: m.apiProtocol ?? p.apiProtocol ?? 'openai',
          maxInputTokens: m.maxInputTokens ?? meta?.c ?? 128000,
          maxOutputTokens: m.maxOutputTokens ?? meta?.o ?? 4096,
          toolCalling: m.toolCalling ?? meta?.t ?? false,
          imageInput: m.imageInput ?? meta?.i ?? false,
          inputCost: pricing?.input,
          outputCost: pricing?.output,
          cacheCost: pricing?.cacheRead,
          defaultReasoningEffort: m.defaultReasoningEffort,
          reasoningEfforts: m.reasoningEfforts,
        });
      }
    }
    return out;
  }

  private findModel(modelId: string): ResolvedModel | undefined {
    return this.resolveModels().find((m) => m.id === modelId);
  }

  async provideLanguageModelChatInformation(): Promise<vscode.LanguageModelChatInformation[]> {
    this.refreshAutoModels();
    return this.resolveModels().map((m) => ({
      id: m.id,
      name: m.name,
      detail: m.detail,
      tooltip: m.tooltip,
      family: m.family,
      version: m.version,
      capabilities: { toolCalling: m.toolCalling, imageInput: m.imageInput },
      maxInputTokens: m.maxInputTokens,
      maxOutputTokens: m.maxOutputTokens,
      inputCost: m.inputCost,
      outputCost: m.outputCost,
      cacheCost: m.cacheCost,
      configurationSchema: reasoningEffortSchema(m),
    }));
  }

  async provideLanguageModelChatResponse(
    model: vscode.LanguageModelChatInformation,
    messages: readonly vscode.LanguageModelChatRequestMessage[],
    options: vscode.ProvideLanguageModelChatResponseOptions,
    progress: vscode.Progress<vscode.LanguageModelResponsePart>,
    token: vscode.CancellationToken
  ): Promise<void> {
    const m = this.findModel(model.id);
    if (!m) {
      throw new Error(`No configured provider for model "${model.id}"`);
    }

    const controller = new AbortController();
    const cancelSub = token.onCancellationRequested(() => controller.abort());
    try {
      await this.streamResponse(m, messages, options, progress, controller.signal);
    } finally {
      cancelSub.dispose();
      for (const id of this.pendingToolNames) this.toolNames.delete(id);
      this.pendingToolNames.clear();
    }
  }

  private async streamResponse(
    m: ResolvedModel,
    messages: readonly vscode.LanguageModelChatRequestMessage[],
    options: vscode.ProvideLanguageModelChatResponseOptions,
    progress: vscode.Progress<vscode.LanguageModelResponsePart>,
    signal: AbortSignal,
    protocol?: ApiProtocol
  ): Promise<void> {
    const tools: ToolSet = {};
    for (const t of options.tools ?? []) {
      tools[t.name] = tool({
        description: t.description,
        inputSchema: jsonSchema((t.inputSchema ?? { type: 'object', properties: {} }) as Parameters<typeof jsonSchema>[0]),
      });
    }
    const effective = protocol ?? m.protocol;

    const result = streamText({
      model: sdkModel(m, effective),
      messages: this.toSDKMessages(messages),
      tools: Object.keys(tools).length ? tools : undefined,
      toolChoice: options.toolMode === vscode.LanguageModelChatToolMode.Required ? 'required' : undefined,
      providerOptions: this.providerOptions(m, options, effective),
      abortSignal: signal,
    });

    try {
      for await (const part of result.fullStream) {
        if (part.type === 'text-delta') {
          progress.report(new vscode.LanguageModelTextPart(part.text));
        } else if (part.type === 'tool-call') {
          const call = part as unknown as { toolCallId: string; toolName: string; input?: unknown };
          this.toolNames.set(call.toolCallId, call.toolName);
          this.pendingToolNames.add(call.toolCallId);
          progress.report(new vscode.LanguageModelToolCallPart(call.toolCallId, call.toolName, call.input ?? {}));
        } else if (part.type === 'error') {
          // AI SDK v5 不抛异常：doStream 失败（404 等）和 InvalidPromptError 都作为 error part 进流
          throw (part as { error?: unknown }).error ?? new Error('unknown stream error');
        }
      }
    } catch (e) {
      // 诊断辅助：把实际发送的消息与完整 cause 链打进 exthost console（renderer.log 可见）
      const msg = e instanceof Error ? e.message : String(e);
      const cause = e instanceof Error ? unwrapCause(e) : '';
      console.error(`[my-llm] stream failed for ${m.id}: ${msg}${cause}`, JSON.stringify(this.toSDKMessages(messages)).slice(0, 4000));
      // ponytail: 网关常只给部分模型开 /responses，404/405 时降级 chat completions 重试一次
      const status = (e as { statusCode?: number }).statusCode;
      if (!protocol && m.protocol === 'openai' && (status === 404 || status === 405)) {
        return this.streamResponse(m, messages, options, progress, signal, 'openai-compatible');
      }
      throw e;
    }
  }

  provideTokenCount(
    _model: vscode.LanguageModelChatInformation,
    text: string | vscode.LanguageModelChatRequestMessage
  ): Thenable<number> {
    const source = typeof text === 'string' ? text : text.content.map((c) => String(c)).join(' ');
    return Promise.resolve(Math.ceil(source.length / 4));
  }

  /* ---------- vscode parts -> AI SDK messages ---------- */

  private providerOptions(
    m: ResolvedModel,
    options: vscode.ProvideLanguageModelChatResponseOptions,
    protocol?: ApiProtocol
  ): Record<string, Record<string, string>> {
    // modelConfiguration 是未文档化字段：VS Code 把模型配置 UI / agent frontmatter 里的
    // reasoning-effort 以 options.modelConfiguration 形式传入（见 extensionHostProcess.js）
    const configured = (options as { modelConfiguration?: { reasoningEffort?: string } }).modelConfiguration
      ?.reasoningEffort;
    const effort = configured ?? m.defaultReasoningEffort;
    if (!effort) return {};
    const p = protocol ?? m.protocol;
    return p === 'openai' ? { openai: { reasoningEffort: effort } } : { 'my-llm': { reasoningEffort: effort } };
  }

  /* VS Code 的工具结果可能出现在 User 角色消息里（见 vscode.d.ts 对 toolMode 的说明），
     两种角色都要处理；且 assistant(tool-call) 消息必须先于 tool 输出消息。 */
  private toSDKMessages(messages: readonly vscode.LanguageModelChatRequestMessage[]): ModelMessage[] {
    const out: ModelMessage[] = [];
    for (const msg of messages) {
      const isUser = msg.role === vscode.LanguageModelChatMessageRole.User;
      const assistantContent: unknown[] = [];
      const userContent: unknown[] = [];
      const toolMsgs: ModelMessage[] = [];
      for (const part of msg.content) {
        if (part instanceof vscode.LanguageModelTextPart) {
          (isUser ? userContent : assistantContent).push({ type: 'text', text: part.value });
        } else if (part instanceof vscode.LanguageModelDataPart) {
          if (isUser) userContent.push({ type: 'image', image: part.data, mediaType: part.mimeType });
        } else if (part instanceof vscode.LanguageModelToolCallPart) {
          assistantContent.push({ type: 'tool-call', toolCallId: part.callId, toolName: part.name, input: part.input });
        } else if (part instanceof vscode.LanguageModelToolResultPart) {
          toolMsgs.push({
            role: 'tool',
            content: [
              {
                type: 'tool-result',
                toolCallId: part.callId,
                toolName: this.toolNames.get(part.callId) ?? 'tool',
                output: toToolOutput(part.content),
              },
            ],
          } as ModelMessage);
        }
      }
      if (assistantContent.length) out.push({ role: 'assistant', content: assistantContent as never } as ModelMessage);
      out.push(...toolMsgs);
      if (isUser && userContent.length) out.push({ role: 'user', content: userContent } as ModelMessage);
    }
    return out;
  }
}

/* ---------- protocol -> AI SDK model ---------- */

function sdkModel(m: ResolvedModel, protocol?: ApiProtocol): LanguageModel {
  const base = sdkBaseURL(m);
  switch (protocol ?? m.protocol) {
    case 'openai':
      return createOpenAI({ baseURL: base, apiKey: m.apiKey }).responses(m.id);
    case 'openai-compatible':
      return createOpenAICompatible({ name: 'my-llm', baseURL: base, apiKey: m.apiKey }).chatModel(m.id);
  }
}

function unwrapCause(e: Error): string {
  const parts: string[] = [];
  let c: unknown = e.cause;
  while (c instanceof Error) {
    parts.push(c.message);
    c = c.cause;
  }
  return parts.length ? ` (${parts.join(' <- ')})` : '';
}

function sdkBaseURL(m: ResolvedModel): string {
  return m.baseUrl.replace(/\/+$/, '');
}

function pricingTooltip(p?: ModelPricing): string | undefined {
  if (!p || (p.input === undefined && p.output === undefined)) return undefined;
  const fmt = (v?: number) => (v === undefined ? '?' : `$${v}`);
  return `Pricing: ${fmt(p.input)}/M input · ${fmt(p.output)}/M output`;
}

function reasoningEffortSchema(m: ResolvedModel): object {
  const efforts = m.reasoningEfforts?.length ? m.reasoningEfforts : [...REASONING_EFFORTS];
  const fallback = efforts[0] ?? 'medium';
  const dflt = m.defaultReasoningEffort && efforts.includes(m.defaultReasoningEffort) ? m.defaultReasoningEffort : fallback;
  return {
    type: 'object',
    properties: {
      reasoningEffort: {
        type: 'string',
        enum: efforts,
        default: dflt,
        description: '思考强度（reasoning effort），由 My LLM 透传给模型 API',
      },
    },
  };
}

function metaPricing(m?: ModelMetadata): ModelPricing | undefined {
  if (!m || (m.pin === undefined && m.pout === undefined && m.pc === undefined)) return undefined;
  return { input: m.pin, output: m.pout, cacheRead: m.pc };
}

interface RawModelsDevModel {
  limit?: { context?: number; output?: number };
  tool_call?: boolean;
  modalities?: { input?: string[] };
  cost?: { input?: number; output?: number; cache_read?: number };
}

function flattenModelsDev(raw: Record<string, { models?: Record<string, RawModelsDevModel> }>): MetadataCache {
  const models: Record<string, ModelMetadata> = {};
  for (const p of Object.values(raw)) {
    for (const [id, m] of Object.entries(p.models ?? {})) {
      models[id.toLowerCase()] = {
        c: m.limit?.context,
        o: m.limit?.output,
        t: m.tool_call,
        i: m.modalities?.input?.includes('image') ?? false,
        pin: m.cost?.input,
        pout: m.cost?.output,
        pc: m.cost?.cache_read,
      };
    }
  }
  return { fetchedAt: Date.now(), models };
}

/* AI SDK 的 jsonValueSchema 拒绝 Uint8Array/undefined 等（会触发 InvalidPromptError），
   所以工具输出必须先转成纯 JSON 值 */
function toToolOutput(content: unknown[]): unknown {
  const parts = content.map((c) => {
    if (typeof c === 'string') return c;
    if (c instanceof vscode.LanguageModelTextPart) return c.value;
    if (c instanceof vscode.LanguageModelDataPart) {
      return { type: 'media', mimeType: c.mimeType, dataBase64: Buffer.from(c.data).toString('base64') };
    }
    return jsonSafe(c);
  });
  if (parts.length === 1 && typeof parts[0] === 'string') return { type: 'text', value: parts[0] };
  return { type: 'json', value: parts };
}

function jsonSafe(v: unknown): unknown {
  return JSON.parse(
    JSON.stringify(v ?? null, (_k, val) => (val instanceof Uint8Array ? { base64: Buffer.from(val).toString('base64') } : val))
  );
}

export function activate(context: vscode.ExtensionContext): void {
  const provider = new LLMProvider(context);
  provider.loadCachedMetadata();
  vscode.lm.registerLanguageModelChatProvider('my-llm', provider);
  context.subscriptions.push(vscode.commands.registerCommand('my-llm.patchModel', () => provider.patchModel()));
}

export function deactivate(): void {}
