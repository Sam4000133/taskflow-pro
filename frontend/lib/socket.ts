import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export interface Notification {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_deleted' | 'task_assigned' | 'comment_added';
  title: string;
  message: string;
  taskId?: string;
  userId?: string;
  createdAt: Date;
  read?: boolean;
}

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token: string): Socket | null {
  if (socket?.connected) {
    return socket;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Skip socket connection in production if API is proxied
  if (apiUrl.includes('/api')) {
    return null;
  }

  try {
    socket = io(apiUrl, {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 2,
      reconnectionDelay: 3000,
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('connect_error', () => {
      // Silent fail - notifications are optional
      socket?.disconnect();
      socket = null;
    });

    return socket;
  } catch {
    return null;
  }
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function subscribeToNotifications(
  callback: (notification: Notification) => void
): () => void {
  if (!socket) {
    console.warn('Socket not connected');
    return () => {};
  }

  socket.on('notification', callback);

  return () => {
    socket?.off('notification', callback);
  };
}
