import { motion } from 'framer-motion';
import { Wifi, Database, Shield } from 'lucide-react';

const DataSourcesFooter = () => {
    return (
        <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="fixed bottom-0 left-64 right-0 bg-background/90 backdrop-blur-md border-t border-border/50 px-6 py-3 z-30"
        >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span>System Integrity: <span className="text-success font-medium">Online</span></span>
                    </div>
                    <div className="h-4 w-px bg-border/50" />
                    <div className="flex items-center gap-1">
                        <Database className="w-3 h-3" />
                        <span>Data Sources: <span className="text-foreground">UIDAI (Enrolment, Update), ECI (Voter Rolls), OpenCellID (Telecom), NASA (VIIRS)</span></span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-primary" />
                    <span>Privacy Protocol: <span className="text-primary font-medium">Differential Privacy (e=0.1)</span></span>
                </div>
            </div>
        </motion.footer>
    );
};

export default DataSourcesFooter;
