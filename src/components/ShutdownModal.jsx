import React from 'react';
import { HABITS, ALL_HABITS } from '../features/habits/habitConfig';

function getScoreEmoji(score) {
  if (score >= 90) return '🔥';
  if (score >= 70) return '✅';
  if (score >= 50) return '📈';
  return '😤';
}

function getMotivation(score) {
  if (score >= 90) return 'Zabardast! Kal bhi aise hi karo.';
  if (score >= 70) return 'Acha kiya. Kal aur behtar.';
  if (score >= 50) return 'Theek tha. Kal focus karo.';
  return 'Kal fresh start hai. Don\'t give up.';
}

export default function ShutdownModal({ score, cap, completed, selectedHealth, selectedOutput, onDismiss }) {
  const emoji = getScoreEmoji(score);

  // Find missed habits
  const missed = [];
  HABITS.deen.forEach(h => { if (!completed.includes(h.id)) missed.push(h.label); });
  HABITS.growth.forEach(h => { if (!completed.includes(h.id)) missed.push(h.label); });
  if (selectedHealth && !completed.includes(selectedHealth)) {
    const h = ALL_HABITS.find(x => x.id === selectedHealth);
    if (h) missed.push(h.label);
  }
  if (!completed.includes('abc_juice')) missed.push('ABC Juice');
  if (selectedOutput && !completed.includes(selectedOutput)) {
    const h = ALL_HABITS.find(x => x.id === selectedOutput);
    if (h) missed.push(h.label);
  }

  // Next priorities (top 3 missed + always critical)
  const priorities = [];
  if (!completed.includes('fajr')) priorities.push('Fajr 🌅');
  if (!completed.includes('isha')) priorities.push('Isha 🌙');
  if (selectedOutput && !completed.includes(selectedOutput)) priorities.push('Output 📤');
  if (!completed.includes('dsa')) priorities.push('DSA Practice 💻');
  if (!completed.includes('college')) priorities.push('College Study 📚');

  return (
    <div className="modal-overlay center">
      <div className="modal-card">
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: 40 }}>{emoji}</div>
          <div className="modal-title" style={{ textAlign: 'center', marginTop: 8 }}>Daily Shutdown</div>
          <div className="modal-sub" style={{ textAlign: 'center' }}>Aaj ka hisaab</div>
        </div>

        <div className="shutdown-score" style={{
          color: score >= 70 ? 'var(--green)' : score >= 50 ? 'var(--accent)' : 'var(--red)'
        }}>
          {score}
        </div>

        {cap < 100 && (
          <div style={{
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--red)',
            marginBottom: 12,
            background: 'var(--red-dim)',
            borderRadius: 8,
            padding: '6px 12px'
          }}>
            Cap was {cap} — {3 - Math.round(100 / cap)} critical habits missed
          </div>
        )}

        <div style={{
          textAlign: 'center',
          fontSize: 15,
          color: 'var(--text2)',
          marginBottom: 16,
          fontStyle: 'italic'
        }}>
          {getMotivation(score)}
        </div>

        {missed.length > 0 && (
          <div className="shutdown-section">
            <div className="shutdown-section-title">Missed Habits ({missed.length})</div>
            <div className="missed-list">
              {missed.map(m => (
                <span key={m} className="missed-tag">{m}</span>
              ))}
            </div>
          </div>
        )}

        {priorities.length > 0 && (
          <div className="shutdown-section">
            <div className="shutdown-section-title">Kal Ki Priorities</div>
            {priorities.slice(0, 4).map((p, i) => (
              <div key={i} style={{ fontSize: 14, color: 'var(--text)', padding: '4px 0' }}>
                {i + 1}. {p}
              </div>
            ))}
          </div>
        )}

        <button className="btn-primary" onClick={onDismiss} style={{ marginTop: 16 }}>
          Theek hai, kal milte hain 👋
        </button>
      </div>
    </div>
  );
}
