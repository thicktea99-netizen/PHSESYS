// src/pages/Inductions.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Incidents.css';

interface Induction {
  id: string;
  induction_number: number;
  site: string;
  induction_date: string;
  inducted_by: string;
  attendee_count: number;
  evidence_url: string;
}

export default function Inductions() {
  const [inductions, setInductions] = useState<Induction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchInductions(); }, []);

  const fetchInductions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('inductions').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setInductions(data || []);
    } catch (error: any) {
      alert("Error fetching inductions: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this induction session?")) return;
    await supabase.from('inductions').delete().eq('id', id);
    setInductions(inductions.filter(i => i.id !== id));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Site Inductions</h1>
          <p className="page-subtitle">Track site induction sessions and attendance.</p>
        </div>
        <Link to="/inductions/new" className="btn-primary"><Plus size={18} /> Log Session</Link>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Site</th>
              <th>Date</th>
              <th>Inducted By</th>
              <th>Attendees</th>
              <th>Attendance Sheet</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="table-message">Loading inductions...</td></tr>
            ) : inductions.length === 0 ? (
              <tr><td colSpan={7} className="table-message">No induction sessions found.</td></tr>
            ) : (
              inductions.map((induction) => (
                <tr key={induction.id} className="clickable-row" onClick={() => window.location.href = `/inductions/${induction.id}`}>
                  <td className="font-medium">IND-{String(induction.induction_number).padStart(4, '0')}</td>
                  <td>{induction.site}</td>
                  <td>{new Date(induction.induction_date).toLocaleDateString()}</td>
                  <td>{induction.inducted_by || '-'}</td>
                  <td>{induction.attendee_count || 0}</td>
                  <td>
                    {induction.evidence_url ? (
                      <a href={induction.evidence_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>View</a>
                    ) : '-'}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button className="btn-icon danger" onClick={() => handleDelete(induction.id)}><Trash2 size={16} /></button>
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