// 用量数据接口约定 —— 与 EVO-77 打通用。
// EVO-77 就绪前用本地 mock provider 占位；真实数据源只需实现 UsageProvider 即可无缝替换。
//
// v3：支持「每 provider 多窗口」。同一 provider 在 metrics[] 中出现多条，
//     以 window 区分（如 Claude 的 5 小时滚动限额 + 7 天周限额）。
// v4：可选 resetsAt（窗口重置时刻）用于 M3 卡片的「Resets in」；updatedAt 复用为「Usage updated … ago」。
//
// 约定（与上游对齐时以此 shape 为准）：
//   - 每条 metric = 某 provider 在某 window 下的一项计量。
//   - used / limit 同单位；limit 为 null 表示「无上限 / 仅计量」。
//   - updatedAt 为 ISO 字符串；resetsAt 可选，ISO，窗口下次清零时刻。

export type UsageProviderId = 'claude' | 'codex';

/** 计量窗口。当前约定两档；如需更多窗口在此扩充并同步 EVO-77。 */
export type UsageWindow = '5h' | '7d';

export interface UsageMetric {
  provider: UsageProviderId;
  /** 计量窗口 */
  window: UsageWindow;
  /** 已用量 */
  used: number;
  /** 上限；null = 无上限 / 仅计量 */
  limit: number | null;
  /** 单位，如 'tokens' | 'requests' | 'messages' | '$' */
  unit: string;
  /** ISO 时间戳：数据更新时刻 */
  updatedAt: string;
  /** 可选 ISO 时间戳：该窗口下次重置时刻（用于「Resets in」） */
  resetsAt?: string;
}

export interface UsageSnapshot {
  /** 扁平列表：同一 provider 可出现多条（每窗口一条） */
  metrics: UsageMetric[];
  /** 数据来源标识，便于 UI 标注「占位 / 实时」 */
  source: 'mock' | 'evo-77' | string;
}

export interface UsageProvider {
  getUsage(): Promise<UsageSnapshot>;
}

/** 窗口的人类可读标签（英文 UI）。 */
export const WINDOW_LABEL: Record<UsageWindow, string> = {
  '5h': '5-hour',
  '7d': '7-day',
};

/** 渲染顺序，保证两窗口稳定排布。 */
export const WINDOW_ORDER: UsageWindow[] = ['5h', '7d'];

// —— 占位实现 ——
// EVO-77 接通后，替换为读取真实用量的 provider（实现同一 UsageProvider 接口即可）。
export const mockUsageProvider: UsageProvider = {
  async getUsage(): Promise<UsageSnapshot> {
    const now = Date.now();
    const iso = (msFromNow: number) => new Date(now + msFromNow).toISOString();
    const MIN = 60_000;
    const HOUR = 60 * MIN;
    const DAY = 24 * HOUR;
    const m = (
      provider: UsageProviderId,
      window: UsageWindow,
      used: number,
      limit: number | null,
      unit: string,
      resetsIn: number,
      updatedAgo: number,
    ): UsageMetric => ({
      provider,
      window,
      used,
      limit,
      unit,
      resetsAt: iso(resetsIn),
      updatedAt: iso(-updatedAgo),
    });
    return {
      source: 'mock',
      metrics: [
        m('claude', '5h', 1_240_000, 5_000_000, 'tokens', 2 * HOUR + 41 * MIN, 3 * MIN),
        m('claude', '7d', 18_600_000, 35_000_000, 'tokens', 4 * DAY + 6 * HOUR, 3 * MIN),
        m('codex', '5h', 86, 300, 'requests', 1 * HOUR + 12 * MIN, 8 * MIN),
        m('codex', '7d', 540, 2_000, 'requests', 5 * DAY + 2 * HOUR, 8 * MIN),
      ],
    };
  },
};

/** 当前生效的 provider。EVO-77 接通后改这一行即可。 */
export const usageProvider: UsageProvider = mockUsageProvider;

// Claude / Codex 拆成两个独立卡片，但共用同一份快照（一次拉取）。
let snapshotPromise: Promise<UsageSnapshot> | null = null;

export function getUsageSnapshotOnce(): Promise<UsageSnapshot> {
  if (!snapshotPromise) snapshotPromise = usageProvider.getUsage();
  return snapshotPromise;
}

/** 取某 provider 的全部窗口 metric，按 WINDOW_ORDER 稳定排序。 */
export function metricsFor(
  snapshot: UsageSnapshot,
  provider: UsageProviderId,
): UsageMetric[] {
  return snapshot.metrics
    .filter((m) => m.provider === provider)
    .sort((a, b) => WINDOW_ORDER.indexOf(a.window) - WINDOW_ORDER.indexOf(b.window));
}

export function formatUsageValue(n: number, unit: string): string {
  if (unit === 'tokens') {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  }
  return n.toLocaleString();
}

/** "2h 41m" / "4d 6h" / "12m" —— 距 ISO 时刻还有多久。 */
export function formatResetsIn(iso?: string): string | null {
  if (!iso) return null;
  let s = Math.max(0, Math.floor((Date.parse(iso) - Date.now()) / 1000));
  const d = Math.floor(s / 86400);
  s -= d * 86400;
  const h = Math.floor(s / 3600);
  s -= h * 3600;
  const m = Math.floor(s / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/** "3 min" —— 距今多久（用于「Usage updated … ago」）。 */
export function formatAgo(iso: string): string {
  const s = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
