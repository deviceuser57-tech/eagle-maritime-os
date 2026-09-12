# Eagle Maritime OS — Vessel Field Architecture Matrix

## Core architecture rules

- Existing `public.vessels` remains the canonical vessel master record.
- Existing Setup entities are reused; no duplicate company, currency, classification, flag-state, or port registries are introduced.
- Company relationships continue through unified `setup_companies` role flags.
- New Vessel-specific reference data uses the `setup_` convention.
- Structured fields are preferred for known specifications; unknown specifications are preserved in `additional_unmapped_specifications`.
- Vessel financial data is a baseline operating-cost model, not the Project Financial module.
- Vessel regularity is a child collection so future Project-level overrides can be added without redesigning the Vessel master.

| Domain | Field / Entity | UI | Source | Storage | AI | Tab |
|---|---|---|---|---|---|---|
| Identity | name | text | — | vessels.name | yes | General |
| Identity | imo_number | text | — | vessels.imo_number | yes | General |
| Identity | call_sign | text | — | vessels.call_sign | yes | General |
| Identity | mmsi_number | text | — | vessels.mmsi_number | yes | General |
| Identity | official_number | text | — | vessels.official_number | yes | General |
| Classification | vessel_type | select | setup_vessel_types | vessels.vessel_type + vessel_type_id | yes | General |
| Classification | flag_state | select | existing setup_flag_states | vessels.flag_state | yes | General |
| Classification | port_of_registry | select | existing setup_ports | vessels.port_of_registry + port_of_registry_id | yes | General |
| Classification | classification_society | select | existing setup_classification_societies | vessels.classification_society | yes | General |
| Classification | class_number | text | — | vessels.class_number | yes | General |
| Management | ownership/employment mode | select | setup_ownership_modes | vessels.ownership_mode_id | — | Management |
| Management | owner | select | setup_companies role=is_owner | vessels.owner_company_id | — | Management |
| Management | operator | select | setup_companies role=is_operator | vessels.operator_company_id | — | Management |
| Management | technical manager | select | setup_companies role=is_technical_manager | vessels.technical_manager_id | — | Management |
| Management | ISM manager | select | setup_companies role=is_ism_manager | vessels.ism_manager_id | — | Management |
| Technical | tonnage/dimensions | numeric | — | existing vessels columns | yes | Technical |
| Technical | propulsion type | select | setup_propulsion_types | vessels.propulsion_type + propulsion_type_id | yes | Technical |
| Technical | fuel type | select | setup_fuel_types | vessels.fuel_type + fuel_type_id | yes | Technical |
| Technical | engine maker/model | select | existing setup_engine_makers/models | vessels.engine_make/model | yes | Technical |
| Technical | hull material | select | setup_hull_materials | vessels.hull_material + hull_material_id | yes | Technical |
| Technical | hull coating | select | setup_hull_coatings | vessels.hull_coating + hull_coating_id | yes | Technical |
| Operational | operational status | select/text | setup_vessel_status | vessels.vessel_status_id + operational_status | partial | Operational |
| Operational | speed/capacity/cabins | numeric | — | existing/new vessel columns | yes | Operational |
| Operational | trading area | select | setup_trading_areas | vessels.trading_area + trading_area_id | yes | Operational |
| Operational | operational notes | textarea | — | vessels.operational_notes | — | Operational |
| Financial | minimum daily hire | numeric | existing Currency | vessel_financial_baseline | — | Financial |
| Financial | recurring daily costs | numeric/dynamic | existing Currency | vessel_financial_baseline + vessel_financial_daily_costs | — | Financial |
| Financial | equipment daily costs | dynamic rows | existing Currency | vessel_equipment_costs | — | Financial |
| Financial | total daily operating cost | calculated | — | vessel_daily_cost_summary | — | Financial |
| Compliance | regularity | child rows | setup_regularities | vessel_regularities | future-ready | Compliance |
| Compliance | applicability | select | setup_regularity_applicability | vessel_regularities | — | Compliance |
| Compliance | effective/exemption/document metadata | structured | — | vessel_regularities | — | Compliance |
| Maintenance | drydock dates/yard/tasks | existing controls + Setup yard | setup_shipyards | existing vessels columns | partial | Maintenance |
| Media | brochure/photos | file upload | vessel-assets | existing vessel media fields | source document | Media |
| Additional | unmapped specifications | large textarea | — | vessels.additional_unmapped_specifications | yes | Additional |

## Financial calculation

`TOTAL DAILY VESSEL OPERATING COST` is transparently calculated from the baseline recurring cost fields plus dynamic equipment and other recurring daily cost rows. The minimum daily hire rate is displayed separately as a commercial baseline and is not silently treated as an operating expense.

Future project costing can therefore use:

`Daily Vessel Baseline Cost × Project Days + Project/Voyage-Specific Costs`

## Migration safety

The upgrade migration extends the existing schema with `ADD COLUMN IF NOT EXISTS` and creates only missing Vessel-specific tables. It does not replace the existing `vessels` table or modify the existing `20260904000000_vessel_master_data_tables.sql` migration.
