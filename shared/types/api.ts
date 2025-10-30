export interface ApiResponseBase {
  success: boolean;
  message?: string;
}

// Cursor based Pagination for infinite scrolling
// @param cursor - The current cursor position
// @param nextCursor - The next cursor position for fetching the next set of data
// @param hasNextPage - Indicates if there are more pages to fetch
// Frontend will use `nextCursor` to fetch the next page of data
export interface CursorPagination {
  cursor?: string | null;
  nextCursor?: string | null;
  hasNextPage: boolean;
}

export interface ApiSuccessResponse<T> extends ApiResponseBase {
  success: true;
  data: T;
  pagination?: CursorPagination;
}

export interface ApiErrorResponse extends ApiResponseBase {
  success: false;
  error: {
    code: string;
    message?: string;
  };
}

export interface ApiValidationErrorResponse extends ApiResponseBase {
  success: false;
  error: {
    code: 'VALIDATION_ERROR';
    message?: string;
    errors: {
      field: string;
      code: string;
      message?: string;
    }[];
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse | ApiValidationErrorResponse;
