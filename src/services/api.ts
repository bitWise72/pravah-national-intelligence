/**
 * API Client Service
 * Centralized API communication with type safety and error handling
 */
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API Methods
export const api = {
  // Health check
  health: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // Census API
  getCalibratedCensus: async (pincode: string) => {
    const response = await apiClient.get(`/census/calibrated`, {
      params: { pincode },
    });
    return response.data;
  },

  // Migration API
  getMigrationData: async (pincode?: string, date?: string) => {
    const response = await apiClient.get(`/migration`, {
      params: { pincode, date },
    });
    return response.data;
  },

  // Biometric Risk API
  getBiometricRisk: async (pincode: string) => {
    const response = await apiClient.get(`/biometric-risk`, {
      params: { pincode },
    });
    return response.data;
  },

  // Risk Zones API
  getRiskZones: async (riskLevel?: string, state?: string, limit: number = 100) => {
    const response = await apiClient.get(`/risk-zones`, {
      params: { risk_level: riskLevel, state, limit },
    });
    return response.data;
  },

  getRiskZoneByPincode: async (pincode: string) => {
    const response = await apiClient.get(`/risk-zones/${pincode}`);
    return response.data;
  },

  // Anomalies API
  getAnomalies: async (limit: number = 50) => {
    const response = await apiClient.get(`/anomalies`, {
      params: { limit },
    });
    return response.data;
  },

  getAnomalyByPincode: async (pincode: string) => {
    const response = await apiClient.get(`/anomalies/${pincode}`);
    return response.data;
  },

  // Search API
  search: async (query: string, limit: number = 10) => {
    const response = await apiClient.get(`/search`, {
      params: { query, limit },
    });
    return response.data;
  },
};

export default apiClient;
