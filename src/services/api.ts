

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http:

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {

      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {

      console.error('Network Error:', error.message);
    } else {

      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const api = {

  health: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  getNationalStats: async () => {
    const response = await apiClient.get('/api/stats/national');
    return response.data;
  },

  getCalibratedCensus: async (pincode: string) => {
    const response = await apiClient.get(`/api/census/calibrated`, {
      params: { pincode },
    });
    return response.data;
  },

  getMigrationData: async (pincode?: string, date?: string) => {
    const response = await apiClient.get(`/api/migration`, {
      params: { pincode, date },
    });
    return response.data;
  },

  getBiometricRisk: async (pincode: string) => {
    const response = await apiClient.get(`/api/biometric-risk`, {
      params: { pincode },
    });
    return response.data;
  },

  getRiskZones: async (riskLevel?: string, state?: string, limit: number = 100) => {
    const response = await apiClient.get(`/api/risk-zones`, {
      params: { risk_level: riskLevel, state, limit },
    });
    return response.data;
  },

  getRiskZoneByPincode: async (pincode: string) => {
    const response = await apiClient.get(`/api/risk-zones/${pincode}`);
    return response.data;
  },

  getAnomalies: async (limit: number = 50) => {
    const response = await apiClient.get(`/api/anomalies`, {
      params: { limit },
    });
    return response.data;
  },

  getAnomalyByPincode: async (pincode: string) => {
    const response = await apiClient.get(`/api/anomalies/${pincode}`);
    return response.data;
  },

  search: async (query: string, limit: number = 10) => {
    const response = await apiClient.get(`/api/search`, {
      params: { query, limit },
    });
    return response.data;
  },
};

export default apiClient;
