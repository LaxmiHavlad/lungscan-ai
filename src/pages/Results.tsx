import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  ArrowLeft, 
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  Activity,
  Clock,
  User
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { generatePDFReport } from '@/utils/pdfGenerator';
import VoiceReport from '@/components/VoiceReport';
import RiskSimulator from '@/components/RiskSimulator';
import EmergencyAlert from '@/components/EmergencyAlert';
import LungAgeCard from '@/components/LungAgeCard';
import SymmetryAnalysis from '@/components/SymmetryAnalysis';
import MultiDiseaseResults from '@/components/MultiDiseaseResults';
import RadiologistReport from '@/components/RadiologistReport';

const Results: React.FC = () => {
  const navigate = useNavigate();
  const { 
    uploadedImage, 
    heatmapImage, 
    analysisResult,
    hasAcceptedTerms,
    setUploadedImage,
    setHeatmapImage,
    setAnalysisResult,
    setUploadedFile
  } = useAppContext();

  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);

  useEffect(() => {
    if (!hasAcceptedTerms) {
      navigate('/disclaimer');
    } else if (!analysisResult || !uploadedImage) {
      navigate('/upload');
    }
  }, [hasAcceptedTerms, analysisResult, uploadedImage, navigate]);

  // Show emergency alert for high risk
  useEffect(() => {
    if (analysisResult && analysisResult.riskScore >= 85 && analysisResult.confidence >= 80) {
      setShowEmergencyAlert(true);
    }
  }, [analysisResult]);

  if (!analysisResult || !uploadedImage) {
    return null;
  }

  const handleNewAnalysis = () => {
    setUploadedImage(null);
    setHeatmapImage(null);
    setAnalysisResult(null);
    setUploadedFile(null);
    navigate('/upload');
  };

  const handleDownloadReport = async () => {
    if (!isAcknowledged) return;
    setIsDownloading(true);
    try {
      await generatePDFReport(analysisResult, uploadedImage, heatmapImage || uploadedImage);
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
    setIsDownloading(false);
  };

  const getRiskColor = () => {
    switch (analysisResult.riskLevel) {
      case 'High': return 'text-danger-red';
      case 'Medium': return 'text-warning';
      default: return 'text-success';
    }
  };

  const getRiskBgColor = () => {
    switch (analysisResult.riskLevel) {
      case 'High': return 'bg-danger-pink';
      case 'Medium': return 'bg-alert-yellow-light';
      default: return 'bg-success/10';
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Emergency Alert Modal */}
      {showEmergencyAlert && (
        <EmergencyAlert
          riskScore={analysisResult.riskScore}
          confidence={analysisResult.confidence}
          patientId={analysisResult.patientId}
          onClose={() => setShowEmergencyAlert(false)}
        />
      )}

      {/* Warning Banner */}
      <div className="bg-danger-pink border-b border-danger-red/30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-center gap-2 text-sm">
          <AlertTriangle className="w-4 h-4 text-danger-red" />
          <span className="text-foreground">
            For investigational use only. Not a substitute for professional medical judgment.
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/upload"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Upload</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded-lg">
              <Activity className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">LungScan AI</span>
          </div>
        </div>

        {/* Title & Patient Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Screening Results</h1>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Patient ID: <strong className="text-foreground">{analysisResult.patientId}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Analysis: <strong className="text-foreground">{new Date(analysisResult.analysisTimestamp).toLocaleString()}</strong></span>
            </div>
          </div>
        </motion.div>

        {/* Voice Report */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
          <VoiceReport analysisResult={analysisResult} />
        </motion.div>

        {/* Image Panels */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Original X-ray</h3>
            <div className="bg-muted rounded-xl overflow-hidden aspect-square flex items-center justify-center">
              <img src={uploadedImage} alt="Original X-ray" className="max-w-full max-h-full object-contain" />
            </div>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">AI Heatmap Analysis</h3>
            <div className="bg-muted rounded-xl overflow-hidden aspect-square flex items-center justify-center">
              <img src={heatmapImage || uploadedImage} alt="Heatmap visualization" className="max-w-full max-h-full object-contain" />
            </div>
          </div>
        </motion.div>

        {/* AI Analysis Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`${getRiskBgColor()} rounded-2xl p-6 mb-6 border border-border`}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Risk Score</p>
              <p className={`text-5xl font-bold ${getRiskColor()}`}>{analysisResult.riskScore}%</p>
              <p className="text-sm text-muted-foreground mt-1">Confidence: {analysisResult.confidence}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Classification</p>
              <p className={`text-xl font-semibold ${getRiskColor()}`}>{analysisResult.classification}</p>
              <p className={`text-lg ${getRiskColor()}`}>
                {analysisResult.riskLevel === 'High' && 'High Probability of Malignancy'}
                {analysisResult.riskLevel === 'Medium' && 'Moderate Risk - Follow-up Required'}
                {analysisResult.riskLevel === 'Low' && 'Low Probability - Routine Screening'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Lung Age Card */}
        {analysisResult.lungAge && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-6">
            <LungAgeCard lungAge={analysisResult.lungAge} />
          </motion.div>
        )}

        {/* Symmetry Analysis */}
        {analysisResult.symmetryAnalysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6">
            <SymmetryAnalysis symmetryData={analysisResult.symmetryAnalysis} heatmapImage={heatmapImage} />
          </motion.div>
        )}

        {/* Multi-Disease Results */}
        {analysisResult.multiDiseaseResults && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-6">
            <MultiDiseaseResults results={analysisResult.multiDiseaseResults} />
          </motion.div>
        )}

        {/* Detected Findings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-warning" />
            <h2 className="text-xl font-semibold">Detected Findings</h2>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0" />
              <span><strong>Location:</strong> {analysisResult.noduleLocation}</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0" />
              <span><strong>Size:</strong> {analysisResult.noduleDimensions}</span>
            </li>
            {analysisResult.findings.map((finding, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Recommendations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-6">
          <h2 className="text-xl font-semibold mb-4">Clinical Recommendations</h2>
          <ul className="space-y-3">
            {analysisResult.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium text-primary">{index + 1}</div>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Risk Simulator */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-6">
          <RiskSimulator currentRisk={analysisResult.riskScore} />
        </motion.div>

        {/* Radiologist Report */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mb-6">
          <RadiologistReport analysisResult={analysisResult} />
        </motion.div>

        {/* Disclaimer & Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-danger-pink rounded-2xl p-6 border border-danger-red/20 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-danger-red flex-shrink-0 mt-0.5" />
            <p className="text-sm">
              <strong>Important:</strong> This AI-generated analysis is for investigational purposes only. 
              All findings must be verified by a qualified radiologist or pulmonologist.
            </p>
          </div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input type="checkbox" checked={isAcknowledged} onChange={(e) => setIsAcknowledged(e.target.checked)} className="sr-only" />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isAcknowledged ? 'bg-primary border-primary' : 'border-danger-red/50 group-hover:border-primary'}`}>
                {isAcknowledged && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
              </div>
            </div>
            <span className="text-sm">I acknowledge that I have read and understood the disclaimer.</span>
          </label>
        </motion.div>

        {/* Action Buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex flex-col sm:flex-row gap-4">
          <motion.button onClick={handleNewAnalysis} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 btn-secondary py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5" />
            New Analysis
          </motion.button>
          <motion.button onClick={handleDownloadReport} disabled={!isAcknowledged || isDownloading} whileHover={isAcknowledged ? { scale: 1.02 } : {}} whileTap={isAcknowledged ? { scale: 0.98 } : {}} className={`flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${isAcknowledged ? 'btn-primary cursor-pointer' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
            <Download className="w-5 h-5" />
            {isDownloading ? 'Generating PDF...' : 'Download Report'}
          </motion.button>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          LungScan AI © {new Date().getFullYear()} | For investigational use only
        </p>
      </div>
    </div>
  );
};

export default Results;
