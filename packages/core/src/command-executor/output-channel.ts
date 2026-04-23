export interface CommandOutputChannel {
  appendLine(message: string): void;
  show(): void;
  clear(): void;
}

export function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

export function formatInfo(message: string): string {
  return `[${timestamp()}] [Info] ${message}`;
}

export function formatFile(file: string): string {
  return `[File]: ${file}`;
}

export function formatStatus(exitCode: number | null): string {
  return `[Status]: Exit Code ${exitCode ?? 'cancelled'}`;
}
