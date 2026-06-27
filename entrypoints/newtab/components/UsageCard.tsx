import React, { useEffect, useState } from 'react';
import { Icon } from './Icon';
import {
  formatAgo,
  formatResetsIn,
  formatUsageValue,
  getUsageEndpoint,
  getUsageSnapshotOnce,
  metricsFor,
  resetUsageSnapshot,
  setUsageEndpoint,
  WINDOW_LABEL,
  type UsageMetric,
  type UsageProviderId,
} from '../lib/usage';
import { t } from '../lib/i18n';

const PROVIDER_META: Record<UsageProviderId, { cls: string; symbol: string }> = {
  claude: { cls: 'card-claude', symbol: 'auto_awesome' },
  codex: { cls: 'card-codex', symbol: 'code' },
};

// 用量端点是全局共享的，一处改了通知所有用量卡刷新。
const ENDPOINT_EVENT = 'newtab:usage-endpoint-changed';

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
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState('');
  const meta = PROVIDER_META[provider];

  function load() {
    setMetrics(null);
    setError(false);
    getUsageSnapshotOnce()
      .then((snap) => {
        setMetrics(metricsFor(snap, provider));
        setIsMock(snap.source === 'mock');
      })
      .catch(() => setError(true));
  }

  useEffect(() => {
    let cancelled = false;
    getUsageEndpoint().then((u) => !cancelled && setUrl(u));
    load();
    const onChange = () => load();
    window.addEventListener(ENDPOINT_EVENT, onChange);
    return () => {
      cancelled = true;
      window.removeEventListener(ENDPOINT_EVENT, onChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  async function saveEndpoint() {
    await setUsageEndpoint(url);
    resetUsageSnapshot();
    setEditing(false);
    window.dispatchEvent(new Event(ENDPOINT_EVENT)); // 刷新两张用量卡
  }

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
        <div className="m3card__head-r">
          {isMock && !editing && <span className="m3chip m3chip--badge">{t('placeholder')}</span>}
          <button
            className="m3chip m3chip--soft m3chip--icon"
            title={t('setEndpoint')}
            aria-label={t('setEndpoint')}
            onClick={() => setEditing((v) => !v)}
          >
            ⚙
          </button>
        </div>
      </div>

      {editing ? (
        <div className="usage usage--config">
          <input
            className="cal__input"
            placeholder={t('endpointPlaceholder')}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoFocus
          />
          <span className="cal__msg">{t('endpointHint')}</span>
          <div className="usage__config-actions">
            <button className="m3chip m3chip--filled" onClick={saveEndpoint}>
              {t('save')}
            </button>
            <button className="m3chip m3chip--soft" onClick={() => setEditing(false)}>
              {t('cancel')}
            </button>
          </div>
        </div>
      ) : error ? (
        <p className="muted">{t('usageUnavailable')}</p>
      ) : !metrics ? (
        <p className="muted">{t('loading')}</p>
      ) : metrics.length > 0 ? (
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
      ) : (
        <p className="muted">{t('usageUnavailable')}</p>
      )}
    </section>
  );
}
