import React from 'react';
import { motion } from 'framer-motion';
import { Scan, CheckCircle2, AlertCircle } from 'lucide-react';

interface SymmetryAnalysisProps {
  symmetryData?: {
    score: number;
    asymmetricRegions: string[];
    notes: string;
  };
  heatmapImage: string | null;
}

const SymmetryAnalysis: React.FC<SymmetryAnalysisProps> = ({ symmetryData, heatmapImage }) => {
  if (!symmetryData) return null;

  const isSymmetric = symmetryData.score >= 70;
  const isConcerning = symmetryData.score < 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-sm border border-border"
    >
      <div className="flex items-center gap-3 mb-4">
        <Scan className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Lung Symmetry Analysis</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Symmetry visualization */}
        <div className="relative">
          {heatmapImage && (
            <div className="relative rounded-xl overflow-hidden bg-muted">
              <img 
                src={heatmapImage} 
                alt="Symmetry analysis" 
                className="w-full h-48 object-contain"
              />
              {/* Vertical divider line */}
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-primary/50" />
              {/* Labels */}
              <div className="absolute top-2 left-4 text-xs font-medium px-2 py-1 bg-primary/80 text-primary-foreground rounded">
                Right Lung
              </div>
              <div className="absolute top-2 right-4 text-xs font-medium px-2 py-1 bg-primary/80 text-primary-foreground rounded">
                Left Lung
              </div>
            </div>
          )}
        </div>

        {/* Symmetry score and details */}
        <div>
          <div className={`p-4 rounded-xl mb-4 ${
            isSymmetric ? 'bg-success/10' : isConcerning ? 'bg-danger-pink' : 'bg-alert-yellow-light'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Symmetry Score</span>
              {isSymmetric ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <AlertCircle className={`w-5 h-5 ${isConcerning ? 'text-danger-red' : 'text-warning'}`} />
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${
                isSymmetric ? 'text-success' : isConcerning ? 'text-danger-red' : 'text-warning'
              }`}>
                {symmetryData.score}%
              </span>
              <span className="text-sm text-muted-foreground">
                {isSymmetric ? 'Normal symmetry' : isConcerning ? 'Concerning asymmetry' : 'Mild asymmetry'}
              </span>
            </div>
          </div>

          {/* Asymmetric regions */}
          {symmetryData.asymmetricRegions && symmetryData.asymmetricRegions.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Asymmetric Regions</h4>
              <ul className="space-y-1">
                {symmetryData.asymmetricRegions.map((region, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-warning" />
                    {region}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Notes */}
          {symmetryData.notes && (
            <p className="text-sm text-muted-foreground">
              {symmetryData.notes}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SymmetryAnalysis;
