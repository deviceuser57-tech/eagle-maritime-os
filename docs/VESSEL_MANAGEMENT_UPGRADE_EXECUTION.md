# Vessel Management Upgrade — Execution Specification

This branch implements the Vessel Management upgrade against the existing Eagle Maritime OS architecture.

## Non-negotiable architecture
- Preserve the existing `vessels` table and existing Setup architecture.
- Reuse existing Currency, Classification Society, Flag State, Ports, and unified `setup_companies`.
- Do not create duplicate owner/operator/technical-manager/ISM-manager tables.
- New Setup entities use the `setup_` prefix and are created only when missing.
- No hardcoded business/master-data dropdown fallbacks in Vessel Management.
- Vessel Management tabs: General / Identity, Management, Technical Specifications, Operational Condition, Financial Condition, Compliance / Regularity, Maintenance / Docking, Media, Additional / Unmapped Specifications.
- Regularity is relational and future Project-level overrides must remain possible.
- Financial data is a vessel baseline cost model, not the Project Financial module.
- Existing AI extraction pipeline must be audited and improved, not replaced by default.
- Existing visual language and security architecture are preserved.

## New/required Setup entities
- `setup_vessel_types`
- `setup_propulsion_types`
- `setup_fuel_types`
- `setup_trading_areas`
- `setup_hull_materials`
- `setup_hull_coatings`
- `setup_vessel_status`
- `setup_ownership_modes`
- `setup_regularities`
- `setup_regularity_applicability`

## Financial baseline
Required baseline model includes minimum daily hire rate and recurring daily operating costs, including crew/manning, accommodation, food breakdown (breakfast/lunch/dinner/snacks), fresh water, lubricants, consumables, maintenance, repairs, spare parts, insurance allocation, technical management, regulatory/certification, communications, waste/sewage, and other recurring costs.

Equipment daily costs and additional recurring cost components are dynamic child rows. The system must transparently calculate total daily vessel operating cost.

## AI extraction
Current `handleSmartFill` / `analyze-image` flow remains the primary pipeline unless audit evidence requires a replacement. Structured extraction must map additional known vessel specifications, while all confidently unstructured/unmapped specifications are preserved in `Additional / Unmapped Specifications`. Embedded PDF images should be extracted into Vessel Media where technically supported.

## Verification
The implementation must distinguish repository changes, migration files, live Supabase state, and live Setup seed state. Do not claim live migration/seed status without actual verification.
