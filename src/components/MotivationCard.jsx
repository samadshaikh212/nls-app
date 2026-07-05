import React, { useMemo } from 'react';

const SLAPS = [
  'No 15h work = no 12 LPA dream.',
  'Today decides whether you are serious or just noisy.',
  'DSA skipped today becomes rejection tomorrow.',
  'Small comfort now, big regret later. Pick one.',
  'Your future does not care about your mood.',
  'One clean day beats ten motivational screenshots.',
  'Do the boring work. That is the cheat code.'
];

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  return Math.floor(diff / 86400000);
}

export default function MotivationCard({ score = 0, totalHours = 0 }) {
  const slap = useMemo(() => SLAPS[getDayOfYear() % SLAPS.length], []);
  const status = totalHours >= 15 ? 'Locked' : score >= 80 ? 'Strong' : 'Not enough';

  return (
    <section className="motivation-card dashboard-card">
      <div className="motivation-kicker">Today’s slap</div>
      <div className="motivation-line">{slap}</div>
      <div className="motivation-meta">
        <span>{status}</span>
        <span>{totalHours}/15h tracked</span>
      </div>
    </section>
  );
}
