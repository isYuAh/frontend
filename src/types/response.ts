export type ErrorResponse = {
  type: 'error',
  message: string
}
export type SuccessResponse<T> = {
  type: 'success',
  data: T
}
export type Response<T> = ErrorResponse | SuccessResponse<T>