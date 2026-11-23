// src/pages/Incidents.tsx
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import IncidentStats from '../components/incidents/IncidentStats';
import IncidentFilters from '../components/incidents/IncidentFilters';
import IncidentTable from '../components/incidents/IncidentTable';
import '../styles/Incidents.css';

interface Incident {
  id: string;
  incident_number: number;
  incident_type: string;
  date_of_occurrence: string;
  severity: string;
  area: string;
  status: string;
}

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [siteFilter, setSiteFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchIncidents();
    fetchSites();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('incidents').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setIncidents(data || []);
    } catch (error: any) {
      alert("Error fetching incidents: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    const { data } = await supabase.from('sites').select('id, name').eq('status', 'active');
    if (data) setSitesList(data);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setIncidents(incidents.map(i => i.id === id ? { ...i, status: newStatus } : i));
    await supabase.from('incidents').update({ status: newStatus }).eq('id', id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this incident?")) return;
    await supabase.from('incidents').delete().eq('id', id);
    setIncidents(incidents.filter(i => i.id !== id));
  };

  // Filter logic
  const filteredIncidents = incidents.filter(inc => {
    const matchesStatus = statusFilter === 'All' || inc.status === statusFilter;
    const matchesSite = siteFilter === 'All' || inc.area === siteFilter;
    const matchesSearch = searchQuery === '' || 
      inc.incident_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.area.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSite && matchesSearch;
  });

  // Stats
  const total = incidents.length;
  const open = incidents.filter(i => i.status !== 'closed').length;
  const closed = incidents.filter(i => i.status === 'closed').length;
  const ltis = incidents.filter(i => i.incident_type === 'lti').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Incidents</h1>
          <p className="page-subtitle">Track, investigate, and close all site incidents.</p>
        </div>
        <Link to="/incidents/new" className="btn-primary"><Plus size={18} /> Log Incident</Link>
      </div>

      <IncidentStats total={total} open={open} closed={closed} ltis={ltis} />

      <IncidentFilters 
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        siteFilter={siteFilter}
        onSiteChange={setSiteFilter}
        sitesList={sitesList}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <IncidentTable 
        incidents={filteredIncidents}
        loading={loading}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  );
}