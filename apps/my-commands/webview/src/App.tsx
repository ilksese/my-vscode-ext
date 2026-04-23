import React, { useState } from 'react';
import { useVscodeMessaging } from './hooks/useVscodeMessaging';
import { CommandList } from './components/CommandList';
import { CommandForm } from './components/CommandForm';
import type { CommandConfig } from './types';

export default function App() {
  const { commands, loading, error, saveCommand, deleteCommand } = useVscodeMessaging();
  const [editingCommand, setEditingCommand] = useState<CommandConfig | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSave = (config: CommandConfig) => {
    saveCommand(config);
    setEditingCommand(null);
    setShowForm(false);
  };

  const handleEdit = (command: CommandConfig) => {
    setEditingCommand(command);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteCommand(id);
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
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
