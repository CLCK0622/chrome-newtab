import React, { useEffect, useState } from 'react';

function greetingFor(hour: number): string {
  if (hour < 12) return 'Good morning,';
  if (hour < 18) return 'Good afternoon,';
  return 'Good evening,';
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
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <h1 className="greeting__hello">
        {greetingFor(now.getHours())}
        <br />
        <span className="greeting__name">{userName}</span>
      </h1>
      <div className="greeting__date">{formatDate(now)}</div>
    </div>
  );
}
