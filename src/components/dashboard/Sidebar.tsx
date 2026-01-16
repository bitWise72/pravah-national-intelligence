import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Map, 
  TrendingUp, 
  ShieldAlert, 
  Fingerprint, 
  Wifi,
  Database,
  AlertTriangle,
  Settings,
  Info
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'map', label: 'Risk Map', icon: Map },
  { id: 'migration', label: 'Migration', icon: TrendingUp },
  { id: 'biometric', label: 'Biometric Risk', icon: Fingerprint },
  { id: 'digital', label: 'Digital Exclusion', icon: Wifi },
  { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
  { id: 'census', label: 'Census API', icon: Database },
];

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50"
    >
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-effect">
            <ShieldAlert className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">PRAVAH</h1>
            <p className="text-xs text-muted-foreground">National Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider px-3 mb-3">
          Dashboard
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent transition-colors">
          <Settings className="w-5 h-5" />
          Settings
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent transition-colors">
          <Info className="w-5 h-5" />
          Documentation
        </button>
      </div>

      {/* Status Indicator */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-foreground">System Active</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Last sync: 2 min ago
          </p>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
