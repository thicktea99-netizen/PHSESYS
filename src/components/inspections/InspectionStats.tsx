// src/components/inspections/InspectionStats.tsx
import { ClipboardCheck, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface InspectionStatsProps {
  total: number;
  open: number;
  closed: number;
  totalFindings: number;
}

export default function InspectionStats({ total, open, closed, totalFindings }: InspectionStatsProps) {
  return (
    <div className="mini-stats-grid">
      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
          <ClipboardCheck size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{total}</span>
          <span className="mini-stat-label">Total Inspections</span>
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
          <AlertCircle size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{totalFindings}</span>
          <span className="mini-stat-label">Total Findings</span>
        </div>
      </div>
    </div>
  );
}