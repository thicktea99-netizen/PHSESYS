// src/components/capa/CapaStats.tsx
import { BookOpen, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface CapaStatsProps {
  total: number;
  open: number;
  inProgress: number;
  overdue: number;
}

export default function CapaStats({ total, open, inProgress, overdue }: CapaStatsProps) {
  return (
    <div className="mini-stats-grid">
      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
          <BookOpen size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{total}</span>
          <span className="mini-stat-label">Total Actions</span>
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
        <div className="mini-stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}>
          <CheckCircle size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{inProgress}</span>
          <span className="mini-stat-label">In Progress</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
          <AlertTriangle size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{overdue}</span>
          <span className="mini-stat-label">Overdue</span>
        </div>
      </div>
    </div>
  );
}