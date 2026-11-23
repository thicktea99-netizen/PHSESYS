// src/components/ppe/PpeStats.tsx
import { Shield, CheckCircle, AlertTriangle, ClipboardCheck } from 'lucide-react';

interface PpeStatsProps {
  totalChecks: number;
  compliant: number;
  nonCompliant: number;
  checksThisMonth: number;
}

export default function PpeStats({ totalChecks, compliant, nonCompliant, checksThisMonth }: PpeStatsProps) {
  return (
    <div className="mini-stats-grid">
      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
          <ClipboardCheck size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{totalChecks}</span>
          <span className="mini-stat-label">Total Checks</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
          <CheckCircle size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{compliant}</span>
          <span className="mini-stat-label">Compliant Items</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
          <AlertTriangle size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{nonCompliant}</span>
          <span className="mini-stat-label">Non-Compliant</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
          <Shield size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{checksThisMonth}</span>
          <span className="mini-stat-label">This Month</span>
        </div>
      </div>
    </div>
  );
}