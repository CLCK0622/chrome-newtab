// 轻量本地设置：用户名 + 城市覆盖。存 localStorage，避免引入额外存储依赖。
// 后续要跨设备同步可平滑换成 chrome.storage.sync。

export interface SavedCity {
  name: string;
  latitude: number;
  longitude: number;
}

export interface Settings {
  userName: string;
  city: SavedCity | null; // null = 用浏览器定位
}

const KEY = 'newtab.settings.v1';

const DEFAULTS: Settings = {
  userName: 'Kevin',
  city: null,
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(next: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* 隐私模式等场景下静默失败，不影响主流程 */
  }
}
