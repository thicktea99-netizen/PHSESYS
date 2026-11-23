// src/pages/Inductions.tsx
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import InductionStats from '../components/inductions/InductionStats';
import InductionFilters from '../components/inductions/InductionFilters';
import InductionTable from '../components/inductions/InductionTable';
import '../styles/Incidents.css';

interface Induction {
  id: string;
  induction_number: number;
  person_name: string;
  company: string;
  site: string;
  induction_date: string;
  inducted_by: string;
  signed_acknowledgment: boolean;
}

export default function Inductions() {
  const [inductions, setInductions] = useState<Induction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  
  const [siteFilter, setSiteFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInductions();
    fetchSites();
  }, []);

  const fetchInductions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('inductions').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setInductions(data || []);
    } catch (error: any) {
      alert("Error fetching inductions: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    const { data } = await supabase.from('sites').select('id, name').eq('status', 'active');
    if (data) setSitesList(data);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this induction?")) return;
    await supabase.from('inductions').delete().eq('id', id);
    setInductions(inductions.filter(i => i.id !== id));
  };

  const filteredInductions = inductions.filter(induction => {
    const matchesSite = siteFilter === 'All' || induction.site === siteFilter;
    const matchesSearch = searchQuery === '' || 
      induction.person_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (induction.company && induction.company.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSite && matchesSearch;
  });

  const total = inductions.length;
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = inductions.filter(i => new Date(i.induction_date) >= firstOfMonth).length;
  const signedForms = inductions.filter(i => i.signed_acknowledgment).length;
  const uniqueCompanies = new Set(inductions.map(i => i.company).filter(Boolean)).size;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Site Inductions</h1>
          <p className="page-subtitle">Track site inductions for all workers.</p>
        </div>
        <Link to="/inductions/new" className="btn-primary"><Plus size={18} /> Log Induction</Link>
      </div>

      <InductionStats total={total} thisMonth={thisMonth} signedForms={signedForms} uniqueCompanies={uniqueCompanies} />

      <InductionFilters 
        siteFilter={siteFilter}
        onSiteChange={setSiteFilter}
        sitesList={sitesList}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <InductionTable 
        inductions={filteredInductions}
        loading={loading}
        onDelete={handleDelete}
      />
    </div>
  );
}