import { useVscodeMessaging } from './hooks/useVscodeMessaging';
// Task 8: import { CommandList } from './components/CommandList';
// Task 8: import { CommandForm } from './components/CommandForm';

export default function App() {
  const { commands, loading, error } = useVscodeMessaging();

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>My Commands</h2>
      <p>{commands.length} commands configured</p>
    </div>
  );
}
