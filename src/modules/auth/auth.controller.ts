import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserRegisterDto } from './dto/register-user.dto';
import { AuthService } from './auth.service';
import { UserLoginDto, UserLoginFirebaseDto } from './dto/login-user.dto';
import { FirebaseService } from 'src/libs/firebase/firebase.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private firebaseService: FirebaseService,
  ) {}

  @Post('login')
  login(@Body() body: UserLoginDto) {
    return this.authService.login(body);
  }

  @Post('register')
  register(@Body() body: UserRegisterDto) {
    return this.authService.register(body);
  }

  @Post('firebase')
  async loginWithGoogle(@Body() body: UserLoginFirebaseDto) {
    let firebaseResult = await this.firebaseService.getUserData(body);
    return this.authService.upsertUserWithToken(firebaseResult);
  }
}
