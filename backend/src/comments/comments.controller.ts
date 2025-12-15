import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CurrentUser } from '../auth';
import { NotificationsGateway } from '../notifications';

@Controller()
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  @Post('tasks/:taskId/comments')
  async create(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @CurrentUser() user: { id: string; name: string },
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const { comment, task } = await this.commentsService.create(taskId, user.id, createCommentDto);
    this.notificationsGateway.emitCommentAdded(task, comment, user.name);
    return comment;
  }

  @Get('tasks/:taskId/comments')
  findByTask(@Param('taskId', ParseUUIDPipe) taskId: string) {
    return this.commentsService.findByTask(taskId);
  }

  @Delete('comments/:id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.commentsService.remove(id, user.id);
  }
}
