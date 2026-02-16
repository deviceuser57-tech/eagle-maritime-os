import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';

export interface ERPConfig {
    id: string;
    name: string;
    erp_type: 'SAP' | 'ORACLE' | 'DYNAMICS' | 'CUSTOM';
    base_url: string | null;
    status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
    created_at: string;
}

export interface WebhookEndpoint {
    id: string;
    url: string;
    events: string[];
    is_active: boolean;
    created_at: string;
}

export interface WebhookLog {
    id: string;
    event_type: string;
    status_code: number | null;
    created_at: string;
    duration_ms: number | null;
}

export const useIntegrations = () => {
    const [erpConfigs, setErpConfigs] = useState<ERPConfig[]>([]);
    const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
    const [logs, setLogs] = useState<WebhookLog[]>([]);
    const [loading, setLoading] = useState(true);
    const { orgId } = useOrganization();
    const { toast } = useToast();

    const fetchIntegrations = async () => {
        if (!orgId) return;

        try {
            setLoading(true);
            const [erpRes, webhookRes, logRes] = await Promise.all([
                supabase.from('erp_configurations').select('*').eq('org_id', orgId),
                supabase.from('webhook_endpoints').select('*').eq('org_id', orgId),
                supabase.from('webhook_logs').select('id, event_type, status_code, created_at, duration_ms').eq('org_id', orgId).order('created_at', { ascending: false }).limit(20)
            ]);

            if (erpRes.error) throw erpRes.error;
            if (webhookRes.error) throw webhookRes.error;
            if (logRes.error) throw logRes.error;

            setErpConfigs(erpRes.data || []);
            setWebhooks(webhookRes.data || []);
            setLogs(logRes.data || []);
        } catch (error: any) {
            toast({ title: 'Integration Sync Failed', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const addERPConfig = async (config: Omit<ERPConfig, 'id' | 'status' | 'created_at'>) => {
        if (!orgId) return;
        const { data, error } = await supabase.from('erp_configurations').insert([{ ...config, org_id: orgId }]).select().single();
        if (error) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
            setErpConfigs(prev => [...prev, data]);
            toast({ title: 'ERP Registered', description: `${config.name} has been added to the fleet.` });
        }
    };

    const deleteERPConfig = async (id: string) => {
        const { error } = await supabase.from('erp_configurations').delete().eq('id', id);
        if (!error) {
            setErpConfigs(prev => prev.filter(c => c.id !== id));
            toast({ title: 'Integration Removed', description: 'ERP connection severed successfully.' });
        }
    };

    const addWebhook = async (webhook: { url: string; events: string[] }) => {
        if (!orgId) return;
        const { data, error } = await supabase.from('webhook_endpoints').insert([{ ...webhook, org_id: orgId }]).select().single();
        if (!error) {
            setWebhooks(prev => [...prev, data]);
            toast({ title: 'Webhook Established', description: 'Endpoint is now listening for events.' });
        }
    };

    const deleteWebhook = async (id: string) => {
        const { error } = await supabase.from('webhook_endpoints').delete().eq('id', id);
        if (!error) {
            setWebhooks(prev => prev.filter(w => w.id !== id));
            toast({ title: 'Webhook Deleted', description: 'Endpoint removed from registry.' });
        }
    };

    useEffect(() => {
        fetchIntegrations();
    }, [orgId]);

    return { erpConfigs, webhooks, logs, loading, addERPConfig, deleteERPConfig, addWebhook, deleteWebhook, refetch: fetchIntegrations };
};
