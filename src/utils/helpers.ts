import { v4 as uuidv4 } from 'uuid';
import type { DashboardComponent, ComponentType, ComponentMeta } from '@/types';

export const generateId = (): string => uuidv4();

export const componentMetas: ComponentMeta[] = [
  {
    type: 'line',
    name: '折线图',
    icon: 'TrendingUp',
    defaultWidth: 400,
    defaultHeight: 280,
    defaultConfig: {
      title: '折线图',
      colors: ['#00F5FF', '#7B61FF'],
      smooth: true,
    },
  },
  {
    type: 'bar',
    name: '柱状图',
    icon: 'BarChart3',
    defaultWidth: 400,
    defaultHeight: 280,
    defaultConfig: {
      title: '柱状图',
      colors: ['#00F5FF', '#7B61FF'],
    },
  },
  {
    type: 'pie',
    name: '饼图',
    icon: 'PieChart',
    defaultWidth: 320,
    defaultHeight: 280,
    defaultConfig: {
      title: '饼图',
      colors: ['#00F5FF', '#7B61FF', '#FF6B6B', '#4ECDC4', '#FFE66D'],
      roseType: false,
    },
  },
  {
    type: 'number',
    name: '数字翻牌器',
    icon: 'Hash',
    defaultWidth: 280,
    defaultHeight: 140,
    defaultConfig: {
      title: '总数据量',
      suffix: '',
      prefix: '',
      decimals: 0,
      color: '#00F5FF',
    },
  },
  {
    type: 'heatmap',
    name: '地图热力图',
    icon: 'Map',
    defaultWidth: 500,
    defaultHeight: 360,
    defaultConfig: {
      title: '区域热力图',
      minColor: '#0A1628',
      maxColor: '#00F5FF',
    },
  },
];

export const getComponentMeta = (type: ComponentType): ComponentMeta | undefined => {
  return componentMetas.find((meta) => meta.type === type);
};

export const createDefaultComponent = (
  type: ComponentType,
  x: number,
  y: number,
  zIndex: number
): DashboardComponent => {
  const meta = getComponentMeta(type);
  if (!meta) throw new Error(`Unknown component type: ${type}`);

  return {
    id: generateId(),
    type,
    x,
    y,
    width: meta.defaultWidth,
    height: meta.defaultHeight,
    zIndex,
    config: { ...meta.defaultConfig },
    dataSource: {
      url: '',
      method: 'GET',
      params: {},
      headers: {},
      refreshInterval: 0,
    },
  };
};

export const getDefaultDataSource = () => ({
  url: '',
  method: 'GET' as const,
  params: {},
  headers: {},
  refreshInterval: 0,
});

export const getMaxZIndex = (components: DashboardComponent[]): number => {
  if (components.length === 0) return 1;
  return Math.max(...components.map((c) => c.zIndex)) + 1;
};

export const fetchData = async (
  url: string,
  method: 'GET' | 'POST' = 'GET',
  params: Record<string, string> = {},
  headers: Record<string, string> = {}
): Promise<any> => {
  if (!url) return null;

  try {
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    let requestUrl = url;
    const body = method === 'POST' ? JSON.stringify(params) : undefined;

    if (method === 'GET' && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      requestUrl += `?${searchParams.toString()}`;
    }

    const response = await fetch(requestUrl, {
      method,
      headers: requestHeaders,
      body,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch data error:', error);
    return null;
  }
};

export const generateMockData = (type: ComponentType): any => {
  switch (type) {
    case 'line':
      return {
        xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
        series: [
          { name: '销售额', data: [820, 932, 901, 934, 1290, 1330, 1320] },
          { name: '访问量', data: [320, 432, 501, 634, 790, 830, 920] },
        ],
      };
    case 'bar':
      return {
        xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        series: [{ name: '销量', data: [120, 200, 150, 80, 70, 110, 130] }],
      };
    case 'pie':
      return [
        { name: '直接访问', value: 335 },
        { name: '邮件营销', value: 310 },
        { name: '联盟广告', value: 234 },
        { name: '视频广告', value: 135 },
        { name: '搜索引擎', value: 1548 },
      ];
    case 'number':
      return { value: Math.floor(Math.random() * 100000) };
    case 'heatmap':
      const provinces = ['北京', '上海', '广东', '江苏', '浙江', '山东', '河南', '四川', '湖北', '湖南'];
      return provinces.map((name) => ({
        name,
        value: Math.floor(Math.random() * 1000),
      }));
    default:
      return null;
  }
};
