/**
 * Sanitizes error messages to prevent leaking database schema or internal details to the client.
 * @param error Any error object or string
 * @param context Optional context string to help identify where the error occurred
 * @returns A user-friendly error message
 */
export function sanitizeError(error: any, context?: string): string {
    console.error(`[Error]${context ? ` Context: ${context} |` : ''}`, error);

    // If it's already a string, check for common DB keywords
    const message = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred';

    // Common database error patterns to hide
    const dbKeywords = [
        'relation',
        'column',
        'table',
        'schema',
        'constraint',
        'foreign key',
        'syntax error',
        'pg_toast',
        'PostgREST'
    ];

    if (dbKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
        return 'A database error occurred. Please try again later or contact support if the issue persists.';
    }

    // Handle specific Supabase error codes if available
    if (error?.code) {
        switch (error.code) {
            case '23505':
                return 'This record already exists.';
            case '23503':
                return 'This operation cannot be completed due to existing dependencies.';
            case '42P01':
                return 'Resource configuration error. Please contact the administrator.';
            case 'PGRST116':
                return 'The requested record was not found.';
            default:
                // If it's an unknown DB code, return generic message
                if (error.code.startsWith('23') || error.code.startsWith('42')) {
                    return 'A system error occurred while processing your request.';
                }
        }
    }

    return message;
}
