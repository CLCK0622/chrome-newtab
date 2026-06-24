import React, { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { t } from '../lib/i18n';

function looksLikeUrl(s: string): boolean {
  const t = s.trim();
  if (/\s/.test(t)) return false;
  if (/^https?:\/\//i.test(t)) return true;
  return /^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(t);
}

export function SearchBox() {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    if (looksLikeUrl(q)) {
      window.location.href = /^https?:\/\//i.test(q) ? q : `https://${q}`;
    } else {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
    }
  }

  return (
    <form className="realbox" onSubmit={submit} role="search">
      <Icon name="search" size={24} color="var(--blue)" />
      <input
        ref={inputRef}
        className="realbox__input"
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
