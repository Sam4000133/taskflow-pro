'use strict';

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string;
  email: string;
}

interface NotificationPayload {
  id: string;
  type:
    | 'task_created'
    | 'task_updated'
    | 'task_deleted'
    | 'task_assigned'
    | 'comment_added';
  title: string;
  message: string;
  taskId?: string;
  userId?: string;
  createdAt: Date;
}

interface TaskPayload {
  id: string;
  title: string;
  creatorId?: string;
  assigneeId?: string;
}

interface CommentPayload {
  authorId: string;
}

interface SocketData {
  userId?: string;
}

type TypedSocket = Socket<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  SocketData
>;

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  handleConnection(client: TypedSocket): void {
    try {
      const token =
        (client.handshake.auth.token as string) ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(
          `Client ${client.id} attempted connection without token`,
        );
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const userId: string = payload.sub;
      client.data.userId = userId;

      // Track user's socket connections
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Join user-specific room
      void client.join(`user:${userId}`);

      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Connection error for client ${client.id}: ${errorMessage}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: TypedSocket): void {
    const userId = client.data.userId;
    if (userId) {
      const userSocketSet = this.userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.delete(client.id);
        if (userSocketSet.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ): { success: boolean } {
    void client.join(data.room);
    this.logger.log(`Client ${client.id} subscribed to ${data.room}`);
    return { success: true };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ): { success: boolean } {
    void client.leave(data.room);
    this.logger.log(`Client ${client.id} unsubscribed from ${data.room}`);
    return { success: true };
  }

  // Emit notification to specific user
  sendToUser(userId: string, notification: NotificationPayload) {
    this.server.to(`user:${userId}`).emit('notification', notification);
    this.logger.log(
      `Notification sent to user ${userId}: ${notification.type}`,
    );
  }

  // Emit notification to all connected users
  sendToAll(notification: NotificationPayload) {
    this.server.emit('notification', notification);
    this.logger.log(`Broadcast notification: ${notification.type}`);
  }

  // Emit task update to all users
  emitTaskCreated(task: TaskPayload, creatorName: string): void {
    const notification: NotificationPayload = {
      id: `notif_${Date.now()}`,
      type: 'task_created',
      title: 'New Task Created',
      message: `${creatorName} created "${task.title}"`,
      taskId: task.id,
      createdAt: new Date(),
    };
    this.sendToAll(notification);
  }

  emitTaskUpdated(task: TaskPayload, updaterName: string): void {
    const notification: NotificationPayload = {
      id: `notif_${Date.now()}`,
      type: 'task_updated',
      title: 'Task Updated',
      message: `${updaterName} updated "${task.title}"`,
      taskId: task.id,
      createdAt: new Date(),
    };
    this.sendToAll(notification);
  }

  emitTaskDeleted(taskTitle: string, deleterName: string): void {
    const notification: NotificationPayload = {
      id: `notif_${Date.now()}`,
      type: 'task_deleted',
      title: 'Task Deleted',
      message: `${deleterName} deleted "${taskTitle}"`,
      createdAt: new Date(),
    };
    this.sendToAll(notification);
  }

  emitTaskAssigned(
    task: TaskPayload,
    assigneeId: string,
    assignerName: string,
  ): void {
    const notification: NotificationPayload = {
      id: `notif_${Date.now()}`,
      type: 'task_assigned',
      title: 'Task Assigned',
      message: `${assignerName} assigned you to "${task.title}"`,
      taskId: task.id,
      userId: assigneeId,
      createdAt: new Date(),
    };
    this.sendToUser(assigneeId, notification);
  }

  emitCommentAdded(
    task: TaskPayload,
    comment: CommentPayload,
    commenterName: string,
  ): void {
    const notification: NotificationPayload = {
      id: `notif_${Date.now()}`,
      type: 'comment_added',
      title: 'New Comment',
      message: `${commenterName} commented on "${task.title}"`,
      taskId: task.id,
      createdAt: new Date(),
    };

    // Notify task creator and assignee
    if (task.creatorId && task.creatorId !== comment.authorId) {
      this.sendToUser(task.creatorId, notification);
    }
    if (
      task.assigneeId &&
      task.assigneeId !== comment.authorId &&
      task.assigneeId !== task.creatorId
    ) {
      this.sendToUser(task.assigneeId, notification);
    }
  }
}
