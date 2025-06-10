import { Request } from 'express';

/**
 * Kimlik bilgisine sahip istek
 */
export interface RequestWithUser extends Request {
  user: {
    id: string;
    uid: string;
    email: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string | null;
    role?: 'USER' | 'ADMIN';
    createdAt?: string | Date;
    lastLogin?: string | Date;
    firebaseUser?: any; // Firebase kullanıcı nesnesi
  };
}
