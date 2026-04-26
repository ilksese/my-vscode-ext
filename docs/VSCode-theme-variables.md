# VS Code WebView CSS 变量参考

本文档列出了 VS Code WebView 中可用的所有 CSS 变量。这些变量会自动注入到 WebView 的 `:root` 元素中。

## 使用方法

```css
/* 变量名格式：将 . 替换为 - */
--vscode-editor-foreground  /* 对应 theme colors: editor.foreground */
--vscode-sideBar-background  /* 对应 theme colors: sideBar.background */
```

## Theme Class

VS Code 还会给 body 添加主题类名：

```css
body.vscode-dark     /* 深色主题 */
body.vscode-light   /* 浅色主题 */
body.vscode-high-contrast  /* 高对比度主题 */
```

还可以通过 `data-vscode-theme-id` 属性获取主题 ID：

```css
body[data-vscode-theme-id="One Dark Pro"] {
  background: hotpink;
}
```

## 完整变量列表

> 以下变量列表整理自 [VS Code Theme Variables Gist](https://gist.github.com/estruyf/ba49203e1a7d6868e9320a4ea480c27a)

### 基础颜色 (Base)

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-foreground` | 整体前景色 |
| `--vscode-errorForeground` | 错误前景色 |
| `--vscode-descriptionForeground` | 描述前景色 |
| `--vscode-icon-foreground` | 图标前景色 |
| `--vscode-focusBorder` | 聚焦边框色 |
| `--vscode-selection-background` | 选中背景色 |
| `--vscode-textSeparator-foreground` | 文本分隔符前景色 |
| `--vscode-textLink-foreground` | 文本链接前景色 |
| `--vscode-textLink-activeForeground` | 文本链接激活前景色 |
| `--vscode-textPreformat-foreground` | 预格式化文本前景色 |
| `--vscode-textBlockQuote-background` | 引用块背景色 |
| `--vscode-textBlockQuote-border` | 引用块边框色 |
| `--vscode-textCodeBlock-background` | 代码块背景色 |

### Activity Bar

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-activityBar-background` | 活动栏背景色 |
| `--vscode-activityBar-foreground` | 活动栏前景色 |
| `--vscode-activityBar-inactiveForeground` | 活动栏非激活前景色 |
| `--vscode-activityBar-activeBorder` | 活动栏激活边框色 |
| `--vscode-activityBar-activeBackground` | 活动栏激活背景色 |
| `--vscode-activityBarBadge-background` | 活动栏徽章背景色 |
| `--vscode-activityBarBadge-foreground` | 活动栏徽章前景色 |

### Banner

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-banner-background` | 横幅背景色 |
| `--vscode-banner-foreground` | 横幅前景色 |
| `--vscode-banner-iconForeground` | 横幅图标前景色 |

### Breadcrumb

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-breadcrumb-background` | 面包屑背景色 |
| `--vscode-breadcrumb-foreground` | 面包屑前景色 |
| `--vscode-breadcrumbHover-background` | 面包屑悬停背景色 |
| `--vscode-breadcrumbHover-foreground` | 面包屑悬停前景色 |
| `--vscode-breadcrumbFocus-background` | 面包屑聚焦背景色 |
| `--vscode-breadcrumbFocus-foreground` | 面包屑聚焦前景色 |

### Button

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-button-background` | 按钮背景色 |
| `--vscode-button-foreground` | 按钮前景色 |
| `--vscode-button-hoverBackground` | 按钮悬停背景色 |
| `--vscode-button-secondaryBackground` | 次级按钮背景色 |
| `--vscode-button-secondaryForeground` | 次级按钮前景色 |
| `--vscode-button-secondaryHoverBackground` | 次级按钮悬停背景色 |
| `--vscode-button-prominentBackground` | 突出按钮背景色 |
| `--vscode-button-prominentForeground` | 突出按钮前景色 |
| `--vscode-button-prominentHoverBackground` | 突出按钮悬停背景色 |

### Debug

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-debugView-exceptionLabelForeground` | 异常标签前景色 |
| `--vscode-debugView-exceptionLabelBackground` | 异常标签背景色 |
| `--vscode-debugView-stateLabelForeground` | 状态标签前景色 |
| `--vscode-debugView-stateLabelBackground` | 状态标签背景色 |
| `--vscode-debugTokenExpression-foreground` | 表达式前景色 |
| `--vscode-debugTokenExpression-value` | 表达式值颜色 |
| `--vscode-debugTokenExpression-string` | 表达式字符串颜色 |
| `--vscode-debugTokenExpression-boolean` | 表达式布尔颜色 |
| `--vscode-debugTokenExpression-number` | 表达式数字颜色 |
| `--vscode-debugTokenExpression-keyword` | 表达式关键字颜色 |
| `--vscode-debugConsole-infoForeground` | 控制台信息前景色 |
| `--vscode-debugConsole-warningForeground` | 控制台警告前景色 |
| `--vscode-debugConsole-errorForeground` | 控制台错误前景色 |
| `--vscode-debugConsole-sourceForeground` | 控制台源码前景色 |
| `--vscode-debugConsole-consoleFontAnnotationForeground` | 控制台注释前景色 |

### Dropdown

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-dropdown-background` | 下拉框背景色 |
| `--vscode-dropdown-foreground` | 下拉框前景色 |
| `--vscode-dropdown-border` | 下拉框边框色 |
| `--vscode-dropdown-listBackground` | 下拉列表背景色 |

### Editor

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-editor-background` | 编辑器背景色 |
| `--vscode-editor-foreground` | 编辑器前景色 |
| `--vscode-editorWidget-background` | 编辑器部件背景色 |
| `--vscode-editorWidget-foreground` | 编辑器部件前景色 |
| `--vscode-editorWidget-border` | 编辑器部件边框色 |
| `--vscode-editorWidget-resizeBorder` | 编辑器部件调整边框色 |
| `--vscode-editor-lineHighlightBackground` | 行高亮背景色 |
| `--vscode-editor-lineHighlightBorder` | 行高亮边框色 |
| `--vscode-editorRangeHighlightBackground` | 范围高亮背景色 |
| `--vscode-editor-symbolHighlightBackground` | 符号高亮背景色 |
| `--vscode-editorCursor-foreground` | 光标前景色 |
| `--vscode-editorWhitespace-foreground` | 空白前景色 |
| `--vscode-editorIndentGuide-background` | 缩进背景色 |
| `--vscode-editorIndentGuide-activeBackground` | 激活缩进背景色 |
| `--vscode-editor-activeLinebackground` | 激活行背景色 |
| `--vscode-editor-activeLineForeground` | 激活行前景色 |
| `--vscode-editor-selectionBackground` | 选中背景色 |
| `--vscode-editor-inactiveSelectionBackground` | 非激活选中背景色 |
| `--vscode-editor-selectionHighlightBackground` | 选中高亮背景色 |
| `--vscode-editor-findMatchBackground` | 查找匹配背景色 |
| `--vscode-editor-findMatchHighlightBackground` | 查找匹配高亮背景色 |
| `--vscode-editor-wordHighlightBackground` | 单词高亮背景色 |
| `--vscode-editor-wordHighlightStrongBackground` | 强单词高亮背景色 |
| `--vscode-editorBracketMatch-background` | 括号匹配背景色 |
| `--vscode-editorBracketMatch-border` | 括号匹配边框色 |

### Editor Gutter

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-editorGutter-background` | 编辑器边槽背景色 |
| `--vscode-editorGutter-modifiedBackground` | 修改边槽背景色 |
| `--vscode-editorGutter-addedBackground` | 添加边槽背景色 |
| `--vscode-editorGutter-deletedBackground` | 删除边槽背景色 |
| `--vscode-editorGutter-foldedGlyphBackground` | 折叠符号背景色 |

### Editor Widget

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-editorSuggestWidget-background` | 建议部件背景色 |
| `--vscode-editorSuggestWidget-foreground` | 建议部件前景色 |
| `--vscode-editorSuggestWidget-border` | 建议部件边框色 |
| `--vscode-editorSuggestWidget-selectedBackground` | 建议选中背景色 |
| `--vscode-editorSuggestWidget-selectedForeground` | 建议选中前景色 |
| `--vscode-editorSuggestWidget-highlightForeground` | 建议高亮前景色 |
| `--vscode-editorHoverWidget-background` | 悬停部件背��色 |
| `--vscode-editorHoverWidget-foreground` | 悬停部件前景色 |
| `--vscode-editorHoverWidget-border` | 悬停部件边框色 |
| `--vscode-editorHoverWidget-highlightForeground` | 悬停部件高亮前景色 |

### Extension

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-extensionButton-background` | 扩展按钮背景色 |
| `--vscode-extensionButton-foreground` | 扩展按钮前景色 |
| `--vscode-extensionButton-hoverBackground` | 扩展按钮悬停背景色 |
| `--vscode-extensionButton-prominentBackground` | 扩展突出按钮背景色 |
| `--vscode-extensionButton-prominentForeground` | 扩展突出按钮前景色 |
| `--vscode-extensionButton-prominentHoverBackground` | 扩展突出按钮悬停背景色 |
| `--vscode-extensionIcon-starForeground` | 扩展图标星标前景色 |
| `--vscode-extensionIcon-starFillForeground` | 扩展图标星标填充前景色 |
| `--vscode-extensionIcon-preReleaseForeground` | 扩展图标预发布前景色 |
| `--vscode-extensionIcon-trustedForeground` | 扩展图标信任前景色 |

### Git

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-gitDecoration-addedResourceForeground` | Git 添加前景色 |
| `--vscode-gitDecoration-modifiedResourceForeground` | Git 修改前景色 |
| `--vscode-gitDecoration-deletedResourceForeground` | Git 删除前景色 |
| `--vscode-gitDecoration-renamedResourceForeground` | Git 重命名前景色 |
| `--vscode-gitDecoration-copiedResourceForeground` | Git 复制前景色 |
| `--vscode-gitDecoration-untrackedResourceForeground` | Git 未跟踪前景色 |
| `--vscode-gitDecoration-ignoredResourceForeground` | Git 忽略前景色 |
| `--vscode-gitDecoration-conflictingResourceForeground` | Git 冲突前景色 |
| `--vscode-gitDecoration-subtleResourceForeground` | Git 微弱前景色 |
| `--vscode-gitDecoration-addedResourceBorder` | Git 添加边框色 |
| `--vscode-gitDecoration-modifiedResourceBorder` | Git 修改边框色 |
| `--vscode-gitDecoration-deletedResourceBorder` | Git 删除边框色 |
| `--vscode-gitDecoration-renamedResourceBorder` | Git 重命名边框色 |
| `--vscode-gitDecoration-untrackedResourceBorder` | Git 未跟踪边框色 |

### Input

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-input-background` | 输入框背景色 |
| `--vscode-input-foreground` | 输入框前景色 |
| `--vscode-input-border` | 输入框边框色 |
| `--vscode-input-placeholderForeground` | 输入框占位符前景色 |
| `--vscode-inputOption-activeBorder` | 输入框选项激活边框色 |
| `--vscode-inputOption-hoverBackground` | 输入框选项悬停背景色 |
| `--vscode-inputOption-activeBackground` | 输入框选项激活背景色 |
| `--vscode-inputValidation-infoBackground` | 输入验证信息背景色 |
| `--vscode-inputValidation-infoBorder` | 输入验证信息边框色 |
| `--vscode-inputValidation-warningBackground` | 输入验证警告背景色 |
| `--vscode-inputValidation-warningBorder` | 输入验证警告边框色 |
| `--vscode-inputValidation-errorBackground` | 输入验证错误背景色 |
| `--vscode-inputValidation-errorBorder` | 输入验证错误边框色 |

### List

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-list-activeSelectionBackground` | 列表激活选中背景色 |
| `--vscode-list-activeSelectionForeground` | 列表激活选中文前景色 |
| `--vscode-list-inactiveSelectionBackground` | 列表非激活选中背景色 |
| `--vscode-list-inactiveSelectionForeground` | 列表非激活选中文前景色 |
| `--vscode-list-hoverBackground` | 列表悬停背景色 |
| `--vscode-list-hoverForeground` | 列表悬停前景色 |
| `--vscode-list-focusBackground` | 列表聚焦背景色 |
| `--vscode-list-focusForeground` | 列表聚焦前景色 |
| `--vscode-list-highlightForeground` | 列表高亮前景色 |
| `--vscode-list-invalidItemForeground` | 列表无效项前景色 |
| `--vscode-list-warningForeground` | 列表警告前景�� |
| `--vscode-listFilterWidget-background` | 列表过滤部件背景色 |
| `--vscode-listFilterWidget-outline` | 列表过滤部件轮廓色 |
| `--vscode-listFilterWidget-noMatchesOutline` | 列表过滤无匹配轮廓色 |

### Menu

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-menu-background` | 菜单背景色 |
| `--vscode-menu-foreground` | 菜单前景色 |
| `--vscode-menu-selectionBackground` | 菜单选中背景色 |
| `--vscode-menu-selectionForeground` | 菜单选中文前景色 |
| `--vscode-menu-separatorBackground` | 菜单分隔符背景色 |
| `--vscode-menubar-selectionBackground` | 菜单栏选中背景色 |
| `--vscode-menubar-selectionForeground` | 菜单栏选中文前景色 |

### Merge

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-merge-commonContentBackground` | 合并公共内容背景色 |
| `--vscode-merge-commonHeaderBackground` | 合并公共标题背景色 |
| `--vscode-merge-currentContentBackground` | 合并当前内容背景色 |
| `--vscode-merge-currentHeaderBackground` | 合并当前标题背景色 |
| `--vscode-merge-incomingContentBackground` | 合并传入内容背景色 |
| `--vscode-merge-incomingHeaderBackground` | 合并传入标题背景色 |
| `--vscode-merge-conflictContentBackground` | 合并冲突内容背景色 |
| `--vscode-merge-conflictHeaderBackground` | 合并冲突标题背景色 |

### Notification

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-notificationCenter-headerBackground` | 通知中心标题背景色 |
| `--vscode-notificationCenter-headerForeground` | 通知中心标题前景色 |
| `--vscode-notification-body` | 通知主体颜色 |
| `--vscode-notification-foreground` | 通知前景色 |
| `--vscode-notification-infoBackground` | 通知信息背景色 |
| `--vscode-notification-infoForeground` | 通知信息前景色 |
| `--vscode-notification warningBackground` | 通知警告背景色 |
| `--vscode-notification-warningForeground` | 通知警告前景色 |
| `--vscode-notification-errorBackground` | 通知错误背景色 |
| `--vscode-notification-errorForeground` | 通知��误前景色 |

### Panel

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-panel-background` | 面板背景色 |
| `--vscode-panel-foreground` | 面板前景色 |
| `--vscode-panel-border` | 面板边框色 |
| `--vscode-panelTitle-activeForeground` | 面板标题激活前景色 |
| `--vscode-panelTitle-inactiveForeground` | 面板标题非激活前景色 |
| `--vscode-panelTitle-activeBackground` | 面板标题激活背景色 |
| `--vscode-panelTitle-inactiveBackground` | 面板标题非激活背景色 |

### Progress Bar

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-progressBar-background` | 进度条背景色 |

### Scrollbar

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-scrollbarSlider-background` | 滚动条滑块背景色 |
| `--vscode-scrollbarSlider-hoverBackground` | 滚动条滑块悬停背景色 |
| `--vscode-scrollbarSlider-activeBackground` | 滚动条滑块激活背景色 |

### Side Bar

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-sideBar-background` | 侧边栏背景色 |
| `--vscode-sideBar-foreground` | 侧边栏前景色 |
| `--vscode-sideBar-border` | 侧边栏边框色 |
| `--vscode-sideBarTitle-foreground` | 侧边栏标题前景色 |
| `--vscode-sideBarTitle-background` | 侧边栏标题背景色 |
| `--vscode-sideBarSectionHeader-background` | 侧边栏区域标题背景色 |
| `--vscode-sideBarSectionHeader-foreground` | 侧边栏区域标题前景色 |
| `--vscode-sideBarSectionHeader-border` | 侧边栏区域标题边框色 |
| `--vscode-sideBarActivityBarTop-border` | 侧边栏活动栏顶部边框色 |
| `--vscode-sideBarStickyScroll-background` | 侧边栏粘性滚动背景色 |
| `--vscode-sideBarStickyScroll-border` | 侧边栏粘性滚动边框色 |
| `--vscode-sideBarStickyScroll-shadow` | 侧边栏粘性滚动阴影色 |

### Status Bar

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-statusBar-background` | 状态栏背景色 |
| `--vscode-statusBar-foreground` | 状态栏前景色 |
| `--vscode-statusBar-border` | 状态栏边框色 |
| `--vscode-statusBar-noFolderForeground` | 状态栏无文件夹前景色 |
| `--vscode-statusBar-noFolderBackground` | 状态栏无文件夹背景色 |
| `--vscode-statusBar-noFolderBorder` | 状态栏无文件夹边框色 |
| `--vscode-statusBarItem-activeBackground` | 状态栏项激活背景色 |
| `--vscode-statusBarItem-focusHighlight` | 状态栏项聚焦高亮 |
| `--vscode-statusBarItem-hoverBackground` | 状态栏项悬停背景色 |
| `--vscode-statusBarItem-errorBackground` | 状态栏项错误背景色 |
| `--vscode-statusBarItem-errorForeground` | 状态栏项错误前景色 |
| `--vscode-statusBarItem-warningBackground` | 状态栏项警告背景色 |
| `--vscode-statusBarItem-warningForeground` | 状态栏项警告前景色 |
| `--vscode-statusBarItem-remoteBackground` | 状态栏项远程背景色 |
| `--vscode-statusBarItem-remoteForeground` | 状态栏项远程前景色 |

### Tab

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-tab-activeBackground` | 标签页激活背景色 |
| `--vscode-tab-activeForeground` | 标签页激活前景色 |
| `--vscode-tab-activeBorder` | 标签页激活边框色 |
| `--vscode-tab-activeBorderTop` | 标签页激活顶部边框色 |
| `--vscode-tab-inactiveBackground` | 标签页非激活背景色 |
| `--vscode-tab-inactiveForeground` | 标签页非激活前景色 |
| `--vscode-tab-hoverBackground` | 标签页悬停背景色 |
| `--vscode-tab-hoverForeground` | 标签页悬停前景色 |
| `--vscode-tab-modifiedBorder` | 标签页修改边框色 |
| `--vscode-tab-unfocusedActiveBackground` | 标签页非聚焦激活背景色 |
| `--vscode-tab-unfocusedActiveForeground` | 标签页非聚焦激活前景色 |
| `--vscode-tab-unfocusedHoverBackground` | 标签页非聚焦悬停背景色 |
| `--vscode-tab-unfocusedHoverForeground` | 标签页非聚焦悬停前景色 |

### Terminal

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-terminal-foreground` | 终端前景色 |
| `--vscode-terminal-ansiBlack` | 终端 ANSI 黑色 |
| `--vscode-terminal-ansiRed` | 终端 ANSI 红色 |
| `--vscode-terminal-ansiGreen` | 终端 ANSI 绿色 |
| `--vscode-terminal-ansiYellow` | 终端 ANSI 黄色 |
| `--vscode-terminal-ansiBlue` | 终端 ANSI 蓝色 |
| `--vscode-terminal-ansiMagenta` | 终端 ANSI 洋红色 |
| `--vscode-terminal-ansiCyan` | 终端 ANSI 青色 |
| `--vscode-terminal-ansiWhite` | 终端 ANSI 白色 |
| `--vscode-terminal-ansiBrightBlack` | 终端 ANSI 亮黑色 |
| `--vscode-terminal-ansiBrightRed` | 终端 ANSI 亮红色 |
| `--vscode-terminal-ansiBrightGreen` | 终端 ANSI 亮绿色 |
| `--vscode-terminal-ansiBrightYellow` | 终端 ANSI 亮黄色 |
| `--vscode-terminal-ansiBrightBlue` | 终端 ANSI 亮蓝色 |
| `--vscode-terminal-ansiBrightMagenta` | 终端 ANSI 亮洋红色 |
| `--vscode-terminal-ansiBrightCyan` | 终端 ANSI 亮青色 |
| `--vscode-terminal-ansiBrightWhite` | 终端 ANSI 亮白色 |

### Title

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-titleBar-activeBackground` | 标题栏激活背景色 |
| `--vscode-titleBar-activeForeground` | 标题栏激活前景色 |
| `--vscode-titleBar-inactiveBackground` | 标题栏非激活背景色 |
| `--vscode-titleBar-inactiveForeground` | 标题栏非激活前景色 |
| `--vscode-titleBar-border` | 标题栏边框色 |

### Tree

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-tree-indentGuidesStroke` | 树缩进引线颜色 |
| `--vscode-tree-tableColumnsBorder` | 树表格列边框色 |

### Welcome

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-welcomePage-background` | 欢迎页背景色 |
| `--vscode-welcomePage-foreground` | 欢迎页前景色 |
| `--vscode-welcomePage-buttonBackground` | 欢迎页按钮背景色 |
| `--vscode-welcomePage-buttonHoverBackground` | 欢迎页按钮悬停背景色 |
| `--vscode-welcomePage-progressBackground` | 欢迎页进度背景色 |
| `--vscode-welcomePage-progressForeground` | 欢迎页进度前景色 |

### Widget

| CSS 变量 | 说明 |
|---------|------|
| `--vscode-widget-shadow` | 部件阴影色 |
| `--vscode-widget-border` | 部件边框色 |

## 参考链接

- [VS Code Theme Color Reference](https://code.visualstudio.com/api/references/theme-color)
- [Webview Theming Guide](https://code.visualstudio.com/api/extension-guides/webview#theming-webview-content)
- [Theme Variables Gist](https://gist.github.com/estruyf/ba49203e1a7d6868e9320a4ea480c27a)
- [Issue #41785 - Expose theme colors to webview via css variables](https://github.com/microsoft/vscode/issues/41785)