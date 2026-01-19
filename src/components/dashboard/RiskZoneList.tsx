import { motion } from 'framer-motion';
import { MapPin, AlertTriangle, TrendingUp, Fingerprint, Wifi, Users } from 'lucide-react';
import { RiskZone } from '@/types';
import RiskBadge from './RiskBadge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RiskZoneListProps {
  zones: RiskZone[];
  selectedZone: RiskZone | null;
  onZoneSelect: (zone: RiskZone) => void;
}

const RiskZoneList = ({ zones, selectedZone, onZoneSelect }: RiskZoneListProps) => {
  const sortedZones = [...zones].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div className="glass-card h-full flex flex-col overflow-hidden">
      <div className="p-5 border-b border-border/50 bg-gradient-to-r from-background to-primary/5">
        <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/20">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          Risk Zones
          <span className="ml-auto text-sm font-semibold text-primary bg-primary/20 px-2 py-0.5 rounded-full">
            {zones.length}
          </span>
        </h3>
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Sorted by risk score (highest first)
        </p>
      </div>

      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-3 space-y-2">
          {sortedZones.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No risk zones found</p>
            </div>
          ) : (
            sortedZones.map((zone, index) => (
              <motion.button
                key={zone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onZoneSelect(zone)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${selectedZone?.id === zone.id
                    ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/20'
                    : 'bg-card/50 border-border/30 hover:bg-secondary/50 hover:border-border hover:shadow-md'
                  }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground text-sm mb-0.5">{zone.district}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {zone.state} • {zone.pincode}
                    </p>
                  </div>
                  <RiskBadge level={zone.riskLevel} showPulse={zone.anomalyFlag} />
                </div>

                <div className="flex items-center gap-1.5 mb-3 text-xs">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Population:</span>
                  <span className="text-foreground font-semibold">{zone.population.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center p-2 rounded-lg bg-background/50 border border-border/30">
                    <TrendingUp className="w-3.5 h-3.5 text-warning mb-1" />
                    <span className="text-xs font-semibold text-foreground">{(zone.migrationVelocity * 100).toFixed(1)}%</span>
                    <span className="text-[10px] text-muted-foreground">Migration</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-lg bg-background/50 border border-border/30">
                    <Fingerprint className="w-3.5 h-3.5 text-primary mb-1" />
                    <span className="text-xs font-semibold text-foreground">{(zone.biometricRisk * 100).toFixed(0)}%</span>
                    <span className="text-[10px] text-muted-foreground">Biometric</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-lg bg-background/50 border border-border/30">
                    <Wifi className="w-3.5 h-3.5 text-success mb-1" />
                    <span className="text-xs font-semibold text-foreground">{(zone.digitalExclusion * 100).toFixed(0)}%</span>
                    <span className="text-[10px] text-muted-foreground">Digital</span>
                  </div>
                </div>

                {zone.anomalyFlag && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 mt-3 px-2 py-1.5 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive font-medium"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                    Anomaly Detected
                  </motion.div>
                )}

                <div className="mt-3 pt-3 border-t border-border/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Risk Score</span>
                    <span className="text-sm font-bold text-foreground">
                      {(zone.riskScore * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </motion.button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RiskZoneList;
