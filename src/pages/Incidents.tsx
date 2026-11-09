

// src/pages/Incidents.tsx
import { Plus } from 'lucide-react';

import { Link } from 'react-router-dom';


// Mock data to visualize the table
const mockIncidents = [
  { id: 'INC-2026-014', date: '2026-10-15', type: 'Near-Miss', severity: 'High', area: 'Level 3 - Column B4', status: 'Investigating' },
  { id: 'INC-2026-013', date: '2026-10-12', type: 'First Aid', severity: 'Medium', area: 'Podium Zone', status: 'Closed' },
  { id: 'INC-2026-012', date: '2026-10-10', type: 'Property Damage', severity: 'Low', area: 'Access Road', status: 'Actions Pending' },
];

export default function Incidents() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Incident & Near-Miss Register</h1>
          <p className="page-subtitle">Track, investigate, and close all site incidents.</p>
        </div>

        {/* <button className="btn-primary">
          <Plus size={18} />
          Log Incident
        </button> */}
        <Link to="/incidents/new" className="btn-primary">
          <Plus size={18} />
          Log Incident
        </Link>

      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Incident ID</th>
              <th>Date</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Area / Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockIncidents.map((incident) => (
              <tr key={incident.id}>
                <td className="font-medium">{incident.id}</td>
                <td>{incident.date}</td>
                <td>{incident.type}</td>
                <td>
                  <span className={`badge severity-${incident.severity.toLowerCase()}`}>
                    {incident.severity}
                  </span>
                </td>
                <td>{incident.area}</td>
                <td>
                  <span className={`badge status-${incident.status.toLowerCase().replace(' ', '-')}`}>
                    {incident.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}