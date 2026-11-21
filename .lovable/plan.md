# Plan: Finish the Vessel Management Correction

## Confirmed current state
- The connected database already has `vessel_project_assignments`, `vessel_project_assignment_summary`, `project_cost_summary`, and the existing `projects` master.
- RLS on `vessel_financial_baseline`, `vessel_project_assignments`, and `vessel_project_costs` uses `get_user_org_ids()`; no replacement policy is currently needed.
- `VesselSetupMasters` still queries and displays hull coatings as `name`, while the master uses `coating_type`.
- The vessel Financial tab still contains hire/charter and project-entry fields, and saving a vessel deletes project cost lines.
- The current project-cost screen calls `calculate_vessel_project_cost`, which is no longer present, instead of using assignment summaries.

## Work
1. Correct the hull-coating setup editor and sorting/display to use `coating_type`.
2. Keep the vessel Financial tab focused on reusable owned-vessel daily cost drivers. Remove project hire, charter minimum, insurance, and project-cost entry from that tab; prevent vessel saves from touching project-specific cost records. Ensure save feedback appears only after all required vessel and child writes succeed.
3. Replace the project-cost table with project-vessel assignment entry using the existing Projects and Vessels, assignment table, and summary views. Support assignment-level create/edit/delete, project days, owned baseline or charter hire/minimum days, project-specific cost lines, and transparent calculated totals. Preserve legacy unassigned cost lines and never overwrite costs belonging to another assignment.
4. Add the four requested cost summary cards: owned-fleet daily cost, active project-vessel cost, project total, and vessel cost across projects. Exclude chartered/leased vessels from owned-fleet daily totals and use the existing database summaries for calculations.
5. Add focused calculation/persistence tests for the owned 202 × 15 = 3,030 case, charter hire 1,250 with 12 billable days, separate project assignments for one vessel, and managed-vessel project-only costs. Run typecheck, tests, build, and signed-in save/reopen checks where credentials allow.
6. Record the project-cost assignment rule in root `AGENTS.md`. Keep historical migrations unchanged; add a new additive corrective migration only if a verified database gap requires one.

## Technical details
- Use the existing organization membership model and current RLS; do not add a second project master or duplicate setup masters.
- Replace untyped calls with database-derived types where available, and avoid the removed calculation RPC.
- Keep the current visual language and semantic color tokens; do not redesign unrelated screens.