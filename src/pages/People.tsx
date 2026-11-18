// src/pages/People.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import '../styles/Forms.css';
import '../styles/Inspections.css';

export default function People() {
  const [contractors, setContractors] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Contractor form state
  const [newCompany, setNewCompany] = useState('');
  const [newHseContact, setNewHseContact] = useState('');

  // Person form state
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

    if (newHseContact && newHseContact.length !== 10){
      alert ("HSE Contact must be 10 digits.")
      return;
    }
    try {
      const { error } = await supabase.from('contractors').insert([{ company_name: newCompany, hse_contact: newHseContact }]);
      if (error) throw error;
      setNewCompany('');
      setNewHseContact('');
      fetchData();
    } catch (error: any) { alert(error.message); }


  };

  const handleAddPerson = async () => {
    if (!newPersonName) { alert("Enter a person's name."); return; }
    try {
      const { error } = await supabase.from('people').insert([{
        full_name: newPersonName,
        contractor_id: newPersonContractorId || null,
        role: newPersonRole,
        trade: newPersonTrade,
        contact: newPersonContact
      }]);
      if (error) throw error;
      setNewPersonName('');
      setNewPersonContractorId('');
      setNewPersonRole('');
      setNewPersonTrade('');
      setNewPersonContact('');
      fetchData();
    } catch (error: any) { alert(error.message); }
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

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>People & Contractors</h1>
          <p className="page-subtitle">Manage the companies and workers on your site.</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* CONTRACTORS SECTION */}
        <div>
          <div className="form-card mb-24">
            <h3 className="form-section-title">Add Contractor</h3>
            <div className="form-grid">
              <div className="form-group"><label>Company Name *</label><input type="text" className="form-input" value={newCompany} onChange={(e) => setNewCompany(e.target.value)} /></div>


              <div className="form-group">
                <label>
                  HSE Contact (10 digits)
                </label>

                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="10-digit Contact" 
                  value={newHseContact} 
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, '');
                    if (numericValue.length <= 10) {
                      setNewHseContact(numericValue);
                    }
                  }} 
                />
              </div>

              



              <div className="form-group span-2"><button className="btn-primary" onClick={handleAddContractor}><Plus size={18} /> Add Contractor</button></div>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Company</th><th>HSE Contact</th><th style={{width: '50px'}}></th></tr></thead>
              <tbody>
                {contractors.map(c => (
                  <tr key={c.id}>
                    <td className="font-medium">{c.company_name}</td>
                    <td>{c.hse_contact || '-'}</td>
                    <td><button className="btn-icon danger" onClick={() => handleDeleteContractor(c.id)}><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PEOPLE SECTION */}
        <div>
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

              <div className="form-group">
                <label>Contact (10 digits)</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  value={newPersonContact} 
                  placeholder = "Enter 10 digits"
                  onChange={(e) => setNewPersonContact(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                />
              </div>
              <div className="form-group"><button className="btn-primary" onClick={handleAddPerson}><Plus size={18} /> Add Person</button></div>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Contractor</th><th>Role</th><th>Trade</th><th style={{width: '50px'}}></th></tr></thead>
              <tbody>
                {people.map(p => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.full_name}</td>
                    <td>{p.contractors?.company_name || '-'}</td>
                    <td>{p.role || '-'}</td>
                    <td>{p.trade || '-'}</td>
                    <td><button className="btn-icon danger" onClick={() => handleDeletePerson(p.id)}><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}