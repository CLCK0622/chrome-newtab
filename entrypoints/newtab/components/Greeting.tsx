import React, { useEffect, useState } from 'react';

function greetingFor(hour: number): string {
  if (hour < 5) return 'Good Night';
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
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
