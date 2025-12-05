import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface DiseaseResult {
  disease: string;
  present: boolean;
  confidence: number;
  findings: string[];
}

interface MultiDiseaseResultsProps {
  results?: DiseaseResult[];
}

const MultiDiseaseResults: React.FC<MultiDiseaseResultsProps> = ({ results }) => {
  if (!results || results.length === 0) return null;

  const getStatusIcon = (result: DiseaseResult) => {
    if (!result.present && result.confidence >= 80) {
      return <CheckCircle2 className="w-5 h-5 text-success" />;
    }
    if (result.present && result.confidence >= 70) {
      return <XCircle className="w-5 h-5 text-danger-red" />;
    }
    return <AlertCircle className="w-5 h-5 text-warning" />;
  };

  const getStatusColor = (result: DiseaseResult) => {
    if (!result.present && result.confidence >= 80) {
      return 'border-success/30 bg-success/5';
    }
    if (result.present && result.confidence >= 70) {
      return 'border-danger-red/30 bg-danger-pink';
    }
    return 'border-warning/30 bg-alert-yellow-light';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-sm border border-border"
    >
      <div className="flex items-center gap-3 mb-6">
        <Stethoscope className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Multi-Disease Analysis</h2>
        <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
          Advanced
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result, index) => (
          <motion.div
            key={result.disease}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border ${getStatusColor(result)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium">{result.disease}</h3>
              {getStatusIcon(result)}
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.confidence}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  className={`h-full rounded-full ${
                    result.present ? 'bg-danger-red' : 'bg-success'
                  }`}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {result.confidence}%
              </span>
            </div>
            
            <p className={`text-sm font-medium ${
              result.present ? 'text-danger-red' : 'text-success'
            }`}>
              {result.present ? 'Detected' : 'Not Detected'}
            </p>

            {result.present && result.findings && result.findings.length > 0 && (
              <ul className="mt-2 space-y-1">
                {result.findings.slice(0, 2).map((finding, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                    <span>•</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        Multi-disease detection provides preliminary screening. All findings require clinical verification.
      </p>
    </motion.div>
  );
};

export default MultiDiseaseResults;
