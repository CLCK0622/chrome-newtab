import React, { useEffect, useRef, useState } from 'react';
import { t } from '../lib/i18n';

function looksLikeUrl(s: string): boolean {
  const t = s.trim();
  if (/\s/.test(t)) return false;
  if (/^https?:\/\//i.test(t)) return true;
  // 形如 example.com / sub.domain.io/path
  return /^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(t);
}

export function SearchBox() {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // 打开新标签页即聚焦
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    if (looksLikeUrl(q)) {
      const url = /^https?:\/\//i.test(q) ? q : `https://${q}`;
      window.location.href = url;
    } else {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
    }
  }

  return (
    <form className="search" onSubmit={submit} role="search">
      <span className="search__icon" aria-hidden>
        ⌕
      </span>
      <input
        ref={inputRef}
        className="search__input"
        type="text"
        placeholder={t('searchPlaceholder')}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label={t('searchPlaceholder')}
        autoComplete="off"
        spellCheck={false}
      />
    </form>
  );
}
