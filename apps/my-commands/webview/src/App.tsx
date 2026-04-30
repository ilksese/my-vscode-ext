import { useState } from 'preact/hooks';
import { useVscodeMessaging } from './hooks/useVscodeMessaging';
import { CommandList } from './components/CommandList';
import { CommandForm } from './components/CommandForm';
import { ConfirmDialog } from './components/ConfirmDialog';
import { HelpPanel } from './components/HelpPanel';
import type { CommandConfig } from './types';

export default function App() {
  const { commands, loading, error, saveCommand, deleteCommand, runCommand } = useVscodeMessaging();
  const [editingCommand, setEditingCommand] = useState<CommandConfig | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CommandConfig | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const handleSave = (config: CommandConfig) => {
    saveCommand(config);
    setEditingCommand(null);
    setShowForm(false);
  };

  const handleEdit = (command: CommandConfig) => {
    setEditingCommand(command);
    setShowForm(true);
  };

  const handleDeleteRequest = (command: CommandConfig) => {
    setDeleteTarget(command);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteCommand(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  const handleCancel = () => {
    setEditingCommand(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <h2>My Commands</h2>
        <div className="header-actions">
          <button
            className="help-btn"
            onClick={() => setShowHelp(true)}
            aria-label="Show help"
          >
            ?
          </button>
          <button
            className="add-btn"
            onClick={() => {
              setEditingCommand(null);
              setShowForm(true);
            }}
          >
            + Add Command
          </button>
        </div>
      </div>

      {showForm ? (
        <CommandForm
          command={editingCommand || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
      <CommandList
        commands={commands}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        onRun={(cmd) => runCommand(cmd.id)}
      />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="确认删除"
        message={deleteTarget ? `确定要删除命令 "${deleteTarget.displayName}" 吗？` : ''}
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}
    </div>
  );
}
