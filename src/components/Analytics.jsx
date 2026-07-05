import React, { useMemo } from 'react';
import { getCategoryStats } from '../features/habits/scoring';
import { CATEGORIES } from '../features/habits/habitConfig';

function ScoreBar({ score }) {
  const color = score >= 80 ? '#30D158' : score >= 60 ? '#007AFF' : score >= 40 ? '#FF9F0A' : '#FF453A';
  return (
    <div
      className="chart-bar"
      data-score={score}
      style={{
        height: `${score}%`,
        background: color,
        opacity: 0.8
      }}
    />
  );
}

function CategoryRing({ label, pct, color, urdu }) {
  return (
    <div className="cat-ring-item" style={{ background: 'var(--surface3)', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{
        width: 4,
        height: 36,
        borderRadius: 2,
        background: color,
        flexShrink: 0
      }} />
      <div>
        <div className="ring-pct" style={{ color }}>{pct}%</div>
        <div className="ring-label">{label}</div>
        <div className="ring-sub">{urdu}</div>
      </div>
    </div>
  );
}

export default function Analytics({ logs, dsaTopics }) {
  const last50 = logs.slice(-50);

  // Category averages
  const catAvgs = useMemo(() => {
    if (!last50.length) return { deen: 0, growth: 0, health: 0, output: 0 };
    const sums = { deen: 0, growth: 0, health: 0, output: 0 };
    last50.forEach(log => {
      const stats = getCategoryStats({
        completed: log.completed || [],
        selectedHealth: log.selectedHealth,
        selectedOutput: log.selectedOutput
      });
      sums.deen += stats.deen;
      sums.growth += stats.growth;
      sums.health += stats.health;
      sums.output += stats.output;
    });
    const n = last50.length;
    return {
      deen: Math.round(sums.deen / n),
      growth: Math.round(sums.growth / n),
      health: Math.round(sums.health / n),
      output: Math.round(sums.output / n)
    };
  }, [logs]);

  // DSA topic frequency
  const topicFreq = useMemo(() => {
    const freq = {};
    dsaTopics.forEach(t => {
      const key = t.topic.toLowerCase().trim();
      freq[key] = (freq[key] || 0) + 1;
    });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [dsaTopics]);

  // Average score
  const avgScore = last50.length
    ? Math.round(last50.reduce((a, b) => a + (b.score || 0), 0) / last50.length)
    : 0;

  const bestScore = last50.length ? Math.max(...last50.map(l => l.score || 0)) : 0;

  function formatDate(dateKey) {
    if (!dateKey) return '';
    const [, m, d] = dateKey.split('-');
    return `${d}/${m}`;
  }

  return (
    <div className="analytics-page page-fade">
      <div className="analytics-title">Improvement 📊</div>
      <div className="analytics-sub">تجزیہ — Your progress data</div>

      {/* Summary */}
      <div className="analytics-card">
        <div className="analytics-card-title">Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
          {[
            { label: 'Avg Score', val: avgScore, color: '#007AFF' },
            { label: 'Best Day', val: bestScore, color: '#30D158' },
            { label: 'Days Logged', val: last50.length, color: '#FF9F0A' }
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: 'var(--surface3)', borderRadius: 10, padding: '12px 6px' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color, letterSpacing: -1 }}>{val}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Score chart */}
      <div className="analytics-card">
        <div className="analytics-card-title">Score Graph ({last50.length} days)</div>
        {last50.length === 0 ? (
          <div style={{ color: 'var(--text3)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
            No data yet. Start tracking!
          </div>
        ) : (
          <>
            <div className="score-chart">
              {last50.map((log, i) => (
                <ScoreBar key={log.dateKey || i} score={log.score || 0} />
              ))}
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 6,
              fontSize: 11,
              color: 'var(--text3)'
            }}>
              <span>{last50[0] ? formatDate(last50[0].dateKey) : ''}</span>
              <span>Today</span>
            </div>
          </>
        )}
      </div>

      {/* Category performance */}
      <div className="analytics-card">
        <div className="analytics-card-title">Category Performance (avg)</div>
        <div className="cat-rings">
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <CategoryRing
              key={key}
              label={cat.label}
              urdu={cat.urdu}
              pct={catAvgs[key] ?? 0}
              color={cat.color}
            />
          ))}
        </div>
      </div>

      {/* DSA topics */}
      <div className="analytics-card">
        <div className="analytics-card-title">DSA Topics ({dsaTopics.length} total)</div>
        {dsaTopics.length === 0 ? (
          <div style={{ color: 'var(--text3)', fontSize: 14, textAlign: 'center', padding: '12px 0' }}>
            Complete DSA to log topics
          </div>
        ) : (
          <>
            {dsaTopics.slice(0, 10).map((t, i) => (
              <div key={t.id || i} className="dsa-item">
                <div className="dsa-date">{formatDate(t.dateKey)}</div>
                <div className="dsa-topic-text">{t.topic}</div>
              </div>
            ))}
            {topicFreq.length > 0 && (
              <>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                    Most Practiced
                  </div>
                  {topicFreq.map(([topic, count]) => (
                    <div key={topic} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 13,
                      padding: '4px 0',
                      color: 'var(--text)'
                    }}>
                      <span style={{ textTransform: 'capitalize' }}>{topic}</span>
                      <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{count}×</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
