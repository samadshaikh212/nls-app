import { useState, useEffect, useCallback, useRef } from 'react';
import { todayKey,
  initTodayState, saveTodayLog, getLogs, getDSATopics,
  saveDSATopic, purgOldLogs, getTodayTodos, addTodayTodo,
  updateTodo, deleteTodo
} from '../store/db';
import { calculateScore, getMomentum, getStreak, getPerfectStreak, getMissedHabits } from '../features/habits/scoring';

export function useHabits() {
  const [loading, setLoading]               = useState(true);
  const [completed, setCompleted]           = useState([]);
  const [selectedHealth, setSelectedHealth] = useState(null);
  const [selectedOutput, setSelectedOutput] = useState(null);
  const [preCommitDone, setPreCommitDone]   = useState(false);
  const [score, setScore]                   = useState(0);
  const [cap, setCap]                       = useState(100);
  const [logs, setLogs]                     = useState([]);
  const [dsaTopics, setDsaTopics]           = useState([]);
  const [dsaModalOpen, setDsaModalOpen]     = useState(false);
  const [shutdownShown, setShutdownShown]   = useState(false);
  const [showShutdown, setShowShutdown]     = useState(false);
  const [momentum, setMomentum]             = useState(0);
  const [streak, setStreak]                 = useState(0);
  const [perfectStreak, setPerfectStreak]   = useState(0);
  const [missedHabits, setMissedHabits]     = useState({ warned: [], escalated: [] });
  const [focusDone, setFocusDone]           = useState([]);
  const [skillHours, setSkillHours]         = useState({ dsa: 0, core: 0, devAnalytics: 0 });
  const [todos, setTodos]                   = useState([]);

  // ── Fix #1: useRef holds current state so persistState never goes stale ──
  const stateRef = useRef({});
  stateRef.current = { completed, selectedHealth, selectedOutput, preCommitDone, shutdownShown, focusDone, skillHours };

  const saveTimeout = useRef(null);

  // ── Load on mount ──
  useEffect(() => {
    async function load() {
      await purgOldLogs();
      const today = await initTodayState();
      if (today) {
        setCompleted(today.completed || []);
        setSelectedHealth(today.selectedHealth || null);
        setSelectedOutput(today.selectedOutput || null);
        setPreCommitDone(today.preCommitDone || false);
        setShutdownShown(today.shutdownShown || false);
        setFocusDone(today.focusDone || []);
        setSkillHours({ dsa: 0, core: 0, devAnalytics: 0, ...(today.skillHours || {}) });
      }
      const [todaysTodos, allLogs, topics] = await Promise.all([
        getTodayTodos(),
        getLogs(100),
        getDSATopics()
      ]);
      setTodos(todaysTodos);
      setLogs(allLogs);
      setDsaTopics(topics);
      setLoading(false);
    }
    load();
  }, []);

  // ── Recalculate derived values on state changes ──
  useEffect(() => {
    if (loading) return;
    const { score: s, cap: c } = calculateScore({ completed, selectedHealth, selectedOutput });
    setScore(s);
    setCap(c);
    setMomentum(getMomentum(logs));
    setStreak(getStreak(logs));
    setPerfectStreak(getPerfectStreak(logs));
    setMissedHabits(getMissedHabits(logs.slice(0, -1), selectedHealth, selectedOutput));
  }, [completed, selectedHealth, selectedOutput, logs, loading]);

  // ── Fix #2: persistState reads from ref — never stale, never recreated ──
  // Stable reference: no deps array needed, ref always has latest values
  const persistState = useCallback((overrides = {}) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      // Merge latest ref state with any in-flight overrides
      const s = { ...stateRef.current, ...overrides };
      const { score: computedScore } = calculateScore({
        completed: s.completed,
        selectedHealth: s.selectedHealth,
        selectedOutput: s.selectedOutput
      });
      await saveTodayLog({
        completed:      s.completed,
        selectedHealth: s.selectedHealth,
        selectedOutput: s.selectedOutput,
        preCommitDone:  s.preCommitDone,
        score:          computedScore,
        shutdownShown:  s.shutdownShown,
        focusDone:      s.focusDone,
        skillHours:     s.skillHours
      });
      // Fix #3: don't re-read all 100 logs after every save.
      // Only sync logs at load time and after shutdown so analytics stay accurate.
      // The today log update is reflected on next full load.
    }, 300);
  }, []); // ← stable forever, no deps

  // ── Habit toggle ──
  const toggleHabit = useCallback((id) => {
    setCompleted(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      persistState({ completed: next });
      return next;
    });
    if (id === 'dsa') {
      setCompleted(cur => {
        if (!cur.includes('dsa')) setTimeout(() => setDsaModalOpen(true), 300);
        return cur;
      });
    }
  }, [persistState]);

  const finishPreCommit = useCallback((health, output) => {
    setSelectedHealth(health);
    setSelectedOutput(output);
    setPreCommitDone(true);
    persistState({ selectedHealth: health, selectedOutput: output, preCommitDone: true });
  }, [persistState]);

  const saveDSA = useCallback(async (topic) => {
    if (!topic.trim()) return;
    await saveDSATopic(topic.trim());
    const topics = await getDSATopics();
    setDsaTopics(topics);
    setDsaModalOpen(false);
  }, []);

  const dismissDSAModal = useCallback(() => setDsaModalOpen(false), []);
  const triggerShutdown = useCallback(() => setShowShutdown(true), []);

  const dismissShutdown = useCallback(async () => {
    setShowShutdown(false);
    setShutdownShown(true);
    persistState({ shutdownShown: true });
    // Sync logs now so analytics are fresh after shutdown
    const allLogs = await getLogs(100);
    setLogs(allLogs);
  }, [persistState]);

  // Auto-shutdown at 11 PM
  useEffect(() => {
    function checkShutdown() {
      if (new Date().getHours() >= 23 && !stateRef.current.shutdownShown) {
        setShowShutdown(true);
      }
    }
    const interval = setInterval(checkShutdown, 60000);
    checkShutdown();
    return () => clearInterval(interval);
  }, []);

  // ── Focus toggles ──
  const toggleFocus = useCallback((id) => {
    setFocusDone(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      persistState({ focusDone: next });
      return next;
    });
  }, [persistState]);

  const setSkillHoursForBlock = useCallback((blockId, hours) => {
    setSkillHours(prev => {
      const clamped = Math.max(0, Math.min(5, Number(hours) || 0));
      const next = { ...prev, [blockId]: clamped };
      persistState({ skillHours: next });
      return next;
    });
  }, [persistState]);

  const resetFocus = useCallback(() => {
    const emptyHours = { dsa: 0, core: 0, devAnalytics: 0 };
    setFocusDone([]);
    setSkillHours(emptyHours);
    persistState({ focusDone: [], skillHours: emptyHours });
  }, [persistState]);

  // ── Fix #7: Optimistic todo updates — no round-trip before UI update ──
  const addTodo = useCallback(async (text) => {
    if (todos.length >= 3) return;
    const key = todayKey();
    const newTodo = {
      id: `${key}-${Date.now()}`,
      text: text.trim(),
      done: false,
      dateKey: key,
      createdAt: Date.now()
    };
    setTodos(prev => [...prev, newTodo]);          // instant UI
    await addTodayTodo(text.trim());               // background write
  }, [todos.length]);

  const toggleTodo = useCallback((id) => {
    setTodos(prev => {                             // instant UI
      const next = prev.map(t => t.id === id ? { ...t, done: !t.done } : t);
      const todo = next.find(t => t.id === id);
      if (todo) updateTodo(id, { done: todo.done }); // background write
      return next;
    });
  }, []);

  const removeTodo = useCallback((id) => {
    setTodos(prev => prev.filter(t => t.id !== id)); // instant UI
    deleteTodo(id);                                   // background write
  }, []);

  const editTodo = useCallback((id, text) => {
    const clean = text.trim();
    if (!clean) return;
    setTodos(prev => prev.map(t => t.id === id ? { ...t, text: clean } : t)); // instant UI
    updateTodo(id, { text: clean });                                            // background write
  }, []);

  const resetTodos = useCallback(async () => {
    const current = todos;
    setTodos([]);                                    // instant UI
    await Promise.all(current.map(t => deleteTodo(t.id)));
  }, [todos]);

  const isFriday = new Date().getDay() === 5;
  const totalHabits = 8 + 2 + (selectedHealth ? 1 : 0) + 1 + (selectedOutput ? 1 : 0);
  const doneCount = completed.length;

  return {
    loading, completed, selectedHealth, selectedOutput,
    preCommitDone, score, cap, logs, dsaTopics,
    dsaModalOpen, showShutdown, momentum, streak,
    perfectStreak, missedHabits, focusDone, skillHours, todos, isFriday,
    totalHabits, doneCount,
    toggleHabit, finishPreCommit, saveDSA,
    dismissDSAModal, triggerShutdown, dismissShutdown,
    toggleFocus, setSkillHours: setSkillHoursForBlock, resetFocus,
    addTodo, toggleTodo, removeTodo, editTodo, resetTodos
  };
}
