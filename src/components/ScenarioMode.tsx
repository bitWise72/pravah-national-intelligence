import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { TrendingUp, Users, AlertTriangle, Calendar } from 'lucide-react';

interface ScenarioModeProps {
    onScenarioChange: (scenario: string) => void;
    currentScenario: string;
}

const mahakumbhData = [
    { date: 'Jan 14', visitors: 15000000, label: 'Paush Purnima' },
    { date: 'Jan 29', visitors: 85000000, label: 'Mauni Amavasya' },
    { date: 'Feb 3', visitors: 20000000, label: 'Basant Panchami' },
    { date: 'Feb 12', visitors: 45000000, label: 'Maghi Purnima' },
    { date: 'Feb 26', visitors: 100000000, label: 'Maha Shivaratri' },
];

export const ScenarioModeSelector = ({ onScenarioChange, currentScenario }: ScenarioModeProps) => {
    return (
        <Select value={currentScenario} onValueChange={onScenarioChange}>
            <SelectTrigger className="w-[220px] bg-secondary/50 border-border/50">
                <SelectValue placeholder="Select Scenario" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="live">Live Operations</SelectItem>
                <SelectItem value="mahakumbh">Historical: Maha Kumbh 2025</SelectItem>
            </SelectContent>
        </Select>
    );
};

interface MahakumbhModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MahakumbhAnalysisModal = ({ isOpen, onClose }: MahakumbhModalProps) => {
    const maxVisitors = Math.max(...mahakumbhData.map(d => d.visitors));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Calendar className="w-5 h-5 text-primary" />
                        Event Surge Analysis: Maha Kumbh 2025
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-primary" />
                                <span className="text-sm text-muted-foreground">Total Visitors</span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">400M+</p>
                        </div>
                        <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-warning" />
                                <span className="text-sm text-muted-foreground">Peak Day</span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">100M</p>
                            <p className="text-xs text-muted-foreground">Feb 26 (Shivaratri)</p>
                        </div>
                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-destructive" />
                                <span className="text-sm text-muted-foreground">Risk Level</span>
                            </div>
                            <p className="text-2xl font-bold text-destructive">CRITICAL</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-card border border-border/50">
                        <h4 className="text-sm font-semibold text-foreground mb-4">Daily Visitor Surge (Jan 14 - Feb 26, 2025)</h4>
                        <div className="space-y-3">
                            {mahakumbhData.map((day, i) => (
                                <motion.div
                                    key={day.date}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-16 text-xs text-muted-foreground">{day.date}</div>
                                    <div className="flex-1 h-6 bg-secondary/50 rounded overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(day.visitors / maxVisitors) * 100}%` }}
                                            transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
                                            className="h-full bg-gradient-to-r from-primary to-warning rounded"
                                        />
                                    </div>
                                    <div className="w-20 text-right text-sm font-medium text-foreground">
                                        {(day.visitors / 1000000).toFixed(0)}M
                                    </div>
                                    <div className="w-28 text-xs text-muted-foreground">{day.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-sm">
                        <p className="text-warning font-medium">Location Focus: Prayagraj (Pincode: 211001)</p>
                        <p className="text-muted-foreground mt-1">
                            Historical validation mode filters data to Prayagraj district with elevated risk indicators during event period.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
