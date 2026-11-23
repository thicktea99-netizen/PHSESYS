// src/components/hazards/HazardTable.tsx
import { Trash2 } from 'lucide-react';

interface Hazard {
  id: string;
  hazard_number: number;
  entry_type: string;
  project_site: string;
  area: string;
  description: string;
  risk_score: number;
  date_observed: string;
  status: string;
  photo_url: string;
}

interface HazardTableProps {
  hazards: Hazard[];
  loading: boolean;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

const getRiskColor = (score: number) => {
  if (!score) return 'severity-low';
  if (score <= 4) return 'severity-low';
  if (score <= 9) return 'severity-medium';
  if (score <= 15) return 'severity-high';
  return 'severity-critical';
};

export default function HazardTable({ hazards, loading, onStatusChange, onDelete }: HazardTableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Description</th>
            <th>Risk Score</th>
            <th>Photo</th>
            <th>Status</th>
            <th style={{ width: '50px' }}></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={7} className="table-message">Loading hazards...</td></tr>
          ) : hazards.length === 0 ? (
            <tr><td colSpan={7} className="table-message">No hazards found.</td></tr>
          ) : (
            hazards.map((hazard) => (
              <tr key={hazard.id} className="clickable-row" onClick={() => window.location.href = `/hazards/${hazard.id}`}>
                <td>{hazard.date_observed}</td>
                <td>{hazard.entry_type}</td>
                <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {hazard.description}
                </td>
                <td>
                  {hazard.risk_score ? (
                    <span className={`badge ${getRiskColor(hazard.risk_score)}`}>{hazard.risk_score} / 25</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>-</span>
                  )}
                </td>
                <td>
                  {hazard.photo_url ? (
                    <a href={hazard.photo_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>View</a>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>None</span>
                  )}
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <select 
                    value={hazard.status} 
                    onChange={(e) => onStatusChange(hazard.id, e.target.value)} 
                    className={`table-select status-${hazard.status.replace(' ', '-')}`}
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button className="btn-icon danger" onClick={() => onDelete(hazard.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}