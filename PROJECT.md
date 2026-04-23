# My VSCode Extensions

A monorepo for VSCode extension development, providing a flexible custom command execution tool and future extensions.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                 Apps Layer                       │
│  apps/my-commands/  (VSCode Extension + Webview) │
├─────────────────────────────────────────────────┤
│              Domain Logic Layer                  │
│  packages/core/  (VariableResolver, Shell, Exec) │
├─────────────────────────────────────────────────┤
│            Shared Infrastructure                 │
│  packages/tsconfig/  (Shared TS base configs)   │
└─────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Package Manager | pnpm (workspace) |
| Build Orchestration | Turborepo |
| Language | TypeScript 5.x |
| Extension Build | esbuild + tsc |
| Webview Build | Vite 5 + React 18 |
| Testing | Vitest 2 |
| UI Framework | @vscode/webview-ui-toolkit |

## Project Structure

```
.
├── apps/
│   └── my-commands/             # Command execution extension
│       ├── src/                 # Extension host code
│       │   ├── extension.ts     # Entry point
│       │   ├── commands.ts      # Command registration + execution
│       │   └── sidebar/         # Sidebar provider + message bus
│       ├── webview/             # React sidebar UI
│       │   ├── src/
│       │   │   ├── components/  # CommandList, CommandItem, CommandForm
│       │   │   ├── hooks/       # useVscodeMessaging
│       │   │   └── utils/       # VSCode API wrapper
│       │   └── vite.config.ts
│       └── package.json         # Extension manifest
├── packages/
│   ├── core/                    # Domain logic (zero VSCode deps)
│   │   ├── src/
│   │   │   ├── variable-resolver/  # 7 placeholder strategies
│   │   │   ├── shell-adapter/      # Unix/Windows adapters
│   │   │   └── command-executor/   # Async execution pipeline
│   │   └── __tests__/
│   ├── tsconfig/                # Shared TypeScript base configs
│   └── eslint-config/           # (future) Shared lint rules
├── .vscode/
│   ├── launch.json              # Debug configurations
│   └── tasks.json               # Build tasks
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 9.0.0
- VSCode >= 1.60.0

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev              # Watch mode for all packages
pnpm test             # Run all tests
pnpm build            # Build everything
pnpm clean            # Clean build artifacts
```

### Debugging

Press `F5` in VSCode to launch the extension in debug mode. The `.vscode/launch.json` provides two configurations:

- **Run Extension** — Launches VSCode with the extension loaded
- **Debug Webview** — Connects to the webview dev server for UI debugging

### Core Package Tests

```bash
pnpm test --filter=@suite/core
```

## Packages

### @suite/core

Pure Node.js domain logic package. Zero VSCode API dependencies.

**Exports:**
- `VariableResolver` — Strategy-pattern variable substitution engine
- `ShellAdapter` — Cross-platform shell execution adapter
- `CommandExecutor` — Async command execution with timeout/cancellation
- Output formatting utilities (`formatInfo`, `formatFile`, `formatStatus`, `timestamp`)

### my-commands

VSCode extension that provides:
- Sidebar panel for managing custom commands (React webview)
- Editor context menu for executing commands on the active file
- Real-time output in VSCode Output Channel
- Variable substitution system (`${file}`, `${workspaceFolder}`, etc.)
- 30-second timeout with cancellation support
- Cross-platform support (Windows/macOS/Linux)

### my-commands-webview

React webview application for the sidebar UI. Built with Vite.

### @suite/tsconfig

Shared TypeScript configuration. Provides `base.json` (Node.js) and `react.json` (React/Webview).

## Variable Substitution

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `${file}` | Absolute path of active file | `/Users/dev/project/src/app.js` |
| `${relativeFile}` | Path relative to workspace root | `src/app.js` |
| `${fileBasename}` | Filename with extension | `app.js` |
| `${fileBasenameNoExtension}` | Filename without extension | `app` |
| `${fileDirname}` | Directory of active file | `/Users/dev/project/src` |
| `${workspaceFolder}` | Workspace root path | `/Users/dev/project` |
| `${cwd}` | Current working directory | Dynamically computed |

**Default behavior:** If no `${}` placeholders are present in a command, `${relativeFile}` is automatically appended.

## Adding New Extensions

1. Create a new directory under `apps/`: `pnpm create vite apps/my-new-ext --template react-ts`
2. Add `"@suite/core": "workspace:*"` to `dependencies`
3. Add `"@suite/tsconfig": "workspace:*"` to `devDependencies`
4. Configure `tsconfig.json` to extend `@suite/tsconfig/base.json`
5. Add VSCode extension manifest fields to `package.json`

## Quality Gates

- [OK] Cross-platform: Paths handled correctly on Windows/macOS/Linux
- [OK] Security: All commands escaped via ShellAdapter
- [OK] Performance: Cold start < 100ms, non-blocking execution
- [OK] Tests: 26 unit tests for core logic (Vitest)
