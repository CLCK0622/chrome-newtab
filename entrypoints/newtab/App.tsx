import React, { useMemo } from 'react';
import { Greeting } from './components/Greeting';
import { Clock } from './components/Clock';
import { SearchBox } from './components/SearchBox';
import { Quote } from './components/Quote';
import { Weather } from './components/Weather';
import { UsageCard } from './components/UsageCard';
import { Calendar } from './components/Calendar';
import { Shortcuts } from './components/Shortcuts';
import { loadSettings } from './lib/settings';
import { t } from './lib/i18n';

export function App() {
  const settings = useMemo(() => loadSettings(), []);

  return (
    <main className="dashboard">
      <div className="container">
        <header className="topbar">
          <Greeting userName={settings.userName} />
          <Clock />
        </header>

        <section className="hero">
          <Quote />
          <SearchBox />
        </section>

        {/* 顶排：天气(1) | Claude(1) | Codex(1) | 日历(1.4) */}
        <section className="grid">
          <Weather />
          <UsageCard provider="claude" title={t('claude')} />
          <UsageCard provider="codex" title={t('codex')} />
          <Calendar />
        </section>

        <Shortcuts />
      </div>
    </main>
  );
}
