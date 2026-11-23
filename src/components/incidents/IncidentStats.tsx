// src/components/incidents/IncidentStats.tsx
import { AlertTriangle, CheckCircle, Clock, ShieldAlert } from 'lucide-react';

interface IncidentStatsProps {
  total: number;
  open: number;
  closed: number;
  ltis: number;
}

export default function IncidentStats({ total, open, closed, ltis }: IncidentStatsProps) {
  return (
    <div className="mini-stats-grid">
      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
          <AlertTriangle size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{total}</span>
          <span className="mini-stat-label">Total Incidents</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
          <Clock size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{open}</span>
          <span className="mini-stat-label">Open</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
          <CheckCircle size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{closed}</span>
          <span className="mini-stat-label">Closed</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
          <ShieldAlert size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{ltis}</span>
          <span className="mini-stat-label">LTIs</span>
        </div>
      </div>
    </div>
  );
}