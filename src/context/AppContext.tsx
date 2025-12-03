import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AnalysisResult {
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  findings: string[];
  recommendations: string[];
  noduleLocation: string;
  noduleDimensions: string;
  additionalObservations: string[];
  patientId: string;
  analysisTimestamp: string;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [heatmapImage, setHeatmapImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
