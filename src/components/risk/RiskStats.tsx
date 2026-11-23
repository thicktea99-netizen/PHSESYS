// src/components/risk/RiskStats.tsx
import { ShieldAlert, FileText, ClipboardList, CheckCircle } from 'lucide-react';

interface RiskStatsProps {
  total: number;
  jsas: number;
  rams: number;
  approved: number;
}

export default function RiskStats({ total, jsas, rams, approved }: RiskStatsProps) {
  return (
    <div className="mini-stats-grid">
      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
          <ShieldAlert size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{total}</span>
          <span className="mini-stat-label">Total Assessments</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}>
          <ClipboardList size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{jsas}</span>
          <span className="mini-stat-label">JSAs</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
          <FileText size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{rams}</span>
          <span className="mini-stat-label">RAMS</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
          <CheckCircle size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{approved}</span>
          <span className="mini-stat-label">Approved</span>
        </div>
      </div>
    </div>
  );
}