import { supabase } from '@/integrations/supabase/client';

export interface AuditEventPayload {
  actor_id?: string | null;
  org_id?: string | null;
  action: string;
  resource_type?: string | null;
  resource_id?: string | null;
  outcome?: 'success' | 'failure' | 'denied';
  detail?: Record<string, unknown> | null;
}

/**
 * Log a security/audit event to the enterprise_audit_log table.
 * Fire-and-forget — does NOT throw on error to avoid disrupting UX flows.
 */
export const logAuditEvent = async (payload: AuditEventPayload): Promise<void> => {
  try {
    const { error } = await supabase.from('enterprise_audit_log').insert({
      actor_id: payload.actor_id ?? null,
      org_id: payload.org_id ?? null,
      action: payload.action,
      resource_type: payload.resource_type ?? null,
      resource_id: payload.resource_id ?? null,
      outcome: payload.outcome ?? 'success',
      detail: payload.detail ?? null,
    });
    if (error) {
      console.warn('[auditService] Failed to write audit event:', error.message);
    }
  } catch (err) {
    console.warn('[auditService] Unexpected error logging audit event:', err);
  }
};

/**
 * Convenience wrappers for common action patterns.
 */
export const auditService = {
  /** Record a user login event */
  loginSuccess: (actorId: string, orgId?: string | null) =>
    logAuditEvent({ actor_id: actorId, org_id: orgId, action: 'auth.login', outcome: 'success' }),

  /** Record a failed login attempt */
  loginFailure: (detail?: Record<string, unknown>) =>
    logAuditEvent({ action: 'auth.login', outcome: 'failure', detail }),

  /** Record CRUD operations */
  create: (actorId: string, resourceType: string, resourceId: string, orgId?: string | null) =>
    logAuditEvent({ actor_id: actorId, org_id: orgId, action: `${resourceType}.create`, resource_type: resourceType, resource_id: resourceId, outcome: 'success' }),

  update: (actorId: string, resourceType: string, resourceId: string, orgId?: string | null, detail?: Record<string, unknown>) =>
    logAuditEvent({ actor_id: actorId, org_id: orgId, action: `${resourceType}.update`, resource_type: resourceType, resource_id: resourceId, outcome: 'success', detail }),

  delete: (actorId: string, resourceType: string, resourceId: string, orgId?: string | null) =>
    logAuditEvent({ actor_id: actorId, org_id: orgId, action: `${resourceType}.delete`, resource_type: resourceType, resource_id: resourceId, outcome: 'success' }),

  /** Record a denied/unauthorized access attempt */
  denied: (actorId: string | null, action: string, orgId?: string | null, detail?: Record<string, unknown>) =>
    logAuditEvent({ actor_id: actorId, org_id: orgId, action, outcome: 'denied', detail }),
};
