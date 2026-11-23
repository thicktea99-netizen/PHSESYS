// src/pages/Drills.tsx
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import DrillStats from '../components/drills/DrillStats';
import DrillFilters from '../components/drills/DrillFilters';
import DrillTable from '../components/drills/DrillTable';
import '../styles/Incidents.css';

interface Drill {
  id: string;
  drill_number: number;
  drill_type: string;
  site: string;
  date: string;
  total_participants: number;
  status: string;
}

export default function Drills() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [loading, setLoading] = useState(true);
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  
  const [statusFilter, setStatusFilter] = useState('All');
  const [siteFilter, setSiteFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDrills();
    fetchSites();
  }, []);

  const fetchDrills = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('drills').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setDrills(data || []);
    } catch (error: any) {
      alert("Error fetching drills: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    const { data } = await supabase.from('sites').select('id, name').eq('status', 'active');
    if (data) setSitesList(data);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this drill record?")) return;
    await supabase.from('drills').delete().eq('id', id);
    setDrills(drills.filter(d => d.id !== id));
  };

  // Filter logic
  const filteredDrills = drills.filter(drill => {
    const matchesStatus = statusFilter === 'All' || drill.status === statusFilter;
    const matchesSite = siteFilter === 'All' || drill.site === siteFilter;
    const matchesSearch = searchQuery === '' || 
      drill.drill_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSite && matchesSearch;
  });

  // Stats
  const total = drills.length;
  const completed = drills.filter(d => d.status === 'Completed').length;
  const planned = drills.filter(d => d.status === 'Planned').length;
  const totalParticipants = drills.reduce((sum, d) => sum + (d.total_participants || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Drills & Exercises</h1>
          <p className="page-subtitle">Track emergency drills and their findings.</p>
        </div>
        <Link to="/drills/new" className="btn-primary"><Plus size={18} /> Log Drill</Link>
      </div>

      <DrillStats total={total} completed={completed} planned={planned} totalParticipants={totalParticipants} />

      <DrillFilters 
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        siteFilter={siteFilter}
        onSiteChange={setSiteFilter}
        sitesList={sitesList}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <DrillTable 
        drills={filteredDrills}
        loading={loading}
        onDelete={handleDelete}
      />
    </div>
  );
}