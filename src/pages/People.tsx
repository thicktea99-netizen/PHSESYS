// src/pages/People.tsx
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PeopleStats from '../components/people/PeopleStats';
import PeopleFilters from '../components/people/PeopleFilters';
import PeopleTable from '../components/people/PeopleTable';
import '../styles/Incidents.css';

export default function People() {
  const [contractors, setContractors] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [contractorFilter, setContractorFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Contractor form
  const [newCompany, setNewCompany] = useState('');
  const [newHseContact, setNewHseContact] = useState('');

  // Person form
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonContractorId, setNewPersonContractorId] = useState('');
  const [newPersonRole, setNewPersonRole] = useState('');
  const [newPersonTrade, setNewPersonTrade] = useState('');
  const [newPersonContact, setNewPersonContact] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: cData } = await supabase.from('contractors').select('*').order('company_name');
      const { data: pData } = await supabase.from('people').select('*, contractors(company_name)').order('full_name');
      setContractors(cData || []);
      setPeople(pData || []);
    } catch (error: any) {
      alert("Error fetching data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContractor = async () => {
    if (!newCompany) { alert("Enter a company name."); return; }
    if (newHseContact && newHseContact.length !== 10) { alert("HSE Contact must be 10 digits."); return; }
    await supabase.from('contractors').insert([{ company_name: newCompany, hse_contact: newHseContact }]);
    setNewCompany(''); setNewHseContact('');
    fetchData();
  };

  const handleAddPerson = async () => {
    if (!newPersonName) { alert("Enter a person's name."); return; }
    await supabase.from('people').insert([{
      full_name: newPersonName,
      contractor_id: newPersonContractorId || null,
      role: newPersonRole,
      trade: newPersonTrade,
      contact: newPersonContact
    }]);
    setNewPersonName(''); setNewPersonContractorId(''); setNewPersonRole(''); setNewPersonTrade(''); setNewPersonContact('');
    fetchData();
  };

  const handleDeleteContractor = async (id: string) => {
    if (!window.confirm("Delete this contractor? This will unlink any people assigned to them.")) return;
    await supabase.from('contractors').delete().eq('id', id);
    fetchData();
  };

  const handleDeletePerson = async (id: string) => {
    if (!window.confirm("Delete this person?")) return;
    await supabase.from('people').delete().eq('id', id);
    fetchData();
  };

  // Filter logic
  const filteredPeople = people.filter(person => {
    const matchesStatus = statusFilter === 'All' || person.status === statusFilter;
    const matchesContractor = contractorFilter === 'All' || person.contractor_id === contractorFilter;
    const matchesSearch = searchQuery === '' || 
      person.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (person.role && person.role.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesContractor && matchesSearch;
  });

  // Stats
  const totalPeople = people.length;
  const totalContractors = contractors.length;
  const activeWorkers = people.filter(p => p.status === 'active').length;
  const inactiveWorkers = people.filter(p => p.status === 'inactive').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>People & Contractors</h1>
          <p className="page-subtitle">Manage the companies and workers on your site.</p>
        </div>
      </div>

      <PeopleStats 
        totalPeople={totalPeople} 
        totalContractors={totalContractors} 
        activeWorkers={activeWorkers} 
        inactiveWorkers={inactiveWorkers} 
      />

      <PeopleFilters 
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        contractorFilter={contractorFilter}
        onContractorChange={setContractorFilter}
        contractorsList={contractors}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Add Contractor Form */}
      <div className="form-card mb-24">
        <h3 className="form-section-title">Add Contractor</h3>
        <div className="form-grid" style={{ alignItems: 'flex-end' }}>
          <div className="form-group"><label>Company Name *</label><input type="text" className="form-input" value={newCompany} onChange={(e) => setNewCompany(e.target.value)} /></div>
          <div className="form-group">
            <label>HSE Contact (10 digits)</label>
            <input type="tel" className="form-input" placeholder="10-digit Contact" value={newHseContact} onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              if (val.length <= 10) setNewHseContact(val);
            }} />
          </div>
          <div className="form-group"><button className="btn-primary" onClick={handleAddContractor}><Plus size={18} /> Add Contractor</button></div>
        </div>
      </div>

      {/* Add Person Form */}
      <div className="form-card mb-24">
        <h3 className="form-section-title">Add Person</h3>
        <div className="form-grid">
          <div className="form-group"><label>Full Name *</label><input type="text" className="form-input" value={newPersonName} onChange={(e) => setNewPersonName(e.target.value)} /></div>
          <div className="form-group">
            <label>Contractor</label>
            <select className="form-input" value={newPersonContractorId} onChange={(e) => setNewPersonContractorId(e.target.value)}>
              <option value="">Select...</option>
              {contractors.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Role</label><input type="text" className="form-input" value={newPersonRole} onChange={(e) => setNewPersonRole(e.target.value)} /></div>
          <div className="form-group"><label>Trade</label><input type="text" className="form-input" value={newPersonTrade} onChange={(e) => setNewPersonTrade(e.target.value)} /></div>
          <div className="form-group"><label>Contact (10 digits)</label><input type="tel" className="form-input" value={newPersonContact} onChange={(e) => setNewPersonContact(e.target.value.replace(/\D/g, '').slice(0, 10))} /></div>
          <div className="form-group"><button className="btn-primary" onClick={handleAddPerson}><Plus size={18} /> Add Person</button></div>
        </div>
      </div>

      <PeopleTable people={filteredPeople} loading={loading} onDelete={handleDeletePerson} />
    </div>
  );
}