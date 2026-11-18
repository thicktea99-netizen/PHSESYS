// src/pages/Compliance.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Inspections.css';

interface Compliance {
  id: string;
  compliance_number: number;
  obligation_name: string;
  authority: string;
  expiry_date: string;
  renewal_lead_days: number;
  file_url: string;
}

export default function Compliance() {
  const [records, setRecords] = useState<Compliance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRecords(); }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('compliance_register').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      alert("Error fetching records: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      const { error } = await supabase.from('compliance_register').delete().eq('id', id);
      if (error) throw error;
      setRecords(records.filter(r => r.id !== id));
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  const getStatus = (expiryDate: string, leadDays: number) => {
    if (!expiryDate) return { label: 'No Expiry', color: 'status-active' };
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'Expired', color: 'status-expired' };
    if (diffDays <= leadDays) return { label: 'Expiring Soon', color: 'status-suspended' };
    return { label: 'Valid', color: 'status-active' };
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Legal & Compliance Register</h1><p className="page-subtitle">Click any row to update dates or upload new documents.</p></div>
        <Link to="/compliance/new" className="btn-primary"><Plus size={18} /> Add Record</Link>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Obligation Name</th>
              <th>Authority</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Document</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="table-message">Loading records...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={7} className="table-message">No compliance records yet.</td></tr>
            ) : (
              records.map((record) => {
                const status = getStatus(record.expiry_date, record.renewal_lead_days);
                return (
                  <tr key={record.id} className="clickable-row" onClick={() => window.location.href = `/compliance/${record.id}`}>
                    <td className="font-medium">CMP-{String(record.compliance_number).padStart(4, '0')}</td>
                    <td>{record.obligation_name}</td>
                    <td>{record.authority || '-'}</td>
                    <td>{record.expiry_date ? new Date(record.expiry_date).toLocaleDateString() : 'N/A'}</td>
                    <td><span className={`badge ${status.color.replace('status-', 'severity-')}`}>{status.label}</span></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {record.file_url ? (
                        <a href={record.file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>View File</a>
                      ) : <span style={{ color: 'var(--text-muted)' }}>None</span>}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button className="btn-icon danger" onClick={() => handleDelete(record.id)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}