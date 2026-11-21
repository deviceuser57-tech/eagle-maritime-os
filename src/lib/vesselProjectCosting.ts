export type ProjectCostInputs = {
  ownershipMode: string | null | undefined;
  projectDays: number;
  dailyOperatingCost: number;
  dailyHireRate: number;
  minimumCharterPeriodDays: number;
  projectSpecificCosts: number;
};

export type ProjectCostBreakdown = {
  projectDays: number;
  billableDays: number;
  dailyVesselOperatingCost: number;
  operatingCostTotal: number;
  dailyHireRate: number;
  hireCostTotal: number;
  projectSpecificCosts: number;
  totalProjectCost: number;
};

export type DailyCostSummary = {
  is_owned?: boolean | null;
  total_daily_vessel_operating_cost?: number | null;
};

export type AssignmentCostSummary = {
  project_reference?: string | null;
  vessel_id?: string | null;
  total_project_cost?: number | null;
  total_vessel_project_cost?: number | null;
};

const finiteNonNegative = (value: number) =>
  Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;

export function calculateProjectCost(inputs: ProjectCostInputs): ProjectCostBreakdown {
  const projectDays = Math.floor(finiteNonNegative(inputs.projectDays));
  const mode = (inputs.ownershipMode || '').toLowerCase();
  const isOwned = mode.includes('own');
  const isChartered = mode.includes('charter') || mode.includes('lease');
  const minimumDays = Math.floor(finiteNonNegative(inputs.minimumCharterPeriodDays));
  const billableDays = isChartered ? Math.max(projectDays, minimumDays) : projectDays;
  const dailyVesselOperatingCost = isOwned ? finiteNonNegative(inputs.dailyOperatingCost) : 0;
  const dailyHireRate = isChartered ? finiteNonNegative(inputs.dailyHireRate) : 0;
  const operatingCostTotal = dailyVesselOperatingCost * projectDays;
  const hireCostTotal = dailyHireRate * billableDays;
  const projectSpecificCosts = finiteNonNegative(inputs.projectSpecificCosts);

  return {
    projectDays,
    billableDays,
    dailyVesselOperatingCost,
    operatingCostTotal,
    dailyHireRate,
    hireCostTotal,
    projectSpecificCosts,
    totalProjectCost: operatingCostTotal + hireCostTotal + projectSpecificCosts,
  };
}

export function sumOwnedFleetDailyCost(rows: DailyCostSummary[]): number {
  return rows.reduce((total, row) =>
    total + (row.is_owned ? finiteNonNegative(row.total_daily_vessel_operating_cost || 0) : 0), 0);
}

export function sumProjectTotal(rows: AssignmentCostSummary[], projectReference: string): number {
  return rows.reduce((total, row) =>
    total + (row.project_reference === projectReference ? finiteNonNegative(row.total_project_cost || 0) : 0), 0);
}

export function sumVesselAcrossProjects(rows: AssignmentCostSummary[], vesselId: string): number {
  return rows.reduce((total, row) =>
    total + (row.vessel_id === vesselId ? finiteNonNegative(row.total_vessel_project_cost || 0) : 0), 0);
}