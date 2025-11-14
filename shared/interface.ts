// @ts-nocheck
export interface ISuccessResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface IPaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

//-------------------------
export interface IErrorResponse {
  success: boolean;
  message: string;
}
