// src/pages/Training.tsx
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import TrainingStats from '../components/training/TrainingStats';
import TrainingFilters from '../components/training/TrainingFilters';
import TrainingTable from '../components/training/TrainingTable';
import '../styles/Incidents.css';

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
  
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCerts();
  }, []);

  const fetchCerts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('certifications').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCerts(data || []);
    } catch (error: any) {
      alert("Error fetching certifications: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this certification?")) return;
    await supabase.from('certifications').delete().eq('id', id);
    setCerts(certs.filter(c => c.id !== id));
  };

  // Filter logic
  const filteredCerts = certs.filter(cert => {
    const today = new Date();
    const expiry = cert.expiry_date ? new Date(cert.expiry_date) : null;
    const diffDays = expiry ? Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

    let matchesStatus = true;
    if (statusFilter === 'valid') matchesStatus = !expiry || diffDays! > 60;
    else if (statusFilter === 'expiring') matchesStatus = expiry !== null && diffDays! > 0 && diffDays! <= 60;
    else if (statusFilter === 'expired') matchesStatus = expiry !== null && diffDays! < 0;

    const matchesSearch = searchQuery === '' || 
      cert.person_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.cert_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Stats
  const total = certs.length;
  const today = new Date();
  const valid = certs.filter(c => !c.expiry_date || new Date(c.expiry_date) > new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)).length;
  const expiringSoon = certs.filter(c => c.expiry_date && new Date(c.expiry_date) > today && new Date(c.expiry_date) <= new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)).length;
  const expired = certs.filter(c => c.expiry_date && new Date(c.expiry_date) < today).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Training & Certifications</h1>
          <p className="page-subtitle">Track worker competencies and expiry dates.</p>
        </div>
        <Link to="/training/new" className="btn-primary"><Plus size={18} /> Add Certification</Link>
      </div>

      <TrainingStats total={total} valid={valid} expiringSoon={expiringSoon} expired={expired} />

      <TrainingFilters 
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <TrainingTable 
        certs={filteredCerts}
        loading={loading}
        onDelete={handleDelete}
      />
    </div>
  );
}