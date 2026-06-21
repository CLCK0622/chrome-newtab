import React, { useEffect, useState } from 'react';
import { Card } from './Card';
import {
  faviconFor,
  loadQuickLinks,
  newId,
  normalizeUrl,
  saveQuickLinks,
  type QuickLink,
} from '../lib/quicklinks';
import { t } from '../lib/i18n';

// favicon 取不到时回退到标题首字母。
function LinkIcon({ link }: { link: QuickLink }) {
  const [broken, setBroken] = useState(false);
  const src = faviconFor(link.url, link.icon);
  if (broken || !src) {
    const letter = (link.title || link.url).trim().charAt(0).toUpperCase() || '?';
    return (
      <span className="ql__letter" aria-hidden>
        {letter}
      </span>
    );
  }
  return (
    <img
      className="ql__favicon"
      src={src}
      alt=""
      width={32}
      height={32}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}

interface DraftProps {
  initial: { title: string; url: string };
  onSave: (v: { title: string; url: string }) => void;
  onCancel: () => void;
}

function LinkDraft({ initial, onSave, onCancel }: DraftProps) {
  const [title, setTitle] = useState(initial.title);
  const [url, setUrl] = useState(initial.url);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    onSave({ title: title.trim() || url.trim(), url: url.trim() });
  }

  return (
    <form className="ql__draft" onSubmit={submit}>
      <input
        className="text-input"
        placeholder={t('titleField')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <input
        className="text-input"
        placeholder={t('urlField')}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <div className="ql__draft-actions">
        <button type="submit" className="link-btn">
          {t('save')}
        </button>
        <button type="button" className="link-btn muted" onClick={onCancel}>
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}

export function QuickLinks() {
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
    <Card
      title={t('quickLinks')}
      className="card--quicklinks"
      aside={
        <button className="link-btn" onClick={() => setEditing((v) => !v)}>
          {editing ? t('save') : t('editLink')}
        </button>
      }
    >
      {!loaded ? (
        <p className="muted">{t('loading')}</p>
      ) : (
        <div className="ql">
          {links.map((link) => (
            <div className="ql__item" key={link.id}>
              {editId === link.id ? (
                <LinkDraft
                  initial={{ title: link.title, url: link.url }}
                  onSave={(v) => update(link.id, v)}
                  onCancel={() => setEditId(null)}
                />
              ) : (
                <>
                  <a className="ql__link" href={normalizeUrl(link.url)} title={link.title}>
                    <LinkIcon link={link} />
                    <span className="ql__label">{link.title}</span>
                  </a>
                  {editing && (
                    <div className="ql__tools">
                      <button
                        className="ql__tool"
                        title={t('moveLeft')}
                        onClick={() => move(link.id, -1)}
                      >
                        ‹
                      </button>
                      <button
                        className="ql__tool"
                        title={t('editLink')}
                        onClick={() => setEditId(link.id)}
                      >
                        ✎
                      </button>
                      <button
                        className="ql__tool"
                        title={t('deleteLink')}
                        onClick={() => remove(link.id)}
                      >
                        ✕
                      </button>
                      <button
                        className="ql__tool"
                        title={t('moveRight')}
                        onClick={() => move(link.id, 1)}
                      >
                        ›
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {adding ? (
            <div className="ql__item">
              <LinkDraft
                initial={{ title: '', url: '' }}
                onSave={add}
                onCancel={() => setAdding(false)}
              />
            </div>
          ) : (
            <button
              className="ql__add"
              onClick={() => setAdding(true)}
              title={t('addLink')}
            >
              <span className="ql__add-plus">+</span>
              <span className="ql__label muted">{t('addLink')}</span>
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
