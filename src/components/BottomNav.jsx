import React from 'react';

const TABS = [
  { id: 'today', icon: '✦', label: 'Today' },
  { id: 'mission', icon: '▦', label: 'Mission' },
  { id: 'analytics', icon: '◈', label: 'Improve' }
];

export default function BottomNav({ active, onSwitch }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`nav-btn ${active === tab.id ? 'active' : ''}`}
          onClick={() => onSwitch(tab.id)}
        >
          <span className="nav-icon">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
