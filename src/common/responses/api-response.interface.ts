export interface ApiErrorResponse {
  error: string;
  message: string | string[];
  path: string;
  statusCode: number;
  timestamp: string;
}

export interface ApiSuccessResponse<T> {
  data: T;
  path: string;
  statusCode: number;
  timestamp: string;
}
