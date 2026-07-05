import React from 'react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getDateStr() {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function getScoreColor(score) {
  if (score >= 80) return '#30D158';
  if (score >= 60) return '#007AFF';
  if (score >= 40) return '#FF9F0A';
  return '#FF453A';
}

export default function Header({ score, cap, doneCount, totalHabits, onShutdown }) {
  const pct = totalHabits > 0 ? (doneCount / totalHabits) * 100 : 0;
  const color = getScoreColor(score);

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-brand">N<span>LS</span></div>
        <button
          onClick={onShutdown}
          style={{
            background: 'var(--surface3)',
            border: 'none',
            borderRadius: '8px',
            color: 'var(--text3)',
            fontSize: '12px',
            padding: '5px 10px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: '500'
          }}
        >
          Shutdown 🌙
        </button>
      </div>
      <div className="header-date">{getDateStr()}</div>

      <div className="score-row">
        <div className="score-num" style={{ color }}>{score}</div>
        <div className="score-max">/ 100</div>
        {cap < 100 && (
          <div className="score-cap-badge">Cap: {cap}</div>
        )}
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}dd)` }}
        />
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 6,
        fontSize: 12,
        color: 'var(--text3)'
      }}>
        <span>{doneCount} / {totalHabits} habits</span>
        <span>{Math.round(pct)}%</span>
      </div>
    </header>
  );
}
