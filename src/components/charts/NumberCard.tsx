import React, { useState, useEffect, useRef } from 'react';
import type { ComponentConfig } from '@/types';

interface NumberCardProps {
  data: any;
  config: ComponentConfig;
}

export const NumberCard: React.FC<NumberCardProps> = ({ data, config }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  const value = data?.value ?? 0;
  const color = config.color || '#00F5FF';
  const prefix = config.prefix || '';
  const suffix = config.suffix || '';
  const decimals = config.decimals ?? 0;

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    const duration = 800;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * easeOut;
      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    prevValueRef.current = endValue;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value]);

  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center px-4">
      <div className="text-sm text-slate-400 mb-2 tracking-wider">{config.title || '数字指标'}</div>
      <div
        className="text-4xl md:text-5xl font-bold tracking-wider"
        style={{
          color: color,
          textShadow: `0 0 20px ${color}60, 0 0 40px ${color}30`,
          fontFamily: 'monospace',
        }}
      >
        {prefix}
        {formatNumber(displayValue)}
        {suffix}
      </div>
      <div
        className="w-full h-px mt-3"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
        }}
      />
    </div>
  );
};
