import React, { useEffect, useRef, useState } from 'react';
import { Card } from './Card';
import {
  describeWeather,
  fetchWeather,
  getBrowserLocation,
  searchCity,
  type GeocodeHit,
  type WeatherResult,
} from '../lib/weather';
import { loadSettings, saveSettings, type SavedCity } from '../lib/settings';

type Status = 'idle' | 'locating' | 'loading' | 'ready' | 'error';

export function Weather() {
  const [city, setCity] = useState<SavedCity | null>(() => loadSettings().city);
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string>('');
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<GeocodeHit[]>([]);
  const [searching, setSearching] = useState(false);
  const reqId = useRef(0);

  async function loadFor(lat: number, lon: number) {
    const id = ++reqId.current;
    setStatus('loading');
    setError('');
    try {
      const result = await fetchWeather(lat, lon);
      if (id !== reqId.current) return; // 已被更新的请求覆盖
      setWeather(result);
      setStatus('ready');
    } catch (e: any) {
      if (id !== reqId.current) return;
      setError(e?.message ?? '加载失败');
      setStatus('error');
    }
  }

  // 初次加载：有保存城市用城市，否则尝试浏览器定位。
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (city) {
        loadFor(city.latitude, city.longitude);
        return;
      }
      setStatus('locating');
      try {
        const pos = await getBrowserLocation();
        if (cancelled) return;
        loadFor(pos.latitude, pos.longitude);
      } catch {
        if (cancelled) return;
        // 定位失败/被拒：提示手填城市
        setStatus('error');
        setError('无法定位，请手动选择城市');
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 城市搜索（防抖）
  useEffect(() => {
    if (!editing) return;
    const q = query.trim();
    if (!q) {
      setHits([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const results = await searchCity(q);
        setHits(results);
      } catch {
        setHits([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query, editing]);

  function pickCity(hit: GeocodeHit) {
    const saved: SavedCity = {
      name: hit.admin1 ? `${hit.name}·${hit.admin1}` : hit.name,
      latitude: hit.latitude,
      longitude: hit.longitude,
    };
    setCity(saved);
    saveSettings({ ...loadSettings(), city: saved });
    setEditing(false);
    setQuery('');
    setHits([]);
    loadFor(saved.latitude, saved.longitude);
  }

  async function useMyLocation() {
    setEditing(false);
    setStatus('locating');
    setCity(null);
    saveSettings({ ...loadSettings(), city: null });
    try {
      const pos = await getBrowserLocation();
      loadFor(pos.latitude, pos.longitude);
    } catch {
      setStatus('error');
      setError('无法定位，请手动选择城市');
    }
  }

  const locationLabel = city ? city.name : weather ? '当前位置' : '—';

  return (
    <Card
      title="天气"
      aside={
        <button
          className="link-btn"
          onClick={() => setEditing((v) => !v)}
          aria-expanded={editing}
        >
          {city ? city.name : '设置城市'}
        </button>
      }
    >
      {editing && (
        <div className="weather__editor">
          <input
            className="text-input"
            placeholder="搜索城市（如 Shanghai / 北京）"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button className="link-btn" onClick={useMyLocation}>
            📍 用我的定位
          </button>
          {searching && <p className="muted small">搜索中…</p>}
          {hits.length > 0 && (
            <ul className="weather__hits">
              {hits.map((h, i) => (
                <li key={`${h.latitude},${h.longitude},${i}`}>
                  <button className="weather__hit" onClick={() => pickCity(h)}>
                    {h.name}
                    {h.admin1 ? `, ${h.admin1}` : ''}
                    {h.country ? ` · ${h.country}` : ''}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {(status === 'locating' || status === 'loading') && (
        <p className="muted">{status === 'locating' ? '定位中…' : '加载天气…'}</p>
      )}

      {status === 'error' && !editing && (
        <div className="weather__error">
          <p className="muted">{error}</p>
          <button className="link-btn" onClick={() => setEditing(true)}>
            选择城市
          </button>
        </div>
      )}

      {status === 'ready' && weather && (
        <div className="weather">
          <div className="weather__now">
            <span className="weather__icon">
              {describeWeather(weather.current.weatherCode).icon}
            </span>
            <div>
              <div className="weather__temp">{weather.current.temperature}°</div>
              <div className="muted small">
                {describeWeather(weather.current.weatherCode).label} · 体感{' '}
                {weather.current.apparentTemperature}°
              </div>
            </div>
          </div>
          <div className="weather__meta">
            <span className="muted small">{locationLabel}</span>
            <span className="weather__range">
              ↑{weather.today.tempMax}° ↓{weather.today.tempMin}°
              {weather.today.precipitationProbability != null &&
                ` · 💧${weather.today.precipitationProbability}%`}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
