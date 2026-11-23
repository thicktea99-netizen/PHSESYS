// src/components/compliance/ComplianceStats.tsx
import { FileCheck, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface ComplianceStatsProps {
  total: number;
  valid: number;
  expiringSoon: number;
  expired: number;
}

export default function ComplianceStats({ total, valid, expiringSoon, expired }: ComplianceStatsProps) {
  return (
    <div className="mini-stats-grid">
      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
          <FileCheck size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{total}</span>
          <span className="mini-stat-label">Total Obligations</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
          <CheckCircle size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{valid}</span>
          <span className="mini-stat-label">Valid</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
          <Clock size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{expiringSoon}</span>
          <span className="mini-stat-label">Expiring Soon</span>
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