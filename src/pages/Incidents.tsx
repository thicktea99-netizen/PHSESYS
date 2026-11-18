

// src/pages/Incidents.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Incidents.css';

interface Incident {
  id: string;
  incident_number: number;
  incident_type: string;
  date_of_occurrence: string;
  severity: string;
  area: string;
  status: string;
}

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
    } catch (error: any) {
      alert("Error fetching incidents: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatusInline = async (id: string, newStatus: string) => {
    setIncidents(incidents.map(i => i.id === id ? { ...i, status: newStatus } : i));
    
    const { error } = await supabase
      .from('incidents')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert("Failed to update status: " + error.message);
      fetchIncidents();
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this incident? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('incidents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove it from the UI instantly
      setIncidents(incidents.filter(i => i.id !== id));
    } catch (error: any) {
      alert("Error deleting incident: " + error.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Incident Register</h1>
          <p className="page-subtitle">Track, investigate, and close all site incidents.</p>
        </div>
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
              <th style={{ width: '50px' }}></th> {/* Empty header for trash icon */}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="table-message">Loading incidents...</td>
              </tr>
            ) : incidents.length === 0 ? (
              <tr>
                <td colSpan={7} className="table-message">No incidents logged yet. Click "Log Incident" to add one.</td>
              </tr>
            ) : (
              incidents.map((incident) => (
                <tr 
                  key={incident.id} 
                  className="clickable-row" 
                  onClick={() => window.location.href = `/incidents/${incident.id}`}
                >
                  <td className="font-medium">INC-{String(incident.incident_number).padStart(4, '0')}</td>
                  <td>{incident.date_of_occurrence}</td>
                  <td className="text-capitalize">{incident.incident_type.replace('-', ' ')}</td>
                  <td>
                    <span className={`badge severity-${incident.severity.toLowerCase()}`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td>{incident.area}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select 
                      value={incident.status || 'reported'} 
                      onChange={(e) => updateStatusInline(incident.id, e.target.value)}
                      className={`table-select status-${(incident.status || 'reported').replace(' ', '-')}`}
                    >
                      <option value="reported">Reported</option>
                      <option value="investigating">Investigating</option>
                      <option value="actions pending">Actions Pending</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="btn-icon danger" 
                      onClick={() => handleDelete(incident.id)}
                      title="Delete Incident"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}