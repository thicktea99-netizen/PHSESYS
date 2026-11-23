// src/pages/PpeChecks.tsx
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import PpeStats from '../components/ppe/PpeStats';
import PpeFilters from '../components/ppe/PpeFilters';
import PpeTable from '../components/ppe/PpeTable';
import '../styles/Incidents.css';

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
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  const [totalCompliant, setTotalCompliant] = useState(0);
  const [totalNonCompliant, setTotalNonCompliant] = useState(0);
  const [checksThisMonth, setChecksThisMonth] = useState(0);

  const [siteFilter, setSiteFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchChecks();
    fetchSites();
    fetchLinesStats();
  }, []);

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

  const fetchSites = async () => {
    const { data } = await supabase.from('sites').select('id, name').eq('status', 'active');
    if (data) setSitesList(data);
  };

  const fetchLinesStats = async () => {
    const { data: lines } = await supabase.from('ppe_check_lines').select('*');
    if (lines) {
      const compliant = lines.reduce((sum: number, l: any) => sum + ((l.quantity_checked || 0) - (l.quantity_non_compliant || 0)), 0);
      const nonCompliant = lines.reduce((sum: number, l: any) => sum + (l.quantity_non_compliant || 0), 0);
      setTotalCompliant(compliant);
      setTotalNonCompliant(nonCompliant);
    }

    // Checks this month
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const { count } = await supabase.from('ppe_checks').select('*', { count: 'exact', head: true }).gte('date', firstOfMonth);
    setChecksThisMonth(count || 0);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this PPE check?")) return;
    await supabase.from('ppe_checks').delete().eq('id', id);
    setChecks(checks.filter(c => c.id !== id));
  };

  // Filter logic
  const filteredChecks = checks.filter(check => {
    const matchesSite = siteFilter === 'All' || check.site === siteFilter;
    const matchesSearch = searchQuery === '' || 
      check.check_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      check.checked_by.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSite && matchesSearch;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>PPE Checks</h1>
          <p className="page-subtitle">Track PPE inspections and compliance.</p>
        </div>
        <Link to="/ppe-checks/new" className="btn-primary"><Plus size={18} /> Log Check</Link>
      </div>

      <PpeStats 
        totalChecks={checks.length} 
        compliant={totalCompliant} 
        nonCompliant={totalNonCompliant} 
        checksThisMonth={checksThisMonth} 
      />

      <PpeFilters 
        siteFilter={siteFilter}
        onSiteChange={setSiteFilter}
        sitesList={sitesList}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <PpeTable 
        checks={filteredChecks}
        loading={loading}
        onDelete={handleDelete}
      />
    </div>
  );
}