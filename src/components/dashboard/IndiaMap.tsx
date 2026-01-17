import { motion } from 'framer-motion';
import { RiskZone } from '@/types';
import RiskBadge from './RiskBadge';
import { useState } from 'react';
import { X, MapPin, TrendingUp, Fingerprint, Wifi } from 'lucide-react';

const getRiskColor = (level: string): string => {
  const colors: Record<string, string> = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
  };
  return colors[level] || '#6b7280';
};

const latLongToSvg = (lat: number, lng: number): { x: number; y: number } => {

  const minLat = 6, maxLat = 38;
  const minLng = 66, maxLng = 98;

  const x = ((lng - minLng) / (maxLng - minLng)) * 400 + 50;
  const y = ((maxLat - lat) / (maxLat - minLat)) * 450 + 25;

  return { x, y };
};

interface IndiaMapProps {
  zones: RiskZone[];
  onZoneSelect?: (zone: RiskZone) => void;
  selectedZone?: RiskZone | null;
  filterLevel?: string;
}

const IndiaMap = ({ zones, onZoneSelect, selectedZone = null, filterLevel }: IndiaMapProps) => {
  const [hoveredZone, setHoveredZone] = useState<RiskZone | null>(null);

  const filteredZones = filterLevel && filterLevel !== 'all'
    ? zones.filter(z => z.riskLevel === filterLevel)
    : zones;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="map-container h-full relative bg-background/50"
      role="region"
      aria-label="Risk zone map of India"
    >
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full"
        style={{ minHeight: '400px' }}
        role="img"
        aria-label={`Map showing ${filteredZones.length} risk zones across India`}
      >
        <title>PRAVAH India Risk Zone Map</title>
        <desc>Interactive map displaying demographic risk zones across India with color-coded severity levels</desc>

        { }
        <defs>
          <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M 25 0 L 0 0 0 25" fill="none" stroke="hsl(215, 28%, 17%)" strokeWidth="0.5" opacity="0.3" />
          </pattern>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" aria-hidden="true" />

        { }
        <path
          d="M 150 80 
             C 180 60, 280 50, 320 70
             C 360 85, 380 100, 400 130
             C 410 160, 420 200, 410 240
             C 405 280, 380 320, 350 360
             C 320 400, 280 430, 250 450
             C 220 440, 180 420, 160 380
             C 140 340, 120 290, 100 250
             C 80 210, 90 160, 110 120
             C 130 90, 140 85, 150 80
             Z"
          fill="hsl(215, 28%, 12%)"
          stroke="hsl(38, 92%, 50%)"
          strokeWidth="1"
          opacity="0.6"
          aria-hidden="true"
        />

        { }
        {filteredZones.map((zone) => {
          const { x, y } = latLongToSvg(zone.latitude, zone.longitude);
          const isSelected = selectedZone?.id === zone.id;
          const isHovered = hoveredZone?.id === zone.id;
          const radius = 6 + zone.riskScore * 12;

          return (
            <g key={zone.id}>
              { }
              {zone.riskLevel === 'critical' && (
                <circle
                  cx={x}
                  cy={y}
                  r={radius + 5}
                  fill={getRiskColor(zone.riskLevel)}
                  opacity={0.3}
                  className="animate-ping"
                  style={{ transformOrigin: `${x}px ${y}px` }}
                />
              )}

              { }
              <circle
                cx={x}
                cy={y}
                r={radius + 3}
                fill={getRiskColor(zone.riskLevel)}
                opacity={isSelected || isHovered ? 0.4 : 0.2}
                filter="url(#glow)"
              />

              { }
              <motion.circle
                cx={x}
                cy={y}
                r={radius}
                fill={getRiskColor(zone.riskLevel)}
                stroke={isSelected ? '#fff' : 'transparent'}
                strokeWidth={isSelected ? 2 : 0}
                opacity={0.8}
                whileHover={{ scale: 1.2 }}
                onMouseEnter={() => setHoveredZone(zone)}
                onMouseLeave={() => setHoveredZone(null)}
                onClick={() => onZoneSelect?.(zone)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onZoneSelect?.(zone);
                  }
                }}
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                aria-label={`${zone.district}, ${zone.state}: ${zone.riskLevel} risk, score ${(zone.riskScore * 100).toFixed(0)}%`}
              />

              { }
              {(isHovered || isSelected) && (
                <text
                  x={x}
                  y={y - radius - 8}
                  textAnchor="middle"
                  fill="hsl(210, 40%, 96%)"
                  fontSize="10"
                  fontWeight="600"
                >
                  {zone.district}
                </text>
              )}
            </g>
          );
        })}

        { }
        <g transform="translate(20, 420)">
          <text fill="hsl(215, 20%, 55%)" fontSize="10" fontWeight="500">Risk Level</text>
          {[
            { level: 'critical', label: 'Critical' },
            { level: 'high', label: 'High' },
            { level: 'medium', label: 'Medium' },
            { level: 'low', label: 'Low' },
          ].map((item, i) => (
            <g key={item.level} transform={`translate(${i * 60}, 15)`}>
              <circle cx="6" cy="6" r="5" fill={getRiskColor(item.level)} />
              <text x="16" y="10" fill="hsl(215, 20%, 55%)" fontSize="9">{item.label}</text>
            </g>
          ))}
        </g>
      </svg>

      { }
      {(hoveredZone || selectedZone) && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 right-4 w-64 glass-card p-4"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-foreground">{(hoveredZone || selectedZone)?.district}</h3>
              <p className="text-xs text-muted-foreground">{(hoveredZone || selectedZone)?.state}</p>
            </div>
            <RiskBadge level={(hoveredZone || selectedZone)?.riskLevel || 'low'} showPulse={(hoveredZone || selectedZone)?.anomalyFlag} />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Pincode
              </span>
              <span className="text-foreground">{(hoveredZone || selectedZone)?.pincode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Population</span>
              <span className="text-foreground">{(hoveredZone || selectedZone)?.population.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Risk Score</span>
              <span className="text-foreground font-medium">{(((hoveredZone || selectedZone)?.riskScore || 0) * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Migration
              </span>
              <span className="text-foreground">{(((hoveredZone || selectedZone)?.migrationVelocity || 0) * 100).toFixed(2)}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Fingerprint className="w-3 h-3" /> Biometric
              </span>
              <span className="text-foreground">{(((hoveredZone || selectedZone)?.biometricRisk || 0) * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Wifi className="w-3 h-3" /> Digital Gap
              </span>
              <span className="text-foreground">{(((hoveredZone || selectedZone)?.digitalExclusion || 0) * 100).toFixed(0)}%</span>
            </div>
          </div>

          {(hoveredZone || selectedZone)?.anomalyFlag && (
            <div className="mt-3 px-2 py-1.5 bg-destructive/20 rounded text-xs text-destructive flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
              Anomaly Detected
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default IndiaMap;
