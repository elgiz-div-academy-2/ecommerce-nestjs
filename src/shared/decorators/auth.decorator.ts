import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from './role.decorator';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';

export function Auth(...roles: UserRole[]) {
  return applyDecorators(
    UseGuards(AuthGuard),
    Roles(...roles),
    ApiBearerAuth(),
  );
}
