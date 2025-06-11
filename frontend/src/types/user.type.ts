/**
 * @file user.ts
 * @description Kullanıcı ile ilgili tip tanımları
 */

/**
 * Kullanıcı rolü tanımları
 */
type UserRole = "user" | "admin" | "teacher" | "student";


export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role?: UserRole;
  onboarded?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  // Diğer kullanıcı bilgileri
}