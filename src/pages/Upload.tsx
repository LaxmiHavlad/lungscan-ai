import React, { useCallback, useState, useRef } from 'react';
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
  Activity,
  Camera,
  Sparkles,
  Zap,
  AlertCircle
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { analyzeXray, generateHeatmapFromRegions, preprocessImage, validateImageFile } from '@/utils/xrayAnalysis';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    hasAcceptedTerms, 
    setUploadedImage, 
    setUploadedFile,
    setAnalysisResult,
    setHeatmapImage,
    setIsAnalyzing,
    analysisMode,
    setAnalysisMode,
    setValidationError,
    validationError,
    addToHealthPassport
  } = useAppContext();

  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [enhanceImage, setEnhanceImage] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Redirect if terms not accepted
  React.useEffect(() => {
    if (!hasAcceptedTerms) {
      navigate('/disclaimer');
    }
  }, [hasAcceptedTerms, navigate]);

  const processFile = async (file: File) => {
    // Validate file first
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid file');
      toast({
        title: "Invalid File",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    setValidationError(null);
    setFileName(file.name);
    setUploadedFile(file);
    
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      setUploadedImage(result);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/dicom': ['.dcm', '.dicom'],
    },
    maxFiles: 1,
  });

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const clearFile = () => {
    setPreview(null);
    setFileName('');
    setUploadedFile(null);
    setUploadedImage(null);
    setValidationError(null);
  };

  const handleAnalyze = async () => {
    if (!preview || !isAcknowledged) return;

    setIsLoading(true);
    setIsAnalyzing(true);
    setValidationError(null);

    try {
      // Step 1: Preprocess image
      setLoadingStep('Preprocessing image...');
      let imageToAnalyze = preview;
      
      // Optional enhancement
      if (enhanceImage) {
        setLoadingStep('Enhancing image quality...');
        // The preprocessing includes contrast enhancement
        const file = await fetch(preview).then(r => r.blob()).then(b => new File([b], 'xray.jpg', { type: 'image/jpeg' }));
        imageToAnalyze = await preprocessImage(file);
      }

      // Step 2: Validate and analyze
      setLoadingStep('Validating X-ray image...');
      await new Promise(r => setTimeout(r, 500)); // Brief pause for UX
      
      setLoadingStep('Analyzing with AI...');
      const result = await analyzeXray(imageToAnalyze, {
        mode: analysisMode
      });
      
      setAnalysisResult(result);

      // Step 3: Generate heatmap
      setLoadingStep('Generating heatmap visualization...');
      const img = new Image();
      img.onload = () => {
        const heatmap = generateHeatmapFromRegions(img, result.heatmapRegions);
        setHeatmapImage(heatmap);
        
        // Add to health passport
        addToHealthPassport({
          date: result.analysisTimestamp,
          riskScore: result.riskScore,
          classification: result.classification,
          findings: result.findings,
          imagePreview: preview.slice(0, 500) // Store small preview
        });
        
        setIsLoading(false);
        setIsAnalyzing(false);
        navigate('/results');
      };
      img.onerror = () => {
        // Fallback - use original image
        setHeatmapImage(preview);
        setIsLoading(false);
        setIsAnalyzing(false);
        navigate('/results');
      };
      img.src = preview;

    } catch (error) {
      console.error('Analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      
      // Check if it's a validation error
      if (errorMessage.includes('not appear to be a chest X-ray') || errorMessage.includes('invalid_image')) {
        setValidationError('⚠️ Invalid Image Detected\n\nThis does not appear to be a chest X-ray. Please upload a clear chest X-ray image.\n\nAccepted: Frontal chest X-ray (PA or AP view)\nRejected: Text documents, photos, non-medical images');
      } else {
        toast({
          title: "Analysis Failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
      
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  };

  const guidelines = [
    { label: 'Resolution', value: 'High-resolution images recommended (1000+ pixels)' },
    { label: 'Anonymization', value: 'Ensure patient data is anonymized before upload' },
    { label: 'View', value: 'Clear, unobstructed frontal (AP/PA) chest X-ray views' },
    { label: 'Format', value: 'JPEG, PNG, or DICOM files accepted' },
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

        {/* Validation Error Alert */}
        <AnimatePresence>
          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-danger-pink border border-danger-red/30 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-danger-red flex-shrink-0 mt-0.5" />
                <div>
                  <pre className="text-sm whitespace-pre-wrap font-sans text-foreground">{validationError}</pre>
                  <button 
                    onClick={clearFile}
                    className="mt-3 text-sm text-primary hover:underline"
                  >
                    Upload a different image
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-8 shadow-sm border border-border mb-6"
        >
          <h1 className="text-2xl font-bold mb-6">Upload Chest X-ray</h1>

          {/* Hidden camera input */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraChange}
            className="hidden"
          />

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
                  <div className="flex items-center justify-center gap-3">
                    <button type="button" className="btn-primary px-6 py-2 rounded-lg text-sm">
                      Browse Files
                    </button>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCameraCapture();
                      }}
                      className="btn-secondary px-6 py-2 rounded-lg text-sm flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Capture Photo
                    </button>
                  </div>
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

        {/* Analysis Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Analysis Options
          </h2>
          
          <div className="space-y-4">
            {/* Image Enhancement Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-warning" />
                <div>
                  <p className="font-medium">Enhance Image Quality</p>
                  <p className="text-sm text-muted-foreground">Improve contrast and sharpness before analysis</p>
                </div>
              </div>
              <Switch 
                checked={enhanceImage} 
                onCheckedChange={setEnhanceImage}
              />
            </div>

            {/* Multi-Disease Mode Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Advanced Multi-Disease Detection</p>
                  <p className="text-sm text-muted-foreground">Check for pneumonia, TB, COPD, and more</p>
                </div>
              </div>
              <Switch 
                checked={analysisMode === 'multi-disease'} 
                onCheckedChange={(checked) => setAnalysisMode(checked ? 'multi-disease' : 'standard')}
              />
            </div>
          </div>
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
            disabled={!preview || !isAcknowledged || isLoading || !!validationError}
            whileHover={preview && isAcknowledged && !isLoading && !validationError ? { scale: 1.02 } : {}}
            whileTap={preview && isAcknowledged && !isLoading && !validationError ? { scale: 0.98 } : {}}
            className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
              preview && isAcknowledged && !isLoading && !validationError
                ? 'btn-primary cursor-pointer'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {loadingStep || 'Analyzing X-ray...'}
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
