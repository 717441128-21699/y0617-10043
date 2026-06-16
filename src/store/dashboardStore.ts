import { create } from 'zustand';
import { produce } from 'immer';
import type { Dashboard, DashboardComponent, ComponentType, AlignType, ZIndexAction } from '@/types';
import { generateId, createDefaultComponent, getMaxZIndex, generateMockData } from '@/utils/helpers';
import { storage } from '@/utils/storage';

interface HistoryState {
  past: DashboardComponent[][];
  future: DashboardComponent[][];
}

interface DashboardState {
  dashboard: Dashboard;
  selectedIds: string[];
  history: HistoryState;
  isPreview: boolean;
  flushPending: number;

  setDashboard: (dashboard: Dashboard) => void;
  updateDashboardConfig: (config: Partial<Dashboard>) => void;

  addComponent: (type: ComponentType, x: number, y: number) => void;
  duplicateComponents: (ids: string[]) => void;
  removeComponent: (id: string) => void;
  removeComponents: (ids: string[]) => void;
  updateComponent: (id: string, updates: Partial<DashboardComponent>) => void;
  updateComponentWithHistory: (id: string, updates: Partial<DashboardComponent>) => void;
  updateComponentConfig: (id: string, config: Record<string, any>) => void;
  updateComponentDataSource: (id: string, dataSource: Partial<DashboardComponent['dataSource']>) => void;

  selectComponent: (id: string, multi?: boolean) => void;
  multiSelect: (ids: string[]) => void;
  clearSelection: () => void;

  moveComponents: (ids: string[], dx: number, dy: number) => void;
  resizeComponent: (id: string, width: number, height: number) => void;

  alignComponents: (ids: string[], type: AlignType) => void;
  adjustZIndex: (id: string, action: ZIndexAction) => void;

  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  captureSnapshot: () => DashboardComponent[];
  pushHistorySnapshot: (snapshot: DashboardComponent[]) => void;
  triggerFlush: () => void;

  saveDashboard: () => void;
  loadDashboard: (id: string) => void;
  newDashboard: () => void;
}

