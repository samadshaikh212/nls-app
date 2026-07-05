import React, { useMemo, useState, useCallback, memo } from 'react';
import { useHabits } from './hooks/useHabits';
import { HABITS, CATEGORIES } from './features/habits/habitConfig';
import Header from './components/Header';
import HabitCard from './components/HabitCard';
import DSAModal from './components/DSAModal';
import ShutdownModal from './components/ShutdownModal';
import PreCommitModal from './components/PreCommitModal';
import Analytics from './components/Analytics';
import BottomNav from './components/BottomNav';
import MissionBoard from './components/MissionBoard';
import MissionPage from './components/MissionPage';
import DailyFocus from './components/DailyFocus';
import MotivationCard from './components/MotivationCard';
import './styles/global.css';

function getTimeWindow() {
  const h = new Date().getHours();
  if (h < 6)  return 'night';
  if (h < 12) return 'morning';
  if (h < 16) return 'afternoon';
  if (h < 20) return 'evening';
  return 'night';
}

const TIME_ORDER = ['morning', 'afternoon', 'evening', 'night'];
const CUR_WINDOW = getTimeWindow(); // computed once per page load, not per render

function isLateWindow(habitWindow) {
  return habitWindow && TIME_ORDER.indexOf(CUR_WINDOW) > TIME_ORDER.indexOf(habitWindow);
}

// Fix #4: memo + stable prop shapes so CategorySection skips re-render
// unless its specific slice of data changed
const CategorySection = memo(function CategorySection({
  categoryKey, habits, completed, isFriday, onToggle,
  warned, escalated, selectedOption
}) {
  const cat = CATEGORIES[categoryKey];

  const visibleHabits = useMemo(() => habits.filter(h => {
    if (categoryKey === 'health') return h.alwaysShow || h.id === selectedOption;
    if (categoryKey === 'output') return selectedOption ? h.id === selectedOption : true;
    return true;
  }), [habits, categoryKey, selectedOption]);

  if (visibleHabits.length === 0) return null;

  const done  = visibleHabits.filter(h => completed.includes(h.id)).length;
  const total = visibleHabits.length;

  return (
    <div className="category-section">
      <div className="category-header">
        <div className="cat-dot" style={{ background: cat.color }} />
        <div className="cat-label">{cat.label}</div>
        <div className="cat-progress">{done}/{total}</div>
      </div>
      <div className="habits-list">
        {visibleHabits.map(habit => (
          <HabitCard
            key={habit.id}
            habit={habit}
            completed={completed.includes(habit.id)}
            onToggle={onToggle}
            isFriday={isFriday}
            warned={warned.includes(habit.id)}
            escalated={escalated.includes(habit.id)}
            isLate={isLateWindow(habit.timeWindow)}
          />
        ))}
      </div>
    </div>
  );
});

// Fix #4: memo for StreakBar
const StreakBar = memo(function StreakBar({ streak, momentum, perfectStreak }) {
  return (
    <div className="streak-bar dashboard-card">
      <div className="streak-item">
        <div className="streak-val" style={{ color: streak > 0 ? 'var(--orange)' : 'var(--text3)' }}>
          {streak}🔥
        </div>
        <div className="streak-label">Streak</div>
      </div>
      <div className="streak-item">
        <div className="streak-val" style={{ color: 'var(--accent)' }}>{momentum}</div>
        <div className="streak-label">7d Momentum</div>
      </div>
      <div className="streak-item">
        <div className="streak-val" style={{ color: 'var(--green)' }}>{perfectStreak}⭐</div>
        <div className="streak-label">Perfect</div>
      </div>
    </div>
  );
});

