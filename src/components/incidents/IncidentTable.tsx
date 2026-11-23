// src/components/incidents/IncidentTable.tsx
import { Trash2 } from 'lucide-react';

interface Incident {
  id: string;
  incident_number: number;
  incident_type: string;
  date_of_occurrence: string;
  severity: string;
  area: string;
  status: string;
}

interface IncidentTableProps {
  incidents: Incident[];
  loading: boolean;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export default function IncidentTable({ incidents, loading, onStatusChange, onDelete }: IncidentTableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Incident ID</th>
            <th>Date</th>
            <th>Type</th>
            <th>Severity</th>
            <th>Area / Location</th>
            <th>Status</th>
            <th style={{ width: '50px' }}></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={7} className="table-message">Loading incidents...</td></tr>
          ) : incidents.length === 0 ? (
            <tr><td colSpan={7} className="table-message">No incidents found.</td></tr>
          ) : (
            incidents.map((incident) => (
              <tr key={incident.id} className="clickable-row" onClick={() => window.location.href = `/incidents/${incident.id}`}>
                <td className="font-medium">INC-{String(incident.incident_number).padStart(4, '0')}</td>
                <td>{incident.date_of_occurrence}</td>
                <td className="text-capitalize">{incident.incident_type.replace('-', ' ')}</td>
                <td><span className={`badge severity-${incident.severity.toLowerCase()}`}>{incident.severity}</span></td>
                <td>{incident.area}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <select 
                    value={incident.status || 'reported'} 
                    onChange={(e) => onStatusChange(incident.id, e.target.value)} 
                    className={`table-select status-${(incident.status || 'reported').replace(' ', '-')}`}
                  >
                    <option value="reported">Reported</option>
                    <option value="investigating">Investigating</option>
                    <option value="actions pending">Actions Pending</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button className="btn-icon danger" onClick={() => onDelete(incident.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}