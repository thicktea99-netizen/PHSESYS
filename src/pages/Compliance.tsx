// src/pages/Compliance.tsx
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ComplianceStats from '../components/compliance/ComplianceStats';
import ComplianceFilters from '../components/compliance/ComplianceFilters';
import ComplianceTable from '../components/compliance/ComplianceTable';
import '../styles/Incidents.css';

interface Compliance {
  id: string;
  compliance_number: number;
  obligation_name: string;
  authority: string;
  expiry_date: string;
  renewal_lead_days: number;
  file_url: string;
  site: string;
}

export default function Compliance() {
  const [records, setRecords] = useState<Compliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  
  const [statusFilter, setStatusFilter] = useState('All');
  const [siteFilter, setSiteFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRecords();
    fetchSites();
  }, []);

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

  const fetchSites = async () => {
    const { data } = await supabase.from('sites').select('id, name').eq('status', 'active');
    if (data) setSitesList(data);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this compliance record?")) return;
    await supabase.from('compliance_register').delete().eq('id', id);
    setRecords(records.filter(r => r.id !== id));
  };

  // Filter logic
  const filteredRecords = records.filter(record => {
    const today = new Date();
    const expiry = record.expiry_date ? new Date(record.expiry_date) : null;
    const diffDays = expiry ? Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

    let matchesStatus = true;
    if (statusFilter === 'valid') matchesStatus = !expiry || diffDays! > (record.renewal_lead_days || 60);
    else if (statusFilter === 'expiring') matchesStatus = expiry !== null && diffDays! > 0 && diffDays! <= (record.renewal_lead_days || 60);
    else if (statusFilter === 'expired') matchesStatus = expiry !== null && diffDays! < 0;

    const matchesSite = siteFilter === 'All' || record.site === siteFilter;
    const matchesSearch = searchQuery === '' || 
      record.obligation_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.authority && record.authority.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSite && matchesSearch;
  });

  // Stats
  const total = records.length;
  const today = new Date();
  const valid = records.filter(r => !r.expiry_date || new Date(r.expiry_date) > new Date(today.getTime() + (r.renewal_lead_days || 60) * 24 * 60 * 60 * 1000)).length;
  const expiringSoon = records.filter(r => r.expiry_date && new Date(r.expiry_date) > today && new Date(r.expiry_date) <= new Date(today.getTime() + (r.renewal_lead_days || 60) * 24 * 60 * 60 * 1000)).length;
  const expired = records.filter(r => r.expiry_date && new Date(r.expiry_date) < today).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Legal & Compliance Register</h1>
          <p className="page-subtitle">Track certificates, licenses, and permits.</p>
        </div>
        <Link to="/compliance/new" className="btn-primary"><Plus size={18} /> Add Record</Link>
      </div>

      <ComplianceStats total={total} valid={valid} expiringSoon={expiringSoon} expired={expired} />

      <ComplianceFilters 
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        siteFilter={siteFilter}
        onSiteChange={setSiteFilter}
        sitesList={sitesList}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <ComplianceTable 
        records={filteredRecords}
        loading={loading}
        onDelete={handleDelete}
      />
    </div>
  );
}