import { useEffect, useRef } from 'react';
import useStore from '../stores/useStore';
import { peopleData } from '../data/people';

export default function DetailPanel() {
  const { selectedNode, clearSelection } = useStore();
  const panelRef = useRef(null);

  const person = peopleData.people.find(p => p.id === selectedNode);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') clearSelection();
    };
    if (selectedNode) {
      document.addEventListener('keydown', handleKeyDown);
      panelRef.current?.focus();
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, clearSelection]);

  if (!selectedNode || !person) return null;

  return (
    <div className="detail-panel-overlay" onClick={clearSelection}>
      <div
        ref={panelRef}
        className="detail-panel"
        tabIndex={0}
        role="dialog"
        aria-label={`Details for ${person.name}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={clearSelection} aria-label="Close panel">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="detail-header">
          <img src={person.avatar} alt="" className="detail-avatar" />
          <h2 className="detail-name">{person.name}</h2>
          <span className="detail-role">{person.details.role}</span>
        </div>

        <div className="detail-stats">
          <div className="stat-item">
            <span className="stat-value">{person.letterCount}</span>
            <span className="stat-label">Thank You Letters</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{new Date(person.details.joined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            <span className="stat-label">Joined</span>
          </div>
        </div>

        <div className="detail-bio">
          <h3>About</h3>
          <p>{person.details.bio}</p>
        </div>

        <div className="detail-actions">
          <button className="action-btn primary">View Letters</button>
          <button className="action-btn secondary">Send Thank You</button>
        </div>
      </div>
    </div>
  );
}