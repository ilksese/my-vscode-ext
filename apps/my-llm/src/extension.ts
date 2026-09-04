import * as vscode from 'vscode';
import { streamText, tool, jsonSchema } from 'ai';
import type { LanguageModel, ModelMessage, ToolSet } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

type ApiProtocol = 'openai' | 'openai-compatible';

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

interface ProviderConfig {
  id: string;
  name?: string;
  baseUrl: string;
  apiKey: string;
  apiProtocol?: ApiProtocol;
  models: ModelConfig[];
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
}

type ProviderType = vscode.LanguageModelChatProvider<vscode.LanguageModelChatInformation>;

class LLMProvider implements ProviderType {
  private readonly onChange = new vscode.EventEmitter<void>();
  readonly onDidChangeLanguageModelChatInformation: vscode.Event<void> = this.onChange.event;

  private readonly toolNames = new Map<string, string>();
  private readonly pendingToolNames = new Set<string>();

  private metadata?: MetadataCache;

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
      for (const m of p.models) {
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
        });
      }
    }
    return out;
  }

  private findModel(modelId: string): ResolvedModel | undefined {
    return this.resolveModels().find((m) => m.id === modelId);
  }

  provideLanguageModelChatInformation(): vscode.LanguageModelChatInformation[] {
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
    signal: AbortSignal
  ): Promise<void> {
    const tools: ToolSet = {};
    for (const t of options.tools ?? []) {
      tools[t.name] = tool({
        description: t.description,
        inputSchema: jsonSchema((t.inputSchema ?? { type: 'object', properties: {} }) as Parameters<typeof jsonSchema>[0]),
      });
    }

    const result = streamText({
      model: sdkModel(m),
      messages: this.toSDKMessages(messages),
      tools: Object.keys(tools).length ? tools : undefined,
      toolChoice: options.toolMode === vscode.LanguageModelChatToolMode.Required ? 'required' : undefined,
      abortSignal: signal,
    });

    for await (const part of result.fullStream) {
      if (part.type === 'text-delta') {
        progress.report(new vscode.LanguageModelTextPart(part.text));
      } else if (part.type === 'tool-call') {
        const call = part as unknown as { toolCallId: string; toolName: string; input?: unknown };
        this.toolNames.set(call.toolCallId, call.toolName);
        this.pendingToolNames.add(call.toolCallId);
        progress.report(new vscode.LanguageModelToolCallPart(call.toolCallId, call.toolName, call.input ?? {}));
      }
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

  private toSDKMessages(messages: readonly vscode.LanguageModelChatRequestMessage[]): ModelMessage[] {
    const out: ModelMessage[] = [];
    for (const msg of messages) {
      if (msg.role === vscode.LanguageModelChatMessageRole.User) {
        out.push({ role: 'user', content: this.toUserContent(msg.content) } as ModelMessage);
      } else {
        const content: unknown[] = [];
        for (const part of msg.content) {
          if (part instanceof vscode.LanguageModelTextPart) {
            content.push({ type: 'text', text: part.value });
          } else if (part instanceof vscode.LanguageModelToolCallPart) {
            content.push({ type: 'tool-call', toolCallId: part.callId, toolName: part.name, input: part.input });
          } else if (part instanceof vscode.LanguageModelToolResultPart) {
            out.push({
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
        if (content.length) out.push({ role: 'assistant', content: content as never } as ModelMessage);
      }
    }
    return out;
  }

  private toUserContent(content: readonly unknown[]): unknown[] {
    const parts: unknown[] = [];
    for (const part of content) {
      if (part instanceof vscode.LanguageModelTextPart) {
        parts.push({ type: 'text', text: part.value });
      } else if (part instanceof vscode.LanguageModelDataPart) {
        parts.push({ type: 'image', image: part.data, mediaType: part.mimeType });
      }
    }
    return parts;
  }
}

/* ---------- protocol -> AI SDK model ---------- */

function sdkModel(m: ResolvedModel): LanguageModel {
  const base = sdkBaseURL(m);
  switch (m.protocol) {
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

function toToolOutput(content: unknown[]): unknown {
  if (content.length === 1 && typeof content[0] === 'string') return { type: 'text', value: content[0] };
  return { type: 'json', value: content };
}

export function activate(context: vscode.ExtensionContext): void {
  const provider = new LLMProvider(context);
  provider.loadCachedMetadata();
  vscode.lm.registerLanguageModelChatProvider('my-llm', provider);
  context.subscriptions.push(vscode.commands.registerCommand('my-llm.patchModel', () => provider.patchModel()));
}

export function deactivate(): void {}
