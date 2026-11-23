// src/components/inductions/InductionStats.tsx
import { UserCheck, Users, Calendar, CheckSquare } from 'lucide-react';

interface InductionStatsProps {
  total: number;
  thisMonth: number;
  signedForms: number;
  uniqueCompanies: number;
}

export default function InductionStats({ total, thisMonth, signedForms, uniqueCompanies }: InductionStatsProps) {
  return (
    <div className="mini-stats-grid">
      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
          <UserCheck size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{total}</span>
          <span className="mini-stat-label">Total Inductions</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
          <Calendar size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{thisMonth}</span>
          <span className="mini-stat-label">This Month</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
          <CheckSquare size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{signedForms}</span>
          <span className="mini-stat-label">Signed Forms</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}>
          <Users size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{uniqueCompanies}</span>
          <span className="mini-stat-label">Companies</span>
        </div>
      </div>
    </div>
  );
}