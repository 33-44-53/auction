import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

export default function AnimatedCounter({ value, duration = 2, suffix = '', prefix = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    // Extract numeric value
    const numericValue = typeof value === 'string' 
      ? parseFloat(value.replace(/[^0-9.]/g, ''))
      : value;

    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = easeOutQuart * numericValue;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isInView, value, duration]);

  const formatValue = (val) => {
    if (typeof value === 'string' && value.includes('%')) {
      return Math.round(val);
    }
    if (typeof value === 'string' && value.includes('M')) {
      return (val / 1000000).toFixed(1);
    }
    if (typeof value === 'string' && value.includes('K')) {
      return (val / 1000).toFixed(1);
    }
    if (typeof value === 'string' && value.includes('+')) {
      return Math.round(val);
    }
    if (typeof value === 'string' && value.includes(',')) {
      return Math.round(val).toLocaleString();
    }
    return Math.round(val);
  };

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      {prefix}{formatValue(displayValue)}{suffix}
    </motion.span>
  );
}
