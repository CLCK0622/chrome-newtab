import React, { useEffect, useState } from 'react';
import { Card } from './Card';
import {
  calendarProvider,
  getCalendarUrl,
  setCalendarUrl,
  type CalendarEvent,
} from '../lib/calendar';
import { t } from '../lib/i18n';

type Status = 'loading' | 'unconfigured' | 'ready' | 'error';

function timeLabel(e: CalendarEvent): string {
  if (e.allDay) return t('allDay');
  const d = new Date(e.start);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
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

  return (
    <Card
      span={2}
      title={t('calendar')}
      aside={
        configured ? (
          <button className="link-btn" onClick={() => setEditing((v) => !v)}>
            {t('change')}
          </button>
        ) : null
      }
    >
      {editing || status === 'unconfigured' ? (
        <div className="calendar__connect">
          <p className="muted small">{t('calendarConnect')}</p>
          <div className="calendar__connect-row">
            <input
              className="text-input"
              placeholder={t('calendarUrlPlaceholder')}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button className="link-btn" onClick={save}>
              {t('connect')}
            </button>
          </div>
        </div>
      ) : status === 'loading' ? (
        <p className="muted">{t('loadingCalendar')}</p>
      ) : status === 'error' ? (
        <p className="muted">{t('calendarError')}</p>
      ) : events.length === 0 ? (
        <p className="muted">{t('noEventsToday')}</p>
      ) : (
        <ul className="agenda">
          {events.map((e, i) => (
            <li key={`${e.start}-${i}`} className="agenda__item">
              <span className="agenda__time">{timeLabel(e)}</span>
              <span className="agenda__body">
                <span className="agenda__title">{e.title}</span>
                {e.location && (
                  <span className="agenda__loc muted small">{e.location}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
