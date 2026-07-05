import React, { useState, useRef, useEffect } from 'react';

export default function DSAModal({ onSave, onDismiss }) {
  const [topic, setTopic] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 350);
  }, []);

  function handleSave() {
    if (topic.trim()) onSave(topic);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onDismiss()}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <div className="modal-title">🧠 DSA Topic</div>
        <div className="modal-sub">Aaj ka DSA topic kya tha?</div>

        <textarea
          ref={inputRef}
          className="dsa-input"
          rows={3}
          placeholder="e.g., Two Pointers, Binary Search, DP..."
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={handleKey}
        />

        <button className="btn-primary" onClick={handleSave} disabled={!topic.trim()}>
          Save Topic ✓
        </button>
        <button className="btn-secondary" onClick={onDismiss}>
          Skip karo
        </button>
      </div>
    </div>
  );
}
