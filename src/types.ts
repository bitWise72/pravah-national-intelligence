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
    electoralIntegrityRatio?: number;
    ghostVoterRisk?: boolean;
}

export interface RiskFactors {
    migration: number;
    biometric: number;
    digital: number;
}

export interface RiskZoneResponse {
    pincode: string;
    district: string;
    state: string;
    latitude: number;
    longitude: number;
    population: number;
    risk_score: number;
    risk_level: string;
    factors: RiskFactors;
    anomaly_flag: boolean;
    suppressed: boolean;
    suppression_reason?: string;
    electoral_integrity_ratio?: number;
    ghost_voter_risk?: boolean;
}

export interface NationalStats {
    total_population: number;
    calibrated_population: number;
    total_zones: number;
    risk_counts: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    averages: {
        migration: number;
        biometric: number;
        digital: number;
    };
    anomalies: number;
    dataFreshness?: string;
    coveragePercent?: number;
    ghostVoterZones?: number;
    avgElectoralIntegrity?: number;
}

export interface MigrationTrend {
    date: string;
    velocity: number;
    netMigration: number;
}

export interface RiskDistribution {
    name: string;
    value: number;
    color: string;
}

export interface StateRisk {
    state: string;
    riskScore: number;
}

export interface Anomaly {
    pincode: string;
    district: string;
    state: string;
    anomaly_type: string;
    severity: string;
    description: string;
}

