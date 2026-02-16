import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';
import { ServiceResponse, ServiceError } from '@/types/errors';

export const invokeService = async <T>(
    rpcName: string,
    params: any
): Promise<ServiceResponse<T>> => {
    try {
        const { data, error } = await supabase.rpc(rpcName, params);

        if (error) {
            logger.error(`Service Error [${rpcName}]: ${error.message}`, { params, error });
            return {
                data: null,
                error: {
                    code: 'DATABASE_ERROR',
                    message: error.message,
                    details: error
                }
            };
        }

        // Backend services return { success: boolean, data: T, error?: string }
        const result = data as any;
        if (result && result.success === false) {
            logger.warn(`Business Logic Error [${rpcName}]: ${result.error}`, { params, result });
            return {
                data: null,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: result.error || 'Operation failed',
                    details: result
                }
            };
        }

        return { data: result as T, error: null };
    } catch (err: any) {
        logger.error(`Critical Service Failure [${rpcName}]: ${err.message}`, { params, err });
        return {
            data: null,
            error: {
                code: 'SERVICE_UNAVAILABLE',
                message: 'Could not connect to the domain service node.',
                details: err
            }
        };
    }
};
