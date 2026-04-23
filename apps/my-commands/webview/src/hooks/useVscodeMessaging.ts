import { useState, useEffect, useCallback } from 'react';
import type { CommandConfig, VscodeMessage } from '../types';
import { postMessage, onMessage } from '../utils/vscode';

export function useVscodeMessaging() {
  const [commands, setCommands] = useState<CommandConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onMessage((message: VscodeMessage) => {
      switch (message.type) {
        case 'COMMANDS_LIST':
          setCommands(message.payload);
          setLoading(false);
          break;
        case 'COMMAND_SAVED':
          setCommands((prev) => {
            const index = prev.findIndex((c) => c.id === message.payload.id);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = message.payload;
              return updated;
            }
            return [...prev, message.payload];
          });
          break;
        case 'COMMAND_DELETED':
          setCommands((prev) => prev.filter((c) => c.id !== message.payload.id));
          break;
        case 'ERROR':
          setError(message.payload.message);
          setLoading(false);
          break;
      }
    });

    postMessage({ type: 'GET_COMMANDS' });

    return unsubscribe;
  }, []);

  const saveCommand = useCallback((config: CommandConfig) => {
    postMessage({ type: 'SAVE_COMMAND', payload: config });
  }, []);

  const deleteCommand = useCallback((id: string) => {
    postMessage({ type: 'DELETE_COMMAND', payload: { id } });
  }, []);

  const refresh = useCallback(() => {
    postMessage({ type: 'GET_COMMANDS' });
    setLoading(true);
  }, []);

  return { commands, loading, error, saveCommand, deleteCommand, refresh };
}
