import React, { useEffect, useState } from 'react';
import { Icon } from './Icon';
import {
  formatAgo,
  formatResetsIn,
  formatUsageValue,
  getUsageSnapshotOnce,
  metricsFor,
  WINDOW_LABEL,
  type UsageMetric,
  type UsageProviderId,
} from '../lib/usage';
import { t } from '../lib/i18n';

const PROVIDER_META: Record<UsageProviderId, { cls: string; symbol: string }> = {
  claude: { cls: 'card-claude', symbol: 'auto_awesome' },
  codex: { cls: 'card-codex', symbol: 'code' },
};

function WindowRow({ metric }: { metric: UsageMetric }) {
  const pct =
    metric.limit && metric.limit > 0
      ? Math.min(100, (metric.used / metric.limit) * 100)
      : 0;
  const resets = formatResetsIn(metric.resetsAt);
  return (
    <div>
      <div className="usage__win-head">
        <span className="usage__label">{WINDOW_LABEL[metric.window]}</span>
        <span>
          <b className="usage__value">{formatUsageValue(metric.used, metric.unit)}</b>{' '}
          {metric.limit != null && (
            <span className="usage__limit">/ {formatUsageValue(metric.limit, metric.unit)}</span>
          )}
        </span>
      </div>
      <div className="usage__bar">
        <span style={{ width: `${pct}%` }} />
      </div>
      {resets && (
        <div className="usage__reset">
          <span className="usage__reset-l">
            <Icon name="schedule" size={13} />
            {t('resetsIn')}
          </span>
          <span className="mono">{resets}</span>
        </div>
      )}
    </div>
  );
}

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
  const meta = PROVIDER_META[provider];

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

  const updatedAt = metrics && metrics.length > 0 ? metrics[0].updatedAt : null;

  return (
    <section className={`m3card ${meta.cls}`}>
      <div className="m3card__head">
        <div className="m3card__head-l">
          <span className="m3icon">
            <Icon name={meta.symbol} size={20} />
          </span>
          <span className="m3card__title">{title}</span>
        </div>
        {isMock && <span className="m3chip m3chip--badge">{t('placeholder')}</span>}
      </div>

      {error && <p className="muted">{t('usageUnavailable')}</p>}
      {!error && !metrics && <p className="muted">{t('loading')}</p>}
      {metrics && metrics.length > 0 && (
        <div className="usage">
          {metrics.map((m) => (
            <WindowRow key={`${m.provider}-${m.window}`} metric={m} />
          ))}
          {updatedAt && (
            <div className="usage__foot">
              <span className="usage__foot-l">
                <Icon name="sync" size={13} />
                {t('usageUpdated')}
              </span>
              <span>
                <span className="mono">{formatAgo(updatedAt)}</span> {t('ago')}
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
