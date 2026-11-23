// src/components/toolbox/ToolboxStats.tsx
import { MessageSquare, CheckCircle, Users, Tag } from 'lucide-react';

interface ToolboxStatsProps {
  total: number;
  thisMonth: number;
  totalAttendees: number;
  categoriesCount: number;
}

export default function ToolboxStats({ total, thisMonth, totalAttendees, categoriesCount }: ToolboxStatsProps) {
  return (
    <div className="mini-stats-grid">
      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
          <MessageSquare size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{total}</span>
          <span className="mini-stat-label">Total Talks</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
          <CheckCircle size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{thisMonth}</span>
          <span className="mini-stat-label">This Month</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
          <Users size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{totalAttendees}</span>
          <span className="mini-stat-label">Total Attendees</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}>
          <Tag size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{categoriesCount}</span>
          <span className="mini-stat-label">Categories</span>
        </div>
      </div>
    </div>
  );
}