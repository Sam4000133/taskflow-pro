import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTasksDto } from './dto/filter-tasks.dto';
import { TaskStatus, Role } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(creatorId: string, createTaskDto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status,
        priority: createTaskDto.priority,
        dueDate: createTaskDto.dueDate
          ? new Date(createTaskDto.dueDate)
          : undefined,
        creatorId,
        assigneeId: createTaskDto.assigneeId,
        categoryId: createTaskDto.categoryId,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        category: true,
      },
    });
  }

  async findAll(filters: FilterTasksDto, userId: string, userRole: Role) {
    const where: any = {};

    // Non-admin users can only see their own tasks (created or assigned)
    if (userRole !== Role.ADMIN) {
      where.OR = [
        { creatorId: userId },
        { assigneeId: userId },
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }

    if (filters.search) {
      // Combine search with existing OR conditions
      const searchCondition = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];

      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: searchCondition },
        ];
        delete where.OR;
      } else {
        where.OR = searchCondition;
      }
    }

    const tasks = await this.prisma.task.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        category: true,
        _count: { select: { comments: true } },
      },
    });

    // Custom sorting: priority (HIGH > MEDIUM > LOW), then by due date (oldest first)
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };

    return tasks.sort((a, b) => {
      // First sort by priority
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then sort by due date (oldest/most overdue first, null dates at the end)
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;

      // If same priority and no due dates, sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        category: true,
        comments: {
          include: {
            author: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: string, userId: string, userRole: Role, updateTaskDto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Non-admin users can only update their own tasks
    if (userRole !== Role.ADMIN && task.creatorId !== userId && task.assigneeId !== userId) {
      throw new ForbiddenException('You can only update your own tasks');
    }

    // Non-admin users cannot reassign tasks to others
    if (userRole !== Role.ADMIN && updateTaskDto.assigneeId && updateTaskDto.assigneeId !== userId) {
      throw new ForbiddenException('You cannot assign tasks to other users');
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        title: updateTaskDto.title,
        description: updateTaskDto.description,
        status: updateTaskDto.status,
        priority: updateTaskDto.priority,
        dueDate: updateTaskDto.dueDate
          ? new Date(updateTaskDto.dueDate)
          : updateTaskDto.dueDate === null
            ? null
            : undefined,
        assigneeId: updateTaskDto.assigneeId,
        categoryId: updateTaskDto.categoryId,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        category: true,
      },
    });
  }

  async remove(id: string, userId: string, userRole: Role) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Admin can delete any task, others can only delete their own
    if (userRole !== Role.ADMIN && task.creatorId !== userId) {
      throw new ForbiddenException('You can only delete tasks you created');
    }

    await this.prisma.task.delete({
      where: { id },
    });

    return { message: 'Task deleted successfully' };
  }

  async getStats(userId: string, userRole: Role) {
    // Base filter for non-admin users
    const baseWhere = userRole !== Role.ADMIN
      ? { OR: [{ creatorId: userId }, { assigneeId: userId }] }
      : {};

    const [total, todo, inProgress, done, overdue] = await Promise.all([
      this.prisma.task.count({ where: baseWhere }),
      this.prisma.task.count({ where: { ...baseWhere, status: TaskStatus.TODO } }),
      this.prisma.task.count({ where: { ...baseWhere, status: TaskStatus.IN_PROGRESS } }),
      this.prisma.task.count({ where: { ...baseWhere, status: TaskStatus.DONE } }),
      this.prisma.task.count({
        where: {
          ...baseWhere,
          dueDate: { lt: new Date() },
          status: { not: TaskStatus.DONE },
        },
      }),
    ]);

    return { total, todo, inProgress, done, overdue };
  }
}
