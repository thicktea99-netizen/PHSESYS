// src/components/toolbox/ToolboxTable.tsx
import { Trash2 } from 'lucide-react';

interface ToolboxTalk {
  id: string;
  talk_number: number;
  topic: string;
  site: string;
  date: string;
  presenter_name: string;
  attendee_count: number;
  category: string;
}

interface ToolboxTableProps {
  talks: ToolboxTalk[];
  loading: boolean;
  onDelete: (id: string) => void;
}

export default function ToolboxTable({ talks, loading, onDelete }: ToolboxTableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Topic</th>
            <th>Category</th>
            <th>Site</th>
            <th>Date</th>
            <th>Presenter</th>
            <th>Attendees</th>
            <th style={{ width: '50px' }}></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={8} className="table-message">Loading talks...</td></tr>
          ) : talks.length === 0 ? (
            <tr><td colSpan={8} className="table-message">No toolbox talks found.</td></tr>
          ) : (
            talks.map((talk) => (
              <tr key={talk.id} className="clickable-row" onClick={() => window.location.href = `/toolbox-talks/${talk.id}`}>
                <td className="font-medium">TBT-{String(talk.talk_number).padStart(4, '0')}</td>
                <td>{talk.topic}</td>
                <td>{talk.category || '-'}</td>
                <td>{talk.site}</td>
                <td>{new Date(talk.date).toLocaleDateString()}</td>
                <td>{talk.presenter_name}</td>
                <td>{talk.attendee_count || 0}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button className="btn-icon danger" onClick={() => onDelete(talk.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}