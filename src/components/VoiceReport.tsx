import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw } from 'lucide-react';
import { AnalysisResult } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface VoiceReportProps {
  analysisResult: AnalysisResult;
}

const VoiceReport: React.FC<VoiceReportProps> = ({ analysisResult }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [supported, setSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSupported(false);
    }
    
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const generateSpeechText = (): string => {
    const { classification, riskScore, riskLevel, findings, recommendations, noduleLocation } = analysisResult;
    
    let text = `Analysis complete. `;
    text += `Classification: ${classification}. `;
    text += `Risk score is ${riskScore} percent, indicating ${riskLevel.toLowerCase()} probability. `;
    
    if (findings && findings.length > 0) {
      text += `The scan shows the following findings: ${findings.join('. ')}. `;
    } else {
      text += `No significant abnormalities detected. `;
    }
    
    if (noduleLocation && noduleLocation !== 'None detected') {
      text += `${noduleLocation}. `;
    }
    
    if (recommendations && recommendations.length > 0) {
      text += `Recommendations: ${recommendations.slice(0, 3).join('. ')}. `;
    }
    
    text += `Please note: This analysis is for informational purposes only. Consult a healthcare professional for medical advice.`;
    
    return text;
  };

  const handlePlay = () => {
    if (!supported) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // Cancel any existing speech
    window.speechSynthesis.cancel();
    
    const text = generateSpeechText();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';
    
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!supported) {
    return (
      <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
        Voice report is not supported in this browser.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-primary" />
          <span className="font-medium">Voice Report</span>
        </div>
        <div className="flex items-center gap-2">
          {!isPlaying && !isPaused && (
            <Button size="sm" variant="outline" onClick={handlePlay}>
              <Play className="w-4 h-4 mr-1" />
              Play
            </Button>
          )}
          {isPlaying && (
            <Button size="sm" variant="outline" onClick={handlePause}>
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </Button>
          )}
          {isPaused && (
            <Button size="sm" variant="outline" onClick={handlePlay}>
              <Play className="w-4 h-4 mr-1" />
              Resume
            </Button>
          )}
          {(isPlaying || isPaused) && (
            <Button size="sm" variant="ghost" onClick={handleStop}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <VolumeX className="w-4 h-4 text-muted-foreground" />
        <Slider
          value={[speechRate]}
          onValueChange={([value]) => setSpeechRate(value)}
          min={0.5}
          max={1.5}
          step={0.1}
          className="flex-1"
        />
        <Volume2 className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground w-12">{speechRate.toFixed(1)}x</span>
      </div>
    </div>
  );
};

export default VoiceReport;
