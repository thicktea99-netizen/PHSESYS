// src/components/NeedsAttention.tsx
import { AlertCircle, FileWarning, ShieldAlert } from 'lucide-react';
import '../styles/Alerts.css';

export default function NeedsAttention() {
  return (
    <div className="alert-card">
      <div className="alert-header">
        <h3>Needs Attention</h3>
        <span className="alert-badge">3 Alerts</span>
      </div>
      
      <div className="alert-list">
        {/* Alert 1: Compliance */}
        <div className="alert-item">
          <div className="alert-icon warning">
            <FileWarning size={20} />
          </div>
          <div className="alert-content">
            <h4>Compliance Expiring</h4>
            <p>Fire Certificate for Site A expires in 7 days.</p>
          </div>
        </div>

        {/* Alert 2: Certifications */}
        <div className="alert-item">
          <div className="alert-icon danger">
            <ShieldAlert size={20} />
          </div>
          <div className="alert-content">
            <h4>Certification Expired</h4>
            <p>John Mensah (ABC Scaffolding) - Working at Height has expired.</p>
          </div>
        </div>

        {/* Alert 3: CAPA */}
        <div className="alert-item">
          <div className="alert-icon danger">
            <AlertCircle size={20} />
          </div>
          <div className="alert-content">
            <h4>CAPA Overdue</h4>
            <p>Action: "Replace missing guardrail L3" is 3 days overdue.</p>
          </div>
        </div>
      </div>
    </div>
  );
}