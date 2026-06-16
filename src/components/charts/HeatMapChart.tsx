import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { ComponentConfig } from '@/types';

interface HeatMapChartProps {
  data: any;
  config: ComponentConfig;
}

export const HeatMapChart: React.FC<HeatMapChartProps> = ({ data, config }) => {
  const option = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        title: { text: config.title || '地图热力图', textStyle: { color: '#8899aa', fontSize: 14 } },
      };
    }

    const maxColor = config.maxColor || '#00F5FF';
    const minColor = config.minColor || '#0A1628';

    return {
      title: {
        text: config.title || '地图热力图',
        textStyle: { color: '#8899aa', fontSize: 14, fontWeight: 'normal' },
        left: 10,
        top: 5,
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `${params.name}<br/>数值: ${params.value ?? 0}`;
        },
      },
      visualMap: {
        min: 0,
        max: Math.max(...data.map((d: any) => d.value || 0)),
        left: 10,
        bottom: 10,
        text: ['高', '低'],
        textStyle: { color: '#8899aa', fontSize: 10 },
        calculable: true,
        inRange: {
          color: [minColor, maxColor],
        },
      },
      grid: { left: 60, right: 20, top: 50, bottom: 50 },
      xAxis: {
        type: 'category',
        data: data.map((d: any) => d.name),
        axisLine: { lineStyle: { color: '#1e3a5f' } },
        axisLabel: {
          color: '#8899aa',
          fontSize: 10,
          rotate: data.length > 8 ? 30 : 0,
        },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#1e3a5f' } },
        axisLabel: { color: '#8899aa', fontSize: 10 },
        splitLine: { lineStyle: { color: '#1e3a5f20' } },
      },
      series: [
        {
          type: 'bar',
          data: data.map((d: any) => ({
            name: d.name,
            value: d.value,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: maxColor },
                  { offset: 1, color: minColor },
                ],
              },
              borderRadius: [4, 4, 0, 0],
            },
          })),
          barWidth: '60%',
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowColor: maxColor + '60',
            },
          },
        },
      ],
    };
  }, [data, config]);

  return (
    <ReactECharts
      option={option}
      style={{ width: '100%', height: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
};
