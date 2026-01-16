import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Fingerprint, 
  Wifi,
  MapPin,
  Activity,
  Shield
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import StatCard from '@/components/dashboard/StatCard';
import IndiaMap from '@/components/dashboard/IndiaMap';
import RiskZoneList from '@/components/dashboard/RiskZoneList';
import { MigrationTrendChart, RiskDistributionChart, StateRiskChart } from '@/components/dashboard/RiskChart';
import CensusApiPanel from '@/components/dashboard/CensusApiPanel';
import { riskZones, nationalStats, RiskZone } from '@/data/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);
  const [riskFilter, setRiskFilter] = useState('all');

  const renderContent = () => {
    switch (activeTab) {
      case 'census':
        return <CensusApiPanel />;
      case 'map':
        return (
          <div className="h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">National Risk Map</h2>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-40 bg-secondary/50">
                  <SelectValue placeholder="Filter by risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 gap-4 h-[calc(100%-3rem)]">
              <div className="col-span-3">
                <IndiaMap 
                  onZoneSelect={setSelectedZone} 
                  selectedZone={selectedZone}
                  filterLevel={riskFilter}
                />
              </div>
              <div className="col-span-1">
                <RiskZoneList 
                  zones={riskFilter === 'all' ? riskZones : riskZones.filter(z => z.riskLevel === riskFilter)}
                  selectedZone={selectedZone}
                  onZoneSelect={setSelectedZone}
                />
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 border-primary/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold gradient-text">
                    National Demographic Intelligence
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Real-time population analytics, migration tracking, and risk detection across India
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Data Coverage</p>
                    <p className="text-2xl font-bold text-primary">{nationalStats.coveragePercent}%</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center glow-effect">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              <StatCard
                title="Calibrated Population"
                value={(nationalStats.calibratedPopulation / 1e9).toFixed(2) + 'B'}
                subtitle="National estimate"
                icon={Users}
                trend={{ value: 1.2, direction: 'up', label: 'vs Census 2011' }}
                variant="primary"
                delay={0}
              />
              <StatCard
                title="Critical Zones"
                value={nationalStats.criticalZones}
                subtitle={`${nationalStats.highRiskZones} high risk zones`}
                icon={AlertTriangle}
                variant="critical"
                delay={0.1}
              />
              <StatCard
                title="Migration Velocity"
                value={(nationalStats.migrationVelocityAvg * 100).toFixed(1) + '%'}
                subtitle="National average"
                icon={TrendingUp}
                trend={{ value: 8.5, direction: 'up', label: 'vs last quarter' }}
                variant="warning"
                delay={0.2}
              />
              <StatCard
                title="Anomalies Detected"
                value={nationalStats.anomaliesDetected}
                subtitle="Active alerts"
                icon={Activity}
                variant="critical"
                delay={0.3}
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-4 gap-4">
              <StatCard
                title="Biometric Risk Index"
                value={(nationalStats.biometricRiskAvg * 100).toFixed(0) + '%'}
                subtitle="Enrollment deficit score"
                icon={Fingerprint}
                delay={0.4}
              />
              <StatCard
                title="Digital Exclusion"
                value={(nationalStats.digitalExclusionAvg * 100).toFixed(0) + '%'}
                subtitle="OTP failure & connectivity"
                icon={Wifi}
                delay={0.5}
              />
              <StatCard
                title="Monitored Zones"
                value={riskZones.length}
                subtitle="Active tracking points"
                icon={MapPin}
                delay={0.6}
              />
              <StatCard
                title="Total Risk Zones"
                value={nationalStats.criticalZones + nationalStats.highRiskZones + nationalStats.mediumRiskZones}
                subtitle="Requiring intervention"
                icon={AlertTriangle}
                variant="warning"
                delay={0.7}
              />
            </div>

            {/* Map Preview */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 h-[400px]">
                <IndiaMap 
                  onZoneSelect={setSelectedZone}
                  selectedZone={selectedZone}
                />
              </div>
              <RiskZoneList 
                zones={riskZones.slice(0, 8)}
                selectedZone={selectedZone}
                onZoneSelect={setSelectedZone}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-3 gap-4">
              <MigrationTrendChart />
              <RiskDistributionChart />
              <StateRiskChart />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="ml-64">
        <Header />
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
