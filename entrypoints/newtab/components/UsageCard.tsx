import React, { useEffect, useState } from 'react';
import { Card } from './Card';
import {
  formatUsageValue,
  getUsageSnapshotOnce,
  metricFor,
  type UsageMetric,
  type UsageProviderId,
} from '../lib/usage';
import { t } from '../lib/i18n';

// Claude / Codex 各一格，复用同一份快照（getUsageSnapshotOnce 只拉一次）。
export function UsageCard({
  provider,
  title,
}: {
  provider: UsageProviderId;
  title: string;
}) {
  const [metric, setMetric] = useState<UsageMetric | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getUsageSnapshotOnce()
      .then((snap) => {
        if (cancelled) return;
        setMetric(metricFor(snap, provider) ?? null);
        setIsMock(snap.source === 'mock');
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [provider]);

  const pct =
    metric && metric.limit && metric.limit > 0
      ? Math.min(100, Math.round((metric.used / metric.limit) * 100))
      : null;

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
      {!error && !metric && <p className="muted">{t('loading')}</p>}
      {metric && (
        <div className="usage-card">
          <div className="usage-card__value">
            {formatUsageValue(metric.used, metric.unit)}
            {metric.limit != null && (
              <span className="muted">
                {' / '}
                {formatUsageValue(metric.limit, metric.unit)}
              </span>
            )}
          </div>
          <div className="usage-card__unit muted small">
            {metric.unit} · {metric.window}
          </div>
          {pct != null && (
            <div className="usage__bar" role="progressbar" aria-valuenow={pct}>
              <span style={{ width: `${pct}%` }} />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
