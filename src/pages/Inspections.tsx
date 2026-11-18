// src/pages/Inspections.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Inspections.css';

interface Inspection {
  id: string;
  inspection_number: number;
  inspection_type: string;
  site: string;
  area: string;
  date: string;
  status: string;
}

export default function Inspections() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inspections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInspections(data || []);
    } catch (error: any) {
      alert("Error fetching inspections: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatusInline = async (id: string, newStatus: string) => {
    setInspections(inspections.map(i => i.id === id ? { ...i, status: newStatus } : i));
    const { error } = await supabase.from('inspections').update({ status: newStatus }).eq('id', id);
    if (error) {
      alert("Failed to update status: " + error.message);
      fetchInspections();
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this inspection? This will also delete all findings linked to it.");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from('inspections').delete().eq('id', id);
      if (error) throw error;
      setInspections(inspections.filter(i => i.id !== id));
    } catch (error: any) {
      alert("Error deleting inspection: " + error.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Inspections & Daily Walks</h1>
          <p className="page-subtitle">Track all site inspections and findings.</p>
        </div>
        <Link to="/inspections/new" className="btn-primary">
          <Plus size={18} />
          Log Inspection
        </Link>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Site</th>
              <th>Area</th>
              <th>Date</th>
              <th>Status</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="table-message">Loading inspections...</td></tr>
            ) : inspections.length === 0 ? (
              <tr><td colSpan={7} className="table-message">No inspections logged yet. Click "Log Inspection" to add one.</td></tr>
            ) : (
              inspections.map((insp) => (
                <tr key={insp.id} onClick={() => window.location.href = `/inspections/${insp.id}`} className="clickable-row">
                  <td className="font-medium">INS-{String(insp.inspection_number).padStart(4, '0')}</td>
                  <td>{insp.inspection_type}</td>
                  <td>{insp.site}</td>
                  <td>{insp.area || '-'}</td>
                  <td>{insp.date}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select 
                      value={insp.status || 'open'} 
                      onChange={(e) => updateStatusInline(insp.id, e.target.value)}
                      className={`table-select status-${(insp.status || 'open').replace(' ', '-')}`}
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button className="btn-icon danger" onClick={() => handleDelete(insp.id)} title="Delete Inspection">
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