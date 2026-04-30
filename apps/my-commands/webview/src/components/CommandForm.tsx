import { useState, useRef, useEffect } from 'preact/hooks';
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

const insertableVariables = [
  { name: '${file}', label: 'File path' },
  { name: '${fileDirname}', label: 'File directory' },
  { name: '${fileBasename}', label: 'File name (with ext)' },
  { name: '${fileBasenameNoExtension}', label: 'File name (no ext)' },
  { name: '${relativeFile}', label: 'Relative file path' },
  { name: '${workspaceFolder}', label: 'Workspace folder' },
  { name: '${cwd}', label: 'Current working directory' },
];

export function CommandForm({ command, onSave, onCancel }: CommandFormProps) {
  const [displayName, setDisplayName] = useState(command?.displayName || '');
  const [cmd, setCmd] = useState(command?.command || '');
  const [workingDir, setWorkingDir] = useState<CommandConfig['workingDir']>(
    command?.workingDir || 'workspaceRoot'
  );
  const [customWorkingDir, setCustomWorkingDir] = useState(command?.customWorkingDir || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showVarPicker, setShowVarPicker] = useState(false);
  const [cursorPos, setCursorPos] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showVarPicker) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowVarPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showVarPicker]);

  const handleCommandInputClick = () => {
    if (inputRef.current) {
      setCursorPos(inputRef.current.selectionStart ?? cmd.length);
    }
  };

  const handleInsertVariable = (variable: string) => {
    const pos = cursorPos ?? cmd.length;
    const newVal = cmd.slice(0, pos) + variable + cmd.slice(pos);
    setCmd(newVal);
    setShowVarPicker(false);
    setTimeout(() => {
      if (inputRef.current) {
        const newPos = pos + variable.length;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

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
        <div className="command-input-row">
          <input
            id="command"
            type="text"
            ref={inputRef}
            value={cmd}
            onChange={(e) => setCmd((e.target as HTMLInputElement).value)}
            onClick={handleCommandInputClick}
            placeholder="e.g., tsc ${file}"
            className={errors.command ? 'error' : ''}
          />
          <button
            type="button"
            className="btn-insert"
            onClick={() => setShowVarPicker((v) => !v)}
            aria-label="Insert variable"
          >
            插入
          </button>
        </div>
        {showVarPicker && (
          <div ref={dropdownRef} className="var-picker-dropdown">
            {insertableVariables.map((v) => (
              <button
                key={v.name}
                type="button"
                className="var-picker-item"
                onClick={() => handleInsertVariable(v.name)}
              >
                <code>{v.name}</code>
                <span>{v.label}</span>
              </button>
            ))}
          </div>
        )}
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
