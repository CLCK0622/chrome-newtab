import React from 'react';

interface CardProps {
  title?: string;
  /** 在网格中横跨的列数（默认 1） */
  span?: 1 | 2;
  /** 右上角辅助操作/状态 */
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function Card({ title, span = 1, aside, className, children }: CardProps) {
  return (
    <section
      className={`card${span === 2 ? ' card--span2' : ''}${className ? ` ${className}` : ''}`}
    >
      {(title || aside) && (
        <header className="card__head">
          {title && <h2 className="card__title">{title}</h2>}
          {aside && <div className="card__aside">{aside}</div>}
        </header>
      )}
      <div className="card__body">{children}</div>
    </section>
  );
}
