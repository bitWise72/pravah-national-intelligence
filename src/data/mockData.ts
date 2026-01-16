// PRAVAH Mock Data - National Demographic Intelligence

export interface RiskZone {
  id: string;
  pincode: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  population: number;
  riskScore: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  migrationVelocity: number;
  biometricRisk: number;
  digitalExclusion: number;
  anomalyFlag: boolean;
}

export interface MigrationData {
  pincode: string;
  date: string;
  velocity: number;
  netChange: number;
  direction: 'inflow' | 'outflow';
}

export interface BiometricRisk {
  pincode: string;
  district: string;
  enrolledChildren: number;
  expectedChildren: number;
  survivalScore: number;
  deficit: number;
}

export interface DigitalExclusion {
  pincode: string;
  district: string;
  darknesIndex: number;
  otpFailureRate: number;
  internetPenetration: number;
}

export interface CensusData {
  pincode: string;
  censusBaseline: number;
  aadhaarProxy: number;
  calibratedPopulation: number;
  lowerCI: number;
  upperCI: number;
  timestamp: string;
}

// High-risk zones across India
export const riskZones: RiskZone[] = [
  { id: '1', pincode: '110001', district: 'Central Delhi', state: 'Delhi', latitude: 28.6139, longitude: 77.2090, population: 125000, riskScore: 0.92, riskLevel: 'critical', migrationVelocity: 0.089, biometricRisk: 0.78, digitalExclusion: 0.45, anomalyFlag: true },
  { id: '2', pincode: '400001', district: 'Mumbai City', state: 'Maharashtra', latitude: 18.9388, longitude: 72.8354, population: 340000, riskScore: 0.88, riskLevel: 'critical', migrationVelocity: 0.076, biometricRisk: 0.65, digitalExclusion: 0.32, anomalyFlag: true },
  { id: '3', pincode: '700001', district: 'Kolkata', state: 'West Bengal', latitude: 22.5726, longitude: 88.3639, population: 180000, riskScore: 0.79, riskLevel: 'high', migrationVelocity: 0.054, biometricRisk: 0.72, digitalExclusion: 0.48, anomalyFlag: false },
  { id: '4', pincode: '600001', district: 'Chennai', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707, population: 220000, riskScore: 0.71, riskLevel: 'high', migrationVelocity: 0.048, biometricRisk: 0.58, digitalExclusion: 0.35, anomalyFlag: false },
  { id: '5', pincode: '560001', district: 'Bengaluru Urban', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946, population: 410000, riskScore: 0.65, riskLevel: 'medium', migrationVelocity: 0.082, biometricRisk: 0.42, digitalExclusion: 0.18, anomalyFlag: true },
  { id: '6', pincode: '500001', district: 'Hyderabad', state: 'Telangana', latitude: 17.3850, longitude: 78.4867, population: 285000, riskScore: 0.58, riskLevel: 'medium', migrationVelocity: 0.061, biometricRisk: 0.48, digitalExclusion: 0.25, anomalyFlag: false },
  { id: '7', pincode: '380001', district: 'Ahmedabad', state: 'Gujarat', latitude: 23.0225, longitude: 72.5714, population: 195000, riskScore: 0.52, riskLevel: 'medium', migrationVelocity: 0.045, biometricRisk: 0.51, digitalExclusion: 0.29, anomalyFlag: false },
  { id: '8', pincode: '302001', district: 'Jaipur', state: 'Rajasthan', latitude: 26.9124, longitude: 75.7873, population: 165000, riskScore: 0.74, riskLevel: 'high', migrationVelocity: 0.038, biometricRisk: 0.81, digitalExclusion: 0.62, anomalyFlag: true },
  { id: '9', pincode: '226001', district: 'Lucknow', state: 'Uttar Pradesh', latitude: 26.8467, longitude: 80.9462, population: 142000, riskScore: 0.81, riskLevel: 'high', migrationVelocity: 0.042, biometricRisk: 0.85, digitalExclusion: 0.71, anomalyFlag: true },
  { id: '10', pincode: '800001', district: 'Patna', state: 'Bihar', latitude: 25.5941, longitude: 85.1376, population: 118000, riskScore: 0.89, riskLevel: 'critical', migrationVelocity: 0.095, biometricRisk: 0.91, digitalExclusion: 0.82, anomalyFlag: true },
  { id: '11', pincode: '781001', district: 'Guwahati', state: 'Assam', latitude: 26.1445, longitude: 91.7362, population: 92000, riskScore: 0.68, riskLevel: 'medium', migrationVelocity: 0.055, biometricRisk: 0.62, digitalExclusion: 0.58, anomalyFlag: false },
  { id: '12', pincode: '160001', district: 'Chandigarh', state: 'Chandigarh', latitude: 30.7333, longitude: 76.7794, population: 78000, riskScore: 0.35, riskLevel: 'low', migrationVelocity: 0.028, biometricRisk: 0.25, digitalExclusion: 0.12, anomalyFlag: false },
  { id: '13', pincode: '440001', district: 'Nagpur', state: 'Maharashtra', latitude: 21.1458, longitude: 79.0882, population: 135000, riskScore: 0.48, riskLevel: 'medium', migrationVelocity: 0.035, biometricRisk: 0.52, digitalExclusion: 0.38, anomalyFlag: false },
  { id: '14', pincode: '682001', district: 'Kochi', state: 'Kerala', latitude: 9.9312, longitude: 76.2673, population: 105000, riskScore: 0.32, riskLevel: 'low', migrationVelocity: 0.022, biometricRisk: 0.18, digitalExclusion: 0.08, anomalyFlag: false },
  { id: '15', pincode: '751001', district: 'Bhubaneswar', state: 'Odisha', latitude: 20.2961, longitude: 85.8245, population: 88000, riskScore: 0.61, riskLevel: 'medium', migrationVelocity: 0.048, biometricRisk: 0.68, digitalExclusion: 0.55, anomalyFlag: false },
];

