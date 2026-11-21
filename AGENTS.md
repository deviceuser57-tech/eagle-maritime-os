# Architecture Rules

- Project costing uses `vessel_project_assignments` and the existing assignment/project summary views; legacy `vessel_project_costs` rows remain readable and are only modified when explicitly linked to the selected assignment, preventing cross-project data loss.