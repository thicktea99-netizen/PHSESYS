// src/pages/Drills.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Inspections.css';

interface Drill {
  id: string;
  drill_number: number;
  drill_type: string;
  site: string;
  date: string;
  total_participants: number;
  status: string;
}

export default function Drills() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDrills(); }, []);

  const fetchDrills = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('drills').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setDrills(data || []);
    } catch (error: any) {
      alert("Error fetching drills: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this drill record?")) return;
    try {
      const { error } = await supabase.from('drills').delete().eq('id', id);
      if (error) throw error;
      setDrills(drills.filter(d => d.id !== id));
    } catch (error: any) { alert(error.message); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Drills & Exercises</h1>
          <p className="page-subtitle">Track emergency drills and their findings.</p>
        </div>
        <Link to="/drills/new" className="btn-primary"><Plus size={18} /> Log Drill</Link>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Drill Type</th>
              <th>Site</th>
              <th>Date</th>
              <th>Participants</th>
              <th>Status</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="table-message">Loading drills...</td></tr>
            ) : drills.length === 0 ? (
              <tr><td colSpan={7} className="table-message">No drills logged yet.</td></tr>
            ) : (
              drills.map((drill) => (
                <tr key={drill.id} className="clickable-row" onClick={() => window.location.href = `/drills/${drill.id}`}>
                  <td className="font-medium">DRL-{String(drill.drill_number).padStart(4, '0')}</td>
                  <td>{drill.drill_type}</td>
                  <td>{drill.site}</td>
                  <td>{new Date(drill.date).toLocaleDateString()}</td>
                  <td>{drill.total_participants || '-'}</td>
                  <td>
                    <span className={`badge ${drill.status === 'Completed' ? 'severity-low' : drill.status === 'Cancelled' ? 'severity-critical' : 'severity-medium'}`}>
                      {drill.status}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button className="btn-icon danger" onClick={() => handleDelete(drill.id)}><Trash2 size={16} /></button>
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