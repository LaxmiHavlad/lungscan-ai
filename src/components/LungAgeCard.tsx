import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LungAgeCardProps {
  lungAge?: { age: number; notes: string };
  assumedChronologicalAge?: number;
}

const LungAgeCard: React.FC<LungAgeCardProps> = ({ 
  lungAge, 
  assumedChronologicalAge = 45 
}) => {
  if (!lungAge) return null;

  const ageDifference = lungAge.age - assumedChronologicalAge;
  const isYounger = ageDifference < 0;
  const isOlder = ageDifference > 5;
  
  const getColor = () => {
    if (isYounger) return 'text-success';
    if (isOlder) return 'text-danger-red';
    return 'text-warning';
  };

  const getBgColor = () => {
    if (isYounger) return 'bg-success/10';
    if (isOlder) return 'bg-danger-pink';
    return 'bg-alert-yellow-light';
  };

  const getGaugeRotation = () => {
    // Map lung age to gauge rotation (-90 to 90 degrees)
    // Age 20 = -90deg, Age 70 = 90deg
    const minAge = 20;
    const maxAge = 70;
    const normalizedAge = Math.min(maxAge, Math.max(minAge, lungAge.age));
    const rotation = ((normalizedAge - minAge) / (maxAge - minAge)) * 180 - 90;
    return rotation;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${getBgColor()} rounded-2xl p-6 border border-border`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Estimated Lung Age</h3>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>This is an estimate based on visible lung tissue health markers. It does not replace clinical lung function tests.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex items-center gap-6">
        {/* Gauge visualization */}
        <div className="relative w-24 h-12 overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-24 w-24 rounded-full border-8 border-b-0 border-gradient-to-r from-success via-warning to-danger-red"
               style={{ 
                 borderColor: 'transparent',
                 background: 'conic-gradient(from 180deg, hsl(var(--success)), hsl(var(--warning)), hsl(var(--danger-red)))',
                 clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)',
                 borderRadius: '0 0 100% 100%'
               }}
          />
          <motion.div
            initial={{ rotate: -90 }}
            animate={{ rotate: getGaugeRotation() }}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute bottom-0 left-1/2 h-10 w-1 bg-foreground origin-bottom"
            style={{ transformOrigin: 'bottom center' }}
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-foreground" />
        </div>

        {/* Age display */}
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold ${getColor()}`}>{lungAge.age}</span>
            <span className="text-muted-foreground">years</span>
          </div>
          
          {ageDifference !== 0 && (
            <p className={`text-sm ${getColor()}`}>
              {isYounger ? (
                <>{Math.abs(ageDifference)} years younger than average</>
              ) : (
                <>{Math.abs(ageDifference)} years older than expected</>
              )}
            </p>
          )}
        </div>
      </div>

      {lungAge.notes && (
        <p className="text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
          {lungAge.notes}
        </p>
      )}
    </motion.div>
  );
};

export default LungAgeCard;
