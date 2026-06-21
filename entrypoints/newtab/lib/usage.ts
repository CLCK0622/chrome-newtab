// 用量数据接口约定 —— 与 EVO-77 打通用。
// EVO-77 就绪前用本地 mock provider 占位；真实数据源只需实现 UsageProvider 即可无缝替换。
//
// v3：支持「每 provider 多窗口」。同一 provider 在 metrics[] 中出现多条，
// 以 window 区分（如 Claude 的 5 小时滚动限额 + 7 天周限额）。
//
// 约定（与上游对齐时以此 shape 为准）：
//   - 每条 metric = 某 provider 在某 window 下的一项计量。
//   - used / limit 同单位；limit 为 null 表示「无上限 / 仅计量」。
//   - updatedAt 为 ISO 字符串，便于显示「x 分钟前」。

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
  /** ISO 时间戳 */
  updatedAt: string;
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
    const now = new Date().toISOString();
    const m = (
      provider: UsageProviderId,
      window: UsageWindow,
      used: number,
      limit: number | null,
      unit: string,
    ): UsageMetric => ({ provider, window, used, limit, unit, updatedAt: now });
    return {
      source: 'mock',
      metrics: [
        m('claude', '5h', 1_240_000, 5_000_000, 'tokens'),
        m('claude', '7d', 18_600_000, 35_000_000, 'tokens'),
        m('codex', '5h', 86, 300, 'requests'),
        m('codex', '7d', 540, 2_000, 'requests'),
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
