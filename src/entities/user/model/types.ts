/**
 * User Entity 타입 정의
 */

export interface User {
  userNum: number;
  email: string;
  nickname: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface UserSignupRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface UserSignupResponse {
  userNum: number;
  email: string;
  nickname: string;
}

export interface UserUpdateRequest {
  nickname?: string;
  password?: string;
}

export type UserMeResponse = User

