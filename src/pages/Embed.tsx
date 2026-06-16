import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { storage } from '@/utils/storage';
import type { Dashboard } from '@/types';
import { ChartRenderer } from '@/components/charts/ChartRenderer';

export const Embed: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (id) {
      const d = storage.getDashboard(id);
      if (d) {
        setDashboard(d);
      }
    }
  }, [id]);

  useEffect(() => {
    if (!dashboard) return;

    const updateScale = () => {
      const scaleX = window.innerWidth / dashboard.width;
      const scaleY = window.innerHeight / dashboard.height;
      setScale(Math.min(scaleX, scaleY, 1));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [dashboard]);

  if (!dashboard) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        未找到该大屏方案
      </div>
    );
  }

  return (
    <div
      className="w-screen h-screen overflow-hidden"
      style={{ backgroundColor: dashboard.backgroundColor }}
    >
      <div
        className="absolute top-1/2 left-1/2"
        style={{
          width: dashboard.width,
          height: dashboard.height,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <div
          className="relative w-full h-full"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 245, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 245, 255, 0.03) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        >
          {dashboard.components.map((component) => (
            <div
              key={component.id}
              className="absolute"
              style={{
                left: component.x,
                top: component.y,
                width: component.width,
                height: component.height,
                zIndex: component.zIndex,
              }}
            >
              <ChartRenderer component={component} isPreview={true} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
