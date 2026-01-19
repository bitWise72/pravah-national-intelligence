import { motion } from 'framer-motion';
import { Copy, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  example: string;
}

const endpoints: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/api/census/calibrated',
    description: 'Returns calibrated population estimates with confidence intervals',
    example: `{
  "pincode": "110001",
  "census_baseline": 125000,
  "aadhaar_proxy": 128500,
  "calibrated_population": 126750,
  "lower_ci": 124200,
  "upper_ci": 129300,
  "timestamp": "2025-01-16T08:30:00Z"
}`,
  },
  {
    method: 'GET',
    path: '/api/migration?date=2025-01-16',
    description: 'Returns migration velocity data for specified date',
    example: `{
  "pincode": "110001",
  "date": "2025-01-16",
  "velocity": 0.052,
  "net_change": 1250,
  "direction": "inflow"
}`,
  },
  {
    method: 'GET',
    path: '/api/biometric-risk',
    description: 'Returns biometric enrollment deficit and survival scores',
    example: `{
  "pincode": "800001",
  "district": "Patna",
  "enrolled_children": 45200,
  "expected_children": 52800,
  "survival_score": 0.856,
  "deficit": 7600
}`,
  },
  {
    method: 'GET',
    path: '/api/risk-zones',
    description: 'Returns high-risk zones with composite risk scores',
    example: `{
  "pincode": "800001",
  "district": "Patna",
  "state": "Bihar",
  "risk_score": 0.89,
  "risk_level": "critical",
  "factors": {
    "migration": 0.095,
    "biometric": 0.91,
    "digital": 0.82
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/anomalies',
    description: 'Returns detected anomalies from Isolation Forest model',
    example: `{
  "pincode": "110001",
  "anomaly_flag": true,
  "anomaly_score": -0.42,
  "detected_at": "2025-01-15T14:22:00Z",
  "type": "migration_spike"
}`,
  },
];

const CensusApiPanel = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="glass-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold gradient-text">Census-as-a-Service API</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              RESTful API endpoints for accessing calibrated population data, migration analytics,
              and risk intelligence. Designed for government systems integration.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm text-success">API Active</span>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <code className="px-4 py-2 bg-secondary rounded-lg text-sm font-mono text-foreground">
            Base URL: <span className="text-muted-foreground">{import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}</span>
          </code>
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            OpenAPI Spec
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {endpoints.map((endpoint, index) => (
          <motion.div
            key={endpoint.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card overflow-hidden"
          >
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-success/20 text-success">
                  {endpoint.method}
                </span>
                <code className="text-sm font-mono text-foreground">{endpoint.path}</code>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(endpoint.path, index)}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                {copiedIndex === index ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-success" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-4">{endpoint.description}</p>
              <div className="bg-background/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-2">Example Response:</p>
                <pre className="text-sm font-mono text-foreground overflow-x-auto">
                  {endpoint.example}
                </pre>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-5 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Government Integration Ready</h4>
            <p className="text-sm text-muted-foreground mt-1">
              All endpoints implement privacy-preserving data handling with automatic suppression
              of values for populations below threshold (n&lt;10). Authentication via API key required
              for production access.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CensusApiPanel;
