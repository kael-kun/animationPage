import { useState } from 'react';
import { peopleData } from '../data/people';
import useStore from '../stores/useStore';

const getNodeSize = (count) => {
  if (count <= 10) return 16 + Math.sqrt(count) * 2;
  if (count <= 50) return 22 + Math.sqrt(count - 10) * 2.5;
  if (count <= 150) return 40 + Math.sqrt(count - 50) * 1.5;
  return 60 + Math.min(Math.sqrt(count - 150) * 0.5, 10);
};

export default function MobileCardGrid() {
  const [expandedId, setExpandedId] = useState(null);
  const { selectNode } = useStore();

  return (
    <div className="mobile-card-grid">
      {peopleData.people.map((person) => {
        const size = getNodeSize(person.letterCount);
        const isExpanded = expandedId === person.id;

        return (
          <div
            key={person.id}
            className={`person-card ${isExpanded ? 'expanded' : ''}`}
            onClick={() => {
              if (isExpanded) {
                selectNode(person.id);
              } else {
                setExpandedId(person.id);
              }
            }}
          >
            <div className="card-header">
              <img src={person.avatar} alt="" className="card-avatar" style={{ width: size * 1.5, height: size * 1.5 }} />
              <div className="card-info">
                <h3 className="card-name">{person.name}</h3>
                <span className="card-role">{person.details.role}</span>
              </div>
              <span className="card-count">{person.letterCount}</span>
            </div>

            {isExpanded && (
              <div className="card-details">
                <p className="card-bio">{person.details.bio}</p>
                <div className="card-meta">
                  <span>Joined {new Date(person.details.joined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
                <button className="card-btn">View Profile</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}