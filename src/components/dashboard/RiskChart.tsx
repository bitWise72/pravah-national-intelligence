import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { MigrationTrend, RiskDistribution, StateRisk } from '@/types';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

const ChartCard = ({ title, subtitle, children, className = '' }: ChartCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`glass-card p-5 ${className}`}
  >
    <div className="mb-4">
      <h3 className="font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
    {children}
  </motion.div>
);

interface MigrationChartProps {
  data: MigrationTrend[];
}

export const MigrationTrendChart = ({ data }: MigrationChartProps) => (
  <ChartCard title="Migration Velocity Trend" subtitle="Last 7 months">
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 28%, 17%)" />
          <XAxis
            dataKey="date"
            stroke="hsl(215, 20%, 55%)"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="hsl(215, 20%, 55%)"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(222, 47%, 10%)',
              border: '1px solid hsl(215, 28%, 17%)',
              borderRadius: '8px',
              color: 'hsl(210, 40%, 96%)',
            }}
            formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, 'Velocity']}
          />
          <Area
            type="monotone"
            dataKey="velocity"
            stroke="hsl(38, 92%, 50%)"
            strokeWidth={2}
            fill="url(#velocityGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </ChartCard>
);

interface RiskDistributionChartProps {
  data: RiskDistribution[];
}

export const RiskDistributionChart = ({ data }: RiskDistributionChartProps) => (
  <ChartCard title="Risk Distribution" subtitle="Active zones by risk level">
    <div className="h-64 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(222, 47%, 10%)',
              border: '1px solid hsl(215, 28%, 17%)',
              borderRadius: '8px',
              color: 'hsl(210, 40%, 96%)',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-muted-foreground text-sm">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </ChartCard>
);

interface StateRiskChartProps {
  data: StateRisk[];
}

export const StateRiskChart = ({ data }: StateRiskChartProps) => (
  <ChartCard title="State-wise Risk Score" subtitle="Top 10 states by risk">
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 28%, 17%)" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 1]}
            stroke="hsl(215, 20%, 55%)"
            fontSize={12}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
          />
          <YAxis
            type="category"
            dataKey="state"
            stroke="hsl(215, 20%, 55%)"
            fontSize={11}
            width={100}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(222, 47%, 10%)',
              border: '1px solid hsl(215, 28%, 17%)',
              borderRadius: '8px',
              color: 'hsl(210, 40%, 96%)',
            }}
            formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Risk Score']}
          />
          <Bar
            dataKey="riskScore"
            fill="hsl(38, 92%, 50%)"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </ChartCard>
);
