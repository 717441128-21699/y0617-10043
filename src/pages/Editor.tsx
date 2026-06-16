import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toolbar } from '@/components/panels/Toolbar';
import { ComponentPanel } from '@/components/panels/ComponentPanel';
import { ConfigPanel } from '@/components/panels/ConfigPanel';
import { Canvas } from '@/components/canvas/Canvas';
import { useDashboardStore } from '@/store/dashboardStore';

export const Editor: React.FC = () => {
  const navigate = useNavigate();
  const { undo, redo, dashboard } = useDashboardStore();

  const handlePreview = () => {
    useDashboardStore.getState().saveDashboard();
    navigate(`/preview/${dashboard.id}`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (e.key === 'y') {
          e.preventDefault();
          redo();
        } else if (e.key === 's') {
          e.preventDefault();
          useDashboardStore.getState().saveDashboard();
          alert('保存成功！');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      <Toolbar onPreview={handlePreview} />
      <div className="flex-1 flex overflow-hidden">
        <ComponentPanel />
        <div className="flex-1 overflow-hidden">
          <Canvas />
        </div>
        <ConfigPanel />
      </div>
    </div>
  );
};
