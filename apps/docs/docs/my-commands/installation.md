# 安装

## 前置要求

- VSCode 1.60.0 或更高版本
- 任一受支持的操作系统（Windows / macOS / Linux）

## 安装方式

### 从 VSIX 安装

1. 在 [Releases](/my-commands/) 页面下载最新的 `.vsix` 文件。
2. 打开 VSCode，运行命令 `Extensions: Install from VSIX`。
3. 选择下载的 `.vsix` 文件完成安装。

### 从源码构建

```bash
pnpm install
pnpm build
pnpm package:my-commands
```

构建完成后会在 `apps/my-commands/` 生成 `.vsix` 文件，按上述 VSIX 方式安装。

## 验证

安装后侧边栏会出现 **my-commands** 图标，点击即可打开命令管理面板。