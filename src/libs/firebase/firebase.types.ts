interface FirebaseIdentities {
  'google.com': string[];
  email: string[];
}

interface FirebaseData {
  identities: FirebaseIdentities;
  sign_in_provider: string;
}

export interface FirebaseUser {
  name: string;
  picture: string;
  iss: string;
  aud: string;
  auth_time: number;
  user_id: string;
  sub: string;
  iat: number;
  exp: number;
  email: string;
  email_verified: boolean;
  firebase: FirebaseData;
  uid: string;
}
