import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { WifiOff, Wifi, AlertCircle } from 'lucide-react';
import { connectionManager, ConnectionMode } from '@/services/connectionManager';

export const ModeIndicator = () => {
    const [mode, setMode] = useState<ConnectionMode>(ConnectionMode.CHECKING);

    useEffect(() => {
        connectionManager.checkConnection();
        const unsubscribe = connectionManager.subscribe(setMode);
        return unsubscribe;
    }, []);

    if (mode === ConnectionMode.CHECKING) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span>Checking connection...</span>
            </div>
        );
    }

    if (mode === ConnectionMode.REAL) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20"
            >
                <Wifi className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-success">Live Mode</span>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning/10 border border-warning/20"
        >
            <WifiOff className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-warning">Dummy Mode</span>
        </motion.div>
    );
};

export const DummyModeBanner = () => {
    const [mode, setMode] = useState<ConnectionMode>(ConnectionMode.CHECKING);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const unsubscribe = connectionManager.subscribe(setMode);
        return unsubscribe;
    }, []);

    if (mode !== ConnectionMode.DUMMY || isDismissed) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 z-40 mx-auto max-w-4xl px-4"
        >
            <div className="bg-gradient-to-r from-warning/90 to-warning/70 backdrop-blur-sm rounded-lg shadow-lg border border-warning p-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-warning-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-warning-foreground mb-1">
                            Backend Unavailable - Using Sample Data
                        </h3>
                        <p className="text-sm text-warning-foreground/90 mb-3">
                            The application is running in demo mode with sample data. To use real data:
                        </p>
                        <ol className="text-sm text-warning-foreground/90 space-y-1 ml-4 list-decimal">
                            <li>Navigate to the <code className="px-1.5 py-0.5 bg-black/20 rounded">backend</code> directory</li>
                            <li>Run <code className="px-1.5 py-0.5 bg-black/20 rounded">uvicorn main:app --reload</code></li>
                            <li>Refresh this page once the backend is running</li>
                        </ol>
                    </div>
                    <button
                        onClick={() => setIsDismissed(true)}
                        className="text-warning-foreground/70 hover:text-warning-foreground transition-colors"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
