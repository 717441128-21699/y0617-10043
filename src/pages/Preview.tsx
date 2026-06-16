import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import { storage } from '@/utils/storage';
import type { Dashboard } from '@/types';
import { ChartRenderer } from '@/components/charts/ChartRenderer';

export const Preview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      const d = storage.getDashboard(id);
      if (d) {
        setDashboard(d);
      } else {
        navigate('/');
      }
    }
  }, [id, navigate]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!dashboard) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        加载中...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-screen w-screen overflow-hidden relative"
      style={{ backgroundColor: dashboard.backgroundColor }}
    >
      <div className="absolute top-4 right-4 z-50 flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 rounded-lg backdrop-blur-sm transition-colors"
          title={isFullscreen ? '退出全屏' : '全屏'}
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
        <button
          onClick={() => navigate('/')}
          className="p-2 bg-slate-800/80 hover:bg-red-500/80 text-slate-200 rounded-lg backdrop-blur-sm transition-colors"
          title="退出演示"
        >
          <X size={20} />
        </button>
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at center, rgba(0, 245, 255, 0.05) 0%, transparent 70%)',
        }}
      >
        <div
          className="relative"
          style={{
            width: '100%',
            height: '100%',
            maxWidth: '100vw',
            maxHeight: '100vh',
          }}
        >
          <ScaleContainer width={dashboard.width} height={dashboard.height}>
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
          </ScaleContainer>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-500 opacity-0 hover:opacity-100 transition-opacity">
        按 ESC 退出全屏 · 点击右上角退出演示
      </div>
    </div>
  );
};

interface ScaleContainerProps {
  width: number;
  height: number;
  children: React.ReactNode;
}

const ScaleContainer: React.FC<ScaleContainerProps> = ({ width, height, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current?.parentElement) return;
      const parent = containerRef.current.parentElement;
      const scaleX = parent.clientWidth / width;
      const scaleY = parent.clientHeight / height;
      setScale(Math.min(scaleX, scaleY));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [width, height]);

  return (
    <div
      ref={containerRef}
      className="absolute top-1/2 left-1/2"
      style={{
        width,
        height,
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      {children}
    </div>
  );
};
