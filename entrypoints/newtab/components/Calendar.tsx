import React, { useEffect, useState } from 'react';
import { Icon } from './Icon';
import {
  calendarProvider,
  getCalendarUrl,
  setCalendarUrl,
  type CalendarEvent,
} from '../lib/calendar';
import { t, eventsToday } from '../lib/i18n';

type Status = 'loading' | 'unconfigured' | 'ready' | 'error';

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function timeRange(e: CalendarEvent): string {
  if (e.allDay) return 'All day';
  return `${fmtTime(e.start)} – ${fmtTime(e.end)}`;
}

// 事件类型 → 图标 + 强调色（仿设计稿 videocam/restaurant）。
function eventStyle(e: CalendarEvent): { symbol: string; color: string } {
  const hay = `${e.title} ${e.location ?? ''}`.toLowerCase();
  if (/(lunch|dinner|breakfast|coffee|restaurant|cafe|brunch)/.test(hay))
    return { symbol: 'restaurant', color: '#984061' };
  if (/(meet|sync|call|standup|1:1|zoom|hangout|video)/.test(hay))
    return { symbol: 'videocam', color: '#3f51b5' };
  return { symbol: 'calendar_today', color: '#3f51b5' };
}

export function Calendar() {
  const [status, setStatus] = useState<Status>('loading');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState('');

  async function refresh() {
    setStatus('loading');
    try {
      const snap = await calendarProvider.getEvents();
      if (snap.source === 'unconfigured') {
        setStatus('unconfigured');
        return;
      }
      setEvents(snap.events);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => {
    (async () => {
      setUrl(await getCalendarUrl());
      await refresh();
    })();
  }, []);

  async function save() {
    await setCalendarUrl(url);
    setEditing(false);
    await refresh();
  }

  const configured = status === 'ready' || status === 'error';
  const showConnect = editing || status === 'unconfigured';

  return (
    <section className="m3card card-calendar">
      <div className="m3card__head">
        <div className="m3card__head-l">
          <span className="m3icon">
            <Icon name="calendar_today" size={20} />
          </span>
          <span className="m3card__title">{t('calendar')}</span>
        </div>
        {configured && (
          <button className="m3chip m3chip--soft" onClick={() => setEditing((v) => !v)}>
            {t('change')}
          </button>
        )}
      </div>

      {showConnect ? (
        <div className="cal__connect">
          <span className="cal__msg">{t('calendarConnect')}</span>
          <div className="cal__connect-row">
            <input
              className="cal__input"
              placeholder={t('calendarUrlPlaceholder')}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button className="m3chip m3chip--filled" onClick={save}>
              {t('connect')}
            </button>
          </div>
        </div>
      ) : status === 'loading' ? (
        <div className="cal">
          <span className="cal__msg">{t('loadingCalendar')}</span>
        </div>
      ) : status === 'error' ? (
        <div className="cal">
          <span className="cal__msg">{t('calendarError')}</span>
        </div>
      ) : (
        <>
          <div className="cal">
            {events.length === 0 ? (
              <span className="cal__msg">{t('noEventsToday')}</span>
            ) : (
              events.slice(0, 3).map((e, i) => {
                const st = eventStyle(e);
                return (
                  <div className="cal__event" key={`${e.start}-${i}`}>
                    <div className="cal__bar" style={{ background: st.color }} />
                    <div className="cal__event-body">
                      <div className="cal__event-title">{e.title}</div>
                      <div className="cal__event-sub">
                        <span className="mono">{timeRange(e)}</span>
                        {e.location ? ` · ${e.location}` : ''}
                      </div>
                    </div>
                    <Icon name={st.symbol} size={20} color={st.color} />
                  </div>
                );
              })
            )}
          </div>
          <div className="cal__foot">
            <span className="cal__count">{eventsToday(events.length)}</span>
            <button className="m3chip m3chip--filled" onClick={() => setEditing(true)}>
              {t('viewAll')}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
