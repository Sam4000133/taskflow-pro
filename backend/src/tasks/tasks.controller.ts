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

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: CurrentUserType,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    const task = await this.tasksService.create(user.id, createTaskDto);
    this.notificationsGateway.emitTaskCreated(task, user.name);
    if (task.assigneeId && task.assigneeId !== user.id) {
      this.notificationsGateway.emitTaskAssigned(task, task.assigneeId, user.name);
    }
    return task;
  }

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserType,
    @Query() filters: FilterTasksDto,
  ) {
    return this.tasksService.findAll(filters, user.id, user.role);
  }

  @Get('stats')
  getStats(@CurrentUser() user: CurrentUserType) {
    return this.tasksService.getStats(user.id, user.role);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserType,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    const existingTask = await this.tasksService.findOne(id);
    const task = await this.tasksService.update(id, user.id, user.role, updateTaskDto);
    this.notificationsGateway.emitTaskUpdated(task, user.name);

    // Notify newly assigned user
    if (updateTaskDto.assigneeId &&
        updateTaskDto.assigneeId !== existingTask.assigneeId &&
        updateTaskDto.assigneeId !== user.id) {
      this.notificationsGateway.emitTaskAssigned(task, updateTaskDto.assigneeId, user.name);
    }
    return task;
  }

  @Delete(':id')
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
