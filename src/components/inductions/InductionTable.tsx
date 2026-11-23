// src/components/inductions/InductionTable.tsx
import { Trash2 } from 'lucide-react';

interface Induction {
  id: string;
  induction_number: number;
  person_name: string;
  company: string;
  site: string;
  induction_date: string;
  inducted_by: string;
}

interface InductionTableProps {
  inductions: Induction[];
  loading: boolean;
  onDelete: (id: string) => void;
}

export default function InductionTable({ inductions, loading, onDelete }: InductionTableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Person Name</th>
            <th>Company</th>
            <th>Site</th>
            <th>Date</th>
            <th>Inducted By</th>
            <th style={{ width: '50px' }}></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={7} className="table-message">Loading inductions...</td></tr>
          ) : inductions.length === 0 ? (
            <tr><td colSpan={7} className="table-message">No inductions found.</td></tr>
          ) : (
            inductions.map((induction) => (
              <tr key={induction.id} className="clickable-row" onClick={() => window.location.href = `/inductions/${induction.id}`}>
                <td className="font-medium">IND-{String(induction.induction_number).padStart(4, '0')}</td>
                <td>{induction.person_name}</td>
                <td>{induction.company || '-'}</td>
                <td>{induction.site}</td>
                <td>{new Date(induction.induction_date).toLocaleDateString()}</td>
                <td>{induction.inducted_by || '-'}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button className="btn-icon danger" onClick={() => onDelete(induction.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}