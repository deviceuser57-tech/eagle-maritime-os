import { z } from 'zod';

// Reusable string sanitizer - strips dangerous chars and limits length
const safeString = (max = 255) =>
  z.string().max(max).transform(v => v.replace(/[<>"';\\]/g, ''));

const optionalSafeString = (max = 255) =>
  safeString(max).optional().nullable();

// ── Vessel ──
export const vesselSchema = z.object({
  name: safeString(150).pipe(z.string().min(1, 'Vessel name is required')),
  imo_number: z.string().regex(/^\d{7}$/, 'IMO must be 7 digits').optional().nullable(),
  call_sign: optionalSafeString(20),
  mmsi_number: optionalSafeString(20),
  vessel_type: optionalSafeString(100),
  flag_state: optionalSafeString(100),
  gross_tonnage: z.number().nonnegative().max(1_000_000).optional().nullable(),
  deadweight: z.number().nonnegative().max(1_000_000).optional().nullable(),
  year_built: z.number().int().min(1800).max(2100).optional().nullable(),
  classification_society: optionalSafeString(200),
  status: optionalSafeString(50),
}).passthrough();

// ── Audit ──
export const auditSchema = z.object({
  audit_type: safeString(100).pipe(z.string().min(1, 'Audit type is required')),
  scheduled_date: z.string().min(1, 'Scheduled date is required'),
  auditor_name: optionalSafeString(150),
  location: optionalSafeString(200),
  notes: optionalSafeString(2000),
}).passthrough();

// ── Incident ──
export const incidentSchema = z.object({
  title: safeString(200).pipe(z.string().min(1, 'Title is required')),
  incident_type: safeString(100).pipe(z.string().min(1, 'Incident type is required')),
  incident_date: z.string().min(1, 'Incident date is required'),
  severity: z.enum(['minor', 'moderate', 'major', 'critical']).default('minor'),
  description: optionalSafeString(5000),
  location: optionalSafeString(200),
  reported_by: optionalSafeString(150),
}).passthrough();

// ── Crew Member ──
export const crewMemberSchema = z.object({
  first_name: safeString(100).pipe(z.string().min(1, 'First name is required')),
  last_name: safeString(100).pipe(z.string().min(1, 'Last name is required')),
  rank: safeString(100).pipe(z.string().min(1, 'Rank is required')),
  email: z.string().email('Invalid email').max(255).optional().nullable().or(z.literal('')),
  phone: optionalSafeString(30),
  nationality: optionalSafeString(100),
}).passthrough();

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
}).passthrough();

// ── Custom Regulation ──
export const regulationSchema = z.object({
  code: safeString(50).pipe(z.string().min(1, 'Code is required')),
  title: safeString(300).pipe(z.string().min(1, 'Title is required')),
  category: safeString(100).default('custom'),
  description: optionalSafeString(5000),
  version: optionalSafeString(50),
  link: z.string().url('Invalid URL').max(2000).optional().nullable().or(z.literal('')).or(z.literal(null)),
  notes: optionalSafeString(2000),
}).passthrough();

// Helper to validate and return either { data } or { error }
export function validate<T>(schema: z.ZodSchema<T>, input: unknown): { data: T; error: null } | { data: null; error: z.ZodError } {
  const result = schema.safeParse(input);
  if (result.success) return { data: result.data, error: null };
  return { data: null, error: result.error };
}
