// src/components/trainingSessions/TrainingSessionStats.tsx
import { BookOpen, Users, Calendar, Award } from 'lucide-react';

interface TrainingSessionStatsProps {
  total: number;
  totalAttendees: number;
  thisMonth: number;
  withCertificate: number;
}

export default function TrainingSessionStats({ total, totalAttendees, thisMonth, withCertificate }: TrainingSessionStatsProps) {
  return (
    <div className="mini-stats-grid">
      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
          <BookOpen size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{total}</span>
          <span className="mini-stat-label">Total Sessions</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
          <Users size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{totalAttendees}</span>
          <span className="mini-stat-label">Total Attendees</span>
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
        <div className="mini-stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}>
          <Award size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{withCertificate}</span>
          <span className="mini-stat-label">With Certificate</span>
        </div>
      </div>
    </div>
  );
}