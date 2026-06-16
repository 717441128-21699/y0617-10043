import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { ComponentConfig } from '@/types';

interface LineChartProps {
  data: any;
  config: ComponentConfig;
}

export const LineChart: React.FC<LineChartProps> = ({ data, config }) => {
  const option = useMemo(() => {
    if (!data) {
      return {
        title: { text: config.title || '折线图', textStyle: { color: '#8899aa', fontSize: 14 } },
      };
    }

    const colors = config.colors || ['#00F5FF', '#7B61FF'];
    const series = (data.series || []).map((item: any, index: number) => ({
      name: item.name,
      type: 'line',
      data: item.data,
      smooth: config.smooth !== false,
      lineStyle: { color: colors[index % colors.length], width: 2 },
      itemStyle: { color: colors[index % colors.length] },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: colors[index % colors.length] + '40' },
            { offset: 1, color: colors[index % colors.length] + '00' },
          ],
        },
      },
    }));

    return {
      title: {
        text: config.title || '折线图',
        textStyle: { color: '#8899aa', fontSize: 14, fontWeight: 'normal' },
        left: 10,
        top: 5,
      },
      tooltip: { trigger: 'axis' },
      legend: {
        data: (data.series || []).map((s: any) => s.name),
        textStyle: { color: '#8899aa' },
        top: 5,
        right: 10,
      },
      grid: { left: 50, right: 20, top: 50, bottom: 30 },
      xAxis: {
        type: 'category',
        data: data.xAxis || [],
        axisLine: { lineStyle: { color: '#1e3a5f' } },
        axisLabel: { color: '#8899aa', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#1e3a5f' } },
        axisLabel: { color: '#8899aa', fontSize: 11 },
        splitLine: { lineStyle: { color: '#1e3a5f20' } },
      },
      series,
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
