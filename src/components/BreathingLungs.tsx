import React from 'react';
import { motion } from 'framer-motion';

const BreathingLungs: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <motion.svg
        viewBox="0 0 400 350"
        className="w-full h-auto"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        {/* Background glow */}
        <defs>
          <radialGradient id="lungGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(221, 83%, 53%)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(221, 83%, 53%)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="lungGradientLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(221, 83%, 63%)" />
            <stop offset="50%" stopColor="hsl(221, 83%, 53%)" />
            <stop offset="100%" stopColor="hsl(221, 83%, 43%)" />
          </linearGradient>
          <linearGradient id="lungGradientRight" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(221, 83%, 63%)" />
            <stop offset="50%" stopColor="hsl(221, 83%, 53%)" />
            <stop offset="100%" stopColor="hsl(221, 83%, 43%)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background circle glow */}
        <circle cx="200" cy="175" r="150" fill="url(#lungGlow)" />

        {/* Trachea */}
        <motion.path
          d="M200 30 L200 90 Q200 110 180 120 Q160 130 160 150
             M200 90 Q200 110 220 120 Q240 130 240 150"
          fill="none"
          stroke="hsl(221, 83%, 53%)"
          strokeWidth="8"
          strokeLinecap="round"
          filter="url(#glow)"
          animate={{
            strokeWidth: [8, 9, 8],
          }}
          transition={{
            duration: 4,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />

        {/* Left Lung */}
        <motion.path
          d="M160 150 
             Q140 150 120 170
             Q80 210 70 260
             Q65 290 80 310
             Q100 340 140 340
             Q170 340 185 320
             Q195 300 195 280
             Q195 260 190 240
             Q185 200 170 170
             Q165 155 160 150"
          fill="url(#lungGradientLeft)"
          opacity="0.9"
          filter="url(#glow)"
          animate={{
            d: [
              "M160 150 Q140 150 120 170 Q80 210 70 260 Q65 290 80 310 Q100 340 140 340 Q170 340 185 320 Q195 300 195 280 Q195 260 190 240 Q185 200 170 170 Q165 155 160 150",
              "M160 150 Q135 148 115 168 Q72 208 62 260 Q55 292 75 315 Q98 345 142 345 Q175 345 192 322 Q205 298 205 275 Q205 252 198 232 Q190 195 172 168 Q165 153 160 150",
              "M160 150 Q140 150 120 170 Q80 210 70 260 Q65 290 80 310 Q100 340 140 340 Q170 340 185 320 Q195 300 195 280 Q195 260 190 240 Q185 200 170 170 Q165 155 160 150"
            ],
          }}
          transition={{
            duration: 4,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />

        {/* Left Lung bronchi details */}
        <motion.g
          stroke="hsl(221, 83%, 73%)"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
          animate={{ opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
        >
          <path d="M160 160 Q140 180 130 210" />
          <path d="M155 175 Q145 195 140 230" />
          <path d="M150 190 Q135 220 125 260" />
          <path d="M145 210 Q130 250 140 290" />
          <path d="M130 220 Q110 260 115 300" />
        </motion.g>

        {/* Right Lung */}
        <motion.path
          d="M240 150 
             Q260 150 280 170
             Q320 210 330 260
             Q335 290 320 310
             Q300 340 260 340
             Q230 340 215 320
             Q205 300 205 280
             Q205 260 210 240
             Q215 200 230 170
             Q235 155 240 150"
          fill="url(#lungGradientRight)"
          opacity="0.9"
          filter="url(#glow)"
          animate={{
            d: [
              "M240 150 Q260 150 280 170 Q320 210 330 260 Q335 290 320 310 Q300 340 260 340 Q230 340 215 320 Q205 300 205 280 Q205 260 210 240 Q215 200 230 170 Q235 155 240 150",
              "M240 150 Q265 148 285 168 Q328 208 338 260 Q345 292 325 315 Q302 345 258 345 Q225 345 208 322 Q195 298 195 275 Q195 252 202 232 Q210 195 228 168 Q235 153 240 150",
              "M240 150 Q260 150 280 170 Q320 210 330 260 Q335 290 320 310 Q300 340 260 340 Q230 340 215 320 Q205 300 205 280 Q205 260 210 240 Q215 200 230 170 Q235 155 240 150"
            ],
          }}
          transition={{
            duration: 4,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />

        {/* Right Lung bronchi details */}
        <motion.g
          stroke="hsl(221, 83%, 73%)"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
          animate={{ opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
        >
          <path d="M240 160 Q260 180 270 210" />
          <path d="M245 175 Q255 195 260 230" />
          <path d="M250 190 Q265 220 275 260" />
          <path d="M255 210 Q270 250 260 290" />
          <path d="M270 220 Q290 260 285 300" />
        </motion.g>

        {/* Highlight spots */}
        <motion.circle
          cx="110"
          cy="250"
          r="8"
          fill="hsl(221, 83%, 73%)"
          opacity="0.4"
          animate={{
            r: [8, 12, 8],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 4,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
        <motion.circle
          cx="290"
          cy="250"
          r="8"
          fill="hsl(221, 83%, 73%)"
          opacity="0.4"
          animate={{
            r: [8, 12, 8],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 4,
            ease: "easeInOut",
            repeat: Infinity,
            delay: 0.5,
          }}
        />
      </motion.svg>

      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/30"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${30 + Math.random() * 40}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              ease: "easeInOut",
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default BreathingLungs;
