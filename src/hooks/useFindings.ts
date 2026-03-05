import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import type { Tables } from '@/integrations/supabase/types';

export type AuditFinding = Tables<'audit_findings'>;

export const useFindings = (vesselId?: string) => {
    const { user } = useAuth();
    const { orgId } = useOrganization();

    return useQuery({
        queryKey: ['audit_findings', orgId, vesselId],
        queryFn: async () => {
            if (!orgId) return [];

            let query = (supabase
                .from('audit_findings')
                .select('*, audits!inner(org_id, vessel_id)') as any)
                .eq('audits.org_id', orgId);

            if (vesselId) {
                query = query.eq('audits.vessel_id', vesselId);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            return (data || []) as any as (AuditFinding & { audits: { org_id: string; vessel_id: string } })[];
        },
        enabled: !!user && !!orgId,
    });
};
