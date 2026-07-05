import React from 'react';
import MissionBoard from './MissionBoard';

export default function MissionPage({ logs = [], streak = 0, perfectStreak = 0, momentum = 0 }) {
  return (
    <div className="mission-page page-fade">
      <div className="page-title-block">
        <div className="analytics-title">Mission Control</div>
        <div className="analytics-sub">Full 90-day board. One job: stack clean days.</div>
      </div>

      <div className="mission-hero-grid">
        <div className="analytics-card mission-mini-stat">
          <div className="analytics-card-title">Current streak</div>
          <div className="mission-big-num">{streak}🔥</div>
        </div>
        <div className="analytics-card mission-mini-stat">
          <div className="analytics-card-title">Perfect streak</div>
          <div className="mission-big-num">{perfectStreak}⭐</div>
        </div>
        <div className="analytics-card mission-mini-stat">
          <div className="analytics-card-title">7d momentum</div>
          <div className="mission-big-num">{momentum}</div>
        </div>
      </div>

      <MissionBoard logs={logs} />
    </div>
  );
}
