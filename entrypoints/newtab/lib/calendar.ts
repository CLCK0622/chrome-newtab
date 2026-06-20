// 日历数据层 —— 仿 UsageProvider 的 CalendarProvider 约定。
// v2 优先实现 iCal secret-URL 路径：fetch .ics + 客户端解析，无需 Google OAuth。
// 凭据（私密 .ics 地址）由用户粘贴并存本地 storage；未配置时返回 source:'unconfigured'。
// OAuth（chrome.identity + calendar.readonly）作为后续重路径预留，接口不变。

import { storageGet, storageSet } from './storage';

export interface CalendarEvent {
  start: string; // ISO
  end: string; // ISO
  title: string;
  allDay: boolean;
  location?: string;
}

export interface CalendarSnapshot {
  events: CalendarEvent[];
  /** 'unconfigured' | 'ical' | 'oauth' | 'mock' */
  source: string;
}

export interface CalendarProvider {
  getEvents(): Promise<CalendarSnapshot>;
}

const URL_KEY = 'newtab.calendar.icalUrl.v1';

export async function getCalendarUrl(): Promise<string> {
  return storageGet<string>(URL_KEY, '');
}

export async function setCalendarUrl(url: string): Promise<void> {
  await storageSet(URL_KEY, url.trim());
}

// —— 极简 ICS 解析 ——
// 处理 RFC5545 折行（续行以空格/制表符开头），抽取 VEVENT 的
// DTSTART / DTEND / SUMMARY / LOCATION，区分 all-day(DATE) 与定时(DATE-TIME)。
function unfold(ics: string): string[] {
  const rawLines = ics.replace(/\r\n/g, '\n').split('\n');
  const lines: string[] = [];
  for (const line of rawLines) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && lines.length > 0) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
  }
  return lines;
}

function parseIcsDate(value: string, params: string): { iso: string; allDay: boolean } {
  // params 形如 ";VALUE=DATE" 或 ";TZID=America/Los_Angeles"
  const isDateOnly = /VALUE=DATE(?!-TIME)/i.test(params) || /^\d{8}$/.test(value);
  if (isDateOnly) {
    const y = +value.slice(0, 4);
    const m = +value.slice(4, 6);
    const d = +value.slice(6, 8);
    return { iso: new Date(y, m - 1, d).toISOString(), allDay: true };
  }
  // DATE-TIME: 20240131T180000 或 ...Z（UTC）
  const m = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if (!m) {
    const t = Date.parse(value);
    return { iso: isNaN(t) ? new Date(0).toISOString() : new Date(t).toISOString(), allDay: false };
  }
  const [, y, mo, d, h, mi, s, z] = m;
  if (z) {
    return {
      iso: new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s)).toISOString(),
      allDay: false,
    };
  }
  // 无 Z：按本地时区解释（floating / TZID 简化处理）
  return { iso: new Date(+y, +mo - 1, +d, +h, +mi, +s).toISOString(), allDay: false };
}

export function parseIcs(ics: string): CalendarEvent[] {
  const lines = unfold(ics);
  const events: CalendarEvent[] = [];
  let cur: Partial<CalendarEvent> | null = null;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      cur = { allDay: false };
      continue;
    }
    if (line === 'END:VEVENT') {
      if (cur && cur.start && cur.title) {
        events.push({
          start: cur.start,
          end: cur.end ?? cur.start,
          title: cur.title,
          allDay: !!cur.allDay,
          location: cur.location,
        });
      }
      cur = null;
      continue;
    }
    if (!cur) continue;

    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const left = line.slice(0, idx);
    const value = line.slice(idx + 1);
    const semi = left.indexOf(';');
    const name = (semi === -1 ? left : left.slice(0, semi)).toUpperCase();
    const params = semi === -1 ? '' : left.slice(semi);

    if (name === 'DTSTART') {
      const p = parseIcsDate(value, params);
      cur.start = p.iso;
      cur.allDay = p.allDay;
    } else if (name === 'DTEND') {
      cur.end = parseIcsDate(value, params).iso;
    } else if (name === 'SUMMARY') {
      cur.title = unescapeIcs(value);
    } else if (name === 'LOCATION') {
      cur.location = unescapeIcs(value);
    }
  }
  return events;
}

function unescapeIcs(v: string): string {
  return v
    .replace(/\\n/gi, ' ')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

export function eventsForToday(events: CalendarEvent[], now = new Date()): CalendarEvent[] {
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayEnd = dayStart + 86_400_000;
  return events
    .filter((e) => {
      const s = Date.parse(e.start);
      const end = Date.parse(e.end);
      // 与今日 [00:00, 24:00) 有交叠
      return end > dayStart && s < dayEnd;
    })
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
}

// —— iCal provider ——
export const icalCalendarProvider: CalendarProvider = {
  async getEvents(): Promise<CalendarSnapshot> {
    const url = await getCalendarUrl();
    if (!url) return { events: [], source: 'unconfigured' };
    // 私密 webcal:// 地址统一成 https
    const httpUrl = url.replace(/^webcal:\/\//i, 'https://');
    const res = await fetch(httpUrl);
    if (!res.ok) throw new Error(`iCal ${res.status}`);
    const text = await res.text();
    return { events: eventsForToday(parseIcs(text)), source: 'ical' };
  },
};

/** 当前生效的 provider。后续接 OAuth 时换这一行即可。 */
export const calendarProvider: CalendarProvider = icalCalendarProvider;
