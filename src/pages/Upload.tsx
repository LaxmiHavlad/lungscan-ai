import React, { useCallback, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload as UploadIcon, 
  AlertTriangle, 
  ArrowLeft, 
  FileImage,
  X,
  CheckCircle2,
  Loader2,
  Activity
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { performMockAnalysis, generateHeatmapOverlay } from '@/utils/mockAI';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const { 
    hasAcceptedTerms, 
    setUploadedImage, 
    setUploadedFile,
    setAnalysisResult,
    setHeatmapImage,
    setIsAnalyzing
  } = useAppContext();

  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if terms not accepted
  React.useEffect(() => {
    if (!hasAcceptedTerms) {
      navigate('/disclaimer');
    }
  }, [hasAcceptedTerms, navigate]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFileName(file.name);
      setUploadedFile(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreview(result);
        setUploadedImage(result);
      };
      reader.readAsDataURL(file);
    }
  }, [setUploadedFile, setUploadedImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/dicom': ['.dcm', '.dicom'],
    },
    maxFiles: 1,
  });

  const clearFile = () => {
    setPreview(null);
    setFileName('');
    setUploadedFile(null);
    setUploadedImage(null);
  };

  const handleAnalyze = async () => {
    if (!preview || !isAcknowledged) return;

    setIsLoading(true);
    setIsAnalyzing(true);

    try {
      // Perform mock AI analysis
      const result = await performMockAnalysis();
      setAnalysisResult(result);

      // Generate heatmap
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const heatmap = generateHeatmapOverlay(img, canvas);
        setHeatmapImage(heatmap);
        setIsLoading(false);
        setIsAnalyzing(false);
        navigate('/results');
      };
      img.src = preview;
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  };

  const guidelines = [
    { label: 'Resolution', value: 'High-resolution images recommended' },
    { label: 'Anonymization', value: 'Ensure patient data is anonymized before upload' },
    { label: 'View', value: 'Clear, unobstructed frontal (AP/PA) views' },
  ];

  return (
    <div className="min-h-screen bg-muted">
      {/* Warning Banner */}
      <div className="bg-danger-pink border-b border-danger-red/30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-center gap-2 text-sm">
          <AlertTriangle className="w-4 h-4 text-danger-red" />
          <span className="text-foreground">
            For investigational use only. This tool does not provide a medical diagnosis.
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded-lg">
              <Activity className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">LungScan AI</span>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                1
              </div>
              <span className="font-medium">Upload Image</span>
            </div>
            <div className="flex-1 h-1 bg-border rounded-full">
              <div className="w-1/3 h-full bg-primary rounded-full" />
            </div>
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-8 h-8 bg-muted border border-border rounded-full flex items-center justify-center font-semibold text-sm">
                2
              </div>
              <span>Analysis</span>
            </div>
            <div className="flex-1 h-1 bg-border rounded-full" />
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-8 h-8 bg-muted border border-border rounded-full flex items-center justify-center font-semibold text-sm">
                3
              </div>
              <span>Results</span>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-8 shadow-sm border border-border mb-6"
        >
          <h1 className="text-2xl font-bold mb-6">Upload Chest X-ray</h1>

          <AnimatePresence mode="wait">
            {!preview ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                    isDragActive 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary hover:bg-muted/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <motion.div
                    animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                    className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  >
                    <UploadIcon className="w-8 h-8 text-primary" />
                  </motion.div>
                  <p className="text-lg font-medium mb-2">
                    {isDragActive ? 'Drop your X-ray here' : 'Drag & Drop X-ray Image Here'}
                  </p>
                  <p className="text-muted-foreground text-sm mb-4">
                    Supported formats: DICOM, PNG, JPG
                  </p>
                  <button type="button" className="btn-primary px-6 py-2 rounded-lg text-sm">
                    Browse Files
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative"
              >
                <div className="relative rounded-xl overflow-hidden bg-muted">
                  <img 
                    src={preview} 
                    alt="X-ray preview" 
                    className="w-full max-h-96 object-contain mx-auto"
                  />
                  <button
                    onClick={clearFile}
                    className="absolute top-4 right-4 p-2 bg-card/90 backdrop-blur-sm rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <FileImage className="w-10 h-10 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">{fileName}</p>
                    <p className="text-sm text-muted-foreground">Ready for analysis</p>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Image Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-6"
        >
          <h2 className="text-lg font-semibold mb-4">Image Guidelines</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {guidelines.map((item, index) => (
                  <tr key={item.label} className={index !== guidelines.length - 1 ? 'border-b border-border' : ''}>
                    <td className="py-3 pr-4 font-medium text-muted-foreground w-32">{item.label}</td>
                    <td className="py-3">{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Acknowledgment & Submit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 shadow-sm border border-border"
        >
          <label className="flex items-start gap-4 cursor-pointer group mb-6">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={isAcknowledged}
                onChange={(e) => setIsAcknowledged(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                isAcknowledged ? 'bg-primary border-primary' : 'border-border group-hover:border-primary'
              }`}>
                {isAcknowledged && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
              </div>
            </div>
            <span className="text-sm leading-relaxed">
              I acknowledge that this AI analysis is for informational purposes only and is not 
              a substitute for professional medical advice or diagnosis.
            </span>
          </label>

          <motion.button
            onClick={handleAnalyze}
            disabled={!preview || !isAcknowledged || isLoading}
            whileHover={preview && isAcknowledged && !isLoading ? { scale: 1.02 } : {}}
            whileTap={preview && isAcknowledged && !isLoading ? { scale: 0.98 } : {}}
            className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
              preview && isAcknowledged && !isLoading
                ? 'btn-primary cursor-pointer'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing X-ray...
              </>
            ) : (
              'Analyze'
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Upload;
