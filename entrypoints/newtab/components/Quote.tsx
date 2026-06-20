import React, { useMemo } from 'react';
import { quoteOfTheDay } from '../lib/quotes';

export function Quote() {
  const q = useMemo(() => quoteOfTheDay(), []);
  return (
    <figure className="quote">
      <blockquote className="quote__text">{q.text}</blockquote>
      <figcaption className="quote__author">— {q.author}</figcaption>
    </figure>
  );
}
