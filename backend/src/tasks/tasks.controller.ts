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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTasksDto } from './dto/filter-tasks.dto';
import { CurrentUser } from '../auth';
import { NotificationsGateway } from '../notifications';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: { id: string; name: string },
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
  findAll(@Query() filters: FilterTasksDto) {
    return this.tasksService.findAll(filters);
  }

  @Get('stats')
  getStats() {
    return this.tasksService.getStats();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; name: string },
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    const existingTask = await this.tasksService.findOne(id);
    const task = await this.tasksService.update(id, user.id, updateTaskDto);
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
    @CurrentUser() user: { id: string; name: string },
  ) {
    const task = await this.tasksService.findOne(id);
    const result = await this.tasksService.remove(id, user.id);
    this.notificationsGateway.emitTaskDeleted(task.title, user.name);
    return result;
  }
}
