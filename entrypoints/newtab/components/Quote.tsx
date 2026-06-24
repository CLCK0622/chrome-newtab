import React, { useMemo } from 'react';
import { quoteOfTheDay } from '../lib/quotes';

export function Quote() {
  const q = useMemo(() => quoteOfTheDay(), []);
  return (
    <div className="quote">
      <div className="quote__text">“{q.text}”</div>
      <div className="quote__author">{q.author}</div>
    </div>
  );
}
