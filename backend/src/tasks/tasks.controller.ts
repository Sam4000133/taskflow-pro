import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTasksDto } from './dto/filter-tasks.dto';
import { CurrentUser } from '../auth';
import { NotificationsGateway } from '../notifications';

interface CurrentUserType {
  id: string;
  name: string;
  role: Role;
}

@ApiTags('Tasks')
@ApiBearerAuth('JWT-auth')
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @CurrentUser() user: CurrentUserType,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    const task = await this.tasksService.create(user.id, createTaskDto);
    this.notificationsGateway.emitTaskCreated(task, user.name);
    if (task.assigneeId && task.assigneeId !== user.id) {
      this.notificationsGateway.emitTaskAssigned(
        task,
        task.assigneeId,
        user.name,
      );
    }
    return task;
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with optional filters' })
  @ApiResponse({ status: 200, description: 'List of tasks' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @CurrentUser() user: CurrentUserType,
    @Query() filters: FilterTasksDto,
  ) {
    return this.tasksService.findAll(filters, user.id, user.role);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get task statistics' })
  @ApiResponse({ status: 200, description: 'Task statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getStats(@CurrentUser() user: CurrentUserType) {
    return this.tasksService.getStats(user.id, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID with comments' })
  @ApiResponse({ status: 200, description: 'Task details' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your task' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserType,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    const existingTask = await this.tasksService.findOne(id);
    const task = await this.tasksService.update(
      id,
      user.id,
      user.role,
      updateTaskDto,
    );
    this.notificationsGateway.emitTaskUpdated(task, user.name);

    // Notify newly assigned user
    if (
      updateTaskDto.assigneeId &&
      updateTaskDto.assigneeId !== existingTask.assigneeId &&
      updateTaskDto.assigneeId !== user.id
    ) {
      this.notificationsGateway.emitTaskAssigned(
        task,
        updateTaskDto.assigneeId,
        user.name,
      );
    }
    return task;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your task' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    const task = await this.tasksService.findOne(id);
    const result = await this.tasksService.remove(id, user.id, user.role);
    this.notificationsGateway.emitTaskDeleted(task.title, user.name);
    return result;
  }
}
