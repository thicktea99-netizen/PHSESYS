// src/components/sites/SiteTable.tsx
import { Trash2 } from 'lucide-react';

interface Site {
  id: string;
  name: string;
  location: string;
  status: string;
  projects?: { project_name: string };
  assembly_point: string;
  hospital_name: string;
  first_aider_present: boolean;
}

interface SiteTableProps {
  sites: Site[];
  loading: boolean;
  onDelete: (id: string) => void;
}

export default function SiteTable({ sites, loading, onDelete }: SiteTableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Site Name</th>
            <th>Project</th>
            <th>Location</th>
            <th>Assembly Point</th>
            <th>Hospital</th>
            <th>First Aider</th>
            <th>Status</th>
            <th style={{ width: '50px' }}></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={8} className="table-message">Loading sites...</td></tr>
          ) : sites.length === 0 ? (
            <tr><td colSpan={8} className="table-message">No sites found.</td></tr>
          ) : (
            sites.map((site) => (
              <tr key={site.id}>
                <td className="font-medium">{site.name}</td>
                <td>{site.projects?.project_name || '-'}</td>
                <td>{site.location || '-'}</td>
                <td>{site.assembly_point || '-'}</td>
                <td>{site.hospital_name || '-'}</td>
                <td>{site.first_aider_present ? 'Yes' : 'No'}</td>
                <td><span className={`badge ${site.status === 'active' ? 'severity-low' : 'severity-medium'}`}>{site.status}</span></td>
                <td><button className="btn-icon danger" onClick={() => onDelete(site.id)}><Trash2 size={16} /></button></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}