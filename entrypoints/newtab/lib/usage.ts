// 用量数据接口约定 —— 与 EVO-77 打通用。
// EVO-77 就绪前用本地 mock provider 占位；真实数据源只需实现 UsageProvider 即可无缝替换。
//
// 约定（与上游对齐时以此 shape 为准）：
//   - used / limit 同单位；limit 为 null 表示「无上限 / 仅计量」。
//   - window 表示统计窗口，updatedAt 为 ISO 字符串，便于显示「x 分钟前」。

export type UsageProviderId = 'claude' | 'codex';

export interface UsageMetric {
  provider: UsageProviderId;
  /** 展示名，如 "Claude" / "Codex" */
  label: string;
  /** 已用量 */
  used: number;
  /** 上限；null = 无上限 / 仅计量 */
  limit: number | null;
  /** 单位，如 'tokens' | 'requests' | 'messages' | '$' */
  unit: string;
  /** 统计窗口，如 '今日' | '本月' | '5h 窗口' */
  window: string;
  /** ISO 时间戳 */
  updatedAt: string;
}

export interface UsageSnapshot {
  metrics: UsageMetric[];
  /** 数据来源标识，便于 UI 标注「占位 / 实时」 */
  source: 'mock' | 'evo-77' | string;
}

export interface UsageProvider {
  getUsage(): Promise<UsageSnapshot>;
}

// —— 占位实现 ——
// EVO-77 接通后，替换为读取真实用量的 provider（实现同一 UsageProvider 接口即可）。
export const mockUsageProvider: UsageProvider = {
  async getUsage(): Promise<UsageSnapshot> {
    const now = new Date().toISOString();
    return {
      source: 'mock',
      metrics: [
        {
          provider: 'claude',
          label: 'Claude',
          used: 1_240_000,
          limit: 5_000_000,
          unit: 'tokens',
          window: '今日',
          updatedAt: now,
        },
        {
          provider: 'codex',
          label: 'Codex',
          used: 86,
          limit: 300,
          unit: 'requests',
          window: '今日',
          updatedAt: now,
        },
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

export function metricFor(
  snapshot: UsageSnapshot,
  provider: UsageProviderId,
): UsageMetric | undefined {
  return snapshot.metrics.find((m) => m.provider === provider);
}

export function formatUsageValue(n: number, unit: string): string {
  if (unit === 'tokens') {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  }
  return n.toLocaleString();
}
