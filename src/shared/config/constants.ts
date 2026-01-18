export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

export const ROUTES = {
  HOME: '/',
  EXPLORE: '/explore',
  ADMIN: '/admin',
  LOGIN: '/login',
} as const;

