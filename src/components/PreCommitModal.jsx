import React, { useState } from 'react';
import { HEALTH_OPTIONS, OUTPUT_OPTIONS, HABITS } from '../features/habits/habitConfig';

const HEALTH_HABITS = HABITS.health.filter(h => HEALTH_OPTIONS.includes(h.id));
const OUTPUT_HABITS = HABITS.output;

export default function PreCommitModal({ onCommit }) {
  const [health, setHealth] = useState(null);
  const [output, setOutput] = useState(null);

  const canCommit = health && output;

  return (
    <div className="precommit-overlay">
      <div className="precommit-sheet">
        <div style={{ textAlign: 'center', fontSize: 32, marginBottom: 12 }}>🌅</div>
        <div className="precommit-title">Aaj ka plan?</div>
        <div className="precommit-sub">
          Apna Health routine aur Output goal select karo. Yeh din bhar lock rahega.
        </div>

        <div className="precommit-section">
          <div className="precommit-section-title">
            <span style={{ color: 'var(--orange)' }}>●</span>
            Health — صحت
          </div>
          <div className="select-options">
            {HEALTH_HABITS.map(h => (
              <button
                key={h.id}
                className={`opt-btn ${health === h.id ? 'selected' : ''}`}
                onClick={() => setHealth(h.id)}
              >
                {h.label}
                <span className="opt-urdu">{h.urdu}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="precommit-section">
          <div className="precommit-section-title">
            <span style={{ color: 'var(--purple)' }}>●</span>
            Output — آؤٹ پٹ
          </div>
          <div className="select-options">
            {OUTPUT_HABITS.filter(h => OUTPUT_OPTIONS.includes(h.id)).map(h => (
              <button
                key={h.id}
                className={`opt-btn ${output === h.id ? 'selected' : ''}`}
                onClick={() => setOutput(h.id)}
                style={output === h.id ? {
                  background: 'rgba(191, 90, 242, 0.15)',
                  borderColor: 'var(--purple)',
                  color: 'var(--purple)'
                } : {}}
              >
                {h.label}
                <span className="opt-urdu">{h.urdu}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{
          background: 'var(--surface3)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 12px',
          fontSize: 12,
          color: 'var(--text3)',
          marginBottom: 4,
          lineHeight: 1.5
        }}>
          💡 Health + Output milakay 35% score hain. Sahi select karo!
        </div>

        <button
          className="btn-primary"
          onClick={() => canCommit && onCommit(health, output)}
          disabled={!canCommit}
        >
          {canCommit ? 'Commit karo! 🔒' : 'Dono select karo'}
        </button>
      </div>
    </div>
  );
}
