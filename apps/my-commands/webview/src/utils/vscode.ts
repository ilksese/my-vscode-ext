import type { WebviewMessage, VscodeMessage } from '../types';

declare const acquireVsCodeApi: () => {
  postMessage: (message: unknown) => void;
  getState: () => unknown;
  setState: (state: unknown) => void;
};

let vscodeApi: ReturnType<typeof acquireVsCodeApi> | null = null;

export function getVscodeApi() {
  if (!vscodeApi) {
    vscodeApi = acquireVsCodeApi();
  }
  return vscodeApi;
}

export function postMessage(message: WebviewMessage): void {
  getVscodeApi().postMessage(message);
}

export function onMessage(callback: (message: VscodeMessage) => void): () => void {
  const handler = (event: MessageEvent) => {
    const message = event.data as VscodeMessage;
    callback(message);
  };
  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}
