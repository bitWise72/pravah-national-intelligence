import axios from 'axios';
import { api } from './api';
import { dummyRiskZones, dummyAnomalies, dummyNationalStats } from './dummyData';

export enum ConnectionMode {
    REAL = 'real',
    DUMMY = 'dummy',
    CHECKING = 'checking',
}

class ConnectionManager {
    private mode: ConnectionMode = ConnectionMode.CHECKING;
    private listeners: ((mode: ConnectionMode) => void)[] = [];

    async checkConnection(): Promise<ConnectionMode> {
        try {
            await axios.get('http://localhost:8000/health', { timeout: 3000 });
            this.setMode(ConnectionMode.REAL);
            return ConnectionMode.REAL;
        } catch (error) {
            this.setMode(ConnectionMode.DUMMY);
            return ConnectionMode.DUMMY;
        }
    }

    getMode(): ConnectionMode {
        return this.mode;
    }

    private setMode(mode: ConnectionMode) {
        this.mode = mode;
        this.listeners.forEach(listener => listener(mode));
    }

    subscribe(listener: (mode: ConnectionMode) => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
}

export const connectionManager = new ConnectionManager();

// Enhanced API wrapper with fallback
export const apiWithFallback = {
    async getRiskZones(riskLevel?: string, state?: string, limit: number = 100) {
        if (connectionManager.getMode() === ConnectionMode.REAL) {
            try {
                return await api.getRiskZones(riskLevel, state, limit);
            } catch (error) {
                console.warn('API call failed, falling back to dummy data');
                connectionManager.checkConnection();
            }
        }
        return dummyRiskZones.filter(zone => {
            if (riskLevel && zone.riskLevel !== riskLevel) return false;
            if (state && zone.state !== state) return false;
            return true;
        }).slice(0, limit);
    },

    async getAnomalies(limit: number = 50) {
        if (connectionManager.getMode() === ConnectionMode.REAL) {
            try {
                return await api.getAnomalies(limit);
            } catch (error) {
                console.warn('API call failed, falling back to dummy data');
                connectionManager.checkConnection();
            }
        }
        return dummyAnomalies.slice(0, limit);
    },

    async getNationalStats() {
        if (connectionManager.getMode() === ConnectionMode.REAL) {
            try {
                return await api.getNationalStats();
            } catch (error) {
                console.warn('API call failed, falling back to dummy data');
                connectionManager.checkConnection();
            }
        }
        return dummyNationalStats;
    },

    async getRiskZoneByPincode(pincode: string) {
        if (connectionManager.getMode() === ConnectionMode.REAL) {
            try {
                return await api.getRiskZoneByPincode(pincode);
            } catch (error) {
                console.warn('API call failed, falling back to dummy data');
                connectionManager.checkConnection();
            }
        }
        return dummyRiskZones.find(zone => zone.pincode === pincode) || null;
    },
};
