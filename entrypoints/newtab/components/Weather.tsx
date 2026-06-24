import React, { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import {
  describeWeather,
  fetchWeather,
  getBrowserLocation,
  searchCity,
  type GeocodeHit,
  type WeatherResult,
} from '../lib/weather';
import { loadSettings, saveSettings, type SavedCity } from '../lib/settings';
import { t } from '../lib/i18n';

type Status = 'idle' | 'locating' | 'loading' | 'ready' | 'error';

export function Weather() {
  const [city, setCity] = useState<SavedCity | null>(() => loadSettings().city);
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<GeocodeHit[]>([]);
  const [searching, setSearching] = useState(false);
  const reqId = useRef(0);

  async function loadFor(lat: number, lon: number) {
    const id = ++reqId.current;
    setStatus('loading');
    try {
      const result = await fetchWeather(lat, lon);
      if (id !== reqId.current) return;
      setWeather(result);
      setStatus('ready');
    } catch {
      if (id !== reqId.current) return;
      setStatus('error');
    }
  }

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
        setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!editing) return;
    const q = query.trim();
    if (!q) {
      setHits([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        setHits(await searchCity(q));
      } catch {
        setHits([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query, editing]);

  function pickCity(hit: GeocodeHit) {
    const saved: SavedCity = {
      name: hit.admin1 ? `${hit.name}, ${hit.admin1}` : hit.name,
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
    }
  }

  // 头部图标固定 partly_cloudy_day（与设计稿一致，且在本地打包的图标子集内）。
  const headSymbol = 'partly_cloudy_day';
  const locationLabel = city ? city.name : t('currentLocation');

  return (
    <section className="m3card card-weather">
      <div className="m3card__head">
        <div className="m3card__head-l">
          <span className="m3icon">
            <Icon name={headSymbol} size={20} />
          </span>
          <span className="m3card__title">{t('weather')}</span>
        </div>
        <button className="m3chip m3chip--soft" onClick={() => setEditing((v) => !v)}>
          {city ? city.name : t('setCity')}
        </button>
      </div>

      {editing ? (
        <div className="weather__body">
          <div className="weather__editor">
            <input
              className="cal__input"
              placeholder={t('searchCityPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button className="m3chip m3chip--soft weather__btn" onClick={useMyLocation}>
              {t('useMyLocation')}
            </button>
            {searching && <span className="cal__msg">{t('searching')}</span>}
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
        </div>
      ) : status === 'ready' && weather ? (
        <div className="weather__body">
          <div className="weather__now">
            <span className="weather__temp">{weather.current.temperature}°</span>
          </div>
          <div className="weather__desc">
            {describeWeather(weather.current.weatherCode).label} · {t('feelsLike')}{' '}
            {weather.current.apparentTemperature}°
          </div>
          <div className="weather__range">
            <span>↑{weather.today.tempMax}° ↓{weather.today.tempMin}°</span>
            <span>{locationLabel}</span>
          </div>
        </div>
      ) : status === 'locating' || status === 'loading' ? (
        <div className="weather__body">
          <Icon name="location_on" size={34} color="var(--accent)" />
          <div className="weather__msg">
            {status === 'locating' ? t('locating') : t('loadingWeather')}
          </div>
        </div>
      ) : (
        <div className="weather__body">
          <Icon name="location_off" size={34} color="var(--accent)" />
          <div className="weather__msg">{t('cantLocate')}</div>
          <button
            className="m3chip m3chip--filled weather__btn"
            onClick={() => setEditing(true)}
          >
            {t('pickCity')}
          </button>
        </div>
      )}
    </section>
  );
}
