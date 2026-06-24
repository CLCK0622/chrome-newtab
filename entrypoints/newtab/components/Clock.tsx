import React, { useEffect, useState } from 'react';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="clock">
      <span className="clock__d">{pad(now.getHours())}</span>
      <span className="clock__colon">:</span>
      <span className="clock__d">{pad(now.getMinutes())}</span>
      <sup className="clock__sec">{pad(now.getSeconds())}</sup>
    </div>
  );
}
