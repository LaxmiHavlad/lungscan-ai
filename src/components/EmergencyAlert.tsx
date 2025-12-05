import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, Mail, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface EmergencyAlertProps {
  riskScore: number;
  confidence: number;
  patientId: string;
  onClose: () => void;
}

const EmergencyAlert: React.FC<EmergencyAlertProps> = ({ 
  riskScore, 
  confidence, 
  patientId,
  onClose 
}) => {
  const { toast } = useToast();
  const [doctorEmail, setDoctorEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendAlert = async () => {
    if (!doctorEmail || !doctorEmail.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    
    // Simulate sending (in production, this would call an API)
    await new Promise(r => setTimeout(r, 1500));
    
    toast({
      title: "Alert Sent",
      description: `Report summary sent to ${doctorEmail}`,
    });
    
    setIsSending(false);
    setDoctorEmail('');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card rounded-2xl max-w-md w-full shadow-2xl border-2 border-danger-red overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-danger-red text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <AlertTriangle className="w-8 h-8" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold">HIGH RISK DETECTED</h2>
                  <p className="text-sm opacity-90">Immediate Attention Required</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6 p-4 bg-danger-pink rounded-xl">
              <p className="text-sm text-foreground">
                This screening indicates a <strong>high probability ({riskScore}%)</strong> of 
                serious abnormality with <strong>{confidence}% confidence</strong>.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Patient ID: {patientId}
              </p>
            </div>

            <h3 className="font-semibold mb-3">Recommended Actions</h3>
            <ul className="space-y-2 mb-6">
              {[
                'Contact your physician immediately',
                'Schedule urgent follow-up imaging (CT scan)',
                'Do not delay seeking medical care'
              ].map((action, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs text-primary">✓</span>
                  </div>
                  {action}
                </li>
              ))}
            </ul>

            {/* Emergency Actions */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Emergency Contact Options</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => window.location.href = 'tel:911'}
                >
                  <Phone className="w-4 h-4" />
                  Call Doctor
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => toast({ title: "Feature", description: "SMS integration coming soon" })}
                >
                  <MessageCircle className="w-4 h-4" />
                  Send SMS
                </Button>
              </div>

              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Doctor's email address"
                  value={doctorEmail}
                  onChange={(e) => setDoctorEmail(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendAlert}
                  disabled={isSending}
                  className="bg-danger-red hover:bg-danger-red/90"
                >
                  <Mail className="w-4 h-4 mr-1" />
                  {isSending ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmergencyAlert;
