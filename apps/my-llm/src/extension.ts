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
}

interface ProviderConfig {
  id: string;
  name?: string;
  baseUrl: string;
  apiKey: string;
  apiProtocol?: ApiProtocol;
  models: ModelConfig[];
  maxInputTokens?: number;
  maxOutputTokens?: number;
  toolCalling?: boolean;
  imageInput?: boolean;
}

interface ResolvedModel {
  id: string;
  name: string;
  detail: string;
  family: string;
  version: string;
  baseUrl: string;
  apiKey: string;
  protocol: ApiProtocol;
  maxInputTokens: number;
  maxOutputTokens: number;
  toolCalling: boolean;
  imageInput: boolean;
}

type ProviderType = vscode.LanguageModelChatProvider<vscode.LanguageModelChatInformation>;

class LLMProvider implements ProviderType {
  private readonly onChange = new vscode.EventEmitter<void>();
  readonly onDidChangeLanguageModelChatInformation: vscode.Event<void> = this.onChange.event;

  private readonly toolNames = new Map<string, string>();
  private readonly pendingToolNames = new Set<string>();

  constructor() {
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('my-llm.providers')) {
        this.onChange.fire();
      }
    });
  }

  private getConfigs(): ProviderConfig[] {
    return vscode.workspace.getConfiguration('my-llm').get<ProviderConfig[]>('providers', []);
  }

  private resolveModels(): ResolvedModel[] {
    const out: ResolvedModel[] = [];
    for (const p of this.getConfigs()) {
      for (const m of p.models) {
        out.push({
          id: m.id,
          name: m.name ?? m.id,
          detail: p.name ?? p.id,
          family: m.family ?? m.id,
          version: m.version ?? '1.0.0',
          baseUrl: p.baseUrl,
          apiKey: p.apiKey,
          protocol: m.apiProtocol ?? p.apiProtocol ?? 'openai',
          maxInputTokens: p.maxInputTokens ?? 128000,
          maxOutputTokens: p.maxOutputTokens ?? 4096,
          toolCalling: p.toolCalling ?? false,
          imageInput: p.imageInput ?? false,
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
      family: m.family,
      version: m.version,
      capabilities: { toolCalling: m.toolCalling, imageInput: m.imageInput },
      maxInputTokens: m.maxInputTokens,
      maxOutputTokens: m.maxOutputTokens,
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

function sdkBaseURL(m: ResolvedModel): string {
  return m.baseUrl.replace(/\/+$/, '');
}

function toToolOutput(content: unknown[]): unknown {
  if (content.length === 1 && typeof content[0] === 'string') return { type: 'text', value: content[0] };
  return { type: 'json', value: content };
}

export function activate(_context: vscode.ExtensionContext): void {
  vscode.lm.registerLanguageModelChatProvider('my-llm', new LLMProvider());
}

export function deactivate(): void {}