const createInitialDashboard = (): Dashboard => ({
  id: generateId(),
  name: '未命名大屏',
  backgroundColor: '#0A1628',
  width: 1920,
  height: 1080,
  components: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const getInitialState = (): { dashboard: Dashboard; selectedIds: string[]; history: HistoryState; isPreview: boolean; flushPending: number } => {
  const savedId = storage.getCurrentDashboardId();
  let dashboard = createInitialDashboard();

  if (savedId) {
    const saved = storage.getDashboard(savedId);
    if (saved) {
      dashboard = saved;
    }
  }

  return {
    dashboard,
    selectedIds: [],
    history: {
      past: [],
      future: [],
    },
    isPreview: false,
    flushPending: 0,
  };
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  ...getInitialState(),

  setDashboard: (dashboard) => set({ dashboard }),

  updateDashboardConfig: (config) =>
    set(
      produce((state: DashboardState) => {
        Object.assign(state.dashboard, config);
      })
    ),

  addComponent: (type, x, y) => {
    get().pushHistory();
    const zIndex = getMaxZIndex(get().dashboard.components);
    const component = createDefaultComponent(type, x, y, zIndex);
    set(
      produce((state: DashboardState) => {
        state.dashboard.components.push(component);
        state.selectedIds = [component.id];
      })
    );
  },

  duplicateComponents: (ids) => {
    const { dashboard } = get();
    const compsToDuplicate = dashboard.components.filter((c) => ids.includes(c.id));
    if (compsToDuplicate.length === 0) return;

    get().pushHistory();

    const maxZ = getMaxZIndex(get().dashboard.components);
    const newIds: string[] = [];

    set(
      produce((state: DashboardState) => {
        compsToDuplicate.forEach((comp, index) => {
          const newComp = {
            ...JSON.parse(JSON.stringify(comp)),
            id: generateId(),
            x: comp.x + 20,
            y: comp.y + 20,
            zIndex: maxZ + index,
          };
          state.dashboard.components.push(newComp);
          newIds.push(newComp.id);
        });
        state.selectedIds = newIds;
      })
    );
  },

  removeComponent: (id) => {
    get().pushHistory();
    set(
      produce((state: DashboardState) => {
        state.dashboard.components = state.dashboard.components.filter((c: DashboardComponent) => c.id !== id);
        state.selectedIds = state.selectedIds.filter((sid: string) => sid !== id);
      })
    );
  },

  removeComponents: (ids) => {
    get().pushHistory();
    set(
      produce((state: DashboardState) => {
        state.dashboard.components = state.dashboard.components.filter(
          (c: DashboardComponent) => !ids.includes(c.id)
        );
        state.selectedIds = state.selectedIds.filter((sid: string) => !ids.includes(sid));
      })
    );
  },

  updateComponent: (id, updates) => {
    set(
      produce((state: DashboardState) => {
        const comp = state.dashboard.components.find((c: DashboardComponent) => c.id === id);
        if (comp) {
          const safeUpdates: Partial<DashboardComponent> = { ...updates };
          const newWidth = safeUpdates.width !== undefined ? safeUpdates.width : comp.width;
          const newHeight = safeUpdates.height !== undefined ? safeUpdates.height : comp.height;

          if (safeUpdates.width !== undefined) {
            safeUpdates.width = Math.max(100, Math.min(safeUpdates.width, state.dashboard.width));
          }
          if (safeUpdates.height !== undefined) {
            safeUpdates.height = Math.max(60, Math.min(safeUpdates.height, state.dashboard.height));
          }

          const finalWidth = safeUpdates.width !== undefined ? safeUpdates.width : newWidth;
          const finalHeight = safeUpdates.height !== undefined ? safeUpdates.height : newHeight;

          const maxX = state.dashboard.width - finalWidth;
          const maxY = state.dashboard.height - finalHeight;

          if (safeUpdates.x !== undefined) {
            safeUpdates.x = Math.max(0, Math.min(safeUpdates.x, maxX));
          } else if (safeUpdates.width !== undefined) {
            const autoX = Math.min(comp.x, maxX);
            if (autoX !== comp.x) {
              safeUpdates.x = Math.max(0, autoX);
            }
          }

          if (safeUpdates.y !== undefined) {
            safeUpdates.y = Math.max(0, Math.min(safeUpdates.y, maxY));
          } else if (safeUpdates.height !== undefined) {
            const autoY = Math.min(comp.y, maxY);
            if (autoY !== comp.y) {
              safeUpdates.y = Math.max(0, autoY);
            }
          }

          Object.assign(comp, safeUpdates);
        }
      })
    );
  },

  updateComponentWithHistory: (id, updates) => {
    get().pushHistory();
    set(
      produce((state: DashboardState) => {
        const comp = state.dashboard.components.find((c: DashboardComponent) => c.id === id);
        if (comp) {
          Object.assign(comp, updates);
        }
      })
    );
  },

  updateComponentConfig: (id, config) => {
    set(
      produce((state: DashboardState) => {
        const comp = state.dashboard.components.find((c: DashboardComponent) => c.id === id);
        if (comp) {
          comp.config = { ...comp.config, ...config };
        }
      })
    );
  },

  updateComponentDataSource: (id, dataSource) => {
    set(
      produce((state: DashboardState) => {
        const comp = state.dashboard.components.find((c: DashboardComponent) => c.id === id);
        if (comp) {
          comp.dataSource = { ...comp.dataSource, ...dataSource };
        }
      })
    );
  },

  selectComponent: (id, multi = false) => {
    if (multi) {
      set(
        produce((state: DashboardState) => {
          const index = state.selectedIds.indexOf(id);
          if (index >= 0) {
            state.selectedIds.splice(index, 1);
          } else {
            state.selectedIds.push(id);
          }
        })
      );
    } else {
      set({ selectedIds: [id] });
    }
  },

  multiSelect: (ids) => set({ selectedIds: ids }),

  clearSelection: () => set({ selectedIds: [] }),

  moveComponents: (ids, dx, dy) => {
    set(
      produce((state: DashboardState) => {
        state.dashboard.components.forEach((comp: DashboardComponent) => {
          if (ids.includes(comp.id)) {
            comp.x = Math.max(0, comp.x + dx);
            comp.y = Math.max(0, comp.y + dy);
          }
        });
      })
    );
  },

  resizeComponent: (id, width, height) => {
    set(
      produce((state: DashboardState) => {
        const comp = state.dashboard.components.find((c: DashboardComponent) => c.id === id);
        if (comp) {
          comp.width = Math.max(100, width);
          comp.height = Math.max(60, height);
        }
      })
    );
  },

  alignComponents: (ids, type) => {
    if (ids.length < 2) return;

    get().pushHistory();

    const { dashboard } = get();
    const comps = dashboard.components.filter((c) => ids.includes(c.id));

    let targetValue: number;
    switch (type) {
      case 'left':
        targetValue = Math.min(...comps.map((c) => c.x));
        break;
      case 'right':
        targetValue = Math.max(...comps.map((c) => c.x + c.width));
        break;
      case 'center':
        const centerXs = comps.map((c) => c.x + c.width / 2);
        targetValue = centerXs.reduce((a, b) => a + b, 0) / centerXs.length;
        break;
      case 'top':
        targetValue = Math.min(...comps.map((c) => c.y));
        break;
      case 'bottom':
        targetValue = Math.max(...comps.map((c) => c.y + c.height));
        break;
      case 'middle':
        const centerYs = comps.map((c) => c.y + c.height / 2);
        targetValue = centerYs.reduce((a, b) => a + b, 0) / centerYs.length;
        break;
      default:
        return;
    }

    set(
      produce((state: DashboardState) => {
        state.dashboard.components.forEach((comp: DashboardComponent) => {
          if (ids.includes(comp.id)) {
            switch (type) {
              case 'left':
                comp.x = targetValue;
                break;
              case 'right':
                comp.x = targetValue - comp.width;
                break;
              case 'center':
                comp.x = targetValue - comp.width / 2;
                break;
              case 'top':
                comp.y = targetValue;
                break;
              case 'bottom':
                comp.y = targetValue - comp.height;
                break;
              case 'middle':
                comp.y = targetValue - comp.height / 2;
                break;
            }
          }
        });
      })
    );
  },

  adjustZIndex: (id, action) => {
    get().pushHistory();

    const { dashboard } = get();
    const comps = [...dashboard.components].sort((a, b) => a.zIndex - b.zIndex);
    const comp = comps.find((c) => c.id === id);
    if (!comp) return;

    const currentIndex = comps.findIndex((c) => c.id === id);
    let newZIndex = comp.zIndex;

    switch (action) {
      case 'up':
        if (currentIndex < comps.length - 1) {
          const nextComp = comps[currentIndex + 1];
          newZIndex = nextComp.zIndex + 1;
        }
        break;
      case 'down':
        if (currentIndex > 0) {
          const prevComp = comps[currentIndex - 1];
          newZIndex = prevComp.zIndex - 1;
        }
        break;
      case 'top':
        newZIndex = Math.max(...comps.map((c) => c.zIndex)) + 1;
        break;
      case 'bottom':
        newZIndex = Math.min(...comps.map((c) => c.zIndex)) - 1;
        break;
    }

    set(
      produce((state: DashboardState) => {
        const targetComp = state.dashboard.components.find((c: DashboardComponent) => c.id === id);
        if (targetComp) {
          targetComp.zIndex = newZIndex;
        }
      })
    );
  },

  captureSnapshot: () => {
    return JSON.parse(JSON.stringify(get().dashboard.components));
  },

  pushHistorySnapshot: (snapshot) => {
    const { history } = get();

    if (history.past.length > 0) {
      const last = history.past[history.past.length - 1];
      if (JSON.stringify(last) === JSON.stringify(snapshot)) {
        return;
      }
    }

    set(
      produce((state: DashboardState) => {
        state.history.past.push(JSON.parse(JSON.stringify(snapshot)));
        if (state.history.past.length > 50) {
          state.history.past.shift();
        }
        state.history.future = [];
      })
    );
  },

  pushHistory: () => {
    const snapshot = get().captureSnapshot();
    get().pushHistorySnapshot(snapshot);
  },

  undo: () => {
    const { history, dashboard } = get();
    if (history.past.length === 0) return;

    const previous = history.past[history.past.length - 1];
    const current = JSON.parse(JSON.stringify(dashboard.components));

    if (JSON.stringify(previous) === JSON.stringify(current)) {
      set(
        produce((state: DashboardState) => {
          state.history.past.pop();
        })
      );
      if (history.past.length <= 1) return;
      return get().undo();
    }

    set(
      produce((state: DashboardState) => {
        const prev = state.history.past.pop();
        if (prev) {
          state.history.future.unshift(JSON.parse(JSON.stringify(state.dashboard.components)));
          state.dashboard.components = prev;
          state.selectedIds = [];
        }
      })
    );
  },

  redo: () => {
    const { history, dashboard } = get();
    if (history.future.length === 0) return;

    const next = history.future[0];
    const current = JSON.parse(JSON.stringify(dashboard.components));

    if (JSON.stringify(next) === JSON.stringify(current)) {
      set(
        produce((state: DashboardState) => {
          state.history.future.shift();
        })
      );
      if (history.future.length === 0) return;
      return get().redo();
    }

    set(
      produce((state: DashboardState) => {
        const nxt = state.history.future.shift();
        if (nxt) {
          state.history.past.push(JSON.parse(JSON.stringify(state.dashboard.components)));
          state.dashboard.components = nxt;
          state.selectedIds = [];
        }
      })
    );
  },

  triggerFlush: () => {
    set(
      produce((state: DashboardState) => {
        state.flushPending = (state.flushPending || 0) + 1;
      })
    );
  },

  saveDashboard: () => {
    const { dashboard } = get();
    storage.saveDashboard(dashboard);
    storage.setCurrentDashboardId(dashboard.id);
  },

  loadDashboard: (id) => {
    const dashboard = storage.getDashboard(id);
    if (dashboard) {
      set({
        dashboard,
        selectedIds: [],
        history: { past: [], future: [] },
        flushPending: 0,
      });
      storage.setCurrentDashboardId(id);
    }
  },

  newDashboard: () => {
    const dashboard = createInitialDashboard();
    set({
      dashboard,
      selectedIds: [],
      history: { past: [], future: [] },
      flushPending: 0,
    });
    storage.setCurrentDashboardId(dashboard.id);
  },
}));

export { generateMockData };
