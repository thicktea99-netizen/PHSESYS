// src/pages/Capa.tsx
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import CapaStats from '../components/capa/CapaStats';
import CapaFilters from '../components/capa/CapaFilters';
import CapaTable from '../components/capa/CapaTable';
import '../styles/Incidents.css';

interface CapaAction {
  id: string;
  capa_number: number;
  action_title: string;
  source_type: string;
  priority: string;
  owner: string;
  due_date: string;
  status: string;
}

export default function Capa() {
  const [actions, setActions] = useState<CapaAction[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('capa_actions').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setActions(data || []);
    } catch (error: any) {
      alert("Error fetching CAPA actions: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActions(actions.map(a => a.id === id ? { ...a, status: newStatus } : a));
    await supabase.from('capa_actions').update({ status: newStatus }).eq('id', id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this CAPA action?")) return;
    await supabase.from('capa_actions').delete().eq('id', id);
    setActions(actions.filter(a => a.id !== id));
  };

  // Filter logic
  const filteredActions = actions.filter(action => {
    const matchesStatus = statusFilter === 'All' || action.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || action.priority === priorityFilter;
    const matchesSearch = searchQuery === '' || 
      action.action_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.owner.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  // Stats
  const total = actions.length;
  const open = actions.filter(a => a.status === 'open').length;
  const inProgress = actions.filter(a => a.status === 'in progress').length;
  const overdue = actions.filter(a => a.due_date && new Date(a.due_date) < new Date() && a.status !== 'closed').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>CAPA Tracker</h1>
          <p className="page-subtitle">Track corrective and preventive actions to closure.</p>
        </div>
        <Link to="/capa/new" className="btn-primary"><Plus size={18} /> Raise Action</Link>
      </div>

      <CapaStats total={total} open={open} inProgress={inProgress} overdue={overdue} />

      <CapaFilters 
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <CapaTable 
        actions={filteredActions}
        loading={loading}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  );
}