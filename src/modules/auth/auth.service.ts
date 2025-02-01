import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRegisterDto } from './dto/register-user.dto';
import { UserLoginDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(params: UserLoginDto) {
    let user = await this.prisma.user.findUnique({
      where: { email: params.email },
    });

    if (!user) throw new NotFoundException('Email or password is wrong');

    let checkPassword = await bcrypt.compare(params.password, user.password);

    if (!checkPassword)
      throw new NotFoundException('Email or password is wrong');

    let token = this.jwt.sign({ userId: user.id });

    return { user, token };
  }

  async register(params: UserRegisterDto) {
    let checkEmail = await this.prisma.user.findUnique({
      where: { email: params.email },
    });

    if (checkEmail)
      throw new ConflictException('This email is already registered');

    params.password = await bcrypt.hash(params.password, 10);

    let user = await this.prisma.user.create({
      data: params,
    });

    return user;
  }
}
