import React, { useMemo } from 'react';
import { Greeting } from './components/Greeting';
import { Clock } from './components/Clock';
import { SearchBox } from './components/SearchBox';
import { Quote } from './components/Quote';
import { Weather } from './components/Weather';
import { Usage } from './components/Usage';
import { Bookmarks } from './components/Bookmarks';
import { loadSettings } from './lib/settings';

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

      <section className="grid">
        <Weather />
        <Usage />
        <Bookmarks />
      </section>
    </main>
  );
}
