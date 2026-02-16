import { useState } from 'react';
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
  const [loading] = useState(false);
  const { toast } = useToast();

  const addERPConfig = async (_config: Omit<ERPConfig, 'id' | 'status' | 'created_at'>) => {
    toast({ title: 'Integration tables not yet configured', description: 'ERP integration requires additional database setup.' });
  };

  const deleteERPConfig = async (id: string) => {
    setErpConfigs(prev => prev.filter(c => c.id !== id));
  };

  const addWebhook = async (_webhook: { url: string; events: string[] }) => {
    toast({ title: 'Integration tables not yet configured', description: 'Webhook integration requires additional database setup.' });
  };

  const deleteWebhook = async (id: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== id));
  };

  const refetch = async () => {};

  return { erpConfigs, webhooks, logs, loading, addERPConfig, deleteERPConfig, addWebhook, deleteWebhook, refetch };
};
