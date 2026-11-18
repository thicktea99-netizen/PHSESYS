// src/pages/PpeChecks.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Inspections.css';

interface PpeCheck {
  id: string;
  check_number: number;
  check_type: string;
  site: string;
  date: string;
  checked_by: string;
}

export default function PpeChecks() {
  const [checks, setChecks] = useState<PpeCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchChecks(); }, []);

  const fetchChecks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('ppe_checks').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setChecks(data || []);
    } catch (error: any) {
      alert("Error fetching checks: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this PPE check?")) return;
    try {
      const { error } = await supabase.from('ppe_checks').delete().eq('id', id);
      if (error) throw error;
      setChecks(checks.filter(c => c.id !== id));
    } catch (error: any) {
      alert("Error deleting check: " + error.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>PPE & Equipment Checks</h1>
          <p className="page-subtitle">Track PPE inspections and compliance.</p>
        </div>
        <Link to="/ppe-checks/new" className="btn-primary"><Plus size={18} /> Log Check</Link>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Check Type</th>
              <th>Site</th>
              <th>Date</th>
              <th>Checked By</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="table-message">Loading checks...</td></tr>
            ) : checks.length === 0 ? (
              <tr><td colSpan={6} className="table-message">No PPE checks logged yet. Click "Log Check" to add one.</td></tr>
            ) : (
              checks.map((check) => (
                <tr key={check.id}>
                  <td className="font-medium">PPE-{String(check.check_number).padStart(4, '0')}</td>
                  <td>{check.check_type}</td>
                  <td>{check.site}</td>
                  <td>{check.date}</td>
                  <td>{check.checked_by}</td>
                  <td>
                    <button className="btn-icon danger" onClick={() => handleDelete(check.id)}><Trash2 size={16} /></button>
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