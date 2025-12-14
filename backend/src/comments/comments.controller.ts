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

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('tasks/:taskId/comments')
  create(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @CurrentUser() user: { id: string },
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(taskId, user.id, createCommentDto);
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
