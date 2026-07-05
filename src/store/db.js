import { openDB } from 'idb';

const DB_NAME    = 'nls-tracker';
const DB_VERSION = 2;

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('logs')) {
          const s = db.createObjectStore('logs', { keyPath: 'dateKey' });
          s.createIndex('dateKey', 'dateKey');
        }
        if (!db.objectStoreNames.contains('dsa')) {
          const s = db.createObjectStore('dsa', { keyPath: 'id', autoIncrement: true });
          s.createIndex('dateKey', 'dateKey');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('todos')) {
          const s = db.createObjectStore('todos', { keyPath: 'id' });
          s.createIndex('dateKey', 'dateKey');
        }
      }
    });
  }
  return dbPromise;
}

// Exported so hooks can import it without dynamic import hacks
export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── LOGS ──
export async function getTodayLog() {
  const db = await getDB();
  return (await db.get('logs', todayKey())) || null;
}

export async function saveTodayLog(data) {
  const db = await getDB();
  await db.put('logs', { ...data, dateKey: todayKey() });
}

// Fix: getLogs default stays 100 for analytics, but internal callers are smarter now
export async function getLogs(limit = 100) {
  const db  = await getDB();
  const all = await db.getAll('logs');
  return all.sort((a, b) => a.dateKey.localeCompare(b.dateKey)).slice(-limit);
}

// ── DSA ──
export async function saveDSATopic(topic) {
  const db = await getDB();
  await db.add('dsa', { topic, dateKey: todayKey(), timestamp: Date.now() });
}

export async function getDSATopics() {
  const db  = await getDB();
  const all = await db.getAll('dsa');
  return all.sort((a, b) => b.timestamp - a.timestamp);
}

// ── SETTINGS ──
export async function getSetting(key) {
  const db  = await getDB();
  const rec = await db.get('settings', key);
  return rec ? rec.value : null;
}

export async function setSetting(key, value) {
  const db = await getDB();
  await db.put('settings', { key, value });
}

// ── STATE INIT ──
export async function initTodayState() {
  const db  = await getDB();
  const key = todayKey();
  const existing = await db.get('logs', key);
  if (!existing) {
    await db.put('logs', {
      dateKey: key,
      completed: [],
      selectedHealth: null,
      selectedOutput: null,
      preCommitDone: false,
      score: 0,
      shutdownShown: false,
      focusDone: [],
      skillHours: { dsa: 0, core: 0, devAnalytics: 0 }
    });
    return null;
  }
  return existing;
}

export async function purgOldLogs() {
  const db     = await getDB();
  const all    = await db.getAll('logs');
  const sorted = all.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  if (sorted.length > 120) {
    const toDelete = sorted.slice(0, sorted.length - 120);
    await Promise.all(toDelete.map(rec => db.delete('logs', rec.dateKey)));
  }

  // Also purge todos older than 7 days
  const all_todos  = await db.getAll('todos');
  const cutoff     = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffKey  = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`;
  const oldTodos   = all_todos.filter(t => t.dateKey < cutoffKey);
  await Promise.all(oldTodos.map(t => db.delete('todos', t.id)));
}

// ── TODOS ──
export async function getTodayTodos() {
  const db  = await getDB();
  const key = todayKey();
  const all = await db.getAll('todos');
  return all.filter(t => t.dateKey === key).sort((a, b) => a.createdAt - b.createdAt);
}

export async function addTodayTodo(text) {
  const db  = await getDB();
  const key = todayKey();
  const todo = {
    id: `${key}-${Date.now()}`,
    text,
    done: false,
    dateKey: key,
    createdAt: Date.now()
  };
  await db.put('todos', todo);
  return todo;
}

export async function updateTodo(id, patch) {
  const db   = await getDB();
  const todo = await db.get('todos', id);
  if (!todo) return null;
  const next = { ...todo, ...patch };
  await db.put('todos', next);
  return next;
}

export async function deleteTodo(id) {
  const db = await getDB();
  await db.delete('todos', id);
}
