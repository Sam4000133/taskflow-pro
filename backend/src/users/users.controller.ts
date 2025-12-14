import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../auth';

@Controller('users')
export class UsersController {
  @Get('me')
  getMe(@CurrentUser() user: any) {
    return user;
  }
}
