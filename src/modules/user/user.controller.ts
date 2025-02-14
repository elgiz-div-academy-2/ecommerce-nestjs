import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  users() {
    return this.userService.list();
  }
}
