// src/components/capa/CapaTable.tsx
import { Trash2 } from 'lucide-react';

interface CapaAction {
  id: string;
  capa_number: number;
  action_title: string;
  source_type: string;
  priority: string;
  owner: string;
  due_date: string;
  status: string;
}

interface CapaTableProps {
  actions: CapaAction[];
  loading: boolean;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export default function CapaTable({ actions, loading, onStatusChange, onDelete }: CapaTableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>CAPA ID</th>
            <th>Action Title</th>
            <th>Source</th>
            <th>Priority</th>
            <th>Owner</th>
            <th>Due Date</th>
            <th>Status</th>
            <th style={{ width: '50px' }}></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={8} className="table-message">Loading actions...</td></tr>
          ) : actions.length === 0 ? (
            <tr><td colSpan={8} className="table-message">No CAPA actions found.</td></tr>
          ) : (
            actions.map((action) => (
              <tr 
                key={action.id}
                className="clickable-row"
                onClick={() => window.location.href = `/capa/${action.id}`}
              >
                <td className="table-link" onClick={() => window.location.href = `/capa/${action.id}`}>
                  CAPA-{String(action.capa_number).padStart(4, '0')}
                </td>
                <td>{action.action_title}</td>
                <td>{action.source_type}</td>
                <td>
                  <span className={`badge severity-${action.priority === 'Critical' ? 'critical' : action.priority === 'High' ? 'high' : 'medium'}`}>
                    {action.priority}
                  </span>
                </td>
                <td>{action.owner}</td>
                <td>{action.due_date}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <select 
                    value={action.status} 
                    onChange={(e) => onStatusChange(action.id, e.target.value)} 
                    className={`table-select status-${action.status.replace(' ', '-')}`}
                  >
                    <option value="open">Open</option>
                    <option value="in progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td>
                  <button className="btn-icon danger" onClick={() => onDelete(action.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}