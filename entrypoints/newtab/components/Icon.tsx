import React from 'react';

// Material Symbols Rounded 图标。name 为 symbol 名（ligature），字体本地打包。
export function Icon({
  name,
  size = 24,
  color,
  fill = false,
  className,
  style,
}: {
  name: string;
  size?: number;
  color?: string;
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`msr${className ? ` ${className}` : ''}`}
      aria-hidden="true"
      style={{
        fontSize: size,
        color,
        fontVariationSettings: fill ? "'FILL' 1" : undefined,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
