import React, { useEffect, useState } from 'react';
import { Card } from './Card';
import {
  formatUsageValue,
  getUsageSnapshotOnce,
  metricsFor,
  WINDOW_LABEL,
  type UsageMetric,
  type UsageProviderId,
} from '../lib/usage';
import { t } from '../lib/i18n';

function WindowRow({ metric }: { metric: UsageMetric }) {
  const pct =
    metric.limit && metric.limit > 0
      ? Math.min(100, Math.round((metric.used / metric.limit) * 100))
      : null;
  return (
    <div className="usage-window">
      <div className="usage-window__head">
        <span className="usage-window__label">{WINDOW_LABEL[metric.window]}</span>
        <span className="usage-window__value">
          {formatUsageValue(metric.used, metric.unit)}
          {metric.limit != null && (
            <span className="muted">
              {' / '}
              {formatUsageValue(metric.limit, metric.unit)}
            </span>
          )}
        </span>
      </div>
      {pct != null && (
        <div className="usage__bar" role="progressbar" aria-valuenow={pct}>
          <span style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

// Claude / Codex 各一格，复用同一份快照（getUsageSnapshotOnce 只拉一次），按窗口展示多条。
export function UsageCard({
  provider,
  title,
}: {
  provider: UsageProviderId;
  title: string;
}) {
  const [metrics, setMetrics] = useState<UsageMetric[] | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getUsageSnapshotOnce()
      .then((snap) => {
        if (cancelled) return;
        setMetrics(metricsFor(snap, provider));
        setIsMock(snap.source === 'mock');
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [provider]);

  return (
    <Card
      title={title}
      aside={
        isMock ? (
          <span className="badge" title="Placeholder until EVO-77 is wired up">
            {t('placeholder')}
          </span>
        ) : null
      }
    >
      {error && <p className="muted">{t('usageUnavailable')}</p>}
      {!error && !metrics && <p className="muted">{t('loading')}</p>}
      {metrics && metrics.length > 0 && (
        <div className="usage-card">
          {metrics.map((m) => (
            <WindowRow key={`${m.provider}-${m.window}`} metric={m} />
          ))}
        </div>
      )}
      {metrics && metrics.length === 0 && <p className="muted">{t('usageUnavailable')}</p>}
    </Card>
  );
}
