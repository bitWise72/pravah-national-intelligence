import { motion } from 'framer-motion';

interface RiskBadgeProps {
  level: 'critical' | 'high' | 'medium' | 'low';
  showPulse?: boolean;
}

const RiskBadge = ({ level, showPulse = false }: RiskBadgeProps) => {
  const styles = {
    critical: 'risk-badge-critical',
    high: 'risk-badge-high',
    medium: 'risk-badge-medium',
    low: 'risk-badge-low',
  };

  const labels = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${styles[level]}`}
    >
      {showPulse && level === 'critical' && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
        </span>
      )}
      {labels[level]}
    </motion.span>
  );
};

export default RiskBadge;
