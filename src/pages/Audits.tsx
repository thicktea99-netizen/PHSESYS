// src/pages/Audits.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Inspections.css';

interface Audit {
  id: string;
  audit_number: number;
  title: string;
  audit_type: string;
  site: string;
  audit_date: string;
  status: string;
  score: string;
  report_url: string;
}

export default function Audits() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAudits(); }, []);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('audits').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setAudits(data || []);
    } catch (error: any) {
      alert("Error fetching audits: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatusInline = async (id: string, newStatus: string) => {
    setAudits(audits.map(a => a.id === id ? { ...a, status: newStatus } : a));
    await supabase.from('audits').update({ status: newStatus }).eq('id', id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this audit? This will also delete all findings and team members.")) return;
    try {
      const { error } = await supabase.from('audits').delete().eq('id', id);
      if (error) throw error;
      setAudits(audits.filter(a => a.id !== id));
    } catch (error: any) { alert(error.message); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Audit Register</h1>
          <p className="page-subtitle">Track internal and external audits.</p>
        </div>
        <Link to="/audits/new" className="btn-primary"><Plus size={18} /> Log Audit</Link>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Type</th>
              <th>Site</th>
              <th>Date</th>
              <th>Score</th>
              <th>Status</th>
              <th>Report</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="table-message">Loading audits...</td></tr>
            ) : audits.length === 0 ? (
              <tr><td colSpan={9} className="table-message">No audits yet. Click "Log Audit" to add one.</td></tr>
            ) : (

                            audits.map((audit) => (
                <tr key={audit.id} className="clickable-row" onClick={() => window.location.href = `/audits/${audit.id}`}>
                  <td className="font-medium">AUD-{String(audit.audit_number).padStart(4, '0')}</td>
                  <td>{audit.title}</td>
                  <td>{audit.audit_type}</td>
                  <td>{audit.site}</td>
                  <td>{new Date(audit.audit_date).toLocaleDateString()}</td>
                  <td>{audit.score || '-'}</td>
                  
                  {/* STATUS DROPDOWN - Stop propagation here */}
                  <td onClick={(e) => e.stopPropagation()}>
                    <select 
                      value={audit.status} 
                      onChange={(e) => updateStatusInline(audit.id, e.target.value)} 
                      className={`table-select status-${audit.status.toLowerCase().replace(' ', '-')}`}
                    >
                      <option value="Open">Open</option>
                      <option value="Actions Pending">Actions Pending</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>

                  <td>
                    {audit.report_url ? (
                      <a href={audit.report_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>View</a>
                    ) : '-'}
                  </td>
                  
                  {/* DELETE BUTTON - Stop propagation here */}
                  <td onClick={(e) => e.stopPropagation()}>
                    <button className="btn-icon danger" onClick={() => handleDelete(audit.id)}><Trash2 size={16} /></button>
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