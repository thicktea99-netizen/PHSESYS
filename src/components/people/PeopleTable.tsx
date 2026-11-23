// src/components/people/PeopleTable.tsx
import { Trash2 } from 'lucide-react';

interface Person {
  id: string;
  full_name: string;
  contractor_id: string;
  contractors?: { company_name: string };
  role: string;
  trade: string;
  contact: string;
  status: string;
}

interface PeopleTableProps {
  people: Person[];
  loading: boolean;
  onDelete: (id: string) => void;
}

export default function PeopleTable({ people, loading, onDelete }: PeopleTableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Contractor</th>
            <th>Role</th>
            <th>Trade</th>
            <th>Contact</th>
            <th>Status</th>
            <th style={{ width: '50px' }}></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={7} className="table-message">Loading people...</td></tr>
          ) : people.length === 0 ? (
            <tr><td colSpan={7} className="table-message">No people found.</td></tr>
          ) : (
            people.map((person) => (
              <tr key={person.id}>
                <td className="font-medium">{person.full_name}</td>
                <td>{person.contractors?.company_name || '-'}</td>
                <td>{person.role || '-'}</td>
                <td>{person.trade || '-'}</td>
                <td>{person.contact || '-'}</td>
                <td>
                  <span className={`badge ${person.status === 'active' ? 'severity-low' : 'severity-critical'}`}>
                    {person.status}
                  </span>
                </td>
                <td>
                  <button className="btn-icon danger" onClick={() => onDelete(person.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}