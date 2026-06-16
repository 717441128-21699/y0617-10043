import React from 'react';
import { TrendingUp, BarChart3, PieChart, Hash, Map } from 'lucide-react';
import { componentMetas } from '@/utils/helpers';
import type { ComponentType } from '@/types';

const iconMap: Record<string, React.ReactNode> = {
  TrendingUp: <TrendingUp size={24} />,
  BarChart3: <BarChart3 size={24} />,
  PieChart: <PieChart size={24} />,
  Hash: <Hash size={24} />,
  Map: <Map size={24} />,
};

export const ComponentPanel: React.FC = () => {
  const handleDragStart = (e: React.DragEvent, type: ComponentType) => {
    e.dataTransfer.setData('componentType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="w-60 h-full bg-slate-900/90 border-r border-slate-700/50 flex flex-col">
      <div className="px-4 py-3 border-b border-slate-700/50">
        <h2 className="text-sm font-semibold text-slate-200 tracking-wider">组件库</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {componentMetas.map((meta) => (
          <div
            key={meta.type}
            draggable
            onDragStart={(e) => handleDragStart(e, meta.type)}
            className="group cursor-grab active:cursor-grabbing bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 hover:border-cyan-500/50 hover:bg-slate-800 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-cyan-400 group-hover:text-cyan-300 group-hover:scale-110 transition-all">
                {iconMap[meta.icon]}
              </div>
              <div>
                <div className="text-sm font-medium text-slate-200">{meta.name}</div>
                <div className="text-xs text-slate-500">
                  {meta.defaultWidth} × {meta.defaultHeight}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-3 py-2 border-t border-slate-700/50">
        <p className="text-xs text-slate-500 text-center">拖拽组件到画布</p>
      </div>
    </div>
  );
};
