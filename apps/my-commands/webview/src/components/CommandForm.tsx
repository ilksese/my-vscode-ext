import { useState } from 'preact/hooks';
import type { JSX } from 'preact';
import type { CommandConfig } from '../types';

interface CommandFormProps {
  command?: CommandConfig;
  onSave: (config: CommandConfig) => void;
  onCancel: () => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function CommandForm({ command, onSave, onCancel }: CommandFormProps) {
  const [displayName, setDisplayName] = useState(command?.displayName || '');
  const [cmd, setCmd] = useState(command?.command || '');
  const [workingDir, setWorkingDir] = useState<CommandConfig['workingDir']>(
    command?.workingDir || 'workspaceRoot'
  );
  const [customWorkingDir, setCustomWorkingDir] = useState(command?.customWorkingDir || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!displayName.trim()) newErrors.displayName = 'Name is required';
    if (displayName.trim().length > 50) newErrors.displayName = 'Name must be ≤ 50 characters';
    if (!cmd.trim()) newErrors.command = 'Command is required';
    if (workingDir === 'custom' && !customWorkingDir.trim()) {
      newErrors.customWorkingDir = 'Custom path is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: JSX.TargetedEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    const config: CommandConfig = {
      id: command?.id || generateId(),
      displayName: displayName.trim(),
      command: cmd.trim(),
      workingDir,
      customWorkingDir: workingDir === 'custom' ? customWorkingDir.trim() : undefined,
    };

    onSave(config);
  };

  return (
    <form className="command-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="displayName">Display Name</label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName((e.target as HTMLInputElement).value)}
          placeholder="e.g., Build TypeScript"
          className={errors.displayName ? 'error' : ''}
        />
        {errors.displayName && <span className="error-text">{errors.displayName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="command">Command</label>
        <input
          id="command"
          type="text"
          value={cmd}
          onChange={(e) => setCmd((e.target as HTMLInputElement).value)}
          placeholder="e.g., tsc ${file}"
          className={errors.command ? 'error' : ''}
        />
        {errors.command && <span className="error-text">{errors.command}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="workingDir">Working Directory</label>
        <select
          id="workingDir"
          value={workingDir}
          onChange={(e) => setWorkingDir((e.target as HTMLSelectElement).value as CommandConfig['workingDir'])}
        >
          <option value="workspaceRoot">Workspace Root</option>
          <option value="fileDir">File Directory</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {workingDir === 'custom' && (
        <div className="form-group">
          <label htmlFor="customWorkingDir">Custom Path</label>
          <input
            id="customWorkingDir"
            type="text"
            value={customWorkingDir}
            onChange={(e) => setCustomWorkingDir((e.target as HTMLInputElement).value)}
            placeholder="/absolute/path"
            className={errors.customWorkingDir ? 'error' : ''}
          />
          {errors.customWorkingDir && <span className="error-text">{errors.customWorkingDir}</span>}
        </div>
      )}

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {command ? 'Update' : 'Add'}
        </button>
      </div>
    </form>
  );
}
