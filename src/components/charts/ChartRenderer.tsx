import React from 'react';
import { LineChart } from './LineChart';
import { BarChart } from './BarChart';
import { PieChart } from './PieChart';
import { NumberCard } from './NumberCard';
import { HeatMapChart } from './HeatMapChart';
import type { DashboardComponent } from '@/types';
import { useDataSource } from '@/hooks/useDataSource';

interface ChartRendererProps {
  component: DashboardComponent;
  isPreview?: boolean;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({ component, isPreview = true }) => {
  const { data, loading } = useDataSource(component.dataSource, component.type, isPreview);

  const renderChart = () => {
    switch (component.type) {
      case 'line':
        return <LineChart data={data} config={component.config} />;
      case 'bar':
        return <BarChart data={data} config={component.config} />;
      case 'pie':
        return <PieChart data={data} config={component.config} />;
      case 'number':
        return <NumberCard data={data} config={component.config} />;
      case 'heatmap':
        return <HeatMapChart data={data} config={component.config} />;
      default:
        return <div className="w-full h-full flex items-center justify-center text-slate-500">未知组件类型</div>;
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-10">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {renderChart()}
    </div>
  );
};
