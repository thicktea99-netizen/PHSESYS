// src/components/drills/DrillTable.tsx
import { Trash2 } from 'lucide-react';

interface Drill {
  id: string;
  drill_number: number;
  drill_type: string;
  site: string;
  date: string;
  total_participants: number;
  status: string;
}

interface DrillTableProps {
  drills: Drill[];
  loading: boolean;
  onDelete: (id: string) => void;
}

export default function DrillTable({ drills, loading, onDelete }: DrillTableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Drill Type</th>
            <th>Site</th>
            <th>Date</th>
            <th>Participants</th>
            <th>Status</th>
            <th style={{ width: '50px' }}></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={7} className="table-message">Loading drills...</td></tr>
          ) : drills.length === 0 ? (
            <tr><td colSpan={7} className="table-message">No drills found.</td></tr>
          ) : (
            drills.map((drill) => (
              <tr key={drill.id} className="clickable-row" onClick={() => window.location.href = `/drills/${drill.id}`}>
                <td className="font-medium">DRL-{String(drill.drill_number).padStart(4, '0')}</td>
                <td>{drill.drill_type}</td>
                <td>{drill.site}</td>
                <td>{new Date(drill.date).toLocaleDateString()}</td>
                <td>{drill.total_participants || '-'}</td>
                <td>
                  <span className={`badge ${drill.status === 'Completed' ? 'severity-low' : drill.status === 'Cancelled' ? 'severity-critical' : 'severity-medium'}`}>
                    {drill.status}
                  </span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button className="btn-icon danger" onClick={() => onDelete(drill.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}