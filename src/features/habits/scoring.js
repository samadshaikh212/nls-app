import { HABITS, CATEGORIES } from './habitConfig';

/**
 * Calculate score from completed habits + pre-commit selections
 */
export function calculateScore({ completed, selectedHealth, selectedOutput }) {
  let raw = 0;

  // --- DEEN (40pts) ---
  const deenHabits = HABITS.deen;
  const deenDone = deenHabits.filter(h => completed.includes(h.id)).length;
  raw += (deenDone / deenHabits.length) * 40;

  // --- GROWTH (25pts) ---
  const growthHabits = HABITS.growth;
  const growthDone = growthHabits.filter(h => completed.includes(h.id)).length;
  raw += (growthDone / growthHabits.length) * 25;

  // --- HEALTH (15pts) ---
  // activity = 7.5, juice = 7.5
  const activityDone = selectedHealth && completed.includes(selectedHealth);
  const juiceDone = completed.includes('abc_juice');
  raw += (activityDone ? 7.5 : 0) + (juiceDone ? 7.5 : 0);

  // --- OUTPUT (20pts) ---
  const outputDone = selectedOutput && completed.includes(selectedOutput);
  raw += outputDone ? 20 : 0;

  // --- CRITICAL PENALTY ---
  const criticalMissed = [
    !completed.includes('fajr'),
    !completed.includes('isha'),
    !outputDone
  ].filter(Boolean).length;

  let cap = 100;
  if (criticalMissed === 1) cap = 60;
  else if (criticalMissed === 2) cap = 40;
  else if (criticalMissed >= 3) cap = 20;

  return { score: Math.min(Math.round(raw), cap), cap, criticalMissed };
}

/**
 * Category-level completion %
 */
export function getCategoryStats({ completed, selectedHealth, selectedOutput }) {
  const deen = HABITS.deen.filter(h => completed.includes(h.id)).length / HABITS.deen.length;
  const growth = HABITS.growth.filter(h => completed.includes(h.id)).length / HABITS.growth.length;
  const healthActivity = selectedHealth && completed.includes(selectedHealth) ? 1 : 0;
  const juice = completed.includes('abc_juice') ? 1 : 0;
  const health = (healthActivity + juice) / 2;
  const output = selectedOutput && completed.includes(selectedOutput) ? 1 : 0;
  return {
    deen: Math.round(deen * 100),
    growth: Math.round(growth * 100),
    health: Math.round(health * 100),
    output: Math.round(output * 100)
  };
}

/**
 * 7-day momentum (avg of last 7 scores)
 */
export function getMomentum(logs) {
  const recent = logs.slice(-7).map(l => l.score || 0);
  if (!recent.length) return 0;
  return Math.round(recent.reduce((a, b) => a + b, 0) / recent.length);
}

/**
 * Count current streak (consecutive days with score > 0)
 */
export function getStreak(logs) {
  let streak = 0;
  const sorted = [...logs].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  for (const log of sorted) {
    if ((log.score || 0) > 0) streak++;
    else break;
  }
  return streak;
}

/**
 * Count perfect streak (score === 100)
 */
export function getPerfectStreak(logs) {
  let streak = 0;
  const sorted = [...logs].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  for (const log of sorted) {
    if ((log.score || 0) === 100) streak++;
    else break;
  }
  return streak;
}

/**
 * Habits missed for 2+ days (anti-skip detection)
 */
export function getMissedHabits(logs, selectedHealth, selectedOutput) {
  if (logs.length < 2) return { warned: [], escalated: [] };
  const recent2 = logs.slice(-2).map(l => l.completed || []);
  const recent3 = logs.slice(-3).map(l => l.completed || []);

  // All habit IDs that should be completed daily
  const daily = [
    ...HABITS.deen.map(h => h.id),
    ...HABITS.growth.map(h => h.id),
    'abc_juice'
  ];
  if (selectedHealth) daily.push(selectedHealth);
  if (selectedOutput) daily.push(selectedOutput);

  const missedIn2 = daily.filter(id => recent2.every(c => !c.includes(id)));
  const missedIn3 = daily.filter(id => recent3.length === 3 && recent3.every(c => !c.includes(id)));

  return { warned: missedIn2, escalated: missedIn3 };
}
