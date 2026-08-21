import { z } from 'zod';

// Reusable string sanitizer - strips dangerous chars and limits length
const safeString = (max = 255) =>
  z.string().max(max).transform(v => v.replace(/[<>"';\\]/g, ''));

const optionalSafeString = (max = 255) =>
  safeString(max).optional().nullable();

// Numeric input helper: HTML inputs yield strings; empty values mean "not provided".
const num = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => {
    if (v === '' || v === null || v === undefined) return undefined;
    if (typeof v === 'string') {
      const n = Number(v.trim());
      return Number.isNaN(n) ? v : n;
    }
    return v;
  }, schema);

// ── Vessel ──
export const vesselSchema = z.object({
  name: safeString(150).pipe(z.string().min(1, 'Vessel name is required')),
  imo_number: z.string().regex(/^\d{7}$/, 'IMO must be 7 digits').optional().nullable(),
  call_sign: optionalSafeString(20),
  mmsi_number: optionalSafeString(20),
  vessel_type: optionalSafeString(100),
  flag_state: optionalSafeString(100),
  gross_tonnage: num(z.number().nonnegative().max(1_000_000).optional().nullable()),
  deadweight: num(z.number().nonnegative().max(1_000_000).optional().nullable()),
  year_built: num(z.number().int().min(1800).max(2100).optional().nullable()),
  classification_society: optionalSafeString(200),
  status: optionalSafeString(50),
  class_number: optionalSafeString(100),
  last_drydock_date: z.string().optional().nullable(),
  next_drydock_date: z.string().optional().nullable(),
  previous_yard: optionalSafeString(200),
  remaining_tasks: optionalSafeString(5000),
  vessel_photos: z.array(z.string()).optional().nullable(),
  vessel_brochure: optionalSafeString(1000),
  painting_details: optionalSafeString(1000),
  navigation_equipment: optionalSafeString(2000),
  accommodations_pax: optionalSafeString(500),
});

// ── Audit ──
export const auditSchema = z.object({
  audit_type: safeString(100).pipe(z.string().min(1, 'Audit type is required')),
  scheduled_date: z.string().min(1, 'Scheduled date is required'),
  auditor_name: optionalSafeString(150),
  location: optionalSafeString(200),
  notes: optionalSafeString(2000),
});

// ── Incident ──
export const incidentSchema = z.object({
  title: safeString(200).pipe(z.string().min(1, 'Title is required')),
  incident_type: safeString(100).pipe(z.string().min(1, 'Incident type is required')),
  incident_date: z.string().min(1, 'Incident date is required'),
  severity: z.enum(['minor', 'moderate', 'major', 'critical']).default('minor'),
  description: optionalSafeString(5000),
  location: optionalSafeString(200),
  reported_by: optionalSafeString(150),
});

// ── Crew Member ──
export const crewMemberSchema = z.object({
  first_name: safeString(100).pipe(z.string().min(1, 'First name is required')),
  last_name: safeString(100).pipe(z.string().min(1, 'Last name is required')),
  rank: safeString(100).pipe(z.string().min(1, 'Rank is required')),
  email: z.string().email('Invalid email').max(255).optional().nullable().or(z.literal('')),
  phone: optionalSafeString(30),
  nationality: optionalSafeString(100),
});

// ── Maintenance Task ──
export const maintenanceTaskSchema = z.object({
  title: safeString(200).pipe(z.string().min(1, 'Title is required')),
  due_date: z.string().min(1, 'Due date is required'),
  task_type: safeString(100).default('preventive'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  status: safeString(50).default('pending'),
  description: optionalSafeString(5000),
  assigned_to: optionalSafeString(150),
  notes: optionalSafeString(2000),
});

// ── Custom Regulation ──
export const regulationSchema = z.object({
  code: safeString(50).pipe(z.string().min(1, 'Code is required')),
  title: safeString(300).pipe(z.string().min(1, 'Title is required')),
  category: safeString(100).default('custom'),
  description: optionalSafeString(5000),
  version: optionalSafeString(50),
  link: z.string().url('Invalid URL').max(2000).optional().nullable().or(z.literal('')).or(z.literal(null)),
  notes: optionalSafeString(2000),
});

// ── Setup Company ──
export const companySchema = z.object({
  company_type: z.enum(['owner', 'operator', 'technical', 'ism', 'doc'], { error: 'Company type is required' }),
  name: safeString(200).pipe(z.string().min(1, 'Company name is required')),
  contact_person: optionalSafeString(150),
  title: optionalSafeString(100),
  phone: optionalSafeString(30),
  email: z.string().email('Invalid email').max(255).optional().nullable().or(z.literal('')),
  address: optionalSafeString(500),
  remarks: optionalSafeString(2000),
});

// ── Setup Audit Type ──
export const auditTypeSchema = z.object({
  audit_type_name: safeString(150).pipe(z.string().min(1, 'Audit type name is required')),
  description: optionalSafeString(2000),
  frequency_months: num(z.number().int().min(1).max(120).optional().nullable()),
  is_external: z.boolean().default(false),
});

// ── Setup Finding Type ──
export const findingTypeSchema = z.object({
  finding_type_name: safeString(150).pipe(z.string().min(1, 'Finding type name is required')),
  severity: z.enum(['minor', 'major', 'critical']).default('minor'),
  description: optionalSafeString(2000),
  default_deduction: num(z.number().min(0).max(100).default(10)),
});

// ── Setup Finding Status ──
export const findingStatusSchema = z.object({
  status_name: safeString(100).pipe(z.string().min(1, 'Status name is required')),
  status_order: num(z.number().int().min(0).max(1000).default(0)),
  is_closed: z.boolean().default(false),
  color: optionalSafeString(20),
});

// ── Setup Root Cause ──
export const rootCauseSchema = z.object({
  cause_name: safeString(200).pipe(z.string().min(1, 'Cause name is required')),
  category: optionalSafeString(100),
  description: optionalSafeString(2000),
});

// ── Setup Crew Rank ──
export const crewRankSchema = z.object({
  rank_name: safeString(100).pipe(z.string().min(1, 'Rank name is required')),
  department: optionalSafeString(100),
  rank_order: num(z.number().int().min(0).max(1000).default(0)),
  is_officer: z.boolean().default(false),
});

// ── Setup Nationality ──
export const nationalitySchema = z.object({
  country_name: safeString(100).pipe(z.string().min(1, 'Country name is required')),
  country_code: optionalSafeString(10),
});

// ── Setup Contract Type ──
export const contractTypeSchema = z.object({
  contract_name: safeString(150).pipe(z.string().min(1, 'Contract name is required')),
  duration_months: num(z.number().int().min(1).max(120).optional().nullable()),
  description: optionalSafeString(2000),
});

// ── Setup Currency ──
export const currencySchema = z.object({
  currency_code: safeString(10).pipe(z.string().min(1, 'Currency code is required')),
  currency_name: safeString(100).pipe(z.string().min(1, 'Currency name is required')),
  symbol: optionalSafeString(10),
});

// ── Setup Classification Society ──
export const classificationSocietySchema = z.object({
  society_name: safeString(200).pipe(z.string().min(1, 'Society name is required')),
  abbreviation: optionalSafeString(20),
  website: z.string().url('Invalid URL').max(500).optional().nullable().or(z.literal('')).or(z.literal(null)),
});

// ── Setup Flag State ──
export const flagStateSchema = z.object({
  flag_name: safeString(100).pipe(z.string().min(1, 'Flag name is required')),
  flag_code: optionalSafeString(10),
  risk_level: z.enum(['low', 'standard', 'high']).default('standard'),
});

// ── Setup Certificate Type ──
export const certificateTypeSchema = z.object({
  certificate_category: z.enum(['statutory', 'class', 'crew', 'other'], { error: 'Category is required' }),
  certificate_name: safeString(200).pipe(z.string().min(1, 'Certificate name is required')),
  issuing_authority: optionalSafeString(200),
  validity_months: num(z.number().int().min(1).max(600).optional().nullable()),
  is_mandatory: z.boolean().default(false),
});

// ── Auditor ──
export const auditorSchema = z.object({
  name: safeString(150).pipe(z.string().min(1, 'Name is required')),
  email: z.string().email('Invalid email').max(255).optional().nullable().or(z.literal('')),
  phone: optionalSafeString(30),
  certification_number: optionalSafeString(100),
  specialization: optionalSafeString(200),
  status: safeString(50).default('available'),
  rating: num(z.number().min(0).max(5).optional().nullable()),
  audits_completed: num(z.number().int().min(0).max(100000).optional().nullable()),
});

// ── CII Record ──
export const ciiRecordSchema = z.object({
  year: num(z.number().int().min(2000).max(2100)),
  cii_value: num(z.number().min(0).max(100000)),
  cii_rating: safeString(10).pipe(z.string().min(1, 'CII rating is required')),
  target_value: num(z.number().min(0).max(100000).optional().nullable()),
  fuel_consumption: num(z.number().min(0).max(10_000_000).optional().nullable()),
  distance_travelled: num(z.number().min(0).max(10_000_000).optional().nullable()),
  cargo_carried: num(z.number().min(0).max(10_000_000).optional().nullable()),
  notes: optionalSafeString(2000),
});

// ── Corrective Action ──
export const correctiveActionSchema = z.object({
  action_description: safeString(2000).pipe(z.string().min(1, 'Action description is required')),
  responsible_person: optionalSafeString(150),
  due_date: z.string().optional().nullable(),
  status: safeString(50).default('pending'),
  evidence_url: z.string().url('Invalid URL').max(2000).optional().nullable().or(z.literal('')).or(z.literal(null)),
  notes: optionalSafeString(2000),
});

// ── Communication ──
export const communicationSchema = z.object({
  subject: safeString(300).pipe(z.string().min(1, 'Subject is required')),
  message: safeString(10000).pipe(z.string().min(1, 'Message is required')),
  sender_name: optionalSafeString(150),
  recipient_name: optionalSafeString(150),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal').optional().nullable(),
  status: safeString(50).default('unread'),
});

// ── Vessel Certification ──
export const vesselCertificationSchema = z.object({
  certificate_name: safeString(200).pipe(z.string().min(1, 'Certificate name is required')),
  certificate_type: safeString(100).pipe(z.string().min(1, 'Certificate type is required')),
  issuing_authority: optionalSafeString(200),
  issue_date: z.string().optional().nullable(),
  expiry_date: z.string().min(1, 'Expiry date is required'),
  status: safeString(50).default('active'),
  document_url: z.string().url('Invalid URL').max(2000).optional().nullable().or(z.literal('')).or(z.literal(null)),
  notes: optionalSafeString(2000),
});

// ── Voyage ──
export const voyageSchema = z.object({
  voyage_number: optionalSafeString(50),
  origin_port: safeString(200).pipe(z.string().min(1, 'Origin port is required')),
  destination_port: safeString(200).pipe(z.string().min(1, 'Destination port is required')),
  departure_date: z.string().optional().nullable(),
  arrival_date: z.string().optional().nullable(),
  eta: z.string().optional().nullable(),
  cargo_type: optionalSafeString(200),
  cargo_quantity: num(z.number().min(0).max(10_000_000).optional().nullable()),
  status: safeString(50).default('planned'),
  notes: optionalSafeString(2000),
});

// ── Insurance Claim ──
export const insuranceClaimSchema = z.object({
  claim_number: optionalSafeString(50),
  claim_type: safeString(100).pipe(z.string().min(1, 'Claim type is required')),
  policy_number: optionalSafeString(50),
  insurer_name: optionalSafeString(200),
  incident_date: z.string().optional().nullable(),
  submitted_date: z.string().optional().nullable(),
  resolved_date: z.string().optional().nullable(),
  claim_amount: num(z.number().min(0).max(1_000_000_000).optional().nullable()),
  approved_amount: num(z.number().min(0).max(1_000_000_000).optional().nullable()),
  status: safeString(50).default('pending'),
  description: optionalSafeString(5000),
});

// ── Project ──
export const projectSchema = z.object({
  name: safeString(200).pipe(z.string().min(1, 'Project name is required')),
  description: optionalSafeString(5000),
  project_type: optionalSafeString(100),
  status: safeString(50).default('planning'),
  start_date: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  completed_date: z.string().optional().nullable(),
  progress: num(z.number().int().min(0).max(100).optional().nullable()),
  vessel_count: num(z.number().int().min(0).max(10000).optional().nullable()),
});

// Helper to validate and return either { data } or { error }
export function validate<T>(schema: z.ZodSchema<T>, input: unknown): { data: T; error: null } | { data: null; error: z.ZodError } {
  const result = schema.safeParse(input);
  if (result.success) return { data: result.data, error: null };
  return { data: null, error: result.error };
}
