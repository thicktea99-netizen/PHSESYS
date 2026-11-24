// src/components/sites/SiteStats.tsx
import { Building2, CheckCircle, AlertTriangle, MapPin } from 'lucide-react';

interface SiteStatsProps {
  total: number;
  active: number;
  closed: number;
  projects: number;
}

export default function SiteStats({ total, active, closed, projects }: SiteStatsProps) {
  return (
    <div className="mini-stats-grid">
      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
          <MapPin size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{total}</span>
          <span className="mini-stat-label">Total Sites</span>
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
          <AlertTriangle size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{closed}</span>
          <span className="mini-stat-label">Closed</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}>
          <Building2 size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{projects}</span>
          <span className="mini-stat-label">Projects</span>
        </div>
      </div>
    </div>
  );
}