// src/components/SafetyActivities.tsx
import { MessageSquare, GraduationCap } from 'lucide-react';
import '../styles/Charts.css';

export default function SafetyActivities() {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Safety Activities</h3>
      </div>

      {/* Top Half: Toolbox Talks */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '12px', borderRadius: '8px' }}>
          <MessageSquare size={24} color="var(--primary)" />
        </div>
        <div>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-main)' }}>4</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Toolbox Talks (34 Attendees)</p>
        </div>
      </div>

      {/* Bottom Half: Trainings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0' }}>
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '8px' }}>
          <GraduationCap size={24} color="var(--success)" />
        </div>
        <div>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-main)' }}>1</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Training Delivered (12 Attendees)</p>
        </div>
      </div>

    </div>
  );
}