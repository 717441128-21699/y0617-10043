import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { ComponentConfig } from '@/types';

interface PieChartProps {
  data: any;
  config: ComponentConfig;
}

export const PieChart: React.FC<PieChartProps> = ({ data, config }) => {
  const option = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        title: { text: config.title || '饼图', textStyle: { color: '#8899aa', fontSize: 14 } },
      };
    }

    const colors = config.colors || ['#00F5FF', '#7B61FF', '#FF6B6B', '#4ECDC4', '#FFE66D'];

    return {
      title: {
        text: config.title || '饼图',
        textStyle: { color: '#8899aa', fontSize: 14, fontWeight: 'normal' },
        left: 10,
        top: 5,
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: { color: '#8899aa', fontSize: 11 },
        itemWidth: 10,
        itemHeight: 10,
      },
      color: colors,
      series: [
        {
          name: config.title,
          type: 'pie',
          radius: config.roseType ? ['30%', '70%'] : '65%',
          center: ['35%', '55%'],
          roseType: config.roseType ? 'angle' : undefined,
          data: data,
          label: {
            show: false,
          },
          labelLine: {
            show: false,
          },
          itemStyle: {
            borderRadius: 4,
            borderColor: '#0A1628',
            borderWidth: 2,
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
