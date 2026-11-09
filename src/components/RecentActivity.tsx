// src/components/RecentActivity.tsx
import '../styles/Alerts.css';

export default function RecentActivity() {
  return (
    <div className="alert-card">
      <div className="alert-header">
        <h3>Recent Activity</h3>
      </div>
      
      <div className="activity-list">
        <div className="activity-item">
          <div className="activity-dot"></div>
          <div className="activity-content">
            <p><strong>Incident INC-2026-014</strong> closed by you</p>
            <span>10:45 AM</span>
          </div>
        </div>

        <div className="activity-item">
          <div className="activity-dot"></div>
          <div className="activity-content">
            <p><strong>CAPA-0042</strong> marked as verified</p>
            <span>09:30 AM</span>
          </div>
        </div>

        <div className="activity-item">
          <div className="activity-dot"></div>
          <div className="activity-content">
            <p><strong>Inspection</strong> completed at Podium Zone</p>
            <span>Yesterday</span>
          </div>
        </div>

        <div className="activity-item">
          <div className="activity-dot"></div>
          <div className="activity-content">
            <p><strong>Hazard logged</strong> on Level 3</p>
            <span>Yesterday</span>
          </div>
        </div>
      </div>
    </div>
  );
}