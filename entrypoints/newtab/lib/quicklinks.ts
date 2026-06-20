// 常用链接（Quick Links）数据层 —— 用户可编辑，存 chrome.storage.local（localStorage 兜底）。
// 取代了 v1 的 chrome.bookmarks 自动读取，权限面随之收窄。

import { storageGet, storageSet } from './storage';

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  /** 可选自定义图标 URL；留空则按域名自动取 favicon */
  icon?: string;
}

const KEY = 'newtab.quicklinks.v1';

// 首次使用的种子链接，避免空白。
const DEFAULTS: QuickLink[] = [
  { id: 'gmail', title: 'Gmail', url: 'https://mail.google.com' },
  { id: 'calendar', title: 'Calendar', url: 'https://calendar.google.com' },
  { id: 'github', title: 'GitHub', url: 'https://github.com' },
  { id: 'youtube', title: 'YouTube', url: 'https://youtube.com' },
  { id: 'maps', title: 'Maps', url: 'https://maps.google.com' },
];

export async function loadQuickLinks(): Promise<QuickLink[]> {
  const links = await storageGet<QuickLink[]>(KEY, DEFAULTS);
  return Array.isArray(links) ? links : DEFAULTS;
}

export async function saveQuickLinks(links: QuickLink[]): Promise<void> {
  await storageSet(KEY, links);
}

// 简易 id 生成：单调计数器 + 高精度时钟，避免同毫秒碰撞（无需 crypto）。
let seq = 0;
export function newId(): string {
  seq += 1;
  return `ql-${Math.floor(performance.now()).toString(36)}-${seq}`;
}

export function faviconFor(url: string, custom?: string): string {
  if (custom) return custom;
  try {
    const u = new URL(normalizeUrl(url));
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
  } catch {
    return '';
  }
}

// 用户可能只填 "github.com"，补全协议。
export function normalizeUrl(url: string): string {
  const t = url.trim();
  if (!t) return t;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}
