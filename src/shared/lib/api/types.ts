/**
 * API 공통 타입 정의
 */

export interface ErrorResponse {
  errorCode: string;
  message: string;
}

export interface PaginationParams {
  page?: number;
  size?: number;
}

export interface PaginationResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

