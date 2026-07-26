import React, { useMemo, memo } from 'react';
const START_DATE = '2026-07-27';
const END_DATE   = '2026-10-24';
const TOTAL_DAYS  = 90;
const MS_PER_DAY  = 24 * 60 * 60 * 1000;

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Fix #5: precompute all 90 date keys once at module level — never recomputed
const DATE_KEYS = Array.from({ length: TOTAL_DAYS }, (_, i) => {
  const d = new Date(`${START_DATE}T00:00:00`);
  d.setDate(d.getDate() + i);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
});

function getDayNumber(today) {
  const start = new Date(`${START_DATE}T00:00:00`);
  const cur   = new Date(`${today}T00:00:00`);
  return Math.min(TOTAL_DAYS, Math.max(1, Math.floor((cur - start) / MS_PER_DAY) + 1));
}

// Fix #4: memo so grid only re-renders when logs change
const MissionBoard = memo(function MissionBoard({ logs = [], compact = false }) {
  const today = useMemo(() => todayKey(), []);

  // Fix #5: all derived values memoized together in one pass
  const { doneDays, dayNumber, completedCount, missedCount, successRate } = useMemo(() => {
    const done   = new Set(logs.filter(l => (l.score || 0) >= 80).map(l => l.dateKey));
    const logged = new Set(logs.map(l => l.dateKey));
    const dn     = getDayNumber(today);
    const cc     = DATE_KEYS.filter(k => k <= today && k >= START_DATE && done.has(k)).length;
    const mc     = DATE_KEYS.slice(0, Math.max(0, dn - 1))
                            .filter(k => k < today && !done.has(k) && logged.has(k)).length;
    return {
      doneDays:       done,
      dayNumber:      dn,
      completedCount: cc,
      missedCount:    mc,
      successRate:    Math.round((cc / Math.max(1, dn)) * 100)
    };
  }, [logs, today]);

  return (
    <section className={`mission-board ${compact ? 'compact-mission' : 'full-mission'}`}>
      <div className="mission-topline">
       <span>START: 27 JULY</span>
<span>END: 24 OCT 2026</span>
      </div>

      <div className="mission-panel dashboard-card">
        <div className="mission-header-row">
          <div>
            <div className="mission-title">{compact ? '90-Day Mission' : '90 Days Streak Board'}</div>
            <div className="mission-sub">80+ score = day counted. No fake progress.</div>
          </div>
          <div className="mission-day-pill">Day {dayNumber}/90</div>
        </div>

        {!compact && (
          <div className="mission-stats-grid">
            <div className="mission-stat"><span>{completedCount}</span><p>Locked days</p></div>
            <div className="mission-stat"><span>{missedCount}</span><p>Missed days</p></div>
            <div className="mission-stat"><span>{successRate}%</span><p>Success rate</p></div>
            <div className="mission-stat"><span>{TOTAL_DAYS - completedCount}</span><p>Left</p></div>
          </div>
        )}

        <div className={`mission-grid ${compact ? 'mini-grid' : ''}`} aria-label="90 day streak board">
          {DATE_KEYS.map(key => {
            const isDone  = doneDays.has(key);
            const isToday = key === today;
            const isPast  = key < today;
            return (
              <div
                key={key}
                className={`mission-cell ${isDone ? 'done' : ''} ${isToday ? 'today' : ''} ${isPast && !isDone ? 'missed' : ''}`}
                title={`${key}${isDone ? ' ✓' : isToday ? ' today' : ''}`}
              >
                {!compact && isDone ? '✓' : ''}
              </div>
            );
          })}
        </div>

        <div className="mission-footer">
          <span>{completedCount}/90 locked</span>
          <span>{TOTAL_DAYS - completedCount} left</span>
        </div>
      </div>
    </section>
  );
});

export default MissionBoard;
