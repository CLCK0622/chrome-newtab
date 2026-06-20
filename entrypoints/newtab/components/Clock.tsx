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
      <div className="clock__time">
        <span>{pad(now.getHours())}</span>
        <span className="clock__colon">:</span>
        <span>{pad(now.getMinutes())}</span>
        <span className="clock__seconds">{pad(now.getSeconds())}</span>
      </div>
    </div>
  );
}
