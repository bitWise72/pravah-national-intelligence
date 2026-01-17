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
    default: 'border-border/50',
    primary: 'border-primary/30 bg-primary/5',
    warning: 'border-warning/30 bg-warning/5',
    critical: 'border-destructive/30 bg-destructive/5',
    success: 'border-success/30 bg-success/5',
  };

  const iconStyles = {
    default: 'bg-secondary text-muted-foreground',
    primary: 'bg-primary/20 text-primary',
    warning: 'bg-warning/20 text-warning',
    critical: 'bg-destructive/20 text-destructive',
    success: 'bg-success/20 text-success',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`stat-card ${variantStyles[variant]}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconStyles[variant]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend.direction === 'up' ? 'text-success' : 'text-destructive'
          }`}>
            {trend.direction === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="font-medium">{trend.value}%</span>
          </div>
        )}
      </div>

      <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
      <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      )}
      {trend && (
        <p className="text-xs text-muted-foreground mt-2">{trend.label}</p>
      )}
    </motion.div>
  );
};

export default StatCard;
