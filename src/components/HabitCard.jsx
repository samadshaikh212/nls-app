import React, { useRef, memo } from 'react';

// Fix #4: memo so this only re-renders when its own props change
const HabitCard = memo(function HabitCard({
  habit,
  completed,
  onToggle,
  isFriday,
  warned = false,
  escalated = false,
  disabled = false,
  isLate = false
}) {
  const cardRef = useRef(null);

  let label = habit.label;
  let urdu  = habit.urdu;
  if (habit.id === 'zohar' && isFriday) {
    label = habit.fridayLabel || 'Jumma';
    urdu  = habit.fridayUrdu  || 'جمعہ';
  }

  function handleClick(e) {
    if (disabled) return;
    // Ripple
    const card = cardRef.current;
    if (card) {
      const rect = card.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
      card.appendChild(ripple);
      setTimeout(() => ripple.remove(), 400);
    }
    onToggle(habit.id);
  }

  let className = 'habit-card';
  if (completed)          className += ' completed';
  if (habit.critical)     className += ' critical-habit';
  if (escalated)          className += ' escalated';
  else if (warned)        className += ' warned';
  if (disabled)           className += ' disabled';

  return (
    <div
      ref={cardRef}
      className={className}
      onClick={handleClick}
      style={disabled ? { opacity: 0.4, cursor: 'default' } : undefined}
    >
      <div className="check-ring">
        <span className="check-mark">✓</span>
      </div>

      <div className="habit-info">
        <div className="habit-label">{label}</div>
        <div className="habit-urdu">{urdu}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
        {habit.critical && !completed && (
          <span className="habit-badge badge-critical">Critical</span>
        )}
        {habit.hasDSAModal && completed && (
          <span className="habit-badge badge-dsa">+Topic</span>
        )}
        {isLate && !completed && (
          <span className="habit-badge badge-late">Late</span>
        )}
        {escalated && <span style={{ fontSize: 16 }}>🔴</span>}
        {warned && !escalated && <span style={{ fontSize: 16 }}>⚠️</span>}
      </div>
    </div>
  );
});

export default HabitCard;
