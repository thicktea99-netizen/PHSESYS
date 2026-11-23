// src/pages/Equipment.tsx
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import EquipmentStats from '../components/equipment/EquipmentStats';
import EquipmentFilters from '../components/equipment/EquipmentFilters';
import EquipmentTable from '../components/equipment/EquipmentTable';
import '../styles/Incidents.css';

interface Equipment {
  id: string;
  equipment_number: number;
  name: string;
  type: string;
  site: string;
  status: string;
  assigned_to_name: string;
  next_inspection_due: string;
}

export default function Equipment() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  
  const [statusFilter, setStatusFilter] = useState('All');
  const [siteFilter, setSiteFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEquipment();
    fetchSites();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('equipment').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setEquipment(data || []);
    } catch (error: any) {
      alert("Error fetching equipment: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    const { data } = await supabase.from('sites').select('id, name').eq('status', 'active');
    if (data) setSitesList(data);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setEquipment(equipment.map(e => e.id === id ? { ...e, status: newStatus } : e));
    await supabase.from('equipment').update({ status: newStatus }).eq('id', id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this equipment record?")) return;
    await supabase.from('equipment').delete().eq('id', id);
    setEquipment(equipment.filter(e => e.id !== id));
  };

  // Filter logic
  const filteredEquipment = equipment.filter(item => {
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesSite = siteFilter === 'All' || item.site === siteFilter;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSite && matchesSearch;
  });

  // Stats
  const total = equipment.length;
  const inService = equipment.filter(e => e.status === 'In Service').length;
  const damaged = equipment.filter(e => e.status === 'Damaged').length;
  const overdueInspections = equipment.filter(e => e.next_inspection_due && new Date(e.next_inspection_due) < new Date()).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Equipment Register</h1>
          <p className="page-subtitle">Track site equipment, tools, and inspection dates.</p>
        </div>
        <Link to="/equipment/new" className="btn-primary"><Plus size={18} /> Register Equipment</Link>
      </div>

      <EquipmentStats 
        total={total} 
        inService={inService} 
        damaged={damaged} 
        overdueInspections={overdueInspections} 
      />

      <EquipmentFilters 
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        siteFilter={siteFilter}
        onSiteChange={setSiteFilter}
        sitesList={sitesList}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <EquipmentTable 
        equipment={filteredEquipment}
        loading={loading}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  );
}