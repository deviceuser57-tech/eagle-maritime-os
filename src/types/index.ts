// Data schemas extracted from EAGLE CAR'S system

// Company & Vessel Data Types
export interface Company {
  id: string;
  name: string;
  contactPerson: string;
  title: string;
  phone: string;
  email: string;
  address: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Crew Data Types
export interface CrewRank {
  id: string;
  name: string;
  department: string;
  level: number;
  responsibilities: string;
}

export interface Nationality {
  id: string;
  name: string;
  code: string;
  flag: string;
}

export interface CrewContractType {
  id: string;
  name: string;
  duration: number;
  benefits: string[];
  restrictions: string[];
}

export interface CurrencyCode {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
}

// Audit & Findings Data Types
export interface AuditType {
  id: string;
  name: string;
  description: string;
  frequency: string;
  regulations: string[];
}

export interface FindingType {
  id: string;
  name: string;
  weight: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  color: string;
}

export interface FindingStatus {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  color: string;
}

export interface RootCauseCategory {
  id: string;
  name: string;
  description: string;
  examples: string[];
}

export interface FindingOwner {
  id: string;
  name: string;
  department: string;
  email: string;
  phone: string;
}

// Medical & Safety Data Types
export interface MedicalTestType {
  id: string;
  name: string;
  frequency: string;
  description: string;
  requirements: string[];
}

export interface VaccinationStatus {
  id: string;
  name: string;
  isRequired: boolean;
  validityPeriod: number;
}

export interface MentalHealthStatus {
  id: string;
  name: string;
  description: string;
  assessmentFrequency: string;
}

export interface DrillType {
  id: string;
  name: string;
  description: string;
  frequency: string;
  regulations: string[];
}

export interface DrillRole {
  id: string;
  name: string;
  responsibilities: string[];
  requiredTraining: string[];
}

// Certification & Project Data Types
export interface ClassificationSociety {
  id: string;
  name: string;
  code: string;
  headquarters: string;
  website: string;
  services: string[];
}

export interface RegulatoryBody {
  id: string;
  name: string;
  jurisdiction: string;
  website: string;
  regulations: string[];
}

export interface CertificateIssuer {
  id: string;
  name: string;
  type: string;
  contactInfo: string;
}

export interface ProjectType {
  id: string;
  name: string;
  description: string;
  duration: number;
  requirements: string[];
}

export interface CharterType {
  id: string;
  name: string;
  description: string;
  duration: string;
}

export interface RecurrenceType {
  id: string;
  name: string;
  interval: number;
  unit: 'days' | 'weeks' | 'months' | 'years';
}

// Risk Management Types
export interface FlagState {
  id: string;
  name: string;
  score: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  regulations: string[];
}

export interface RiskCalculation {
  id: string;
  type: string;
  cargo: string;
  score: number;
  reason: string;
}

export interface RiskCategory {
  id: string;
  name: string;
  range: string;
  description: string;
  color: string;
}

// Vessel Technical Details Types
export interface RegistryStatus {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface HullType {
  id: string;
  name: string;
  description: string;
  suitableFor: string[];
}

export interface HullCoating {
  id: string;
  name: string;
  type: string;
  lifespan: number;
  properties: string[];
}

// Technical Data Types
export interface PropulsionType {
  id: string;
  name: string;
  description: string;
  useCases: string[];
  efficiency: number;
}

export interface GMDSSArea {
  id: string;
  name: string;
  coverage: string;
  equipment: string[];
}

// Certification Types
export interface StandardCertificate {
  id: string;
  name: string;
  issuer: string;
  validityPeriod: number;
  requirements: string[];
}

export interface CrewTrainingCertificate {
  id: string;
  name: string;
  level: string;
  validityPeriod: number;
  renewalRequirements: string[];
}

export interface CargoCertificate {
  id: string;
  name: string;
  cargoType: string;
  specialRequirements: string[];
}

export interface EnvironmentalCertificate {
  id: string;
  name: string;
  standard: string;
  complianceAreas: string[];
}

// Ship Sections for Findings
export interface ShipSection {
  id: string;
  name: string;
  parentSection?: string;
  description: string;
  subsections: string[];
}

// Vessel Management Types
export interface Vessel {
  id: string;
  // General Information
  vesselName: string;
  imoNumber: string;
  callSign: string;
  mmsiNumber: string;
  officialNumber: string;
  
  // Ownership
  ownerCompanyId: string;
  operatorCompanyId: string;
  technicalManagerId: string;
  ismManagerId: string;
  docIssuerId: string;
  
  // Classification Society
  classificationSocietyId: string;
  classNumber: string;
  
  // Financial Information
  purchasePrice?: number;
  currency: string;
  insuranceValue?: number;
  
  // Hull Information
  hullTypeId: string;
  hullCoatingId: string;
  yearBuilt: number;
  shipyard: string;
  
  // Technical Specifications
  length: number;
  beam: number;
  depth: number;
  grossTonnage: number;
  netTonnage: number;
  deadweight: number;
  
  // Machinery
  engineMake: string;
  engineModel: string;
  enginePower: number;
  propulsionTypeId: string;
  
  // Communications & Navigation
  gmdssAreaId: string;
  satelliteProvider: string;
  
  // Performance Data
  maxSpeed: number;
  serviceSpeed: number;
  fuelConsumption: number;
  
  // Safety Equipment
  lifeboats: number;
  liferafts: number;
  fireExtinguishers: number;
  
  // Status
  registryStatusId: string;
  flagStateId: string;
  isActive: boolean;
  
  // Risk Assessment
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Form validation and UI types
export interface SetupFormData {
  type: string;
  title: string;
  headers: string[];
  labels: string[];
  data: Record<string, any>[];
}

export interface TabNavigation {
  id: string;
  label: string;
  isActive: boolean;
  hasErrors: boolean;
}