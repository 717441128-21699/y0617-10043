import React, { useState } from 'react';
import { Settings, Database, Layers, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import type { AlignType, ZIndexAction } from '@/types';

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  children,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-700/50">
      <button
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <span className="text-cyan-400">{icon}</span>
          <span className="text-sm font-medium text-slate-200">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown size={16} className="text-slate-500" />
        ) : (
          <ChevronRight size={16} className="text-slate-500" />
        )}
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
};

export const ConfigPanel: React.FC = () => {
  const { selectedIds, dashboard, updateComponentConfig, updateComponentDataSource, removeComponent, alignComponents, adjustZIndex, updateComponent, pushHistory, flushPending } =
    useDashboardStore();
  const [localWidth, setLocalWidth] = useState<string>('');
  const [localHeight, setLocalHeight] = useState<string>('');
  const [localTitle, setLocalTitle] = useState<string>('');
  const [localUrl, setLocalUrl] = useState<string>('');
  const [localParams, setLocalParams] = useState<string>('');
  const [localRefreshInterval, setLocalRefreshInterval] = useState<string>('');

  const selectedComponent =
    selectedIds.length === 1
      ? dashboard.components.find((c) => c.id === selectedIds[0])
      : null;

  React.useEffect(() => {
    if (selectedComponent) {
      setLocalWidth(String(selectedComponent.width));
      setLocalHeight(String(selectedComponent.height));
      setLocalTitle(selectedComponent.config.title || '');
      setLocalUrl(selectedComponent.dataSource.url || '');
      setLocalParams(JSON.stringify(selectedComponent.dataSource.params || {}, null, 2));
      setLocalRefreshInterval(String(selectedComponent.dataSource.refreshInterval || 0));
    }
  }, [selectedComponent?.id]);

  const commitAll = React.useCallback(() => {
    if (!selectedComponent) return;

    let changed = false;

    if (localTitle !== selectedComponent.config.title) {
      changed = true;
    }

    const w = Number(localWidth);
    if (!isNaN(w) && w > 0 && w !== selectedComponent.width) {
      changed = true;
    }

    const h = Number(localHeight);
    if (!isNaN(h) && h > 0 && h !== selectedComponent.height) {
      changed = true;
    }

    if (localUrl !== selectedComponent.dataSource.url) {
      changed = true;
    }

    const ri = Number(localRefreshInterval);
    if (!isNaN(ri) && ri >= 0 && ri !== selectedComponent.dataSource.refreshInterval) {
      changed = true;
    }

    let paramsChanged = false;
    try {
      const params = JSON.parse(localParams || '{}');
      const oldParamsStr = JSON.stringify(selectedComponent.dataSource.params || {});
      const newParamsStr = JSON.stringify(params);
      if (oldParamsStr !== newParamsStr) {
        paramsChanged = true;
        changed = true;
      }
    } catch {}

    if (changed) {
      pushHistory();

      if (localTitle !== selectedComponent.config.title) {
        updateComponentConfig(selectedComponent.id, { title: localTitle });
      }

      const w2 = Number(localWidth);
      if (!isNaN(w2) && w2 > 0 && w2 !== selectedComponent.width) {
        updateComponent(selectedComponent.id, { width: w2 });
      }

      const h2 = Number(localHeight);
      if (!isNaN(h2) && h2 > 0 && h2 !== selectedComponent.height) {
        updateComponent(selectedComponent.id, { height: h2 });
      }

      if (localUrl !== selectedComponent.dataSource.url) {
        updateComponentDataSource(selectedComponent.id, { url: localUrl });
      }

      const ri2 = Number(localRefreshInterval);
      if (!isNaN(ri2) && ri2 >= 0 && ri2 !== selectedComponent.dataSource.refreshInterval) {
        updateComponentDataSource(selectedComponent.id, { refreshInterval: ri2 });
      }

      if (paramsChanged) {
        try {
          const params = JSON.parse(localParams || '{}');
          updateComponentDataSource(selectedComponent.id, { params });
        } catch {}
      }
    }
  }, [selectedComponent, localTitle, localWidth, localHeight, localUrl, localRefreshInterval, localParams, updateComponentConfig, updateComponent, updateComponentDataSource, pushHistory]);

  React.useEffect(() => {
    if (flushPending > 0) {
      commitAll();
    }
  }, [flushPending, commitAll]);

  if (selectedIds.length === 0) {
    return (
      <div className="w-72 h-full bg-slate-900/90 border-l border-slate-700/50 flex items-center justify-center">
        <div className="text-center text-slate-500">
          <Settings size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">选择组件以配置属性</p>
        </div>
      </div>
    );
  }

  const handleConfigChange = (key: string, value: any) => {
    if (!selectedComponent) return;
    updateComponentConfig(selectedComponent.id, { [key]: value });
  };

  const handleDataSourceChange = (key: string, value: any) => {
    if (!selectedComponent) return;
    updateComponentDataSource(selectedComponent.id, { [key]: value });
  };

  const handleAlign = (type: AlignType) => {
    alignComponents(selectedIds, type);
  };

  const handleZIndex = (action: ZIndexAction) => {
    if (selectedComponent) {
      adjustZIndex(selectedComponent.id, action);
    }
  };

  const handleDelete = () => {
    if (selectedComponent && confirm('确定要删除此组件吗？')) {
      removeComponent(selectedComponent.id);
    }
  };

  return (
    <div className="w-72 h-full bg-slate-900/90 border-l border-slate-700/50 flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50">
        <h2 className="text-sm font-semibold text-slate-200">
          {selectedIds.length > 1 ? `已选择 ${selectedIds.length} 个组件` : selectedComponent?.config.title || '组件配置'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {selectedIds.length > 1 ? (
          <>
            <CollapsibleSection title="对齐方式" icon={<Settings size={16} />}>
              <div className="grid grid-cols-3 gap-2">
                {(['left', 'center', 'right'] as AlignType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleAlign(type)}
                    className="px-2 py-2 text-xs bg-slate-800 hover:bg-cyan-600/20 text-slate-300 hover:text-cyan-400 rounded border border-slate-700 hover:border-cyan-500/50 transition-all"
                  >
                    {type === 'left' ? '左对齐' : type === 'center' ? '水平居中' : '右对齐'}
                  </button>
                ))}
                {(['top', 'middle', 'bottom'] as AlignType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleAlign(type)}
                    className="px-2 py-2 text-xs bg-slate-800 hover:bg-cyan-600/20 text-slate-300 hover:text-cyan-400 rounded border border-slate-700 hover:border-cyan-500/50 transition-all"
                  >
                    {type === 'top' ? '顶部对齐' : type === 'middle' ? '垂直居中' : '底部对齐'}
                  </button>
                ))}
              </div>
            </CollapsibleSection>
          </>
        ) : (
          <>
            <CollapsibleSection title="基础设置" icon={<Settings size={16} />}>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">标题</label>
                  <input
                    type="text"
                    value={localTitle}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    onBlur={() => {
                      if (!selectedComponent) return;
                      if (localTitle !== selectedComponent.config.title) {
                        pushHistory();
                        updateComponentConfig(selectedComponent.id, { title: localTitle });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">宽度</label>
                    <input
                      type="number"
                      value={localWidth}
                      onChange={(e) => setLocalWidth(e.target.value)}
                      onBlur={() => {
                        if (!selectedComponent) return;
                        const w = Number(localWidth);
                        if (!isNaN(w) && w > 0) {
                          pushHistory();
                          updateComponent(selectedComponent.id, { width: w });
                        } else {
                          setLocalWidth(String(selectedComponent.width));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                      min={100}
                      className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">高度</label>
                    <input
                      type="number"
                      value={localHeight}
                      onChange={(e) => setLocalHeight(e.target.value)}
                      onBlur={() => {
                        if (!selectedComponent) return;
                        const h = Number(localHeight);
                        if (!isNaN(h) && h > 0) {
                          pushHistory();
                          updateComponent(selectedComponent.id, { height: h });
                        } else {
                          setLocalHeight(String(selectedComponent.height));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                      min={60}
                      className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="数据源" icon={<Database size={16} />}>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">请求方式</label>
                  <select
                    value={selectedComponent?.dataSource.method || 'GET'}
                    onChange={(e) => {
                      if (selectedComponent) {
                        pushHistory();
                        updateComponentDataSource(selectedComponent.id, { method: e.target.value as 'GET' | 'POST' });
                      }
                    }}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">API 地址</label>
                  <input
                    type="text"
                    value={localUrl}
                    onChange={(e) => setLocalUrl(e.target.value)}
                    onBlur={() => {
                      if (!selectedComponent) return;
                      if (localUrl !== selectedComponent.dataSource.url) {
                        pushHistory();
                        updateComponentDataSource(selectedComponent.id, { url: localUrl });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    placeholder="https://api.example.com/data"
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">刷新间隔（秒）</label>
                  <input
                    type="number"
                    value={localRefreshInterval}
                    onChange={(e) => setLocalRefreshInterval(e.target.value)}
                    onBlur={() => {
                      if (!selectedComponent) return;
                      const ri = Number(localRefreshInterval);
                      if (!isNaN(ri) && ri >= 0) {
                        if (ri !== selectedComponent.dataSource.refreshInterval) {
                          pushHistory();
                          updateComponentDataSource(selectedComponent.id, { refreshInterval: ri });
                        }
                      } else {
                        setLocalRefreshInterval(String(selectedComponent.dataSource.refreshInterval || 0));
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    min={0}
                    placeholder="0 表示不刷新"
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">设置为0表示不自动刷新</p>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">请求参数 (JSON)</label>
                  <textarea
                    value={localParams}
                    onChange={(e) => setLocalParams(e.target.value)}
                    onBlur={() => {
                      if (!selectedComponent) return;
                      try {
                        const params = JSON.parse(localParams || '{}');
                        const oldParamsStr = JSON.stringify(selectedComponent.dataSource.params || {});
                        const newParamsStr = JSON.stringify(params);
                        if (oldParamsStr !== newParamsStr) {
                          pushHistory();
                          updateComponentDataSource(selectedComponent.id, { params });
                        }
                      } catch {
                        setLocalParams(JSON.stringify(selectedComponent.dataSource.params || {}, null, 2));
                      }
                    }}
                    rows={4}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="层叠顺序" icon={<Layers size={16} />}>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleZIndex('top')}
                  className="px-3 py-2 text-xs bg-slate-800 hover:bg-cyan-600/20 text-slate-300 hover:text-cyan-400 rounded border border-slate-700 hover:border-cyan-500/50 transition-all"
                >
                  置顶
                </button>
                <button
                  onClick={() => handleZIndex('bottom')}
                  className="px-3 py-2 text-xs bg-slate-800 hover:bg-cyan-600/20 text-slate-300 hover:text-cyan-400 rounded border border-slate-700 hover:border-cyan-500/50 transition-all"
                >
                  置底
                </button>
                <button
                  onClick={() => handleZIndex('up')}
                  className="px-3 py-2 text-xs bg-slate-800 hover:bg-cyan-600/20 text-slate-300 hover:text-cyan-400 rounded border border-slate-700 hover:border-cyan-500/50 transition-all"
                >
                  上移一层
                </button>
                <button
                  onClick={() => handleZIndex('down')}
                  className="px-3 py-2 text-xs bg-slate-800 hover:bg-cyan-600/20 text-slate-300 hover:text-cyan-400 rounded border border-slate-700 hover:border-cyan-500/50 transition-all"
                >
                  下移一层
                </button>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="删除组件" icon={<Trash2 size={16} />} defaultOpen={false}>
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded border border-red-500/30 hover:border-red-500/50 transition-all"
              >
                删除此组件
              </button>
            </CollapsibleSection>
          </>
        )}
      </div>
    </div>
  );
};
