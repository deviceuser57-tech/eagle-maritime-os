import { McpServer } from '@lovable.dev/mcp-js';
import { z } from 'zod';
import { createMcpSupabaseClient } from './supabase';

const server = new McpServer({
  name: 'EagleMaritimeMCP',
  version: '1.0.0',
});

// Helper for Audit Logging
const auditLog = async (supabase: any, toolName: string, params: any) => {
  try {
    await supabase.from('mcp_audit_logs').insert({
      tool_name: toolName,
      parameters: params,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Audit log failed:', error);
  }
};

// 1. fleet_compliance_summary
server.tool(
  'fleet_compliance_summary',
  'Get a high-level summary of fleet compliance',
  {},
  async (_args, context) => {
    const supabase = createMcpSupabaseClient(context.authHeader);
    await auditLog(supabase, 'fleet_compliance_summary', {});
    
    const { data, error } = await supabase.from('fleet_compliance').select('*').limit(1).single();
    if (error) throw new Error(error.message);
    return { summary: data };
  }
);

// 2. list_vessels (with pagination and filters)
server.tool(
  'list_vessels',
  'List vessels in the fleet with pagination and filtering',
  {
    limit: z.number().min(1).max(100).optional().default(10),
    offset: z.number().min(0).optional().default(0),
    type: z.string().optional(),
    status: z.string().optional(),
  },
  async (args, context) => {
    const supabase = createMcpSupabaseClient(context.authHeader);
    await auditLog(supabase, 'list_vessels', args);

    let query = supabase.from('vessels').select('*', { count: 'exact' });
    
    if (args.type) query = query.eq('vessel_type', args.type);
    if (args.status) query = query.eq('status', args.status);
    
    const { data, count, error } = await query
      .range(args.offset, args.offset + args.limit - 1);

    if (error) throw new Error(error.message);
    return { vessels: data, total: count, limit: args.limit, offset: args.offset };
  }
);

// 3. get_vessel_profile
server.tool(
  'get_vessel_profile',
  'Get detailed profile of a specific vessel',
  { vesselId: z.string().uuid() },
  async ({ vesselId }, context) => {
    const supabase = createMcpSupabaseClient(context.authHeader);
    await auditLog(supabase, 'get_vessel_profile', { vesselId });

    const { data, error } = await supabase.from('vessels').select('*, vessel_certificates(*)').eq('id', vesselId).single();
    if (error) throw new Error(error.message);
    return { profile: data };
  }
);

// 4. list_expiring_certificates
server.tool(
  'list_expiring_certificates',
  'List certificates expiring within a given timeframe (days)',
  { days: z.number().min(1).max(365).optional().default(30) },
  async ({ days }, context) => {
    const supabase = createMcpSupabaseClient(context.authHeader);
    await auditLog(supabase, 'list_expiring_certificates', { days });

    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + days);
    
    const { data, error } = await supabase
      .from('vessel_certificates')
      .select('*, vessels(name)')
      .lte('expiry_date', thresholdDate.toISOString())
      .gte('expiry_date', new Date().toISOString());

    if (error) throw new Error(error.message);
    return { certificates: data };
  }
);

// 5. list_audit_findings
server.tool(
  'list_audit_findings',
  'List recent audit findings',
  { severity: z.enum(['Low', 'Medium', 'High', 'Critical']).optional() },
  async ({ severity }, context) => {
    const supabase = createMcpSupabaseClient(context.authHeader);
    await auditLog(supabase, 'list_audit_findings', { severity });

    let query = supabase.from('audit_findings').select('*');
    if (severity) query = query.eq('severity', severity);
    
    const { data, error } = await query.order('created_at', { ascending: false }).limit(20);
    if (error) throw new Error(error.message);
    return { findings: data };
  }
);

// 6. list_incidents
server.tool(
  'list_incidents',
  'List recent incidents',
  { status: z.string().optional() },
  async ({ status }, context) => {
    const supabase = createMcpSupabaseClient(context.authHeader);
    await auditLog(supabase, 'list_incidents', { status });

    let query = supabase.from('incidents').select('*');
    if (status) query = query.eq('status', status);
    
    const { data, error } = await query.order('reported_at', { ascending: false }).limit(20);
    if (error) throw new Error(error.message);
    return { incidents: data };
  }
);

// 7. report_incident
server.tool(
  'report_incident',
  'Report a new incident',
  { 
    vesselId: z.string().uuid(),
    title: z.string().min(5),
    description: z.string(),
    severity: z.enum(['Low', 'Medium', 'High', 'Critical'])
  },
  async (args, context) => {
    const supabase = createMcpSupabaseClient(context.authHeader);
    await auditLog(supabase, 'report_incident', args);

    const { data, error } = await supabase
      .from('incidents')
      .insert({ ...args, reported_at: new Date().toISOString(), status: 'Open' })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { incident: data };
  }
);

// 8. fleet_compliance_checklist (New Tool)
server.tool(
  'fleet_compliance_checklist',
  'Returns the next required actions per vessel based on expiring certs and unresolved high-severity findings',
  {},
  async (_args, context) => {
    const supabase = createMcpSupabaseClient(context.authHeader);
    await auditLog(supabase, 'fleet_compliance_checklist', {});

    // Simplified aggregation: fetch all active vessels and then resolve their compliance states
    const { data: vessels, error: vErr } = await supabase.from('vessels').select('id, name');
    if (vErr) throw new Error(vErr.message);

    const checklist = [];
    for (const vessel of vessels) {
       const actions = [];
       // Check certs
       const { data: certs } = await supabase
         .from('vessel_certificates')
         .select('certificate_name')
         .eq('vessel_id', vessel.id)
         .lte('expiry_date', new Date(Date.now() + 30*24*60*60*1000).toISOString());
       
       if (certs && certs.length > 0) {
         actions.push(`Renew ${certs.length} certificates within 30 days.`);
       }

       const { data: findings } = await supabase
         .from('audit_findings')
         .select('id')
         .eq('vessel_id', vessel.id)
         .in('severity', ['High', 'Critical'])
         .eq('status', 'Open');
         
       if (findings && findings.length > 0) {
         actions.push(`Resolve ${findings.length} high/critical severity findings.`);
       }

       if (actions.length > 0) {
         checklist.push({ vesselId: vessel.id, vesselName: vessel.name, requiredActions: actions });
       }
    }

    return { complianceChecklist: checklist };
  }
);

export default server;
