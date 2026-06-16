import type { Dashboard } from '@/types';

const DASHBOARDS_KEY = 'dashboard_builder_dashboards';
const CURRENT_DASHBOARD_KEY = 'dashboard_builder_current';

export const storage = {
  getDashboards: (): Dashboard[] => {
    try {
      const data = localStorage.getItem(DASHBOARDS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveDashboards: (dashboards: Dashboard[]): void => {
    localStorage.setItem(DASHBOARDS_KEY, JSON.stringify(dashboards));
  },

  getDashboard: (id: string): Dashboard | null => {
    const dashboards = storage.getDashboards();
    return dashboards.find((d) => d.id === id) || null;
  },

  saveDashboard: (dashboard: Dashboard): void => {
    const dashboards = storage.getDashboards();
    const index = dashboards.findIndex((d) => d.id === dashboard.id);
    if (index >= 0) {
      dashboards[index] = { ...dashboard, updatedAt: Date.now() };
    } else {
      dashboards.push({ ...dashboard, createdAt: Date.now(), updatedAt: Date.now() });
    }
    storage.saveDashboards(dashboards);
  },

  deleteDashboard: (id: string): void => {
    const dashboards = storage.getDashboards();
    const filtered = dashboards.filter((d) => d.id !== id);
    storage.saveDashboards(filtered);
  },

  getCurrentDashboardId: (): string | null => {
    return localStorage.getItem(CURRENT_DASHBOARD_KEY);
  },

  setCurrentDashboardId: (id: string): void => {
    localStorage.setItem(CURRENT_DASHBOARD_KEY, id);
  },
};
