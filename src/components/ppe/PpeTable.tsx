// src/components/ppe/PpeTable.tsx
import { Trash2 } from 'lucide-react';

interface PpeCheck {
  id: string;
  check_number: number;
  check_type: string;
  site: string;
  date: string;
  checked_by: string;
}

interface PpeTableProps {
  checks: PpeCheck[];
  loading: boolean;
  onDelete: (id: string) => void;
}

export default function PpeTable({ checks, loading, onDelete }: PpeTableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Check Type</th>
            <th>Site</th>
            <th>Date</th>
            <th>Checked By</th>
            <th style={{ width: '50px' }}></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} className="table-message">Loading checks...</td></tr>
          ) : checks.length === 0 ? (
            <tr><td colSpan={6} className="table-message">No PPE checks found.</td></tr>
          ) : (
            checks.map((check) => (
              <tr key={check.id} className="clickable-row" onClick={() => window.location.href = `/ppe-checks/${check.id}`}>
                <td className="font-medium">PPE-{String(check.check_number).padStart(4, '0')}</td>
                <td>{check.check_type}</td>
                <td>{check.site}</td>
                <td>{check.date}</td>
                <td>{check.checked_by}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button className="btn-icon danger" onClick={() => onDelete(check.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}