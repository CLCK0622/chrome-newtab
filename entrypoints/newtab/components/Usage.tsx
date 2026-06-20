import React, { useEffect, useState } from 'react';
import { Card } from './Card';
import {
  formatUsageValue,
  usageProvider,
  type UsageSnapshot,
} from '../lib/usage';

export function Usage() {
  const [snapshot, setSnapshot] = useState<UsageSnapshot | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    usageProvider
      .getUsage()
      .then((s) => !cancelled && setSnapshot(s))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card
      title="用量"
      aside={
        snapshot?.source === 'mock' ? (
          <span className="badge" title="EVO-77 接通前为占位数据">
            占位
          </span>
        ) : null
      }
    >
      {error && <p className="muted">用量数据暂不可用</p>}
      {!error && !snapshot && <p className="muted">加载中…</p>}
      {snapshot && (
        <ul className="usage">
          {snapshot.metrics.map((m) => {
            const pct =
              m.limit && m.limit > 0
                ? Math.min(100, Math.round((m.used / m.limit) * 100))
                : null;
            return (
              <li key={m.provider} className="usage__row">
                <div className="usage__head">
                  <span className="usage__label">{m.label}</span>
                  <span className="muted small">{m.window}</span>
                </div>
                <div className="usage__value">
                  {formatUsageValue(m.used, m.unit)}
                  {m.limit != null && (
                    <span className="muted">
                      {' / '}
                      {formatUsageValue(m.limit, m.unit)} {m.unit}
                    </span>
                  )}
                </div>
                {pct != null && (
                  <div className="usage__bar" role="progressbar" aria-valuenow={pct}>
                    <span style={{ width: `${pct}%` }} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