// National statistics
export const nationalStats = {
  totalPopulation: 1428000000,
  calibratedPopulation: 1412500000,
  criticalZones: 3,
  highRiskZones: 4,
  mediumRiskZones: 6,
  lowRiskZones: 2,
  migrationVelocityAvg: 0.052,
  biometricRiskAvg: 0.58,
  digitalExclusionAvg: 0.42,
  anomaliesDetected: 7,
  dataFreshness: '2025-01-16T08:30:00Z',
  coveragePercent: 98.7,
};

// Time series data for charts
export const migrationTrend = [
  { date: '2024-07', velocity: 0.042, netMigration: 125000 },
  { date: '2024-08', velocity: 0.045, netMigration: 138000 },
  { date: '2024-09', velocity: 0.051, netMigration: 156000 },
  { date: '2024-10', velocity: 0.048, netMigration: 142000 },
  { date: '2024-11', velocity: 0.055, netMigration: 168000 },
  { date: '2024-12', velocity: 0.058, netMigration: 182000 },
  { date: '2025-01', velocity: 0.052, netMigration: 158000 },
];

export const riskDistribution = [
  { name: 'Critical', value: 3, color: 'hsl(0, 72%, 51%)' },
  { name: 'High', value: 4, color: 'hsl(25, 95%, 53%)' },
  { name: 'Medium', value: 6, color: 'hsl(38, 92%, 50%)' },
  { name: 'Low', value: 2, color: 'hsl(142, 71%, 45%)' },
];

export const stateWiseRisk = [
  { state: 'Bihar', riskScore: 0.89 },
  { state: 'Uttar Pradesh', riskScore: 0.81 },
  { state: 'Delhi', riskScore: 0.78 },
  { state: 'Maharashtra', riskScore: 0.68 },
  { state: 'Rajasthan', riskScore: 0.74 },
  { state: 'West Bengal', riskScore: 0.72 },
  { state: 'Tamil Nadu', riskScore: 0.58 },
  { state: 'Karnataka', riskScore: 0.52 },
  { state: 'Telangana', riskScore: 0.48 },
  { state: 'Kerala', riskScore: 0.28 },
];
