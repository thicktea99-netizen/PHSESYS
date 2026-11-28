// src/pages/Hazards.tsx
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import HazardStats from '../components/hazards/HazardStats';
import HazardFilters from '../components/hazards/HazardFilters';
import HazardTable from '../components/hazards/HazardTable';
import '../styles/Incidents.css';

interface Hazard {
  id: string;
  hazard_number: number;
  entry_type: string;
  project_site: string;
  area: string;
  description: string;
  risk_score: number;
  date_observed: string;
  status: string;
  photo_url: string;
  
}

export default function Hazards() {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [loading, setLoading] = useState(true);
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  
  const [statusFilter, setStatusFilter] = useState('All');
  const [siteFilter, setSiteFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchHazards();
    fetchSites();
  }, []);

  const fetchHazards = async () => {
  try {
    setLoading(true);
    const { data, error } = await supabase
      .from('hazards')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    setHazards(data || []);
  } catch (error: any) {
    alert("Error fetching hazards: " + error.message);
  } finally {
    setLoading(false);
  }
};


  const fetchSites = async () => {
    const { data } = await supabase.from('sites').select('id, name').eq('status', 'active');
    if (data) setSitesList(data);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setHazards(hazards.map(h => h.id === id ? { ...h, status: newStatus } : h));
    await supabase.from('hazards').update({ status: newStatus }).eq('id', id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this hazard?")) return;
    await supabase.from('hazards').delete().eq('id', id);
    setHazards(hazards.filter(h => h.id !== id));
  };

  // Filter logic
  const filteredHazards = hazards.filter(hazard => {
    const matchesStatus = statusFilter === 'All' || hazard.status === statusFilter;
    const matchesSite = siteFilter === 'All' || hazard.project_site === siteFilter;
    const matchesSearch = searchQuery === '' || 
      hazard.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hazard.entry_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSite && matchesSearch;
  });

  // Stats
  const total = hazards.length;
  const open = hazards.filter(h => h.status !== 'closed').length;
  const closed = hazards.filter(h => h.status === 'closed').length;
  const highRisk = hazards.filter(h => (h.risk_score || 0) >= 15).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Hazard & Observation Register</h1>
          <p className="page-subtitle">Track hazards, unsafe acts, and positive observations.</p>
        </div>
        <Link to="/hazards/new" className="btn-primary"><Plus size={18} /> Log Hazard</Link>
      </div>

      <HazardStats total={total} open={open} closed={closed} highRisk={highRisk} />

      <HazardFilters 
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        siteFilter={siteFilter}
        onSiteChange={setSiteFilter}
        sitesList={sitesList}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <HazardTable 
        hazards={filteredHazards}
        loading={loading}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  );
}