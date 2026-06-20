import React from 'react';

interface CardProps {
  title?: string;
  /** 网格跨列数（fit-to-viewport grid 用） */
  span?: 1 | 2;
  /** 右上角辅助操作/状态 */
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function Card({ title, span = 1, aside, className, children }: CardProps) {
  return (
    <section
      className={`card${span === 2 ? ' card--wide' : ''}${className ? ` ${className}` : ''}`}
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
