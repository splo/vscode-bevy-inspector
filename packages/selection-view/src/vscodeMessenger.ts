import { Messenger } from '@bevy-inspector/messenger/messenger';

// Send messages to the VS Code extension.
const requestSender = acquireVsCodeApi().postMessage;

export const messenger = new Messenger(requestSender);

// Listen to messages from the VS Code extension.
window.addEventListener('message', (event) => messenger.handleIncomingMessage(event.data));
