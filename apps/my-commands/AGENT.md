# Agent Instructions for my-commands

## Project Overview

VSCode extension providing custom command execution via sidebar management and editor context menu.

## Architecture

```
apps/my-commands/src/        ← Extension host (VSCode API)
  extension.ts               ← Entry, activates commands + sidebar
  commands.ts                ← QuickPick + command execution flow
  sidebar/
    sidebar-provider.ts      ← WebviewViewProvider, hosts React UI
    message-bus.ts           ← Type-safe webview ↔ extension messaging

apps/my-commands/webview/src/ ← React sidebar UI (browser runtime)
  components/
    CommandList.tsx          ← Displays commands or empty state
    CommandItem.tsx          ← Single command row with edit/delete
    CommandForm.tsx          ← Add/edit form with validation
  hooks/
    useVscodeMessaging.ts    ← Encapsulates postMessage/onMessage
  utils/
    vscode.ts                ← acquireVsCodeApi wrapper
```

## Key Constraints

- **Extension host** runs in Node.js 18+ — can use `child_process`, `path`, etc.
- **Webview** runs in browser — NO Node.js imports, NO `require()`
- **Core package** (`@suite/core`) has zero VSCode dependencies — pure Node.js
- **Message protocol** is typed: `WebviewMessage` ↔ `VscodeMessage`

## Build Commands

```bash
pnpm build            # Build extension + webview
npx tsc --build       # TypeScript only (no webview)
pnpm exec vite build  # Webview only
```

## Debugging

Press F5 → "Run Extension" launches VSCode with extension loaded.

## Extension Manifest

Located in `apps/my-commands/package.json` under `"contributes"`:
- Commands: `myCommands.runFromMenu`, `myCommands.openSidebar`
- Context menu: `editor/context` with `when: "editorFocus && resourceScheme == 'file'"`
- Sidebar: `myCommandsSidebar` webview view
- Activation: `onView:myCommandsSidebar` + `onCommand:myCommands.runFromMenu`

## Variable Substitution

Commands support `${file}`, `${relativeFile}`, `${fileBasename}`, `${fileBasenameNoExtension}`, `${fileDirname}`, `${workspaceFolder}`, `${cwd}`. Auto-appends `${relativeFile}` if no placeholders present.
