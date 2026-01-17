import { motion } from 'framer-motion';
import { MapPin, AlertTriangle, TrendingUp, Fingerprint, Wifi } from 'lucide-react';
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
    <div className="glass-card h-full flex flex-col">
      <div className="p-4 border-b border-border/50">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          Risk Zones ({zones.length})
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Sorted by risk score
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {sortedZones.map((zone, index) => (
            <motion.button
              key={zone.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onZoneSelect(zone)}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${selectedZone?.id === zone.id
                  ? 'bg-primary/10 border-primary/30'
                  : 'bg-card/50 border-border/30 hover:bg-secondary/50 hover:border-border'
                }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-foreground text-sm">{zone.district}</h4>
                  <p className="text-xs text-muted-foreground">{zone.state}</p>
                </div>
                <RiskBadge level={zone.riskLevel} showPulse={zone.anomalyFlag} />
              </div>

              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  {(zone.migrationVelocity * 100).toFixed(1)}%
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Fingerprint className="w-3 h-3" />
                  {(zone.biometricRisk * 100).toFixed(0)}%
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Wifi className="w-3 h-3" />
                  {(zone.digitalExclusion * 100).toFixed(0)}%
                </div>
              </div>

              {zone.anomalyFlag && (
                <div className="flex items-center gap-1 mt-2 text-xs text-destructive">
                  <AlertTriangle className="w-3 h-3" />
                  Anomaly detected
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RiskZoneList;
