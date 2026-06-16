import React, { useState } from 'react';
import {
  Undo2,
  Redo2,
  Save,
  Play,
  FileCode,
  FolderOpen,
  Plus,
  Monitor,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Copy,
  Trash2,
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { storage } from '@/utils/storage';
import type { Dashboard, AlignType } from '@/types';

interface ToolbarProps {
  onPreview: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onPreview }) => {
  const {
    dashboard,
    selectedIds,
    history,
    undo,
    redo,
    saveDashboard,
    newDashboard,
    loadDashboard,
    alignComponents,
    removeComponents,
    duplicateComponents,
    updateDashboardConfig,
  } = useDashboardStore();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [dashboardName, setDashboardName] = useState(dashboard.name);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const handleSave = () => {
    setDashboardName(dashboard.name);
    setShowSaveModal(true);
  };

  const confirmSave = () => {
    updateDashboardConfig({ name: dashboardName });
    setTimeout(() => {
      saveDashboard();
      setShowSaveModal(false);
      alert('保存成功！');
    }, 0);
  };

  const handleLoad = () => {
    setDashboards(storage.getDashboards());
    setShowLoadModal(true);
  };

  const handleLoadDashboard = (id: string) => {
    loadDashboard(id);
    setShowLoadModal(false);
  };

  const handleDeleteDashboard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除此方案吗？')) {
      storage.deleteDashboard(id);
      setDashboards(storage.getDashboards());
    }
  };

  const handleNew = () => {
    if (confirm('创建新方案将丢失当前未保存的更改，确定继续吗？')) {
      newDashboard();
    }
  };

  const handleEmbed = () => {
    saveDashboard();
    setShowEmbedModal(true);
  };

  const embedCode = `<iframe src="${window.location.origin}/embed/${dashboard.id}" width="${dashboard.width}" height="${dashboard.height}" frameborder="0" allowfullscreen></iframe>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    alert('嵌入代码已复制到剪贴板！');
  };

  const handleAlign = (type: AlignType) => {
    alignComponents(selectedIds, type);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length > 0 && confirm(`确定删除选中的 ${selectedIds.length} 个组件吗？`)) {
      removeComponents(selectedIds);
    }
  };

  const handleCopy = () => {
    if (selectedIds.length === 0) return;
    duplicateComponents(selectedIds);
  };

  return (
    <>
      <div className="h-14 bg-slate-900/95 border-b border-slate-700/50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
            <Monitor className="text-cyan-400" size={20} />
            <span className="text-sm font-semibold text-slate-200">数据大屏搭建平台</span>
          </div>

          <div className="h-6 w-px bg-slate-700 mx-2" />

          <button
            onClick={handleNew}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
            title="新建方案"
          >
            <Plus size={14} />
            新建
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 rounded-md transition-colors border border-cyan-500/30"
            title="保存方案"
          >
            <Save size={14} />
            保存
          </button>

          <button
            onClick={handleLoad}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
            title="打开方案"
          >
            <FolderOpen size={14} />
            打开
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-2 rounded-md transition-colors ${
              canUndo ? 'hover:bg-slate-800 text-slate-300' : 'text-slate-600 cursor-not-allowed'
            }`}
            title="撤销 (Ctrl+Z)"
          >
            <Undo2 size={18} />
          </button>

          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-2 rounded-md transition-colors ${
              canRedo ? 'hover:bg-slate-800 text-slate-300' : 'text-slate-600 cursor-not-allowed'
            }`}
            title="重做 (Ctrl+Y)"
          >
            <Redo2 size={18} />
          </button>

          <div className="h-6 w-px bg-slate-700 mx-2" />

          {selectedIds.length > 0 && (
            <>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => handleAlign('left')}
                  className="p-2 rounded-md hover:bg-slate-800 text-slate-300"
                  title="左对齐"
                >
                  <AlignLeft size={16} />
                </button>
                <button
                  onClick={() => handleAlign('center')}
                  className="p-2 rounded-md hover:bg-slate-800 text-slate-300"
                  title="水平居中"
                >
                  <AlignCenter size={16} />
                </button>
                <button
                  onClick={() => handleAlign('right')}
                  className="p-2 rounded-md hover:bg-slate-800 text-slate-300"
                  title="右对齐"
                >
                  <AlignRight size={16} />
                </button>
              </div>

              <div className="h-5 w-px bg-slate-700 mx-1" />

              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => handleAlign('top')}
                  className="p-2 rounded-md hover:bg-slate-800 text-slate-300"
                  title="顶部对齐"
                >
                  <AlignStartVertical size={16} />
                </button>
                <button
                  onClick={() => handleAlign('middle')}
                  className="p-2 rounded-md hover:bg-slate-800 text-slate-300"
                  title="垂直居中"
                >
                  <AlignCenterVertical size={16} />
                </button>
                <button
                  onClick={() => handleAlign('bottom')}
                  className="p-2 rounded-md hover:bg-slate-800 text-slate-300"
                  title="底部对齐"
                >
                  <AlignEndVertical size={16} />
                </button>
              </div>

              <div className="h-5 w-px bg-slate-700 mx-1" />

              <button
                onClick={handleCopy}
                className="p-2 rounded-md hover:bg-slate-800 text-slate-300"
                title="复制"
              >
                <Copy size={16} />
              </button>

              <button
                onClick={handleDeleteSelected}
                className="p-2 rounded-md hover:bg-red-500/20 text-slate-300 hover:text-red-400"
                title="删除"
              >
                <Trash2 size={16} />
              </button>

              <div className="h-6 w-px bg-slate-700 mx-2" />
            </>
          )}

          <button
            onClick={handleEmbed}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
            title="生成嵌入代码"
          >
            <FileCode size={14} />
            嵌入代码
          </button>

          <button
            onClick={onPreview}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white rounded-md transition-all shadow-lg shadow-cyan-500/20"
          >
            <Play size={14} />
            演示模式
          </button>
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">保存大屏方案</h3>
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">方案名称</label>
              <input
                type="text"
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
              >
                取消
              </button>
              <button
                onClick={confirmSave}
                className="px-4 py-2 text-sm bg-cyan-500 hover:bg-cyan-400 text-white rounded"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showLoadModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-[500px] max-h-[600px] flex flex-col shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">我的方案</h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {dashboards.length === 0 ? (
                <div className="text-center py-8 text-slate-500">暂无保存的方案</div>
              ) : (
                dashboards.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => handleLoadDashboard(d.id)}
                    className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-lg cursor-pointer hover:border-cyan-500/50 hover:bg-slate-800 transition-all group"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-200">{d.name}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(d.updatedAt).toLocaleString()} · {d.components.length} 个组件
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteDashboard(d.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowLoadModal(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {showEmbedModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-[600px] shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">嵌入代码</h3>
            <p className="text-sm text-slate-400 mb-3">
              复制以下代码嵌入到您的网站中（请先保存方案）：
            </p>
            <div className="relative">
              <pre className="p-4 bg-slate-950 border border-slate-700 rounded text-xs text-slate-300 overflow-x-auto font-mono">
                {embedCode}
              </pre>
              <button
                onClick={copyEmbedCode}
                className="absolute top-2 right-2 px-3 py-1 text-xs bg-cyan-500 hover:bg-cyan-400 text-white rounded transition-colors"
              >
                复制
              </button>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowEmbedModal(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
