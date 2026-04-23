# My Commands - User Guide

A VSCode extension for managing and executing custom commands on your active files.

## Features

- **Sidebar Management**: Add, edit, delete commands from a dedicated sidebar panel
- **Context Menu Execution**: Right-click any file to run configured commands
- **Variable Substitution**: Dynamic placeholders for file paths, workspace root, etc.
- **Real-time Output**: See command results in the Output panel
- **Cross-platform**: Works on Windows, macOS, and Linux

## Quick Start

### 1. Open the Sidebar

Click the gear icon in VSCode's Activity Bar (left sidebar) to open "My Commands".

### 2. Add a Command

Click "+ Add Command" and configure:

| Field | Description | Required |
|-------|-------------|----------|
| Display Name | Friendly name shown in QuickPick | Yes |
| Command | Shell command to execute | Yes |
| Working Directory | Where the command runs | Yes |

### 3. Run a Command

Open any file, right-click in the editor, and select **"My Commands"** from the context menu. A searchable QuickPick list appears — select a command to run.

### 4. View Results

The "My Commands" output channel opens automatically and shows:

```
[2026-04-23 10:30:00] [Info] Executing: tsc /Users/dev/project/src/app.ts
[File]: src/app.ts
--- stdout ---
<command output>
--- stderr ---
<error messages if any>
---
[Status]: Exit Code 0
```

## Variable Placeholders

Use these placeholders in your commands. They are replaced with actual values at execution time:

| Placeholder | What it is | Example |
|-------------|------------|---------|
| `${file}` | Full absolute path of the current file | `/Users/dev/project/src/app.ts` |
| `${relativeFile}` | Path relative to workspace root | `src/app.ts` |
| `${fileBasename}` | Filename with extension | `app.ts` |
| `${fileBasenameNoExtension}` | Filename without extension | `app` |
| `${fileDirname}` | Directory containing the current file | `/Users/dev/project/src` |
| `${workspaceFolder}` | Root path of the current workspace | `/Users/dev/project` |
| `${cwd}` | The working directory (matches your config) | depends on Working Directory setting |

**Tip:** If you type a command without any `${}` placeholders, the extension automatically appends the relative file path.

### Examples

```bash
# Compile TypeScript file
tsc ${file} --outDir dist

# Run tests for the current file
jest ${relativeFile}

# Open file in browser
open ${file}          # macOS
start ${file}         # Windows
xdg-open ${file}      # Linux

# Lint current file with eslint
eslint ${file} --fix

# Format with prettier
prettier --write ${file}

# Run npm script (no variables, auto-appends relative file path)
npm run build         # runs: npm run build src/app.ts
```

## Working Directory

The "Working Directory" setting controls where the command executes:

| Option | CWD becomes |
|--------|-------------|
| Workspace Root | The root folder of your open project |
| File Directory | The directory containing the active file |
| Custom | A path you specify |

## Timeout and Cancellation

Commands have a **30-second timeout**. Long-running commands can be cancelled by clicking the progress notification in VSCode's status bar.

## Managing Commands

### Edit

Click "Edit" on any command in the sidebar to modify its settings.

### Delete

Click "Delete" to remove a command. Changes are saved immediately.

### Persistence

All commands are saved automatically and survive VSCode restarts.

## Troubleshooting

### Command not found

Make sure the command is available in your system PATH. Use absolute paths if needed:
```bash
/usr/local/bin/node ${file}
```

### Path with spaces

The extension automatically escapes paths with spaces. No extra quoting needed.

### No commands appear in QuickPick

Check that commands exist in the sidebar panel. The QuickPick shows a message if no commands are configured.

### Right-click menu not visible

The context menu only appears when:
- A file is open in the editor
- The file is from the local filesystem (not remote/untitled)
