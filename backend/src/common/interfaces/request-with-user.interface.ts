import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';

/**
 * Kullanıcı bilgilerini içeren temel arayüz
 */
interface User {
  id: string;
  uid: string;
  email: string;
  displayName?: string | null;
  createdAt: Date;
  lastLogin: Date;
  settings?: any;
}

/**
 * Firebase kullanıcı bilgilerini de içeren genişletilmiş kullanıcı arayüzü
 */
interface PrismaUserWithFirebase extends User {
  firebaseUser: DecodedIdToken;
}

/**
 * Kullanıcı bilgilerini içeren HTTP isteği arayüzü
 */
export interface RequestWithUser extends Request {
  user: PrismaUserWithFirebase;
}
