

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { api } from '@/services/api';

export const useRiskZones = (riskLevel?: string, state?: string, limit: number = 100) => {
    return useQuery({
        queryKey: ['riskZones', riskLevel, state, limit],
        queryFn: () => api.getRiskZones(riskLevel, state, limit),
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });
};

export const useRiskZone = (pincode: string) => {
    return useQuery({
        queryKey: ['riskZone', pincode],
        queryFn: () => api.getRiskZoneByPincode(pincode),
        enabled: !!pincode,
        staleTime: 5 * 60 * 1000,
    });
};

export const useMigrationData = (pincode?: string, date?: string) => {
    return useQuery({
        queryKey: ['migration', pincode, date],
        queryFn: () => api.getMigrationData(pincode, date),
        enabled: !!pincode,
        staleTime: 5 * 60 * 1000,
    });
};

export const useBiometricRisk = (pincode: string) => {
    return useQuery({
        queryKey: ['biometricRisk', pincode],
        queryFn: () => api.getBiometricRisk(pincode),
        enabled: !!pincode,
        staleTime: 5 * 60 * 1000,
    });
};

export const useCalibratedCensus = (pincode: string) => {
    return useQuery({
        queryKey: ['calibratedCensus', pincode],
        queryFn: () => api.getCalibratedCensus(pincode),
        enabled: !!pincode,
        staleTime: 5 * 60 * 1000,
    });
};

export const useAnomalies = (limit: number = 50) => {
    return useQuery({
        queryKey: ['anomalies', limit],
        queryFn: () => api.getAnomalies(limit),
        staleTime: 2 * 60 * 1000,
    });
};

export const useSearch = (query: string, limit: number = 10) => {
    return useQuery({
        queryKey: ['search', query, limit],
        queryFn: () => api.search(query, limit),
        enabled: query.length >= 2,
        staleTime: 10 * 60 * 1000,
    });
};

export const useHealthCheck = () => {
    return useQuery({
        queryKey: ['health'],
        queryFn: () => api.health(),
        refetchInterval: 30000,
        retry: 1,
    });
};
export const useNationalStats = () => {
    return useQuery({
        queryKey: ['nationalStats'],
        queryFn: () => api.getNationalStats(),
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });
};
