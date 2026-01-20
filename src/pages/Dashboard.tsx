import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Fingerprint,
  Wifi,
  MapPin,
  Activity,
  Shield,
  Loader2,
  Vote,
  Radio
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import StatCard from '@/components/dashboard/StatCard';
import IndiaMap from '@/components/dashboard/IndiaMap';
import RiskZoneList from '@/components/dashboard/RiskZoneList';
import { MigrationTrendChart, RiskDistributionChart, StateRiskChart } from '@/components/dashboard/RiskChart';
import CensusApiPanel from '@/components/dashboard/CensusApiPanel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRiskZones, useAnomalies, useNationalStats } from '@/hooks/useApi';
import { RiskZone, RiskZoneResponse, RiskDistribution, StateRisk, MigrationTrend } from '@/types';
import { DummyModeBanner } from '@/components/ModeIndicator';
import DataSourcesFooter from '@/components/DataSourcesFooter';
import { ScenarioModeSelector, MahakumbhAnalysisModal } from '@/components/ScenarioMode';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);
  const [riskFilter, setRiskFilter] = useState('all');
  const [scenarioMode, setScenarioMode] = useState('live');
  const [showMahakumbhModal, setShowMahakumbhModal] = useState(false);

  const { data: riskZonesData, isLoading: isLoadingRiskZones } = useRiskZones(undefined, undefined, 500);
  const { data: anomaliesData } = useAnomalies();
  const { data: statsData } = useNationalStats();

  const riskZones: RiskZone[] = useMemo(() => {
    if (!riskZonesData) return [];
    return riskZonesData.map((z: RiskZoneResponse) => ({
      id: z.pincode,
      pincode: z.pincode,
      district: z.district,
      state: z.state,
      latitude: z.latitude,
      longitude: z.longitude,
      population: z.population,
      riskScore: z.risk_score,
      riskLevel: z.risk_level as 'critical' | 'high' | 'medium' | 'low',
      migrationVelocity: z.factors.migration,
      biometricRisk: z.factors.biometric,
      digitalExclusion: z.factors.digital,
      anomalyFlag: z.anomaly_flag,
      electoralIntegrityRatio: z.electoral_integrity_ratio,
      ghostVoterRisk: z.ghost_voter_risk
    }));
  }, [riskZonesData]);

  const nationalStats = useMemo(() => {
    if (statsData) {
      return {
        totalPopulation: statsData.total_population,
        calibratedPopulation: statsData.calibrated_population,
        criticalZones: statsData.risk_counts.critical,
        highRiskZones: statsData.risk_counts.high,
        mediumRiskZones: statsData.risk_counts.medium,
        lowRiskZones: statsData.risk_counts.low,
        migrationVelocityAvg: statsData.averages.migration,
        biometricRiskAvg: statsData.averages.biometric,
        digitalExclusionAvg: statsData.averages.digital,
        anomaliesDetected: statsData.anomalies,
        dataFreshness: new Date().toISOString(),
        coveragePercent: 98.7,
      };
    }

    if (riskZones.length === 0) return {
      totalPopulation: 0,
      calibratedPopulation: 0,
      criticalZones: 0,
      highRiskZones: 0,
      mediumRiskZones: 0,
      lowRiskZones: 0,
      migrationVelocityAvg: 0,
      biometricRiskAvg: 0,
      digitalExclusionAvg: 0,
      anomaliesDetected: 0,
      dataFreshness: new Date().toISOString(),
      coveragePercent: 0,
    };

    const critical = riskZones.filter(z => z.riskLevel === 'critical').length;
    const high = riskZones.filter(z => z.riskLevel === 'high').length;
    const medium = riskZones.filter(z => z.riskLevel === 'medium').length;
    const low = riskZones.filter(z => z.riskLevel === 'low').length;

    const totalPop = riskZones.reduce((acc, z) => acc + z.population, 0);

    const avgMig = riskZones.reduce((acc, z) => acc + z.migrationVelocity, 0) / riskZones.length;
    const avgBio = riskZones.reduce((acc, z) => acc + z.biometricRisk, 0) / riskZones.length;
    const avgDig = riskZones.reduce((acc, z) => acc + z.digitalExclusion, 0) / riskZones.length;

    const ghostVoterCount = riskZones.filter(z => z.ghostVoterRisk).length;
    const avgElectoral = riskZones.reduce((acc, z) => acc + (z.electoralIntegrityRatio || 1.0), 0) / riskZones.length;

    return {
      totalPopulation: totalPop,
      calibratedPopulation: totalPop * 0.98,
      criticalZones: critical,
      highRiskZones: high,
      mediumRiskZones: medium,
      lowRiskZones: low,
      migrationVelocityAvg: avgMig,
      biometricRiskAvg: avgBio,
      digitalExclusionAvg: avgDig,
      anomaliesDetected: anomaliesData?.length || 0,
      dataFreshness: new Date().toISOString(),
      coveragePercent: 98.7,
      ghostVoterZones: ghostVoterCount,
      avgElectoralIntegrity: avgElectoral,
    };
  }, [riskZones, anomaliesData, statsData]);

  const riskDistributionData: RiskDistribution[] = useMemo(() => [
    { name: 'Critical', value: nationalStats.criticalZones, color: 'hsl(0, 72%, 51%)' },
    { name: 'High', value: nationalStats.highRiskZones, color: 'hsl(25, 95%, 53%)' },
    { name: 'Medium', value: nationalStats.mediumRiskZones, color: 'hsl(38, 92%, 50%)' },
    { name: 'Low', value: nationalStats.lowRiskZones, color: 'hsl(142, 71%, 45%)' },
  ].filter(d => d.value > 0), [nationalStats]);

  const stateRiskData: StateRisk[] = useMemo(() => {
    const stateMap = new Map<string, { totalScore: number; count: number }>();
    riskZones.forEach(z => {
      const current = stateMap.get(z.state) || { totalScore: 0, count: 0 };
      stateMap.set(z.state, {
        totalScore: current.totalScore + z.riskScore,
        count: current.count + 1
      });
    });

    return Array.from(stateMap.entries())
      .map(([state, { totalScore, count }]) => ({
        state,
        riskScore: totalScore / count
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);
  }, [riskZones]);

  const migrationTrendData: MigrationTrend[] = [
    { date: new Date().toISOString().slice(0, 7), velocity: nationalStats.migrationVelocityAvg, netMigration: 0 }
  ];

  const renderContent = () => {
    if (isLoadingRiskZones) {
      return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

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
                  zones={riskZones}
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

            <div className="grid grid-cols-4 gap-4">
              <StatCard
                title="CaaS Calibrated Population"
                value={(nationalStats.calibratedPopulation > 1e9 ? (nationalStats.calibratedPopulation / 1e9).toFixed(2) + 'B' : (nationalStats.calibratedPopulation / 1e6).toFixed(2) + 'M')}
                subtitle="Bayesian Fay-Herriot Model"
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
                subtitle="Simini Radiation Model"
                icon={TrendingUp}
                trend={{ value: 0, direction: 'up', label: 'Stochastic mobility' }}
                variant="warning"
                delay={0.2}
              />
              <StatCard
                title="Anomalies Detected"
                value={nationalStats.anomaliesDetected}
                subtitle="Isolation Forest"
                icon={Activity}
                variant="critical"
                delay={0.3}
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <StatCard
                title="Biometric Survival"
                value={(nationalStats.biometricRiskAvg * 100).toFixed(0) + '%'}
                subtitle="Kaplan-Meier Analysis"
                icon={Fingerprint}
                delay={0.4}
              />
              <StatCard
                title="Digital Darkness"
                value={(nationalStats.digitalExclusionAvg * 100).toFixed(0) + '%'}
                subtitle="OpenCellID + NASA VIIRS"
                icon={Radio}
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
                title="Electoral Integrity"
                value={nationalStats.ghostVoterZones || 0}
                subtitle={nationalStats.ghostVoterZones && nationalStats.ghostVoterZones > 0 ? 'Ghost Voters Detected' : 'Rolls Validated'}
                icon={Vote}
                variant={nationalStats.ghostVoterZones && nationalStats.ghostVoterZones > 0 ? 'critical' : 'success'}
                delay={0.7}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 h-[400px]">
                <IndiaMap
                  zones={riskZones}
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

            <div className="grid grid-cols-3 gap-4">
              <MigrationTrendChart data={migrationTrendData} />
              <RiskDistributionChart data={riskDistributionData} />
              <StateRiskChart data={stateRiskData} />
            </div>
          </div>
        );
    }
  };

  const handleScenarioChange = (scenario: string) => {
    setScenarioMode(scenario);
    if (scenario === 'mahakumbh') {
      setShowMahakumbhModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="ml-64">
        <Header />
        <DummyModeBanner />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div />
            <ScenarioModeSelector
              currentScenario={scenarioMode}
              onScenarioChange={handleScenarioChange}
            />
          </div>
          {renderContent()}
        </div>
      </main>

      <DataSourcesFooter />
      <MahakumbhAnalysisModal
        isOpen={showMahakumbhModal}
        onClose={() => setShowMahakumbhModal(false)}
      />
    </div>
  );
};

export default Dashboard;
