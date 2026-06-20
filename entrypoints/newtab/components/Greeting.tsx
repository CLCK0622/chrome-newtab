import React, { useEffect, useState } from 'react';

function greetingFor(hour: number): string {
  if (hour < 5) return 'Good Night';
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

function formatDate(d: Date): string {
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 · ${WEEKDAYS[d.getDay()]}`;
}

export function Greeting({ userName }: { userName: string }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // 每分钟刷新一次足够（问候/日期都是分钟级粒度）
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="greeting">
      <h1 className="greeting__hello">
        {greetingFor(now.getHours())},<br />
        <span className="greeting__name">{userName}</span>
      </h1>
      <p className="greeting__date">{formatDate(now)}</p>
    </div>
  );
}
