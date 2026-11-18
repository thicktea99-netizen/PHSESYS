// src/pages/Permits.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Inspections.css';

interface Permit {
  id: string;
  permit_number: number;
  permit_type: string;
  site: string;
  work_description: string;
  receiver_name: string;
  valid_to: string;
  status: string;
}

export default function Permits() {
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPermits(); }, []);

  const fetchPermits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('permits').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setPermits(data || []);
    } catch (error: any) {
      alert("Error fetching permits: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatusInline = async (id: string, newStatus: string) => {
    setPermits(permits.map(p => p.id === id ? { ...p, status: newStatus } : p));
    const { error } = await supabase.from('permits').update({ status: newStatus }).eq('id', id);
    if (error) {
      alert("Failed to update status: " + error.message);
      fetchPermits();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this permit?")) return;
    try {
      const { error } = await supabase.from('permits').delete().eq('id', id);
      if (error) throw error;
      setPermits(permits.filter(p => p.id !== id));
    } catch (error: any) {
      alert("Error deleting permit: " + error.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Permit to Work Register</h1>
          <p className="page-subtitle">Track high-risk work authorizations.</p>
        </div>
        <Link to="/permits/new" className="btn-primary"><Plus size={18} /> Issue Permit</Link>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Work Description</th>
              <th>Receiver</th>
              <th>Valid To</th>
              <th>Status</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="table-message">Loading permits...</td></tr>
            ) : permits.length === 0 ? (
              <tr><td colSpan={7} className="table-message">No permits issued yet. Click "Issue Permit" to add one.</td></tr>
            ) : (
              permits.map((permit) => (
                <tr 
                  key={permit.id} 
                  className="clickable-row" 
                  onClick={() => window.location.href = `/permits/${permit.id}`}
                >
                  <td className="font-medium">PTW-{String(permit.permit_number).padStart(4, '0')}</td>
                  <td>{permit.permit_type}</td>
                  <td>{permit.work_description}</td>
                  <td>{permit.receiver_name}</td>
                  <td>{new Date(permit.valid_to).toLocaleString()}</td>
                  
                  {/* STATUS DROPDOWN - Stop propagation here */}
                  <td onClick={(e) => e.stopPropagation()}>
                    <select 
                      value={permit.status} 
                      onChange={(e) => updateStatusInline(permit.id, e.target.value)} 
                      className={`table-select status-${permit.status.replace(' ', '-').toLowerCase()}`}
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                  
                  {/* DELETE BUTTON - Stop propagation here */}
                  <td onClick={(e) => e.stopPropagation()}>
                    <button className="btn-icon danger" onClick={() => handleDelete(permit.id)}><Trash2 size={16} /></button>
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