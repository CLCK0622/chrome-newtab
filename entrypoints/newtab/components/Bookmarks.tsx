import React, { useEffect, useState } from 'react';
import { Card } from './Card';
import {
  bookmarksAvailable,
  loadBookmarkGroups,
  type BookmarkGroup,
} from '../lib/bookmarks';

function faviconFor(url: string): string {
  try {
    const u = new URL(url);
    // chrome://favicon 在 MV3 受限，用 Google s2 服务做轻量回退。
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=32`;
  } catch {
    return '';
  }
}

export function Bookmarks() {
  const [groups, setGroups] = useState<BookmarkGroup[] | null>(null);
  const [available] = useState(() => bookmarksAvailable());

  useEffect(() => {
    if (!available) return;
    loadBookmarkGroups()
      .then(setGroups)
      .catch(() => setGroups([]));
  }, [available]);

  return (
    <Card title="书签" span={2}>
      {!available && (
        <p className="muted">
          书签需要在扩展环境中运行（chrome://extensions 加载未打包后于新标签页查看）。
        </p>
      )}
      {available && !groups && <p className="muted">加载书签…</p>}
      {available && groups && groups.length === 0 && (
        <p className="muted">还没有书签。</p>
      )}
      {available && groups && groups.length > 0 && (
        <div className="bookmarks">
          {groups.map((g, gi) => (
            <div className="bookmarks__group" key={`${g.folder}-${gi}`}>
              <h3 className="bookmarks__folder">{g.folder}</h3>
              <ul className="bookmarks__list">
                {g.links.map((link, li) => (
                  <li key={`${link.url}-${li}`}>
                    <a className="bookmarks__link" href={link.url} title={link.title}>
                      <img
                        className="bookmarks__favicon"
                        src={faviconFor(link.url)}
                        alt=""
                        loading="lazy"
                        width={16}
                        height={16}
                      />
                      <span className="bookmarks__label">{link.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
