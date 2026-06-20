export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  path: string;
  timestamp: string;
}

export interface ApiSuccessResponse<T> {
  data: T;
  path: string;
  statusCode: number;
  timestamp: string;
}
