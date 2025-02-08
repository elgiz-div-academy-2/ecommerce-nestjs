import { Injectable } from '@nestjs/common';
import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { UserLoginFirebaseDto } from 'src/modules/auth/dto/login-user.dto';
const firebaseConfig = require('../../../keys/firebase.json');

@Injectable()
export class FirebaseService {
  private app = admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
  });
  constructor() {}

  async getUserData(params: UserLoginFirebaseDto) {
    let result = await getAuth(this.app).verifyIdToken(params.token);
    return result;
  }
}
