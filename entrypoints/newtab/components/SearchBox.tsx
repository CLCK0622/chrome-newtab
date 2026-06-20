import React, { useEffect, useRef, useState } from 'react';

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
        placeholder="搜索，或输入网址直达…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="搜索或输入网址"
        autoComplete="off"
        spellCheck={false}
      />
    </form>
  );
}
