// src/pages/Training.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Inspections.css';

interface Certification {
  id: string;
  cert_number: number;
  person_name: string;
  company: string;
  cert_type: string;
  expiry_date: string;
  file_url: string;
}

export default function Training() {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCerts(); }, []);

  const fetchCerts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('certifications').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCerts(data || []);
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this certification?")) return;
    try {
      const { error } = await supabase.from('certifications').delete().eq('id', id);
      if (error) throw error;
      setCerts(certs.filter(c => c.id !== id));
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  const getStatus = (expiryDate: string) => {
    if (!expiryDate) return { label: 'No Expiry', color: 'severity-low' };
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'Expired', color: 'severity-critical' };
    if (diffDays <= 60) return { label: 'Expiring Soon', color: 'severity-high' };
    return { label: 'Valid', color: 'severity-low' };
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Training & Certifications</h1><p className="page-subtitle">Click any row to update dates or upload new certificates.</p></div>
        <Link to="/training/new" className="btn-primary"><Plus size={18} /> Add Certification</Link>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Person Name</th>
              <th>Company</th>
              <th>Certification Type</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Document</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="table-message">Loading certifications...</td></tr>
            ) : certs.length === 0 ? (
              <tr><td colSpan={8} className="table-message">No certifications logged yet.</td></tr>
            ) : (
              certs.map((cert) => {
                const status = getStatus(cert.expiry_date);
                return (
                  <tr key={cert.id} className="clickable-row" onClick={() => window.location.href = `/training/${cert.id}`}>
                    <td className="font-medium">CERT-{String(cert.cert_number).padStart(4, '0')}</td>
                    <td>{cert.person_name}</td>
                    <td>{cert.company || '-'}</td>
                    <td>{cert.cert_type}</td>
                    <td>{cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString() : 'N/A'}</td>
                    <td><span className={`badge ${status.color}`}>{status.label}</span></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {cert.file_url ? (
                        <a href={cert.file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>View File</a>
                      ) : <span style={{ color: 'var(--text-muted)' }}>None</span>}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button className="btn-icon danger" onClick={() => handleDelete(cert.id)}><Trash2 size={16} /></button>
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