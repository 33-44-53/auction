import React from 'react';
import { motion } from 'framer-motion';

export default function EnhancedPrice({ children, isHighlighted = false, className = '' }) {
  return (
    <motion.div
      className={`relative inline-block ${className}`}
      animate={isHighlighted ? {
        scale: [1, 1.05, 1],
      } : {}}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Glow Effect for Highlighted Prices */}
      {isHighlighted && (
        <>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl blur-lg"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl blur-xl opacity-20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </>
      )}
      
      {/* Original Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Sparkle Effect */}
      {isHighlighted && (
        <motion.div
          className="absolute top-0 right-0 w-2 h-2 bg-yellow-300 rounded-full"
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
}
