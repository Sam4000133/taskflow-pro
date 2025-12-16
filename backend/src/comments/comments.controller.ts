import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CurrentUser } from '../auth';
import { NotificationsGateway } from '../notifications';

@ApiTags('Comments')
@ApiBearerAuth('JWT-auth')
@Controller()
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  @Post('tasks/:taskId/comments')
  @ApiOperation({ summary: 'Add a comment to a task' })
  @ApiResponse({ status: 201, description: 'Comment added successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Get all comments for a task' })
  @ApiResponse({ status: 200, description: 'List of comments' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByTask(@Param('taskId', ParseUUIDPipe) taskId: string) {
    return this.commentsService.findByTask(taskId);
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your comment' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.commentsService.remove(id, user.id);
  }
}
