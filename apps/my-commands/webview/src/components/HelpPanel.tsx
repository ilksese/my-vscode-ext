import type { JSX } from 'preact';

interface HelpPanelProps {
  onClose: () => void;
}

const variables = [
  {
    name: '${file}',
    description: '当前活动文件的绝对路径',
    example: '/Users/foo/project/src/index.ts',
  },
  {
    name: '${fileDirname}',
    description: '当前活动文件所在目录',
    example: '/Users/foo/project/src',
  },
  {
    name: '${fileBasename}',
    description: '当前活动文件名（含扩展名）',
    example: 'index.ts',
  },
  {
    name: '${fileBasenameNoExtension}',
    description: '当前活动文件名（不含扩展名）',
    example: 'index',
  },
  {
    name: '${relativeFile}',
    description: '当前活动文件相对于工作区的路径',
    example: 'src/index.ts',
  },
  {
    name: '${workspaceFolder}',
    description: '当前工作区根目录',
    example: '/Users/foo/project',
  },
  {
    name: '${cwd}',
    description: 'VS Code 进程的当前工作目录',
    example: '/Users/foo',
  },
];

export function HelpPanel({ onClose }: HelpPanelProps) {
  const handleBackdropClick = (e: JSX.TargetedMouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains('help-backdrop')) {
      onClose();
    }
  };

  return (
    <div className="help-backdrop" onClick={handleBackdropClick}>
      <div className="help-panel">
        <div className="help-header">
          <h3>Available Variables</h3>
          <button className="help-close" onClick={onClose} aria-label="Close help">
            ✕
          </button>
        </div>
        <p className="help-intro">
          Use these variables in your commands. They will be replaced with actual values at runtime.
        </p>
        <ul className="help-variable-list">
          {variables.map((v) => (
            <li key={v.name} className="help-variable-item">
              <code className="help-variable-name">{v.name}</code>
              <span className="help-variable-desc">{v.description}</span>
              <span className="help-variable-example">{v.example}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
