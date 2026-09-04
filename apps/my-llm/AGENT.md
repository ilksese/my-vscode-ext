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
未配置的字段可由命令 `my-llm: patch model` 从 models.dev 拉取补全；数据缓存于 globalState，永久有效，无自动拉取。
思考强度：`defaultReasoningEffort` 为模型级默认值；`reasoningEfforts`（缺省全量 7 档）限定模型配置 UI 中的可选项；请求时被 VS Code 内部 `options.modelConfiguration.reasoningEffort`（模型配置 UI / agent frontmatter `reasoning-effort`）覆盖，通过 `configurationSchema` 暴露给 VS Code。均未设置时不发送 reasoning 参数。
