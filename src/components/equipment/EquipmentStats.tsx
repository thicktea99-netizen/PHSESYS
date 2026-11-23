// src/components/equipment/EquipmentStats.tsx
import { Wrench, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface EquipmentStatsProps {
  total: number;
  inService: number;
  damaged: number;
  overdueInspections: number;
}

export default function EquipmentStats({ total, inService, damaged, overdueInspections }: EquipmentStatsProps) {
  return (
    <div className="mini-stats-grid">
      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
          <Wrench size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{total}</span>
          <span className="mini-stat-label">Total Equipment</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
          <CheckCircle size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{inService}</span>
          <span className="mini-stat-label">In Service</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
          <AlertTriangle size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{damaged}</span>
          <span className="mini-stat-label">Damaged</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
          <Clock size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{overdueInspections}</span>
          <span className="mini-stat-label">Overdue Inspections</span>
        </div>
      </div>
    </div>
  );
}