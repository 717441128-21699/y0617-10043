import React, { useMemo, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import type { ComponentConfig } from '@/types';
import { chinaMapGeoJSON } from '@/utils/chinaMap';

interface HeatMapChartProps {
  data: any;
  config: ComponentConfig;
}

export const HeatMapChart: React.FC<HeatMapChartProps> = ({ data, config }) => {
  const chartRef = useRef<ReactECharts>(null);
  const mapRegistered = useRef(false);

  useEffect(() => {
    if (!mapRegistered.current) {
      echarts.registerMap('china', chinaMapGeoJSON as any);
      mapRegistered.current = true;
    }
  }, []);

  const option = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        title: {
          text: config.title || '地图热力图',
          textStyle: { color: '#8899aa', fontSize: 14, fontWeight: 'normal' },
          left: 10,
          top: 5,
        },
      };
    }

    const maxColor = config.maxColor || '#00F5FF';
    const minColor = config.minColor || '#0A1628';
    const maxValue = Math.max(...data.map((d: any) => d.value || 0));
    const minValue = Math.min(...data.map((d: any) => d.value || 0));

    const mapData = data.map((item: any) => ({
      name: item.name,
      value: item.value,
    }));

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
          if (params.value === undefined || params.value === null) {
            return `${params.name}<br/>暂无数据`;
          }
          return `${params.name}<br/>热度值: ${params.value}`;
        },
      },
      visualMap: {
        min: minValue,
        max: maxValue,
        left: 10,
        bottom: 10,
        text: ['高', '低'],
        textStyle: { color: '#8899aa', fontSize: 10 },
        calculable: true,
        inRange: {
          color: [minColor, '#1e3a5f', '#2d5a87', maxColor],
        },
        itemWidth: 12,
        itemHeight: 80,
      },
      geo: {
        map: 'china',
        roam: false,
        zoom: 1.2,
        label: {
          show: true,
          fontSize: 9,
          color: '#aabbcc',
        },
        itemStyle: {
          areaColor: '#0f172a',
          borderColor: '#1e3a5f',
          borderWidth: 1,
        },
        emphasis: {
          label: {
            show: true,
            color: '#fff',
            fontSize: 11,
          },
          itemStyle: {
            areaColor: '#00F5FF30',
            borderColor: '#00F5FF',
            borderWidth: 2,
          },
        },
        select: {
          disabled: true,
        },
      },
      series: [
        {
          name: '热度',
          type: 'map',
          map: 'china',
          geoIndex: 0,
          data: mapData,
        },
      ],
    };
  }, [data, config]);

  return (
    <div className="w-full h-full relative">
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ width: '100%', height: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
      <div className="absolute bottom-1 right-2 text-xs text-slate-500">
        {data?.length || 0} 个地区
      </div>
    </div>
  );
};
