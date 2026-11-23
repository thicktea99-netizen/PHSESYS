// src/pages/Inspections.tsx
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import InspectionStats from '../components/inspections/InspectionStats';
import InspectionFilters from '../components/inspections/InspectionFilters';
import InspectionTable from '../components/inspections/InspectionTable';
import '../styles/Incidents.css';

interface Inspection {
  id: string;
  inspection_number: number;
  inspection_type: string;
  site: string;
  area: string;
  date: string;
  status: string;
}

export default function Inspections() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  const [totalFindings, setTotalFindings] = useState(0);
  
  const [statusFilter, setStatusFilter] = useState('All');
  const [siteFilter, setSiteFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInspections();
    fetchSites();
    fetchFindingsCount();
  }, []);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('inspections').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setInspections(data || []);
    } catch (error: any) {
      alert("Error fetching inspections: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    const { data } = await supabase.from('sites').select('id, name').eq('status', 'active');
    if (data) setSitesList(data);
  };

  const fetchFindingsCount = async () => {
    const { count } = await supabase.from('inspection_findings').select('*', { count: 'exact', head: true });
    setTotalFindings(count || 0);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setInspections(inspections.map(i => i.id === id ? { ...i, status: newStatus } : i));
    await supabase.from('inspections').update({ status: newStatus }).eq('id', id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this inspection? This will also delete all findings.")) return;
    await supabase.from('inspections').delete().eq('id', id);
    setInspections(inspections.filter(i => i.id !== id));
  };

  // Filter logic
  const filteredInspections = inspections.filter(insp => {
    const matchesStatus = statusFilter === 'All' || insp.status === statusFilter;
    const matchesSite = siteFilter === 'All' || insp.site === siteFilter;
    const matchesSearch = searchQuery === '' || 
      insp.inspection_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (insp.area && insp.area.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSite && matchesSearch;
  });

  // Stats
  const total = inspections.length;
  const open = inspections.filter(i => i.status !== 'closed').length;
  const closed = inspections.filter(i => i.status === 'closed').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Inspections</h1>
          <p className="page-subtitle">Track all site inspections and findings.</p>
        </div>
        <Link to="/inspections/new" className="btn-primary"><Plus size={18} /> Log Inspection</Link>
      </div>

      <InspectionStats total={total} open={open} closed={closed} totalFindings={totalFindings} />

      <InspectionFilters 
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        siteFilter={siteFilter}
        onSiteChange={setSiteFilter}
        sitesList={sitesList}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <InspectionTable 
        inspections={filteredInspections}
        loading={loading}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  );
}