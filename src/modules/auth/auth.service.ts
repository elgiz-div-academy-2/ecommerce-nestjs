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
import { FirebaseUser } from 'src/libs/firebase/firebase.types';
import { Prisma, ProviderType, UserProvider, UserRole } from '@prisma/client';
import { DecodedIdToken } from 'firebase-admin/auth';

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

  async upsertUserWithToken(firebaseResult: DecodedIdToken) {
    const sign_in_provider = firebaseResult.firebase.sign_in_provider;
    const phone =
      sign_in_provider === 'phone'
        ? firebaseResult.firebase.identities.phone[0]
        : null;
    const email = firebaseResult.email || null;

    let providerType: ProviderType | undefined;

    if (sign_in_provider === 'google.com') {
      providerType = ProviderType.GOOGLE;
    } else if (sign_in_provider === 'phone') {
      providerType = ProviderType.PHONE;
    }

    let conditions: Prisma.UserWhereInput[] = [
      {
        provider: UserProvider.FIREBASE,
        providerId: firebaseResult.uid,
      },
    ];

    if (phone) {
      conditions.push({
        phone,
      });
    }

    if (email) {
      conditions.push({
        email,
      });
    }

    let user = await this.prisma.user.findFirst({
      where: {
        OR: conditions,
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          phone,
          password: crypto.randomUUID(),
          provider: UserProvider.FIREBASE,
          providerId: firebaseResult.uid,
          role: UserRole.USER,
          providerType,
        },
      });
    }

    let token = this.jwt.sign({ userId: user.id });

    return {
      user,
      token,
    };
  }
}
