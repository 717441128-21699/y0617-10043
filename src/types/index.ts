export type ComponentType = 'line' | 'bar' | 'pie' | 'number' | 'heatmap';

export interface DataSource {
  url: string;
  method: 'GET' | 'POST';
  params: Record<string, string>;
  headers: Record<string, string>;
  refreshInterval: number;
}

export interface ComponentConfig {
  title?: string;
  colors?: string[];
  [key: string]: any;
}

export interface DashboardComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  config: ComponentConfig;
  dataSource: DataSource;
}

export interface Dashboard {
  id: string;
  name: string;
  backgroundColor: string;
  width: number;
  height: number;
  components: DashboardComponent[];
  createdAt: number;
  updatedAt: number;
}

export interface ComponentMeta {
  type: ComponentType;
  name: string;
  icon: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultConfig: ComponentConfig;
}

export type AlignType = 'left' | 'right' | 'center' | 'top' | 'bottom' | 'middle';

export type ZIndexAction = 'up' | 'down' | 'top' | 'bottom';
