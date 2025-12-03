import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Activity } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="p-2 bg-primary rounded-lg">
            <Activity className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">
            Lung<span className="text-primary">Scan</span> AI
          </span>
        </div>
        
        <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          The page you're looking for doesn't exist.
        </p>
        
        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 mx-auto"
          >
            <Home className="w-5 h-5" />
            Return to Home
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
