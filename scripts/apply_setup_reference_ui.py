from pathlib import Path


def replace(path, old, new):
    p = Path(path)
    s = p.read_text(encoding='utf-8')
    if old not in s:
        return False
    p.write_text(s.replace(old, new), encoding='utf-8')
    return True

# Make operational reference controls use Setup Metadata only.
replacements = {
    'src/components/AuditPlan.tsx': [
        ("const FALLBACK_AUDIT_TYPES = ['ISM Annual', 'ISPS Renewal', 'Environmental', 'PSC', 'Flag State', 'Internal', 'Vetting'];\n", ""),
        ("  const auditTypeOptions = auditTypes.length > 0\n    ? auditTypes.map((t) => t.audit_type_name)\n    : FALLBACK_AUDIT_TYPES;", "  const auditTypeOptions = auditTypes.map((t) => t.audit_type_name);"),
    ],
    'src/components/AuditFindings.tsx': [
        ("const FALLBACK_FINDING_TYPES  = ['Observation', 'Minor NC', 'Major NC', 'Positive Finding'];\nconst FALLBACK_FINDING_STATUSES = ['Open', 'In Progress', 'Closed', 'Verified'];\nconst FALLBACK_ROOT_CAUSES    = ['Human Error', 'Procedure Gap', 'Equipment Failure', 'Training Deficiency'];\n", ""),
        ("  // Options — prefer Setup Metadata, fall back to static list\n  const findingTypeOptions   = findingTypes.length   > 0 ? findingTypes.map(t => t.finding_type_name)  : FALLBACK_FINDING_TYPES;\n  const findingStatusOptions  = findingStatuses.length > 0 ? findingStatuses.map(s => s.status_name)     : FALLBACK_FINDING_STATUSES;\n  const rootCauseOptions     = rootCauses.length     > 0 ? rootCauses.map(r => r.cause_name)            : FALLBACK_ROOT_CAUSES;", "  // Operational reference options are sourced exclusively from Setup Metadata.\n  const findingTypeOptions   = findingTypes.map(t => t.finding_type_name);\n  const findingStatusOptions = findingStatuses.map(s => s.status_name);\n  const rootCauseOptions     = rootCauses.map(r => r.cause_name);"),
    ],
    'src/components/VesselsCertification.tsx': [
        ("const FALLBACK_CURRENCIES = [\n  { code: 'USD', label: 'USD - US Dollar' },\n  { code: 'EUR', label: 'EUR - Euro' },\n  { code: 'GBP', label: 'GBP - British Pound' },\n  { code: 'SGD', label: 'SGD - Singapore Dollar' },\n  { code: 'AED', label: 'AED - UAE Dirham' },\n  { code: 'JPY', label: 'JPY - Japanese Yen' },\n];\n\n", ""),
        ("  const currencyOptions = currencies.length > 0\n    ? currencies.map((c) => ({ code: c.currency_code, label: `${c.currency_code} - ${c.currency_name}` }))\n    : FALLBACK_CURRENCIES;", "  const currencyOptions = currencies.map((c) => ({ code: c.currency_code, label: `${c.currency_code} - ${c.currency_name}` }));"),
    ],
}

changed = 0
for path, pairs in replacements.items():
    for old, new in pairs:
        if replace(path, old, new):
            changed += 1

# Prevent the workflow from repeatedly changing the same files.
Path('scripts/apply_setup_reference_ui.py').unlink(missing_ok=True)
Path('.github/workflows/apply-setup-reference-ui.yml').unlink(missing_ok=True)
print(f'Applied {changed} setup-reference UI replacements.')
