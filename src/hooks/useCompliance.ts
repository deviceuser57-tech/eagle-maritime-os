import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';

export interface ComplianceScore {
    total_score: number;
    admin_score: number;
    coverage_score: number;
    findings_score: number;
    risk_score: number;
    has_statutory_breach: boolean;
    last_calculated_at: string;
}

export interface FleetCompliance {
    fleet_compliance_index: number;
    vessel_count: number;
    at_risk_count: number;
    is_weighted: boolean;
}

export const useCompliance = (vesselId?: string) => {
    const { orgId } = useOrganization();
    const queryClient = useQueryClient();

    // Get Fleet Compliance Index
    const fleetQuery = useQuery({
        queryKey: ['fleet_compliance', orgId],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('rpc_get_fleet_compliance_index', {
                p_org_id: orgId
            });
            if (error) throw error;
            return data as FleetCompliance;
        },
        enabled: !!orgId
    });

    // Get Individual Vessel Score
    const vesselQuery = useQuery({
        queryKey: ['vessel_compliance', vesselId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('vessel_compliance_scores')
                .select('*')
                .eq('vessel_id', vesselId)
                .single();

            if (error) throw error;
            return data as ComplianceScore;
        },
        enabled: !!vesselId
    });

    // Recalculate Score Mutation
    const calculateMutation = useMutation({
        mutationFn: async (vid: string) => {
            const { data, error } = await supabase.rpc('rpc_calculate_vessel_compliance', {
                p_vessel_id: vid
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vessel_compliance'] });
            queryClient.invalidateQueries({ queryKey: ['fleet_compliance'] });
        }
    });

    return {
        fleetInfo: fleetQuery.data,
        vesselScore: vesselQuery.data,
        isLoading: fleetQuery.isLoading || vesselQuery.isLoading,
        isRefetching: fleetQuery.isRefetching || vesselQuery.isRefetching,
        calculateScore: calculateMutation.mutate,
        isCalculating: calculateMutation.isPending
    };
};
