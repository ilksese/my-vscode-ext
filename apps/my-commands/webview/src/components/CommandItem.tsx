import type { CommandConfig } from '../types';

interface CommandItemProps {
  command: CommandConfig;
  onEdit: (command: CommandConfig) => void;
  onDelete: (command: CommandConfig) => void;
  onRun: (command: CommandConfig) => void;
}

const workingDirLabels: Record<string, string> = {
  workspaceRoot: 'Workspace Root',
  fileDir: 'File Directory',
  custom: 'Custom',
};

export function CommandItem({ command, onEdit, onDelete, onRun }: CommandItemProps) {
  return (
    <div className="command-item">
      <div className="command-header">
        <span className="command-name">{command.displayName}</span>
        <div className="command-actions">
          <button className="btn-run" onClick={() => onRun(command)}>
            Run
          </button>
          <button className="btn-edit" onClick={() => onEdit(command)}>
            Edit
          </button>
          <button className="btn-text-delete" onClick={() => onDelete(command)}>
            Delete
          </button>
        </div>
      </div>
      <div className="command-details">
        <code className="command-cmd">{command.command}</code>
        <span className="command-cwd">
          CWD: {workingDirLabels[command.workingDir] || command.workingDir}
          {command.autoAppendFile === false ? ' · Auto append: off' : ''}
        </span>
      </div>
    </div>
  );
}