export default function App() {
  const [tab, setTab] = useState('today');
  const h = useHabits();

  // Fix #5: memoize totalSkillHours so MotivationCard doesn't re-render on unrelated changes
  const totalSkillHours = useMemo(() => {
    const hrs = h.skillHours || {};
    return (Number(hrs.dsa) || 0) + (Number(hrs.core) || 0) + (Number(hrs.devAnalytics) || 0);
  }, [h.skillHours]);

  // Fix #4: Stable references for warned/escalated arrays so memo comparisons work
  const { warned, escalated } = h.missedHabits;

  if (h.loading) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
        <div style={{ color: 'var(--text3)', fontSize: 14 }}>Loading NLS...</div>
      </div>
    );
  }

  if (!h.preCommitDone) {
    return <PreCommitModal onCommit={h.finishPreCommit} />;
  }

  const inRecovery = h.cap <= 40;

  return (
    <div className="app">
      {h.dsaModalOpen && (
        <DSAModal onSave={h.saveDSA} onDismiss={h.dismissDSAModal} />
      )}
      {h.showShutdown && (
        <ShutdownModal
          score={h.score}
          cap={h.cap}
          completed={h.completed}
          selectedHealth={h.selectedHealth}
          selectedOutput={h.selectedOutput}
          onDismiss={h.dismissShutdown}
        />
      )}

      {tab === 'today' && (
        <Header
          score={h.score}
          cap={h.cap}
          doneCount={h.doneCount}
          totalHabits={h.totalHabits}
          onShutdown={h.triggerShutdown}
        />
      )}

      <div className="app-content">
        {tab === 'today' && (
          <div className="page-fade today-dashboard">
            <div className="dashboard-primary">
              <MotivationCard score={h.score} totalHours={totalSkillHours} />

              <StreakBar
                streak={h.streak}
                momentum={h.momentum}
                perfectStreak={h.perfectStreak}
              />

              {inRecovery && (
                <div className="recovery-banner">
                  🚨 Recovery Mode — Focus: Fajr, Growth, Output
                </div>
              )}

              <DailyFocus
                focusDone={h.focusDone}
                skillHours={h.skillHours}
                todos={h.todos}
                onToggleFocus={h.toggleFocus}
                onSetSkillHours={h.setSkillHours}
                onAddTodo={h.addTodo}
                onToggleTodo={h.toggleTodo}
                onDeleteTodo={h.removeTodo}
                onEditTodo={h.editTodo}
                onResetTodos={h.resetTodos}
                onResetFocus={h.resetFocus}
              />
            </div>

            <div className="dashboard-secondary">
              <MissionBoard logs={h.logs} compact />

              <div className="habit-column dashboard-card">
                <CategorySection
                  categoryKey="deen"
                  habits={HABITS.deen}
                  completed={h.completed}
                  isFriday={h.isFriday}
                  onToggle={h.toggleHabit}
                  warned={warned}
                  escalated={escalated}
                />
                <CategorySection
                  categoryKey="growth"
                  habits={HABITS.growth}
                  completed={h.completed}
                  isFriday={h.isFriday}
                  onToggle={h.toggleHabit}
                  warned={warned}
                  escalated={escalated}
                />
                <CategorySection
                  categoryKey="health"
                  habits={HABITS.health}
                  completed={h.completed}
                  isFriday={h.isFriday}
                  onToggle={h.toggleHabit}
                  warned={warned}
                  escalated={escalated}
                  selectedOption={h.selectedHealth}
                />
                <CategorySection
                  categoryKey="output"
                  habits={HABITS.output}
                  completed={h.completed}
                  isFriday={h.isFriday}
                  onToggle={h.toggleHabit}
                  warned={warned}
                  escalated={escalated}
                  selectedOption={h.selectedOutput}
                />
              </div>

              <div className="section-spacer" />
            </div>
          </div>
        )}

        {tab === 'mission' && (
          <MissionPage
            logs={h.logs}
            streak={h.streak}
            perfectStreak={h.perfectStreak}
            momentum={h.momentum}
          />
        )}

        {tab === 'analytics' && (
          <Analytics logs={h.logs} dsaTopics={h.dsaTopics} />
        )}
      </div>

      <BottomNav active={tab} onSwitch={setTab} />
    </div>
  );
}
