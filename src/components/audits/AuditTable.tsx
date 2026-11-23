// src/components/audits/AuditTable.tsx
import { Trash2 } from 'lucide-react';

interface Audit {
  id: string;
  audit_number: number;
  title: string;
  audit_type: string;
  site: string;
  audit_date: string;
  status: string;
  score: string;
  report_url: string;
}

interface AuditTableProps {
  audits: Audit[];
  loading: boolean;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export default function AuditTable({ audits, loading, onStatusChange, onDelete }: AuditTableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Type</th>
            <th>Site</th>
            <th>Date</th>
            <th>Score</th>
            <th>Status</th>
            <th>Report</th>
            <th style={{ width: '50px' }}></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={9} className="table-message">Loading audits...</td></tr>
          ) : audits.length === 0 ? (
            <tr><td colSpan={9} className="table-message">No audits found.</td></tr>
          ) : (
            audits.map((audit) => (
              <tr key={audit.id} className="clickable-row" onClick={() => window.location.href = `/audits/${audit.id}`}>
                <td className="font-medium">AUD-{String(audit.audit_number).padStart(4, '0')}</td>
                <td>{audit.title}</td>
                <td>{audit.audit_type}</td>
                <td>{audit.site}</td>
                <td>{new Date(audit.audit_date).toLocaleDateString()}</td>
                <td>{audit.score || '-'}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <select 
                    value={audit.status} 
                    onChange={(e) => onStatusChange(audit.id, e.target.value)} 
                    className={`table-select status-${audit.status.toLowerCase().replace(' ', '-')}`}
                  >
                    <option value="Open">Open</option>
                    <option value="Actions Pending">Actions Pending</option>
                    <option value="Closed">Closed</option>
                  </select>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  {audit.report_url ? (
                    <a href={audit.report_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>View</a>
                  ) : '-'}
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button className="btn-icon danger" onClick={() => onDelete(audit.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}