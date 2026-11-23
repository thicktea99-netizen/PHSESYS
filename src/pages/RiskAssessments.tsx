// src/pages/RiskAssessments.tsx
import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ShieldAlert, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

import RiskStats from '../components/risk/RiskStats';

import RiskFilters from '../components/risk/RiskFilters';

import RiskTable from '../components/risk/RiskTable';

import '../styles/Incidents.css';

interface RiskAssessment {
  id: string;
  ra_number: number;
  task_name: string;
  assessment_type: string;
  site: string;
  assessor_name: string;
  date_of_assessment: string;
  status: string;
}

export default function RiskAssessments() {
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [siteFilter, setSiteFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAssessments();
    fetchSites();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('risk_assessments').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setAssessments(data || []);
    } catch (error: any) {
      alert("Error fetching assessments: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    const { data } = await supabase.from('sites').select('id, name').eq('status', 'active');
    if (data) setSitesList(data);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this assessment? This will also delete all steps and hazards.")) return;
    await supabase.from('risk_assessments').delete().eq('id', id);
    setAssessments(assessments.filter(a => a.id !== id));
  };

  // Filter logic
  const filteredAssessments = assessments.filter(item => {
    const matchesType = typeFilter === 'All' || item.assessment_type === typeFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesSite = siteFilter === 'All' || item.site === siteFilter;
    const matchesSearch = searchQuery === '' || 
      item.task_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSite && matchesSearch;
  });

  // Stats
  const total = assessments.length;
  const jsas = assessments.filter(a => a.assessment_type === 'JSA').length;
  const rams = assessments.filter(a => a.assessment_type === 'RAMS').length;
  const approved = assessments.filter(a => a.status === 'Approved').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Risk Management</h1>
          <p className="page-subtitle">Manage Risk Assessments (RAMS) and JSA / JHA.</p>
        </div>
        
        <div style={{ position: 'relative' }}>
          <button className="btn-primary" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <Plus size={18} /> New Assessment <ChevronDown size={16} />
          </button>
          
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <Link to="/risk-assessments/new?type=JSA" className="dropdown-item">
                <ClipboardList size={16} /> JSA / JHA (Step-by-Step)
              </Link>
              <Link to="/risk-assessments/new?type=RAMS" className="dropdown-item">
                <ShieldAlert size={16} /> Risk Assessment (RAMS)
              </Link>
            </div>
          )}
        </div>
      </div>

      <RiskStats total={total} jsas={jsas} rams={rams} approved={approved} />

      <RiskFilters 
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        siteFilter={siteFilter}
        onSiteChange={setSiteFilter}
        sitesList={sitesList}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <RiskTable 
        assessments={filteredAssessments}
        loading={loading}
        onDelete={handleDelete}
      />
    </div>
  );
}