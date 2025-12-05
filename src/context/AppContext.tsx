import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HeatmapRegion {
  x_percent: number;
  y_percent: number;
  intensity: number;
  size: number;
}

interface LungAge {
  age: number;
  notes: string;
}

interface SymmetryAnalysis {
  score: number;
  asymmetricRegions: string[];
  notes: string;
}

interface MultiDiseaseResult {
  disease: string;
  present: boolean;
  confidence: number;
  findings: string[];
}

interface ComparisonResults {
  changes: string[];
  progressionRate: number;
  overallTrend: 'improving' | 'stable' | 'worsening';
}

export interface AnalysisResult {
  classification: 'Normal' | 'Abnormal' | 'Inconclusive';
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  confidence: number;
  findings: string[];
  recommendations: string[];
  noduleLocation: string;
  noduleDimensions: string;
  additionalObservations: string[];
  patientId: string;
  analysisTimestamp: string;
  heatmapRegions: HeatmapRegion[];
  detailedReport: string;
  lungAge?: LungAge;
  symmetryAnalysis?: SymmetryAnalysis;
  multiDiseaseResults?: MultiDiseaseResult[];
  comparisonResults?: ComparisonResults;
}

interface HealthPassportEntry {
  id: string;
  date: string;
  riskScore: number;
  classification: string;
  findings: string[];
  imagePreview?: string;
}

interface AppContextType {
  uploadedImage: string | null;
  setUploadedImage: (image: string | null) => void;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  hasAcceptedTerms: boolean;
  setHasAcceptedTerms: (accepted: boolean) => void;
  heatmapImage: string | null;
  setHeatmapImage: (image: string | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
  analysisMode: 'standard' | 'multi-disease';
  setAnalysisMode: (mode: 'standard' | 'multi-disease') => void;
  previousScan: string | null;
  setPreviousScan: (scan: string | null) => void;
  healthPassport: HealthPassportEntry[];
  addToHealthPassport: (entry: Omit<HealthPassportEntry, 'id'>) => void;
  clearHealthPassport: () => void;
  validationError: string | null;
  setValidationError: (error: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [heatmapImage, setHeatmapImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'standard' | 'multi-disease'>('standard');
  const [previousScan, setPreviousScan] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Load health passport from localStorage
  const [healthPassport, setHealthPassport] = useState<HealthPassportEntry[]>(() => {
    try {
      const saved = localStorage.getItem('lung_health_passport');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addToHealthPassport = (entry: Omit<HealthPassportEntry, 'id'>) => {
    const newEntry: HealthPassportEntry = {
      ...entry,
      id: Date.now().toString()
    };
    const updated = [...healthPassport, newEntry];
    setHealthPassport(updated);
    localStorage.setItem('lung_health_passport', JSON.stringify(updated));
  };

  const clearHealthPassport = () => {
    setHealthPassport([]);
    localStorage.removeItem('lung_health_passport');
  };

  return (
    <AppContext.Provider
      value={{
        uploadedImage,
        setUploadedImage,
        uploadedFile,
        setUploadedFile,
        analysisResult,
        setAnalysisResult,
        hasAcceptedTerms,
        setHasAcceptedTerms,
        heatmapImage,
        setHeatmapImage,
        isAnalyzing,
        setIsAnalyzing,
        analysisMode,
        setAnalysisMode,
        previousScan,
        setPreviousScan,
        healthPassport,
        addToHealthPassport,
        clearHealthPassport,
        validationError,
        setValidationError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
