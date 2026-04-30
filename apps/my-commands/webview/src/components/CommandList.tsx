import type { CommandConfig } from '../types';
import { CommandItem } from './CommandItem';

interface CommandListProps {
  commands: CommandConfig[];
  onEdit: (command: CommandConfig) => void;
  onDelete: (command: CommandConfig) => void;
  onRun: (command: CommandConfig) => void;
}

export function CommandList({ commands, onEdit, onDelete, onRun }: CommandListProps) {
  if (commands.length === 0) {
    return (
      <div className="empty-state">
        <p>No commands configured yet.</p>
        <p className="hint">Click "+ Add Command" to get started.</p>
      </div>
    );
  }

  return (
    <div className="command-list">
      {commands.map((cmd) => (
        <CommandItem key={cmd.id} command={cmd} onEdit={onEdit} onDelete={onDelete} onRun={onRun} />
      ))}
    </div>
  );
}
