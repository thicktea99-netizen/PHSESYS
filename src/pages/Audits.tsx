// src/pages/Audits.tsx
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AuditStats from '../components/audits/AuditStats';
import AuditFilters from '../components/audits/AuditFilters';
import AuditTable from '../components/audits/AuditTable';
import '../styles/Incidents.css';

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
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  const [totalFindings, setTotalFindings] = useState(0);
  
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [siteFilter, setSiteFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAudits();
    fetchSites();
    fetchFindingsCount();
  }, []);

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

  const fetchSites = async () => {
    const { data } = await supabase.from('sites').select('id, name').eq('status', 'active');
    if (data) setSitesList(data);
  };

  const fetchFindingsCount = async () => {
    const { count } = await supabase.from('audit_findings').select('*', { count: 'exact', head: true });
    setTotalFindings(count || 0);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setAudits(audits.map(a => a.id === id ? { ...a, status: newStatus } : a));
    await supabase.from('audits').update({ status: newStatus }).eq('id', id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this audit? This will also delete all findings.")) return;
    await supabase.from('audits').delete().eq('id', id);
    setAudits(audits.filter(a => a.id !== id));
  };

  // Filter logic
  const filteredAudits = audits.filter(audit => {
    const matchesStatus = statusFilter === 'All' || audit.status === statusFilter;
    const matchesType = typeFilter === 'All' || audit.audit_type === typeFilter;
    const matchesSite = siteFilter === 'All' || audit.site === siteFilter;
    const matchesSearch = searchQuery === '' || 
      audit.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSite && matchesSearch;
  });

  // Stats
  const total = audits.length;
  const open = audits.filter(a => a.status !== 'Closed').length;
  const closed = audits.filter(a => a.status === 'Closed').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Audit Register</h1>
          <p className="page-subtitle">Track internal and external audits.</p>
        </div>
        <Link to="/audits/new" className="btn-primary"><Plus size={18} /> Log Audit</Link>
      </div>

      <AuditStats total={total} open={open} closed={closed} totalFindings={totalFindings} />

      <AuditFilters 
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        siteFilter={siteFilter}
        onSiteChange={setSiteFilter}
        sitesList={sitesList}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <AuditTable 
        audits={filteredAudits}
        loading={loading}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  );
}