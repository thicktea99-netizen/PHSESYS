// src/components/permits/PermitTable.tsx
import { Trash2 } from 'lucide-react';

interface Permit {
  id: string;
  permit_number: number;
  permit_type: string;
  site: string;
  work_description: string;
  receiver_name: string;
  valid_to: string;
  status: string;
}

interface PermitTableProps {
  permits: Permit[];
  loading: boolean;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export default function PermitTable({ permits, loading, onStatusChange, onDelete }: PermitTableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Work Description</th>
            <th>Receiver</th>
            <th>Valid To</th>
            <th>Status</th>
            <th style={{ width: '50px' }}></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={7} className="table-message">Loading permits...</td></tr>
          ) : permits.length === 0 ? (
            <tr><td colSpan={7} className="table-message">No permits found.</td></tr>
          ) : (
            permits.map((permit) => (
              <tr key={permit.id} className="clickable-row" onClick={() => window.location.href = `/permits/${permit.id}`}>
                <td className="font-medium">PTW-{String(permit.permit_number).padStart(4, '0')}</td>
                <td>{permit.permit_type}</td>
                <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {permit.work_description}
                </td>
                <td>{permit.receiver_name}</td>
                <td>{new Date(permit.valid_to).toLocaleString()}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <select 
                    value={permit.status} 
                    onChange={(e) => onStatusChange(permit.id, e.target.value)} 
                    className={`table-select status-${permit.status.replace(' ', '-')}`}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Closed">Closed</option>
                  </select>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button className="btn-icon danger" onClick={() => onDelete(permit.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}