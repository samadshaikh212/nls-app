import React, { useMemo, useState, memo, useCallback } from 'react';

const SKILL_BLOCKS = [
  { id: 'dsa',         label: 'DSA',          target: 5, note: 'Morning 4 hrs + 1 hr revision/video', color: 'var(--accent)' },
  { id: 'core',        label: 'Core',          target: 5, note: 'CN · OOP · DBMS · Apti · Puzzles',   color: 'var(--orange)' },
  { id: 'devAnalytics',label: 'Dev / Analytics',target: 5, note: 'Build · SQL · dashboard · output',  color: 'var(--green)' }
];

const DAILY_ITEMS = [
  { id: 'namaz_astaghfar', label: '5 Namaz + Tahajjud + 100 Astaghfar' },
  { id: 'linkedin',        label: 'LinkedIn post'                       },
  { id: 'walk_10',         label: '10–15 min walk'                      }
];

const MOVE_LABELS = ['Must finish', 'Should finish', 'Bonus'];

function clampHour(v) { return Math.max(0, Math.min(5, Number(v) || 0)); }

// Fix #4: memo — only re-renders when its own block value changes
const SkillHourBlock = memo(function SkillHourBlock({ block, value = 0, onSetHours }) {
  const percent = Math.min(100, (value / block.target) * 100);
  return (
    <div className="skill-hour-card">
      <div className="skill-hour-top">
        <div>
          <div className="skill-hour-label">{block.label}</div>
          <div className="skill-hour-note">{block.note}</div>
        </div>
        <div className="skill-hour-count">{value}/{block.target}h</div>
      </div>

      <div className="hour-progress-track">
        <div className="hour-progress-fill" style={{ width: `${percent}%`, background: block.color }} />
      </div>

      <div className="hour-chips" aria-label={`${block.label} hour tracker`}>
        {[0, 1, 2, 3, 4, 5].map(hour => (
          <button
            key={hour}
            type="button"
            className={`hour-chip ${value === hour ? 'active' : ''}`}
            onClick={() => onSetHours(block.id, hour)}
          >
            {hour}h
          </button>
        ))}
      </div>
    </div>
  );
});

export default function DailyFocus({
  focusDone = [],
  todos = [],
  skillHours = {},
  onToggleFocus,
  onSetSkillHours,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onEditTodo,
  onResetTodos,
  onResetFocus
}) {
  const [text, setText]           = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText]   = useState('');

  const totalHours = useMemo(
    () => SKILL_BLOCKS.reduce((s, b) => s + clampHour(skillHours[b.id]), 0),
    [skillHours]
  );

  const templateDoneCount = DAILY_ITEMS.filter(i => focusDone.includes(i.id)).length;
  const lockedSkillBlocks  = SKILL_BLOCKS.filter(b => clampHour(skillHours[b.id]) >= b.target).length;
  const maxedMoves         = todos.slice(0, 3);
  const canAddMove         = maxedMoves.length < 3;

  // Fix: removed <form> — use button onClick instead
  function handleAddClick() {
    const clean = text.trim();
    if (!clean || !canAddMove) return;
    onAddTodo(clean);
    setText('');
  }

  function handleInputKey(e) {
    if (e.key === 'Enter') handleAddClick();
  }

  function startEdit(todo) { setEditingId(todo.id); setEditText(todo.text); }
  function cancelEdit()    { setEditingId(null); setEditText(''); }
  function saveEdit(id)    {
    const clean = editText.trim();
    if (!clean) return;
    onEditTodo(id, clean);
    cancelEdit();
  }

  return (
    <section className="focus-section dashboard-card focus-dashboard-card">
      <div className="category-header focus-header">
        <div className="cat-dot" style={{ background: 'var(--yellow)' }} />
        <div className="cat-label">15h War Plan</div>
        <div className="cat-progress">{totalHours}/15h</div>
      </div>

      <div className="focus-note compact-note">
        <b>Track hours, not fake checkmarks.</b> 5 DSA · 5 Core · 5 Dev/Analytics.
      </div>

      <div className="skill-hour-grid">
        {SKILL_BLOCKS.map(block => (
          <SkillHourBlock
            key={block.id}
            block={block}
            value={clampHour(skillHours[block.id])}
            onSetHours={onSetSkillHours}
          />
        ))}
      </div>

      <div className="focus-subgrid">
        {/* Daily Locks */}
        <div className="daily-lock-card">
          <div className="mini-card-head">
            <span>Daily Locks</span>
            <span>{templateDoneCount}/{DAILY_ITEMS.length}</span>
          </div>
          <div className="focus-list compact-focus-list">
            {DAILY_ITEMS.map(item => (
              <button
                key={item.id}
                type="button"
                className={`focus-item ${focusDone.includes(item.id) ? 'completed' : ''}`}
                onClick={() => onToggleFocus(item.id)}
              >
                <span className="focus-check">✓</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <button className="reset-mini-btn" type="button" onClick={onResetFocus}>
            Reset template
          </button>
        </div>

        {/* Today's 3 Moves — no <form>, uses onClick */}
        <div className="todo-card today-moves-card">
          <div className="mini-card-head todo-head-row">
            <span>Today's 3 Moves</span>
            <span>{maxedMoves.filter(t => t.done).length}/3</span>
          </div>

          <div className="todo-form">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleInputKey}
              placeholder={canAddMove
                ? `Add ${MOVE_LABELS[maxedMoves.length].toLowerCase()}...`
                : '3 moves locked. Finish first.'}
              maxLength={90}
              disabled={!canAddMove}
            />
            <button type="button" onClick={handleAddClick} disabled={!canAddMove}>Add</button>
          </div>

          {maxedMoves.length === 0 ? (
            <div className="todo-empty">Add only 3 tasks. More is noise.</div>
          ) : (
            <div className="todo-list">
              {maxedMoves.map((todo, index) => (
                <div key={todo.id} className={`todo-row move-row ${todo.done ? 'completed' : ''}`}>
                  <button className="todo-check" type="button" onClick={() => onToggleTodo(todo.id)}>✓</button>
                  <div className="move-content">
                    <div className="move-label">{MOVE_LABELS[index]}</div>
                    {editingId === todo.id ? (
                      <div className="todo-edit-line">
                        <input
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveEdit(todo.id)}
                          maxLength={90}
                          autoFocus
                        />
                        <button type="button" onClick={() => saveEdit(todo.id)}>Save</button>
                        <button type="button" onClick={cancelEdit}>Cancel</button>
                      </div>
                    ) : (
                      <span>{todo.text}</span>
                    )}
                  </div>
                  {editingId !== todo.id && (
                    <div className="todo-actions">
                      <button className="todo-edit" type="button" onClick={() => startEdit(todo)}>Edit</button>
                      <button className="todo-delete" type="button" onClick={() => onDeleteTodo(todo.id)}>×</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <button className="reset-mini-btn danger-lite" type="button" onClick={onResetTodos}>
            Reset moves
          </button>
        </div>
      </div>

      <div className="focus-summary-strip">
        <span>{lockedSkillBlocks}/3 skill blocks locked</span>
        <span>{templateDoneCount}/3 daily locks</span>
        <span>{maxedMoves.filter(t => t.done).length}/3 moves done</span>
      </div>
    </section>
  );
}
