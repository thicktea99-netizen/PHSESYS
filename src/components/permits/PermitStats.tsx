// src/components/permits/PermitStats.tsx
import { FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface PermitStatsProps {
  total: number;
  active: number;
  closed: number;
  expired: number;
}

export default function PermitStats({ total, active, closed, expired }: PermitStatsProps) {
  return (
    <div className="mini-stats-grid">
      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
          <FileText size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{total}</span>
          <span className="mini-stat-label">Total Permits</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
          <CheckCircle size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{active}</span>
          <span className="mini-stat-label">Active</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
          <Clock size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{closed}</span>
          <span className="mini-stat-label">Closed</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
          <AlertTriangle size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{expired}</span>
          <span className="mini-stat-label">Expired</span>
        </div>
      </div>
    </div>
  );
}