// src/components/trainingSessions/TrainingSessionTable.tsx
import { Trash2 } from 'lucide-react';

interface TrainingSession {
  id: string;
  training_number: number;
  title: string;
  training_type: string;
  site: string;
  date: string;
  attendee_count: number;
}

interface TrainingSessionTableProps {
  sessions: TrainingSession[];
  loading: boolean;
  onDelete: (id: string) => void;
}

export default function TrainingSessionTable({ sessions, loading, onDelete }: TrainingSessionTableProps) {
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
            <th>Attendees</th>
            <th style={{ width: '50px' }}></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={7} className="table-message">Loading sessions...</td></tr>
          ) : sessions.length === 0 ? (
            <tr><td colSpan={7} className="table-message">No training sessions found.</td></tr>
          ) : (
            sessions.map((session) => (
              <tr key={session.id} className="clickable-row" onClick={() => window.location.href = `/training-sessions/${session.id}`}>
                <td className="font-medium">TRN-{String(session.training_number).padStart(4, '0')}</td>
                <td>{session.title}</td>
                <td>{session.training_type || '-'}</td>
                <td>{session.site || '-'}</td>
                <td>{new Date(session.date).toLocaleDateString()}</td>
                <td>{session.attendee_count}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button className="btn-icon danger" onClick={() => onDelete(session.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}