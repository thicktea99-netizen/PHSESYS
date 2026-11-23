// src/components/inspections/InspectionTable.tsx
import { Trash2 } from 'lucide-react';

interface Inspection {
  id: string;
  inspection_number: number;
  inspection_type: string;
  site: string;
  area: string;
  date: string;
  status: string;
}

interface InspectionTableProps {
  inspections: Inspection[];
  loading: boolean;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export default function InspectionTable({ inspections, loading, onStatusChange, onDelete }: InspectionTableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Site</th>
            <th>Area</th>
            <th>Date</th>
            <th>Status</th>
            <th style={{ width: '50px' }}></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={7} className="table-message">Loading inspections...</td></tr>
          ) : inspections.length === 0 ? (
            <tr><td colSpan={7} className="table-message">No inspections found.</td></tr>
          ) : (
            inspections.map((insp) => (
              <tr key={insp.id} className="clickable-row" onClick={() => window.location.href = `/inspections/${insp.id}`}>
                <td className="font-medium">INS-{String(insp.inspection_number).padStart(4, '0')}</td>
                <td>{insp.inspection_type}</td>
                <td>{insp.site}</td>
                <td>{insp.area || '-'}</td>
                <td>{insp.date}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <select 
                    value={insp.status || 'open'} 
                    onChange={(e) => onStatusChange(insp.id, e.target.value)} 
                    className={`table-select status-${(insp.status || 'open').replace(' ', '-')}`}
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button className="btn-icon danger" onClick={() => onDelete(insp.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}