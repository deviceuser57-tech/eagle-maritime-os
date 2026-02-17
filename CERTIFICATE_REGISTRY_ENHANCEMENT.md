# Certificate Registry Enhancement

## Overview
The certificate registry form has been significantly expanded to provide comprehensive certificate tracking and management capabilities.

## Database Changes

### New Migration: `20260218000000_expand_vessel_certifications.sql`

**New Fields Added:**
- `certificate_number` - Unique certificate identifier
- `place_of_issue` - Location where certificate was issued
- `survey_type` - Type of survey (Initial, Annual, Intermediate, Renewal, Special, Additional)
- `surveyor_name` - Name of the surveyor who conducted the survey
- `last_annual_date` - Date of last annual survey
- `next_annual_date` - Date of next annual survey
- `last_intermediate_date` - Date of last intermediate survey
- `next_intermediate_date` - Date of next intermediate survey
- `endorsement_details` - Text field for endorsements
- `limitations` - Text field for certificate limitations/conditions
- `renewal_reminder_days` - Number of days before expiry to send reminder (default: 30)
- `responsible_person` - Person responsible for the certificate
- `cost` - Certificate cost (NUMERIC 10,2)
- `currency` - Currency code (default: USD)
- `attachments` - JSONB array for file attachments
- `org_id` - Organization ID for multi-tenancy support

**Indexes Added:**
- `idx_vessel_certifications_org_id` - For faster organization queries
- `idx_vessel_certifications_expiry` - For expiry date filtering
- `idx_vessel_certifications_status` - For status filtering

**RLS Policies Updated:**
- Migrated from user-based to organization-based access control
- All policies now use `org_id` for multi-tenancy support

## UI Enhancements

### Tabbed Form Interface

The certificate form now uses a **4-tab layout** for better organization:

#### 1. **Basic Info Tab**
- Document Name *
- Certificate Number
- Classification * (expanded list with IAPP, SOLAS, Tonnage, Registry, Radio)
- Associated Vessel
- Issuing Authority
- Place of Issue
- Issue Date
- Expiry Date *

#### 2. **Survey Tracking Tab**
- Survey Type (Initial, Annual, Intermediate, Renewal, Special, Additional)
- Surveyor Name
- Last Annual Survey Date
- Next Annual Survey Date
- Last Intermediate Survey Date
- Next Intermediate Survey Date

#### 3. **Details Tab**
- Responsible Person
- Renewal Reminder (Days Before Expiry)
- Endorsements (Textarea)
- Limitations / Conditions (Textarea)
- Additional Notes (Textarea)

#### 4. **Financial Tab**
- Certificate Cost
- Currency (USD, EUR, GBP, SGD, AED, JPY)
- Document URL / File Path

### Form Features

**Improved UX:**
- Larger dialog (max-w-4xl) with scrollable content
- Organized tabs prevent form overwhelm
- Clear visual hierarchy with consistent spacing
- All fields use rounded-xl styling for modern look
- Placeholder text provides guidance
- Required fields marked with asterisk

**Certificate Types Expanded:**
- SMC (Safety Management Certificate)
- DOC (Document of Compliance)
- ISPS Certificate
- Classification Certificate
- Load Line Certificate
- IOPP Certificate
- **IAPP Certificate** (NEW)
- MLC Certificate
- **SOLAS Certificates** (NEW)
- **Tonnage Certificate** (NEW)
- **Registry Certificate** (NEW)
- **Radio License** (NEW)
- Other Statutory Doc

## State Management

**Form State Updated:**
```tsx
{
  vessel_id: '',
  certificate_name: '',
  certificate_type: '',
  certificate_number: '',        // NEW
  issuing_authority: '',
  place_of_issue: '',           // NEW
  issue_date: '',
  expiry_date: '',
  survey_type: '',              // NEW
  surveyor_name: '',            // NEW
  last_annual_date: '',         // NEW
  next_annual_date: '',         // NEW
  last_intermediate_date: '',   // NEW
  next_intermediate_date: '',   // NEW
  endorsement_details: '',      // NEW
  limitations: '',              // NEW
  renewal_reminder_days: '30',  // NEW
  responsible_person: '',       // NEW
  cost: '',                     // NEW
  currency: 'USD',              // NEW
  status: 'valid',
  notes: '',
  document_url: '',
}
```

## Benefits

1. **Comprehensive Tracking**: All certificate lifecycle data in one place
2. **Survey Management**: Track annual and intermediate survey schedules
3. **Financial Oversight**: Monitor certificate costs across the fleet
4. **Compliance Monitoring**: Set custom renewal reminders
5. **Better Organization**: Tabbed interface reduces cognitive load
6. **Multi-tenancy Ready**: Organization-based access control
7. **Audit Trail**: Track responsible persons and endorsements

## Next Steps

To use the enhanced certificate registry:

1. **Run Migration**: Apply the database migration to add new fields
2. **Test Form**: Navigate to Vessel Certification section
3. **Add Certificate**: Click "Issue Certificate" and explore all tabs
4. **Verify Data**: Ensure all fields save correctly

## Date Modified
2026-02-18 00:14 UTC+2
