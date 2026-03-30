import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function EnhancedCard({ children, className = '' }) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7.5deg', '-7.5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7.5deg', '7.5deg']);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      animate={{
        scale: isHovered ? 1.05 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      className={`relative ${className}`}
    >
      {/* Glow Effect */}
      <motion.div
        className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-600 rounded-3xl opacity-0 blur-xl"
        animate={{
          opacity: isHovered ? 0.3 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Original Card Content */}
      <div
        style={{
          transform: 'translateZ(20px)',
        }}
        className="relative"
      >
        {children}
      </div>
      
      {/* Shine Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/20 to-white/0 rounded-3xl pointer-events-none"
        style={{
          transform: `translateX(${mouseXSpring.get() * 50}px) translateY(${mouseYSpring.get() * 50}px)`,
          opacity: isHovered ? 1 : 0,
        }}
      />
    </motion.div>
  );
}
