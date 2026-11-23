// src/components/people/PeopleStats.tsx
import { Users, Building2, UserCheck, UserX } from 'lucide-react';

interface PeopleStatsProps {
  totalPeople: number;
  totalContractors: number;
  activeWorkers: number;
  inactiveWorkers: number;
}

export default function PeopleStats({ totalPeople, totalContractors, activeWorkers, inactiveWorkers }: PeopleStatsProps) {
  return (
    <div className="mini-stats-grid">
      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
          <Users size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{totalPeople}</span>
          <span className="mini-stat-label">Total People</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}>
          <Building2 size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{totalContractors}</span>
          <span className="mini-stat-label">Contractors</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
          <UserCheck size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{activeWorkers}</span>
          <span className="mini-stat-label">Active Workers</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
          <UserX size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{inactiveWorkers}</span>
          <span className="mini-stat-label">Inactive Workers</span>
        </div>
      </div>
    </div>
  );
}