import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Cigarette, Wind, Calculator } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { simulateRisk } from '@/utils/xrayAnalysis';

interface RiskSimulatorProps {
  currentRisk: number;
}

const RiskSimulator: React.FC<RiskSimulatorProps> = ({ currentRisk }) => {
  const [monthsSmokingFree, setMonthsSmokingFree] = useState(0);
  const [pollutionReduction, setPollutionReduction] = useState(0);

  const { simulatedRisk, reduction } = useMemo(() => {
    return simulateRisk(currentRisk, monthsSmokingFree, pollutionReduction);
  }, [currentRisk, monthsSmokingFree, pollutionReduction]);

  const getRiskColor = (risk: number) => {
    if (risk < 30) return 'text-success';
    if (risk < 60) return 'text-warning';
    return 'text-danger-red';
  };

  const getRiskBgColor = (risk: number) => {
    if (risk < 30) return 'bg-success/20';
    if (risk < 60) return 'bg-warning/20';
    return 'bg-danger-red/20';
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Risk Prediction Simulator</h2>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">
        See how lifestyle changes could potentially affect your risk over time. 
        <em> Note: This is an educational simulation only.</em>
      </p>

      {/* Sliders */}
      <div className="space-y-6 mb-8">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Cigarette className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium">Months Smoke-Free</span>
            </div>
            <span className="text-sm font-semibold text-primary">{monthsSmokingFree} months</span>
          </div>
          <Slider
            value={[monthsSmokingFree]}
            onValueChange={([value]) => setMonthsSmokingFree(value)}
            min={0}
            max={24}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0</span>
            <span>24 months</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Pollution Exposure Reduction</span>
            </div>
            <span className="text-sm font-semibold text-primary">{pollutionReduction}%</span>
          </div>
          <Slider
            value={[pollutionReduction]}
            onValueChange={([value]) => setPollutionReduction(value)}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-xl ${getRiskBgColor(currentRisk)}`}>
          <p className="text-xs text-muted-foreground mb-1">Current Risk</p>
          <p className={`text-3xl font-bold ${getRiskColor(currentRisk)}`}>{currentRisk}%</p>
        </div>
        <div className={`p-4 rounded-xl ${getRiskBgColor(simulatedRisk)}`}>
          <p className="text-xs text-muted-foreground mb-1">Simulated Risk</p>
          <motion.p 
            key={simulatedRisk}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className={`text-3xl font-bold ${getRiskColor(simulatedRisk)}`}
          >
            {simulatedRisk}%
          </motion.p>
        </div>
      </div>

      {reduction > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-success/10 rounded-lg flex items-center justify-center gap-2"
        >
          <TrendingDown className="w-5 h-5 text-success" />
          <span className="font-semibold text-success">
            Potential {reduction}% Risk Reduction
          </span>
        </motion.div>
      )}

      <p className="text-xs text-muted-foreground mt-4 text-center">
        * Based on general epidemiological data. Individual results may vary.
      </p>
    </div>
  );
};

export default RiskSimulator;
