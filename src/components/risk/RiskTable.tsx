// src/components/risk/RiskTable.tsx
import { Trash2 } from 'lucide-react';

interface RiskAssessment {
  id: string;
  ra_number: number;
  task_name: string;
  assessment_type: string;
  site: string;
  assessor_name: string;
  date_of_assessment: string;
  status: string;
}

interface RiskTableProps {
  assessments: RiskAssessment[];
  loading: boolean;
  onDelete: (id: string) => void;
}

export default function RiskTable({ assessments, loading, onDelete }: RiskTableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Task Name</th>
            <th>Site</th>
            <th>Assessor</th>
            <th>Date</th>
            <th>Status</th>
            <th style={{ width: '50px' }}></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={8} className="table-message">Loading assessments...</td></tr>
          ) : assessments.length === 0 ? (
            <tr><td colSpan={8} className="table-message">No assessments found.</td></tr>
          ) : (
            assessments.map((item) => (
              <tr key={item.id} className="clickable-row" onClick={() => window.location.href = `/risk-assessments/${item.id}`}>
                <td className="font-medium">RA-{String(item.ra_number).padStart(4, '0')}</td>
                <td>
                  <span className="badge" style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}>
                    {item.assessment_type}
                  </span>
                </td>
                <td>{item.task_name}</td>
                <td>{item.site}</td>
                <td>{item.assessor_name}</td>
                <td>{new Date(item.date_of_assessment).toLocaleDateString()}</td>
                <td>
                  <span className={`badge ${item.status === 'Approved' ? 'severity-low' : item.status === 'Expired' ? 'severity-critical' : 'severity-medium'}`}>
                    {item.status}
                  </span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button className="btn-icon danger" onClick={() => onDelete(item.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}