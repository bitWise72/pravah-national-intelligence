import { motion } from 'framer-motion';
import { RiskZone } from '@/types';
import RiskBadge from './RiskBadge';
import { useState } from 'react';
import { X, MapPin, TrendingUp, Fingerprint, Wifi, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const getRiskColor = (level: string): string => {
  const colors: Record<string, string> = {
    critical: '#dc2626',
    high: '#ea580c',
    medium: '#ca8a04',
    low: '#16a34a',
  };
  return colors[level] || '#6b7280';
};

const latLongToSvg = (lat: number, lng: number): { x: number; y: number } => {
  const minLat = 6, maxLat = 38;
  const minLng = 66, maxLng = 98;

  const x = ((lng - minLng) / (maxLng - minLng)) * 600 + 50;
  const y = ((maxLat - lat) / (maxLat - minLat)) * 700 + 40;

  return { x, y };
};

const INDIA_PATH = `M 200 100
  C 230 80, 350 60, 420 85
  C 480 105, 520 130, 550 175
  C 570 215, 580 265, 575 315
  C 570 365, 540 420, 495 475
  C 450 530, 390 570, 330 595
  C 270 615, 200 620, 160 595
  C 120 570, 85 530, 70 480
  C 55 430, 50 370, 60 315
  C 70 260, 90 210, 120 170
  C 150 130, 175 110, 200 100
  Z`;

interface IndiaMapProps {
  zones: RiskZone[];
  onZoneSelect?: (zone: RiskZone) => void;
  selectedZone?: RiskZone | null;
  filterLevel?: string;
}

const IndiaMap = ({ zones, onZoneSelect, selectedZone = null, filterLevel }: IndiaMapProps) => {
  const [hoveredZone, setHoveredZone] = useState<RiskZone | null>(null);
  const [zoom, setZoom] = useState(1);

  const filteredZones = filterLevel && filterLevel !== 'all'
    ? zones.filter(z => z.riskLevel === filterLevel)
    : zones;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.6));
  const handleReset = () => setZoom(1);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="map-container h-full relative rounded-xl overflow-hidden border border-border/50 bg-gradient-to-br from-background via-background/95 to-primary/5"
      role="region"
      aria-label="Risk zone map of India"
    >
      {/* Zoom Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomIn}
          className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomOut}
          className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleReset}
          className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      <svg
        viewBox="0 0 700 800"
        className="w-full h-full transition-transform duration-300"
        style={{
          minHeight: '400px',
          transform: `scale(${zoom})`
        }}
        role="img"
        aria-label={`Map showing ${filteredZones.length} risk zones across India`}
      >
        <title>PRAVAH India Risk Zone Map</title>
        <desc>Interactive map displaying demographic risk zones across India with color-coded severity levels</desc>

        <defs>
          {/* Gradient background */}
          <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(215, 28%, 12%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(215, 28%, 8%)" stopOpacity="0.6" />
          </linearGradient>

          {/* Glow effect for zones */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Subtle grid pattern */}
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="hsl(215, 28%, 20%)" strokeWidth="0.3" opacity="0.2" />
          </pattern>
        </defs>

        {/* Background */}
        <rect width="100%" height="100%" fill="url(#grid)" aria-hidden="true" />

        {/* India boundary - enhanced */}
        <path
          d={INDIA_PATH}
          fill="url(#mapGradient)"
          stroke="hsl(38, 92%, 50%)"
          strokeWidth="2"
          opacity="0.8"
          className="transition-all duration-500 hover:opacity-100"
          aria-hidden="true"
        />

        {/* Inner glow for India */}
        <path
          d={INDIA_PATH}
          fill="none"
          stroke="hsl(38, 92%, 60%)"
          strokeWidth="1"
          opacity="0.3"
          style={{
            filter: 'blur(2px)'
          }}
          aria-hidden="true"
        />

        {/* Risk zones */}
        {filteredZones.map((zone) => {
          const { x, y } = latLongToSvg(zone.latitude, zone.longitude);
          const isSelected = selectedZone?.id === zone.id;
          const isHovered = hoveredZone?.id === zone.id;
          const baseRadius = 6;
          const radius = baseRadius + zone.riskScore * 10;

          return (
            <g key={zone.id}>
              {/* Pulse effect for critical zones */}
              {zone.riskLevel === 'critical' && (
                <circle
                  cx={x}
                  cy={y}
                  r={radius + 8}
                  fill={getRiskColor(zone.riskLevel)}
                  opacity={0.2}
                  className="animate-ping"
                  style={{ transformOrigin: `${x}px ${y}px`, animationDuration: '2s' }}
                />
              )}

              {/* Outer glow */}
              <circle
                cx={x}
                cy={y}
                r={radius + 4}
                fill={getRiskColor(zone.riskLevel)}
                opacity={isSelected || isHovered ? 0.5 : 0.25}
                filter="url(#glow)"
              />

              {/* Main zone marker */}
              <motion.circle
                cx={x}
                cy={y}
                r={radius}
                fill={getRiskColor(zone.riskLevel)}
                stroke={isSelected ? '#fff' : 'transparent'}
                strokeWidth={isSelected ? 3 : 0}
                opacity={0.9}
                whileHover={{ scale: 1.3 }}
                transition={{ type: 'spring', stiffness: 300 }}
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

              {/* Label on hover/select */}
              {(isHovered || isSelected) && (
                <text
                  x={x}
                  y={y - radius - 10}
                  textAnchor="middle"
                  fill="hsl(210, 40%, 96%)"
                  fontSize="12"
                  fontWeight="700"
                  className="drop-shadow-lg"
                >
                  {zone.district}
                </text>
              )}
            </g>
          );
        })}

        {/* Enhanced legend */}
        <g transform="translate(40, 720)">
          <rect
            x="-10"
            y="-10"
            width="280"
            height="50"
            fill="hsl(215, 28%, 12%)"
            opacity="0.8"
            rx="8"
          />
          <text fill="hsl(215, 20%, 70%)" fontSize="11" fontWeight="600" y="5">Risk Levels</text>
          {[
            { level: 'critical', label: 'Critical' },
            { level: 'high', label: 'High' },
            { level: 'medium', label: 'Medium' },
            { level: 'low', label: 'Low' },
          ].map((item, i) => (
            <g key={item.level} transform={`translate(${i * 65}, 20)`}>
              <circle cx="7" cy="7" r="6" fill={getRiskColor(item.level)} opacity="0.9" />
              <text x="18" y="11" fill="hsl(215, 20%, 65%)" fontSize="10" fontWeight="500">{item.label}</text>
            </g>
          ))}
        </g>
      </svg>

      {/* Enhanced tooltip panel */}
      {(hoveredZone || selectedZone) && (
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="absolute top-4 right-4 w-72 glass-card p-5 shadow-2xl border border-primary/20"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg text-foreground">{(hoveredZone || selectedZone)?.district}</h3>
              <p className="text-sm text-muted-foreground">{(hoveredZone || selectedZone)?.state}</p>
            </div>
            <RiskBadge level={(hoveredZone || selectedZone)?.riskLevel || 'low'} showPulse={(hoveredZone || selectedZone)?.anomalyFlag} />
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
              <span className="text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Pincode
              </span>
              <span className="text-foreground font-semibold">{(hoveredZone || selectedZone)?.pincode}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
              <span className="text-muted-foreground">Population</span>
              <span className="text-foreground font-semibold">{(hoveredZone || selectedZone)?.population.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
              <span className="text-muted-foreground">Risk Score</span>
              <span className="text-foreground font-bold text-lg">{(((hoveredZone || selectedZone)?.riskScore || 0) * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
            <div className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-secondary/20 transition-colors">
              <span className="text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-warning" /> Migration
              </span>
              <span className="text-foreground font-medium">{(((hoveredZone || selectedZone)?.migrationVelocity || 0) * 100).toFixed(2)}%</span>
            </div>
            <div className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-secondary/20 transition-colors">
              <span className="text-muted-foreground flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-primary" /> Biometric
              </span>
              <span className="text-foreground font-medium">{(((hoveredZone || selectedZone)?.biometricRisk || 0) * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-secondary/20 transition-colors">
              <span className="text-muted-foreground flex items-center gap-2">
                <Wifi className="w-4 h-4 text-success" /> Digital Gap
              </span>
              <span className="text-foreground font-medium">{(((hoveredZone || selectedZone)?.digitalExclusion || 0) * 100).toFixed(0)}%</span>
            </div>
          </div>

          {(hoveredZone || selectedZone)?.anomalyFlag && (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="mt-4 px-3 py-2 bg-destructive/20 rounded-lg text-sm text-destructive flex items-center gap-2 font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              Anomaly Detected
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default IndiaMap;
