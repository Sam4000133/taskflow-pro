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

export function connectSocket(token: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  socket = io(`${apiUrl}/notifications`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  return socket;
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
