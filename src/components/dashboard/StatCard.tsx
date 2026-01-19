import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    label: string;
  };
  variant?: 'default' | 'primary' | 'warning' | 'critical' | 'success';
  delay?: number;
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  delay = 0
}: StatCardProps) => {
  const variantStyles = {
    default: 'border-border/50 hover:border-border',
    primary: 'border-primary/30 bg-primary/5 hover:border-primary/50 hover:bg-primary/10',
    warning: 'border-warning/30 bg-warning/5 hover:border-warning/50 hover:bg-warning/10',
    critical: 'border-destructive/30 bg-destructive/5 hover:border-destructive/50 hover:bg-destructive/10',
    success: 'border-success/30 bg-success/5 hover:border-success/50 hover:bg-success/10',
  };

  const iconStyles = {
    default: 'bg-secondary text-muted-foreground group-hover:bg-secondary/80 group-hover:text-foreground',
    primary: 'bg-primary/20 text-primary group-hover:bg-primary/30',
    warning: 'bg-warning/20 text-warning group-hover:bg-warning/30',
    critical: 'bg-destructive/20 text-destructive group-hover:bg-destructive/30',
    success: 'bg-success/20 text-success group-hover:bg-success/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, type: 'spring', stiffness: 100 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`stat-card group ${variantStyles[variant]} transition-all duration-300 cursor-pointer`}
    >
      <div className="flex items-start justify-between mb-4">
        <motion.div
          whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${iconStyles[variant]}`}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
        {trend && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.2 }}
            className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-lg ${trend.direction === 'up'
                ? 'text-success bg-success/10'
                : 'text-destructive bg-destructive/10'
              }`}
          >
            {trend.direction === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{trend.value}%</span>
          </motion.div>
        )}
      </div>

      <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{title}</h3>
      <motion.p
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.1 }}
        className="text-3xl font-bold text-foreground mb-1 group-hover:text-foreground/90 transition-colors"
      >
        {value}
      </motion.p>
      {subtitle && (
        <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">{subtitle}</p>
      )}
      {trend && (
        <p className="text-xs text-muted-foreground/70 mt-3 pt-3 border-t border-border/30">{trend.label}</p>
      )}
    </motion.div>
  );
};

export default StatCard;
