// src/pages/Permits.tsx
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import PermitStats from '../components/permits/PermitStats';
import PermitFilters from '../components/permits/PermitFilters';
import PermitTable from '../components/permits/PermitTable';
import '../styles/Incidents.css';

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
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  
  const [statusFilter, setStatusFilter] = useState('All');
  const [siteFilter, setSiteFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPermits();
    fetchSites();
  }, []);

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

  const fetchSites = async () => {
    const { data } = await supabase.from('sites').select('id, name').eq('status', 'active');
    if (data) setSitesList(data);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setPermits(permits.map(p => p.id === id ? { ...p, status: newStatus } : p));
    await supabase.from('permits').update({ status: newStatus }).eq('id', id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this permit?")) return;
    await supabase.from('permits').delete().eq('id', id);
    setPermits(permits.filter(p => p.id !== id));
  };

  // Filter logic
  const filteredPermits = permits.filter(permit => {
    const matchesStatus = statusFilter === 'All' || permit.status === statusFilter;
    const matchesSite = siteFilter === 'All' || permit.site === siteFilter;
    const matchesSearch = searchQuery === '' || 
      permit.work_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permit.receiver_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSite && matchesSearch;
  });

  // Stats
  const total = permits.length;
  const active = permits.filter(p => p.status === 'Active').length;
  const closed = permits.filter(p => p.status === 'Closed').length;
  const expired = permits.filter(p => p.valid_to && new Date(p.valid_to) < new Date() && p.status === 'Active').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Permit to Work Register</h1>
          <p className="page-subtitle">Track high-risk work authorizations.</p>
        </div>
        <Link to="/permits/new" className="btn-primary"><Plus size={18} /> Issue Permit</Link>
      </div>

      <PermitStats total={total} active={active} closed={closed} expired={expired} />

      <PermitFilters 
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        siteFilter={siteFilter}
        onSiteChange={setSiteFilter}
        sitesList={sitesList}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <PermitTable 
        permits={filteredPermits}
        loading={loading}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  );
}