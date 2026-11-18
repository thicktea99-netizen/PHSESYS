// src/pages/Hazards.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Inspections.css';

interface Hazard {
  id: string;
  hazard_number: number;
  entry_type: string;
  project_site: string;
  area: string;
  description: string;
  severity: string;
  risk_score: number;
  date_observed: string;
  status: string;
  photo_url: string;
}

export default function Hazards() {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchHazards(); }, []);

  const fetchHazards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('hazards').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setHazards(data || []);
    } catch (error: any) {
      alert("Error fetching hazards: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatusInline = async (id: string, newStatus: string) => {
    setHazards(hazards.map(h => h.id === id ? { ...h, status: newStatus } : h));
    const { error } = await supabase.from('hazards').update({ status: newStatus }).eq('id', id);
    if (error) { alert(error.message); fetchHazards(); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this hazard?")) return;
    try {
      const { error } = await supabase.from('hazards').delete().eq('id', id);
      if (error) throw error;
      setHazards(hazards.filter(h => h.id !== id));
    } catch (error: any) { alert(error.message); }
  };

  const getRiskColor = (score: number) => {
    if (!score) return 'severity-low';
    if (score <= 4) return 'severity-low';
    if (score <= 9) return 'severity-medium';
    if (score <= 15) return 'severity-high';
    return 'severity-critical';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Hazard & Observation Register</h1>
          <p className="page-subtitle">Track hazards, unsafe acts, and positive observations.</p>
        </div>
        <Link to="/hazards/new" className="btn-primary"><Plus size={18} /> Log Observation</Link>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Risk Score</th>
              <th>Photo</th>
              <th>Status</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="table-message">Loading hazards...</td></tr>
            ) : hazards.length === 0 ? (
              <tr><td colSpan={8} className="table-message">No hazards logged yet.</td></tr>
            ) : (
              hazards.map((hazard) => (
                <tr key={hazard.id}
                  className="clickable-row"
                  onClick = {() => window.location.href = `/hazards/${hazard.id}`}
                >
                  <td className="font-medium">HAZ-{String(hazard.hazard_number).padStart(4, '0')}</td>
                  <td>{hazard.date_observed}</td>
                  <td>{hazard.entry_type}</td>
                  <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {hazard.description}
                  </td>
                  <td>
                    {hazard.risk_score ? (
                      <span className={`badge ${getRiskColor(hazard.risk_score)}`}>
                        {hazard.risk_score} / 25
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                    )}
                  </td>
                  <td>
                    {hazard.photo_url ? (
                      <a href={hazard.photo_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>View</a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>None</span>
                    )}
                  </td>
                  <td onClick = {(e) => e.stopPropagation()}>
                    <select value={hazard.status} onChange={(e) => updateStatusInline(hazard.id, e.target.value)} className={`table-select status-${hazard.status.replace(' ', '-')}`}>
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td onClick = {(e) => e.stopPropagation()}>
                    <button className="btn-icon danger" onClick={() => handleDelete(hazard.id)}><Trash2 size={16} /></button>
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