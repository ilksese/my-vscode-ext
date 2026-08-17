# 变量替换

命令内容支持如下占位符，执行时会被替换为实际值。

| 占位符 | 说明 | 示例 |
| ------ | ---- | ---- |
| `${file}` | 活动文件的绝对路径 | `/Users/dev/project/src/app.js` |
| `${relativeFile}` | 相对工作区的路径 | `src/app.js` |
| `${fileBasename}` | 文件名（含扩展名） | `app.js` |
| `${fileBasenameNoExtension}` | 文件名（不含扩展名） | `app` |
| `${fileDirname}` | 文件所在目录 | `/Users/dev/project/src` |
| `${workspaceFolder}` | 工作区根目录 | `/Users/dev/project` |
| `${cwd}` | 当前工作目录 | 动态计算 |

## 默认追加

若命令内容不包含任何 `${}` 占位符，系统会自动在末尾追加 `${relativeFile}`，保证命令总是针对当前活动文件执行。

## 手动引用

需要明确引用文件时，直接在内容中书写占位符即可，例如：

```bash
npx eslint --fix ${file}
```