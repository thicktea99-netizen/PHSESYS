// src/components/drills/DrillStats.tsx
import { Siren, CheckCircle, Clock, Users } from 'lucide-react';

interface DrillStatsProps {
  total: number;
  completed: number;
  planned: number;
  totalParticipants: number;
}

export default function DrillStats({ total, completed, planned, totalParticipants }: DrillStatsProps) {
  return (
    <div className="mini-stats-grid">
      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
          <Siren size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{total}</span>
          <span className="mini-stat-label">Total Drills</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
          <CheckCircle size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{completed}</span>
          <span className="mini-stat-label">Completed</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
          <Clock size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{planned}</span>
          <span className="mini-stat-label">Planned</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}>
          <Users size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{totalParticipants}
            
          </span>
          <span className="mini-stat-label">
            Participants
          </span>
        </div>
      </div>
    </div>
  );
}