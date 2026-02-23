import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';

import { Regulation, CertificateRegulation, AuditRegulation, VesselRegulationTag } from '@/types';
import { toast } from 'sonner';

export const useRegulations = () => {
    const { orgId } = useOrganization();
    const queryClient = useQueryClient();

    // 1. Fetch Regulations (Global + Org-specific)
    const { data: regulations = [], isLoading: isLoadingRegs } = useQuery({
        queryKey: ['regulations', orgId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('regulations')
                .select('*')
                .or(`is_global.eq.true${orgId ? `,org_id.eq.${orgId}` : ''}`)
                .order('convention', { ascending: true })
                .order('code', { ascending: true });

            if (error) throw error;
            return data as Regulation[];
        },
        enabled: true, // Always fetch at least global ones
    });

    // 2. Fetch Certificate Links
    const { data: certificateLinks = [] } = useQuery({
        queryKey: ['certificate_regulations', orgId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('certificate_regulations')
                .select('*, regulations(*)');
            if (error) throw error;
            return data as (CertificateRegulation & { regulations: Regulation })[];
        },
        enabled: !!orgId,
    });

    // 3. Fetch Audit Links
    const { data: auditLinks = [] } = useQuery({
        queryKey: ['audit_regulations', orgId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('audit_regulations')
                .select('*, regulations(*)');
            if (error) throw error;
            return data as (AuditRegulation & { regulations: Regulation })[];
        },
        enabled: !!orgId,
    });

    // 4. Fetch Vessel Links
    const { data: vesselLinks = [] } = useQuery({
        queryKey: ['vessel_regulation_tags', orgId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('vessel_regulation_tags')
                .select('*, regulations(*)');
            if (error) throw error;
            return data as (VesselRegulationTag & { regulations: Regulation })[];
        },
        enabled: !!orgId,
    });

    // Mutations
    const upsertRegulation = useMutation({
        mutationFn: async (reg: Partial<Regulation>) => {
            const { data, error } = await supabase
                .from('regulations')
                .upsert({ ...reg, org_id: reg.isGlobal ? null : orgId })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['regulations'] });
            toast.success('Regulation saved successfully');
        },
        onError: (error: any) => toast.error('Error saving regulation: ' + error.message),
    });

    const linkToCertificate = useMutation({
        mutationFn: async (link: Omit<CertificateRegulation, 'id'>) => {
            const { data, error } = await supabase
                .from('certificate_regulations')
                .insert({ ...link, org_id: orgId })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['certificate_regulations'] });
            toast.success('Linked to certificate type');
        },
    });

    const linkToAudit = useMutation({
        mutationFn: async (link: Omit<AuditRegulation, 'id'>) => {
            const { data, error } = await supabase
                .from('audit_regulations')
                .insert({ ...link, org_id: orgId })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['audit_regulations'] });
            toast.success('Linked to audit type');
        },
    });

    const tagVessel = useMutation({
        mutationFn: async (tag: Omit<VesselRegulationTag, 'id'>) => {
            const { data, error } = await supabase
                .from('vessel_regulation_tags')
                .insert({ ...tag, org_id: orgId })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vessel_regulation_tags'] });
            toast.success('Vessel tagged');
        },
    });

    return {
        regulations,
        certificateLinks,
        auditLinks,
        vesselLinks,
        isLoading: isLoadingRegs,
        upsertRegulation,
        linkToCertificate,
        linkToAudit,
        tagVessel,
    };
};

export const useVesselRegulatoryPortfolio = (vesselId?: string) => {
    const { orgId } = useOrganization();

    return useQuery({
        queryKey: ['vessel_regulatory_portfolio', vesselId, orgId],
        queryFn: async () => {
            if (!vesselId) return [];

            // 1. Get vessel tags
            const { data: taggedRegs } = await supabase
                .from('vessel_regulation_tags')
                .select('regulations(*)')
                .eq('vessel_id', vesselId);

            // 2. Get regs from vessel certificates
            const { data: certs } = await supabase
                .from('vessel_certifications')
                .select('certificate_type_id')
                .eq('vessel_id', vesselId);

            const certTypeIds = certs?.map(c => c.certificate_type_id).filter(Boolean) || [];
            let certRegs: any[] = [];
            if (certTypeIds.length > 0) {
                const { data } = await supabase
                    .from('certificate_regulations')
                    .select('regulations(*)')
                    .in('certificate_type_id', certTypeIds);
                certRegs = data || [];
            }

            // 3. Get regs from vessel audits
            const { data: audits } = await supabase
                .from('audits')
                .select('audit_type')
                .eq('vessel_id', vesselId);

            const auditTypes = audits?.map(a => a.audit_type).filter(Boolean) || [];
            let auditRegs: any[] = [];
            if (auditTypes.length > 0) {
                // Get audit type IDs first
                const { data: auditTypeRecords } = await supabase
                    .from('setup_audit_types')
                    .select('id')
                    .in('audit_type_name', auditTypes);

                const auditTypeIds = auditTypeRecords?.map(r => r.id) || [];
                if (auditTypeIds.length > 0) {
                    const { data } = await supabase
                        .from('audit_regulations')
                        .select('regulations(*)')
                        .in('audit_type_id', auditTypeIds);
                    auditRegs = data || [];
                }
            }

            // Combine all
            const allRegs = [
                ...(taggedRegs?.map(r => r.regulations) || []),
                ...(certRegs?.map(r => r.regulations) || []),
                ...(auditRegs?.map(r => r.regulations) || []),
            ].filter(Boolean) as Regulation[];

            // Unique by ID
            const uniqueRegs = Array.from(new Map(allRegs.map(r => [r.id, r])).values());

            // Sort by convention and code
            return uniqueRegs.sort((a, b) => {
                const convComp = a.convention.localeCompare(b.convention);
                if (convComp !== 0) return convComp;
                return a.code.localeCompare(b.code);
            });
        },
        enabled: !!vesselId && !!orgId,
    });
};
