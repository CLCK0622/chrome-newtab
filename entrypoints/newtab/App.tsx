import React, { useMemo } from 'react';
import { Greeting } from './components/Greeting';
import { Clock } from './components/Clock';
import { SearchBox } from './components/SearchBox';
import { Quote } from './components/Quote';
import { Weather } from './components/Weather';
import { UsageCard } from './components/UsageCard';
import { Calendar } from './components/Calendar';
import { QuickLinks } from './components/QuickLinks';
import { loadSettings } from './lib/settings';
import { t } from './lib/i18n';

export function App() {
  const settings = useMemo(() => loadSettings(), []);

  return (
    <main className="dashboard">
      <header className="topbar">
        <Greeting userName={settings.userName} />
        <Clock />
      </header>

      <section className="hero">
        <Quote />
        <SearchBox />
      </section>

      <section className="main">
        {/* 顶排五等分：天气(1) | Claude(1) | Codex(1) | 日历(span 2) */}
        <div className="grid-top">
          <Weather />
          <UsageCard provider="claude" title={t('claude')} />
          <UsageCard provider="codex" title={t('codex')} />
          <Calendar />
        </div>

        {/* 下方常用链接横向等分一排 */}
        <QuickLinks />
      </section>
    </main>
  );
}
