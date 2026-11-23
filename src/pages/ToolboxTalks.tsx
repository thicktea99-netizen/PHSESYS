// src/pages/ToolboxTalks.tsx
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ToolboxStats from '../components/toolbox/ToolboxStats';
import ToolboxFilters from '../components/toolbox/ToolboxFilters';
import ToolboxTable from '../components/toolbox/ToolboxTable';
import '../styles/Incidents.css';

interface ToolboxTalk {
  id: string;
  talk_number: number;
  topic: string;
  site: string;
  date: string;
  presenter_name: string;
  attendee_count: number;
  category: string;
}

export default function ToolboxTalks() {
  const [talks, setTalks] = useState<ToolboxTalk[]>([]);
  const [loading, setLoading] = useState(true);
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [siteFilter, setSiteFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTalks();
    fetchSites();
  }, []);

  const fetchTalks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('toolbox_talks').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setTalks(data || []);
    } catch (error: any) {
      alert("Error fetching talks: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    const { data } = await supabase.from('sites').select('id, name').eq('status', 'active');
    if (data) setSitesList(data);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this toolbox talk?")) return;
    await supabase.from('toolbox_talks').delete().eq('id', id);
    setTalks(talks.filter(t => t.id !== id));
  };

  // Filter logic
  const filteredTalks = talks.filter(talk => {
    const matchesCategory = categoryFilter === 'All' || talk.category === categoryFilter;
    const matchesSite = siteFilter === 'All' || talk.site === siteFilter;
    const matchesSearch = searchQuery === '' || 
      talk.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talk.presenter_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSite && matchesSearch;
  });

  // Stats
  const total = talks.length;
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = talks.filter(t => new Date(t.date) >= firstOfMonth).length;
  const totalAttendees = talks.reduce((sum, t) => sum + (t.attendee_count || 0), 0);
  const categoriesList = Array.from(new Set(talks.map(t => t.category).filter(Boolean)));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Toolbox Talks</h1>
          <p className="page-subtitle">Track safety briefings and attendee records.</p>
        </div>
        <Link to="/toolbox-talks/new" className="btn-primary"><Plus size={18} /> Log Talk</Link>
      </div>

      <ToolboxStats total={total} thisMonth={thisMonth} totalAttendees={totalAttendees} categoriesCount={categoriesList.length} />

      <ToolboxFilters 
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categoriesList={categoriesList}
        siteFilter={siteFilter}
        onSiteChange={setSiteFilter}
        sitesList={sitesList}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <ToolboxTable 
        talks={filteredTalks}
        loading={loading}
        onDelete={handleDelete}
      />
    </div>
  );
}