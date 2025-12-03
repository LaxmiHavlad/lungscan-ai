import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Info, 
  Target, 
  AlertTriangle, 
  User, 
  Shield, 
  Headphones,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

const Disclaimer: React.FC = () => {
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();
  const { setHasAcceptedTerms } = useAppContext();

  const handleAccept = () => {
    if (isChecked) {
      setHasAcceptedTerms(true);
      navigate('/upload');
    }
  };

  const sections = [
    {
      icon: Info,
      title: 'General Disclaimer',
      color: 'bg-primary/10 border-primary',
      iconColor: 'text-primary',
      content: `LungScan AI is an artificial intelligence-based screening tool designed to assist healthcare professionals in the early detection of potential lung abnormalities from chest X-ray images. This tool is intended for investigational and research purposes only.

The information provided by LungScan AI does not constitute medical advice, diagnosis, or treatment recommendations. Users should not rely solely on the output of this tool for making clinical decisions.`,
    },
    {
      icon: Target,
      title: 'Intended Use',
      color: 'bg-primary/10 border-primary',
      iconColor: 'text-primary',
      content: `This tool is intended exclusively for use by licensed healthcare professionals, including but not limited to radiologists, pulmonologists, oncologists, and general practitioners with appropriate training in medical imaging interpretation.

LungScan AI is designed to serve as a supplementary screening aid and should be used in conjunction with standard diagnostic protocols, clinical examination, patient history, and other imaging modalities.`,
    },
    {
      icon: AlertTriangle,
      title: 'Accuracy & Liability',
      color: 'bg-alert-yellow-light border-alert-yellow',
      iconColor: 'text-warning',
      isWarning: true,
      content: `IMPORTANT: While LungScan AI employs state-of-the-art machine learning algorithms trained on extensive datasets, no AI system can guarantee 100% accuracy. The tool may produce false positive or false negative results.

LungScan AI, its developers, affiliates, and partners shall not be held liable for any direct, indirect, incidental, special, or consequential damages arising from:
• Reliance on AI-generated results
• Misinterpretation of findings
• Delayed or missed diagnoses
• Any clinical decisions made based on the tool's output

Users assume all responsibility for the appropriate use of this tool and verification of results through established clinical protocols.`,
    },
    {
      icon: User,
      title: 'User Responsibilities',
      color: 'bg-primary/10 border-primary',
      iconColor: 'text-primary',
      content: `By using LungScan AI, you acknowledge and agree that:

• You are a qualified healthcare professional authorized to interpret medical imaging
• You will verify all AI-generated findings through appropriate clinical assessment
• You will not use this tool as the sole basis for diagnosis or treatment decisions
• You will ensure patient data is properly anonymized before upload
• You will comply with all applicable medical regulations, including HIPAA in the United States`,
    },
    {
      icon: Shield,
      title: 'Data Privacy',
      color: 'bg-primary/10 border-primary',
      iconColor: 'text-primary',
      content: `LungScan AI is committed to protecting patient privacy and data security:

• All uploaded images are processed using encrypted connections
• Patient data should be anonymized before upload
• Images are not stored permanently and are deleted after analysis
• We comply with HIPAA, GDPR, and other applicable data protection regulations
• No patient-identifiable information is collected or retained`,
    },
    {
      icon: Headphones,
      title: 'Contact & Support',
      color: 'bg-primary/10 border-primary',
      iconColor: 'text-primary',
      content: `For questions, concerns, or technical support regarding LungScan AI:

Email: support@lungscanai.com
Phone: 1-800-LUNGSCAN (1-800-586-4722)
Hours: Monday-Friday, 8:00 AM - 6:00 PM EST

For medical emergencies, please contact emergency services immediately. This tool is not intended for emergency diagnostic use.`,
    },
  ];

  return (
    <div className="min-h-screen bg-muted py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-primary rounded-lg">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">
              Lung<span className="text-primary">Scan</span> AI
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Medical Disclaimer & Terms of Use</h1>
          <p className="text-muted-foreground">
            Please read and accept the following terms before proceeding
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6 mb-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-card rounded-xl border-l-4 ${section.color} shadow-sm overflow-hidden`}
            >
              <div className={`p-6 ${section.isWarning ? 'bg-alert-yellow-light/50' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${section.isWarning ? 'bg-alert-yellow/20' : 'bg-primary/10'}`}>
                    <section.icon className={`w-5 h-5 ${section.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
                    <div className="text-muted-foreground text-sm whitespace-pre-line leading-relaxed">
                      {section.content}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Acceptance Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-xl p-6 shadow-lg border border-border"
        >
          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative mt-1">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-primary border-primary' : 'border-border group-hover:border-primary'}`}>
                {isChecked && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
              </div>
            </div>
            <span className="text-sm leading-relaxed">
              I have read, understood, and agree to the <strong>Medical Disclaimer</strong> and{' '}
              <strong>Terms of Use</strong>. I acknowledge that LungScan AI is an investigational 
              tool and that I am solely responsible for verifying all results through appropriate 
              clinical protocols before making any medical decisions.
            </span>
          </label>

          <motion.button
            onClick={handleAccept}
            disabled={!isChecked}
            whileHover={isChecked ? { scale: 1.02 } : {}}
            whileTap={isChecked ? { scale: 0.98 } : {}}
            className={`w-full mt-6 py-4 rounded-xl font-semibold text-lg transition-all ${
              isChecked 
                ? 'btn-primary cursor-pointer' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            Accept and Continue
          </motion.button>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By clicking "Accept and Continue", you agree to be bound by these terms.
        </p>
      </div>
    </div>
  );
};

export default Disclaimer;
