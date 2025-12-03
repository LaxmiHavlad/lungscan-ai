import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Target, 
  Zap, 
  Shield, 
  FileUp, 
  Cpu, 
  FileText, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BreathingLungs from '@/components/BreathingLungs';

const Landing: React.FC = () => {
  const features = [
    {
      icon: Target,
      title: 'High-Accuracy Detection',
      description: 'Advanced AI models trained on millions of chest X-rays deliver exceptional accuracy in identifying suspicious nodules and masses.',
    },
    {
      icon: Zap,
      title: 'Rapid, Actionable Results',
      description: 'Get comprehensive analysis in seconds, not hours. Instant risk assessment with detailed clinical recommendations.',
    },
    {
      icon: Shield,
      title: 'Secure & HIPAA Compliant',
      description: 'Enterprise-grade security with end-to-end encryption. Your patient data is protected at every step.',
    },
  ];

  const steps = [
    {
      icon: FileUp,
      title: 'Upload Image',
      description: 'Simply upload a chest X-ray in DICOM, PNG, or JPG format. Our system accepts standard medical imaging formats.',
    },
    {
      icon: Cpu,
      title: 'AI Analyzes',
      description: 'Our deep learning model processes the image, identifying potential nodules and generating a Grad-CAM heatmap.',
    },
    {
      icon: FileText,
      title: 'Receive Report',
      description: 'Get a detailed report with risk assessment, findings, and clinical recommendations for follow-up.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Warning Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-16 left-0 right-0 z-40 bg-alert-yellow-light border-b border-alert-yellow"
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <span>
            This tool is for investigational use only. Not for primary diagnosis.{' '}
            <Link to="/disclaimer" className="font-semibold underline hover:text-primary">
              Read Full Disclaimer
            </Link>
          </span>
        </div>
      </motion.div>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                AI-Powered Early{' '}
                <span className="text-gradient">Lung Cancer Screening</span>{' '}
                for Medical Professionals
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                Leverage cutting-edge artificial intelligence to analyze chest X-rays and detect 
                potential malignancies earlier. Enhance your diagnostic workflow with instant, 
                detailed reports.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/disclaimer">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2"
                  >
                    Start Analysis
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary px-8 py-4 rounded-xl text-lg font-semibold"
                >
                  Request a Demo
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-medical-blue/10 rounded-3xl blur-3xl" />
              <BreathingLungs />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Key Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Purpose-built for healthcare professionals, our platform combines cutting-edge AI 
              with clinical best practices.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-medical bg-card"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to get AI-powered insights on chest X-rays.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <step.icon className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-cream-dark rounded-full flex items-center justify-center font-bold text-primary border-2 border-primary">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Critical Disclaimer */}
      <section className="py-16 bg-alert-yellow-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-card rounded-2xl p-8 shadow-lg border-l-4 border-alert-yellow"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-alert-yellow/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Critical Disclaimer</h3>
                <p className="text-muted-foreground mb-4">
                  LungScan AI is an investigational tool designed to assist healthcare professionals. 
                  It is NOT intended to replace clinical judgment, professional medical advice, or diagnosis 
                  by a qualified radiologist or physician.
                </p>
                <p className="text-sm text-muted-foreground">
                  All AI-generated results must be verified by licensed medical professionals before 
                  any clinical decisions are made. The tool should be used as a supplementary aid 
                  within the context of a comprehensive diagnostic workflow.
                </p>
                <Link to="/disclaimer" className="inline-block mt-4 text-primary font-semibold hover:underline">
                  Read Full Medical Disclaimer →
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Transform Your Diagnostic Workflow?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Join healthcare professionals who are using AI to detect lung cancer earlier 
              and improve patient outcomes.
            </p>
            <Link to="/disclaimer">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-card text-primary px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Get Started Now
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
