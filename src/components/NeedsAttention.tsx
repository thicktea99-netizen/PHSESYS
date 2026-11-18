// src/components/NeedsAttention.tsx
import { AlertCircle, FileWarning, ShieldAlert } from 'lucide-react';
import '../styles/Alerts.css';

interface AttentionItem {
  label: string;
  count: number;
  link: string;
}

export default function NeedsAttention({ items }: { items: AttentionItem[] }) {
  return (
    <div className="alert-card">
      <div className="alert-header">
        <h3>Needs Attention</h3>
        <span className="alert-badge">{items.length} Alerts</span>
      </div>
      
      <div className="alert-list">
        {items.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>✅ All clear! Nothing needs your attention.</p>
        ) : (
          items.map((item, index) => (
            <div 
              key={index} 
              className="alert-item" 
              onClick={() => window.location.href = item.link} 
              style={{ cursor: 'pointer' }}
            >
              <div className="alert-icon danger">
                <AlertCircle size={20} />
              </div>
              <div className="alert-content">
                <h4>{item.label}</h4>
                <p>{item.count} item(s) pending.</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}