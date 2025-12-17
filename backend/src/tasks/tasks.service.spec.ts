import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma';

// Define enums locally to avoid Prisma client dependency in tests
type TaskStatusType = 'TODO' | 'IN_PROGRESS' | 'DONE';
const TaskStatus = {
  TODO: 'TODO' as TaskStatusType,
  IN_PROGRESS: 'IN_PROGRESS' as TaskStatusType,
  DONE: 'DONE' as TaskStatusType,
};

type PriorityType = 'LOW' | 'MEDIUM' | 'HIGH';
const Priority = {
  LOW: 'LOW' as PriorityType,
  MEDIUM: 'MEDIUM' as PriorityType,
  HIGH: 'HIGH' as PriorityType,
};

type RoleType = 'USER' | 'ADMIN';
const RoleEnum = {
  USER: 'USER' as RoleType,
  ADMIN: 'ADMIN' as RoleType,
};

describe('TasksService', () => {
  let tasksService: TasksService;

  const mockTask = {
    id: 'task-uuid',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    dueDate: new Date(),
    creatorId: 'user-uuid',
    assigneeId: 'user-uuid',
    categoryId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: {
      id: 'user-uuid',
      name: 'Test User',
      email: 'test@example.com',
      avatar: null,
    },
    assignee: {
      id: 'user-uuid',
      name: 'Test User',
      email: 'test@example.com',
      avatar: null,
    },
    category: null,
  };

  const mockPrismaService = {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      mockPrismaService.task.create.mockResolvedValue(mockTask);

      const result = await tasksService.create('user-uuid', {
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
      });

      expect(result).toEqual(mockTask);
      expect(mockPrismaService.task.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return tasks for admin user', async () => {
      mockPrismaService.task.findMany.mockResolvedValue([mockTask]);

      const result = await tasksService.findAll(
        {},
        'admin-uuid',
        RoleEnum.ADMIN,
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockTask);
    });

    it('should filter tasks for non-admin user', async () => {
      mockPrismaService.task.findMany.mockResolvedValue([mockTask]);

      await tasksService.findAll({}, 'user-uuid', RoleEnum.USER);

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          where: expect.objectContaining({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            OR: expect.arrayContaining([
              { creatorId: 'user-uuid' },
              { assigneeId: 'user-uuid' },
            ]),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a task by ID', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);

      const result = await tasksService.findOne('task-uuid');

      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(tasksService.findOne('nonexistent-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a task for owner', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.task.update.mockResolvedValue({
        ...mockTask,
        title: 'Updated',
      });

      const result = await tasksService.update(
        'task-uuid',
        'user-uuid',
        RoleEnum.USER,
        { title: 'Updated' },
      );

      expect(result.title).toBe('Updated');
    });

    it('should throw ForbiddenException for unauthorized update', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue({
        ...mockTask,
        creatorId: 'other-user',
        assigneeId: 'other-user',
      });

      await expect(
        tasksService.update('task-uuid', 'user-uuid', RoleEnum.USER, {
          title: 'Updated',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to update any task', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue({
        ...mockTask,
        creatorId: 'other-user',
      });
      mockPrismaService.task.update.mockResolvedValue({
        ...mockTask,
        title: 'Updated',
      });

      const result = await tasksService.update(
        'task-uuid',
        'admin-uuid',
        RoleEnum.ADMIN,
        { title: 'Updated' },
      );

      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should delete a task for creator', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.task.delete.mockResolvedValue(mockTask);

      const result = await tasksService.remove(
        'task-uuid',
        'user-uuid',
        RoleEnum.USER,
      );

      expect(result).toEqual({ message: 'Task deleted successfully' });
    });

    it('should throw ForbiddenException for unauthorized delete', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue({
        ...mockTask,
        creatorId: 'other-user',
      });

      await expect(
        tasksService.remove('task-uuid', 'user-uuid', RoleEnum.USER),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getStats', () => {
    it('should return task statistics', async () => {
      mockPrismaService.task.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(4) // todo
        .mockResolvedValueOnce(3) // inProgress
        .mockResolvedValueOnce(2) // done
        .mockResolvedValueOnce(1); // overdue

      const result = await tasksService.getStats('user-uuid', RoleEnum.ADMIN);

      expect(result).toEqual({
        total: 10,
        todo: 4,
        inProgress: 3,
        done: 2,
        overdue: 1,
      });
    });
  });
});
