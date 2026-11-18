// src/components/RecentActivity.tsx
import '../styles/Alerts.css';

interface ActivityItem {
  text: string;
  time: string;
}

export default function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <div className="alert-card">
      <div className="alert-header">
        <h3>Recent Activity</h3>
      </div>
      
      <div className="activity-list">
        {items.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No recent activity.</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="activity-item">
              <div className="activity-dot"></div>
              <div className="activity-content">
                <p>{item.text}</p>
                <span>{item.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}