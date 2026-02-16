export type ErrorCode =
    | 'UNAUTHORIZED'
    | 'VALIDATION_ERROR'
    | 'DATABASE_ERROR'
    | 'SERVICE_UNAVAILABLE'
    | 'UNKNOWN_ERROR';

export interface ServiceError {
    code: ErrorCode;
    message: string;
    details?: any;
}

export interface ServiceResponse<T> {
    data: T | null;
    error: ServiceError | null;
}
