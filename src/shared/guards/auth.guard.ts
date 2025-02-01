import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { Observable } from 'rxjs';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private cls: ClsService,
    private jwt: JwtService,
    private userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    let request = context.switchToHttp().getRequest();
    let authorization = request.headers.authorization || '';

    let token = authorization.split(' ')[1];

    try {
      let payload = this.jwt.verify(token) || '';
      if (!payload.userId) throw new Error();

      let user = await this.userService.userById(payload.userId);

      if (!user) throw new Error();

      let roles = this.reflector.get<UserRole[]>('roles', context.getHandler());

      if (roles?.length && !roles.includes(user.role)) {
        throw new ForbiddenException("You don't have access to this api");
      }

      this.cls.set('user', user);

      return true;
    } catch (err) {
      if (err instanceof ForbiddenException) {
        throw err;
      }
      throw new UnauthorizedException();
    }
  }
}
