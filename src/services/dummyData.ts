import { RiskZone, Anomaly } from '@/types';

// Dummy data for fallback mode
export const dummyRiskZones: Partial<RiskZone>[] = [
    {
        id: '1',
        pincode: '110001',
        district: 'Central Delhi',
        state: 'Delhi',
        latitude: 28.6139,
        longitude: 77.2090,
        population: 45000,
        riskScore: 8.5,
        riskLevel: 'high',
        migrationVelocity: 7.2,
        biometricRisk: 8.9,
        digitalExclusion: 9.1,
        anomalyFlag: true,
    },
    {
        id: '2',
        pincode: '400001',
        district: 'Mumbai',
        state: 'Maharashtra',
        latitude: 18.9322,
        longitude: 72.8264,
        population: 82000,
        riskScore: 9.2,
        riskLevel: 'critical',
        migrationVelocity: 8.8,
        biometricRisk: 9.5,
        digitalExclusion: 9.3,
        anomalyFlag: true,
    },
    {
        id: '3',
        pincode: '560001',
        district: 'Bangalore',
        state: 'Karnataka',
        latitude: 12.9716,
        longitude: 77.5946,
        population: 35000,
        riskScore: 5.5,
        riskLevel: 'medium',
        migrationVelocity: 6.2,
        biometricRisk: 4.8,
        digitalExclusion: 5.5,
        anomalyFlag: false,
    },
];

export const dummyAnomalies: Anomaly[] = [
    {
        pincode: '110001',
        district: 'Central Delhi',
        state: 'Delhi',
        anomaly_type: 'Biometric',
        severity: 'High',
        description: 'High biometric failure rate detected',
    },
    {
        pincode: '400001',
        district: 'Mumbai',
        state: 'Maharashtra',
        anomaly_type: 'Migration',
        severity: 'Critical',
        description: 'Unusual migration pattern detected',
    },
];

export const dummyNationalStats = {
    total_population: 1410000000,
    calibrated_population: 1410000000,
    total_zones: 3,
    risk_counts: {
        critical: 1,
        high: 1,
        medium: 1,
        low: 0,
    },
    averages: {
        migration: 7.4,
        biometric: 7.7,
        digital: 8.0,
    },
    anomalies: 2,
};
