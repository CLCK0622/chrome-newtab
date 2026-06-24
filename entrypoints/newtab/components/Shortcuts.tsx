import React, { useEffect, useState } from 'react';
import { Icon } from './Icon';
import {
  faviconFor,
  loadQuickLinks,
  newId,
  normalizeUrl,
  saveQuickLinks,
  type QuickLink,
} from '../lib/quicklinks';
import { t } from '../lib/i18n';

// M3 tonal 色板，按序循环分配给各快捷方式圆形。
const PALETTE = [
  { bg: '#FAD2CF', fg: '#B3261E' },
  { bg: '#DCE3FF', fg: '#3F51B5' },
  { bg: '#C6E7D9', fg: '#00696D' },
  { bg: '#FFD9E3', fg: '#984061' },
  { bg: '#FFDCC2', fg: '#B5531B' },
  { bg: '#EADDFF', fg: '#6750A4' },
];

// favicon 命中失败回退首字母（用色板前景色）。
function TileIcon({ link, fg }: { link: QuickLink; fg: string }) {
  const [broken, setBroken] = useState(false);
  const src = faviconFor(link.url, link.icon);
  if (broken || !src) {
    const letter = (link.title || link.url).trim().charAt(0).toUpperCase() || '?';
    return (
      <span className="m3circle__letter" style={{ color: fg }} aria-hidden>
        {letter}
      </span>
    );
  }
  return (
    <img
      className="m3circle__favicon"
      src={src}
      alt=""
      width={28}
      height={28}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}

function Draft({
  initial,
  onSave,
  onCancel,
}: {
  initial: { title: string; url: string };
  onSave: (v: { title: string; url: string }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial.title);
  const [url, setUrl] = useState(initial.url);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    onSave({ title: title.trim() || url.trim(), url: url.trim() });
  }
  return (
    <form className="sc-draft" onSubmit={submit}>
      <input
        placeholder={t('titleField')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <input
        placeholder={t('urlField')}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <div className="sc-draft__actions">
        <button type="submit" className="sc-draft__btn">
          {t('save')}
        </button>
        <button
          type="button"
          className="sc-draft__btn sc-draft__btn--muted"
          onClick={onCancel}
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}

export function Shortcuts() {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadQuickLinks().then((l) => {
      setLinks(l);
      setLoaded(true);
    });
  }, []);

  function persist(next: QuickLink[]) {
    setLinks(next);
    void saveQuickLinks(next);
  }
  function move(id: string, dir: -1 | 1) {
    const i = links.findIndex((l) => l.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= links.length) return;
    const next = links.slice();
    [next[i], next[j]] = [next[j], next[i]];
    persist(next);
  }
  function remove(id: string) {
    persist(links.filter((l) => l.id !== id));
  }
  function update(id: string, v: { title: string; url: string }) {
    persist(
      links.map((l) =>
        l.id === id ? { ...l, title: v.title, url: normalizeUrl(v.url) } : l,
      ),
    );
    setEditId(null);
  }
  function add(v: { title: string; url: string }) {
    persist([...links, { id: newId(), title: v.title, url: normalizeUrl(v.url) }]);
    setAdding(false);
  }

  return (
    <section className="shortcuts">
      <div className="shortcuts__head">
        <span className="shortcuts__title">{t('shortcuts')}</span>
        <button className="shortcuts__edit" onClick={() => setEditing((v) => !v)}>
          {editing ? t('save') : t('edit')}
        </button>
      </div>

      <div className="shortcuts__row">
        {loaded &&
          links.map((link, i) => {
            const c = PALETTE[i % PALETTE.length];
            if (editId === link.id) {
              return (
                <Draft
                  key={link.id}
                  initial={{ title: link.title, url: link.url }}
                  onSave={(v) => update(link.id, v)}
                  onCancel={() => setEditId(null)}
                />
              );
            }
            return (
              <a
                className="m3tile"
                key={link.id}
                href={normalizeUrl(link.url)}
                title={link.title}
              >
                {editing && (
                  <span className="m3tile__tools" onClick={(e) => e.preventDefault()}>
                    <button
                      className="m3tile__tool"
                      title={t('moveLeft')}
                      onClick={() => move(link.id, -1)}
                    >
                      ‹
                    </button>
                    <button
                      className="m3tile__tool"
                      title={t('editShortcut')}
                      onClick={() => setEditId(link.id)}
                    >
                      ✎
                    </button>
                    <button
                      className="m3tile__tool"
                      title={t('deleteShortcut')}
                      onClick={() => remove(link.id)}
                    >
                      ✕
                    </button>
                    <button
                      className="m3tile__tool"
                      title={t('moveRight')}
                      onClick={() => move(link.id, 1)}
                    >
                      ›
                    </button>
                  </span>
                )}
                <span className="m3circle" style={{ background: c.bg }}>
                  <TileIcon link={link} fg={c.fg} />
                </span>
                <span className="m3tile__label">{link.title}</span>
              </a>
            );
          })}

        {loaded &&
          (adding ? (
            <Draft initial={{ title: '', url: '' }} onSave={add} onCancel={() => setAdding(false)} />
          ) : (
            <button className="m3tile" onClick={() => setAdding(true)} title={t('addShortcut')}>
              <span className="m3circle" style={{ background: 'var(--surface-2)' }}>
                <Icon name="add" size={24} color="var(--blue)" />
              </span>
              <span className="m3tile__label">{t('addShortcut')}</span>
            </button>
          ))}
      </div>
    </section>
  );
}
