# Agent Instructions for my-llm

## Project Overview

VSCode extension registering a custom language model chat provider (`my-llm`) that forwards requests
to any OpenAI-compatible `/chat/completions` endpoint. No GUI — configured via `settings.json`.

## Key Constraints

- Extension host runs in Node.js 18+ — uses global `fetch`/`ReadableStream`, no Node fetch dependency.
- Depends on VS Code API `lm.registerLanguageModelChatProvider` (VS Code >= 1.134).
- Config schema: `my-llm.providers[]` with `baseUrl`, `apiKey`, `models[]`.
- Single provider registered under vendor `my-llm`; each model maps back to its provider config by `model.id`.

## Build Commands

```bash
pnpm build            # tsdown -> dist/extension.js
pnpm package          # vsce package -> my-llm-0.0.1.vsix
```

## Config Example

```jsonc
"my-llm.providers": [
  {
    "id": "my-openai",
    "baseUrl": "https://api.openai.com/v1",
    "apiKey": "sk-...",
    "models": [{ "id": "gpt-4o-mini", "toolCalling": true }]
  }
]
```
`apiProtocol` 未设置时兜底为 `openai`；可在 provider 与 model 两层设置（model 优先）。
上下文大小（`maxInputTokens`/`maxOutputTokens`）、能力（`toolCalling`/`imageInput`）与 `pricing` 是模型级配置，只能配在 model 上。
