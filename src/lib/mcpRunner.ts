// In-app execution of the same seven MCP tools the agent endpoint exposes.
// Runs as the signed-in user through the app's Supabase session, so results
// are identical to what an MCP client sees after OAuth.
import { supabase } from '@/integrations/supabase/client';

export type ToolArgSpec = {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date';
  required?: boolean;
  placeholder?: string;
};

export type McpToolDef = {
  name: string;
  title: string;
  description: string;
  readOnly: boolean;
  args: ToolArgSpec[];
  run: (input: Record<string, string>) => Promise<unknown>;
};

const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const day = (offset: number) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);

async function currentOrgId(): Promise<string> {
  const { data: session } = await supabase.auth.getUser();
  const userId = session.user?.id;
  if (!userId) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('organization_members')
    .select('org_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.org_id) throw new Error('This account is not a member of any organization');
  return data.org_id as string;
}

export const MCP_TOOLS: McpToolDef[] = [
  {
    name: 'fleet_compliance_summary',
    title: 'Fleet compliance summary',
    description:
      'Vessel count, certificates expired or expiring within 90 days, and open incidents for your organization.',
    readOnly: true,
    args: [],
    run: async () => {
      const orgId = await currentOrgId();
      const { data: vessels, error: vErr } = await supabase
        .from('vessels')
        .select('id, name, status')
        .eq('org_id', orgId);
      if (vErr) throw new Error(vErr.message);
      const fleet = vessels ?? [];

      const today = day(0);
      const soon = day(90);
      let expired = 0;
      let expiringSoon = 0;
      if (fleet.length > 0) {
        const { data: certs, error: cErr } = await supabase
          .from('vessel_certifications')
          .select('expiry_date')
          .in('vessel_id', fleet.map((v) => v.id))
          .lte('expiry_date', soon);
        if (cErr) throw new Error(cErr.message);
        for (const c of certs ?? []) {
          if (c.expiry_date && c.expiry_date < today) expired += 1;
          else expiringSoon += 1;
        }
      }

      const { data: incidents, error: iErr } = await supabase
        .from('incidents')
        .select('severity, investigation_status')
        .eq('org_id', orgId);
      if (iErr) throw new Error(iErr.message);
      const rows = incidents ?? [];

      return {
        vessels: {
          total: fleet.length,
          active: fleet.filter((v) => (v.status ?? '').toLowerCase() === 'active').length,
        },
        certificates: { expired, expiring_within_90_days: expiringSoon },
        incidents: {
          total: rows.length,
          open: rows.filter((i) => (i.investigation_status ?? 'open').toLowerCase() !== 'closed').length,
          high_or_critical: rows.filter((i) => ['high', 'critical'].includes((i.severity ?? '').toLowerCase())).length,
        },
      };
    },
  },
  {
    name: 'list_vessels',
    title: 'List vessels',
    description: 'List vessels in your fleet, optionally filtered by name or IMO number.',
    readOnly: true,
    args: [
      { key: 'search', label: 'Search (name or IMO)', type: 'text', placeholder: 'EAGLE' },
      { key: 'limit', label: 'Limit', type: 'number', placeholder: '25' },
    ],
    run: async (input) => {
      const orgId = await currentOrgId();
      let query = supabase
        .from('vessels')
        .select(
          'id, name, imo_number, call_sign, vessel_type, flag_state, classification_society, gross_tonnage, deadweight, year_built, status',
        )
        .eq('org_id', orgId)
        .order('name', { ascending: true })
        .limit(num(input.limit, 25));
      if (input.search) query = query.or(`name.ilike.%${input.search}%,imo_number.ilike.%${input.search}%`);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { count: data?.length ?? 0, vessels: data ?? [] };
    },
  },
  {
    name: 'get_vessel_profile',
    title: 'Get vessel profile',
    description: 'Full particulars of one vessel plus its certificates, by vessel id or IMO number.',
    readOnly: true,
    args: [
      { key: 'vessel_id', label: 'Vessel ID (UUID)', type: 'text' },
      { key: 'imo_number', label: 'IMO number', type: 'text' },
    ],
    run: async (input) => {
      if (!input.vessel_id && !input.imo_number) throw new Error('Provide either vessel_id or imo_number.');
      const orgId = await currentOrgId();
      let query = supabase.from('vessels').select('*').eq('org_id', orgId).limit(1);
      query = input.vessel_id ? query.eq('id', input.vessel_id) : query.eq('imo_number', input.imo_number);
      const { data: vessel, error } = await query.maybeSingle();
      if (error) throw new Error(error.message);
      if (!vessel) throw new Error('Vessel not found in your organization.');

      const { data: certificates, error: cErr } = await supabase
        .from('vessel_certifications')
        .select('id, certificate_name, certificate_type, issuing_authority, issue_date, expiry_date, status')
        .eq('vessel_id', vessel.id)
        .order('expiry_date', { ascending: true });
      if (cErr) throw new Error(cErr.message);
      return { vessel, certificates: certificates ?? [] };
    },
  },
  {
    name: 'list_expiring_certificates',
    title: 'List expiring certificates',
    description: 'Statutory and class certificates expiring within a look-ahead window.',
    readOnly: true,
    args: [
      { key: 'within_days', label: 'Within days', type: 'number', placeholder: '90' },
      { key: 'vessel_id', label: 'Vessel ID (optional)', type: 'text' },
      { key: 'limit', label: 'Limit', type: 'number', placeholder: '50' },
    ],
    run: async (input) => {
      const orgId = await currentOrgId();
      const withinDays = num(input.within_days, 90);
      const { data: vessels, error: vErr } = await supabase
        .from('vessels')
        .select('id, name, imo_number')
        .eq('org_id', orgId);
      if (vErr) throw new Error(vErr.message);
      const fleet = vessels ?? [];
      const ids = fleet.filter((v) => !input.vessel_id || v.id === input.vessel_id).map((v) => v.id);
      if (ids.length === 0) return { count: 0, certificates: [] };

      const { data, error } = await supabase
        .from('vessel_certifications')
        .select('id, vessel_id, certificate_name, certificate_type, issuing_authority, expiry_date, status')
        .in('vessel_id', ids)
        .lte('expiry_date', day(withinDays))
        .order('expiry_date', { ascending: true })
        .limit(num(input.limit, 50));
      if (error) throw new Error(error.message);

      const byId = new Map(fleet.map((v) => [v.id, v]));
      const today = day(0);
      const certificates = (data ?? []).map((c) => ({
        ...c,
        vessel_name: c.vessel_id ? byId.get(c.vessel_id)?.name ?? null : null,
        imo_number: c.vessel_id ? byId.get(c.vessel_id)?.imo_number ?? null : null,
        expired: !!c.expiry_date && c.expiry_date < today,
      }));
      return { count: certificates.length, within_days: withinDays, certificates };
    },
  },
  {
    name: 'list_audit_findings',
    title: 'List audit findings',
    description: 'Audit findings (non-conformities, observations) raised across your audits.',
    readOnly: true,
    args: [
      { key: 'vessel_id', label: 'Vessel ID (optional)', type: 'text' },
      { key: 'status', label: 'Status (optional)', type: 'text', placeholder: 'open' },
      { key: 'limit', label: 'Limit', type: 'number', placeholder: '25' },
    ],
    run: async (input) => {
      const orgId = await currentOrgId();
      let query = (supabase
        .from('audit_findings')
        .select('*, audits!inner(org_id, vessel_id, audit_type, audit_date)') as any)
        .eq('audits.org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(num(input.limit, 25));
      if (input.vessel_id) query = query.eq('audits.vessel_id', input.vessel_id);
      if (input.status) query = query.eq('status', input.status);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { count: data?.length ?? 0, findings: data ?? [] };
    },
  },
  {
    name: 'list_incidents',
    title: 'List incidents',
    description: 'Reported safety, pollution and near-miss incidents for your fleet.',
    readOnly: true,
    args: [
      { key: 'vessel_id', label: 'Vessel ID (optional)', type: 'text' },
      { key: 'severity', label: 'Severity (optional)', type: 'text', placeholder: 'high' },
      { key: 'since', label: 'Since (YYYY-MM-DD)', type: 'date' },
      { key: 'limit', label: 'Limit', type: 'number', placeholder: '25' },
    ],
    run: async (input) => {
      const orgId = await currentOrgId();
      let query = supabase
        .from('incidents')
        .select('id, title, incident_type, severity, incident_date, location, investigation_status, vessel_id, vessels(name)')
        .eq('org_id', orgId)
        .order('incident_date', { ascending: false })
        .limit(num(input.limit, 25));
      if (input.vessel_id) query = query.eq('vessel_id', input.vessel_id);
      if (input.severity) query = query.eq('severity', input.severity);
      if (input.since) query = query.gte('incident_date', input.since);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { count: data?.length ?? 0, incidents: data ?? [] };
    },
  },
  {
    name: 'report_incident',
    title: 'Report an incident',
    description: 'Create a new incident record for a vessel in your organization.',
    readOnly: false,
    args: [
      { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Main engine oil leak' },
      { key: 'incident_type', label: 'Incident type', type: 'text', required: true, placeholder: 'Near Miss' },
      { key: 'incident_date', label: 'Incident date', type: 'date', required: true },
      { key: 'severity', label: 'Severity', type: 'text', placeholder: 'low' },
      { key: 'vessel_id', label: 'Vessel ID (optional)', type: 'text' },
      { key: 'location', label: 'Location (optional)', type: 'text' },
      { key: 'description', label: 'Description (optional)', type: 'text' },
    ],
    run: async (input) => {
      if (!input.title || !input.incident_type || !input.incident_date) {
        throw new Error('title, incident_type and incident_date are required.');
      }
      const { data: session } = await supabase.auth.getUser();
      const userId = session.user?.id;
      const orgId = await currentOrgId();

      if (input.vessel_id) {
        const { data: vessel, error: vErr } = await supabase
          .from('vessels')
          .select('id')
          .eq('org_id', orgId)
          .eq('id', input.vessel_id)
          .maybeSingle();
        if (vErr) throw new Error(vErr.message);
        if (!vessel) throw new Error('Vessel not found in your organization.');
      }

      const { data, error } = await supabase
        .from('incidents')
        .insert({
          org_id: orgId,
          user_id: userId!,
          title: input.title,
          incident_type: input.incident_type,
          incident_date: input.incident_date,
          severity: input.severity || 'low',
          vessel_id: input.vessel_id || null,
          location: input.location || null,
          description: input.description || null,
          investigation_status: 'open',
        })
        .select('id, title, incident_type, severity, incident_date, investigation_status')
        .single();
      if (error) throw new Error(error.message);
      return { created: data };
    },
  },
];
