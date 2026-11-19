



// src/pages/Settings.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2, Settings as SettingsIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import '../styles/Forms.css';
import '../styles/Settings.css';

interface Site { 
  id: string; 
  name: string; 
  location: string; 
  status: string;
  assembly_point: string;
  hospital_name: string;
  hospital_phone: string;
  first_aider_present: boolean;
}
interface Option { id: string; option_value: string; }

const CATEGORIES = [
  { key: 'incident_type', label: 'Incident Types' },
  { key: 'inspection_type', label: 'Inspection Types' },
  { key: 'finding_type', label: 'Finding Types' },
  { key: 'ppe_category', label: 'PPE Categories' },
  { key: 'ppe_check_type', label: 'PPE Check Types' },
  { key: 'hazard_entry_type', label: 'Hazard Entry Types' },
  { key: 'certification_type', label: 'Certification Types' },
  { key: 'permit_type', label: 'Permit Types' },
  { key: 'audit_type', label: 'Audit Types' },
  { key: 'drill_type', label: 'Drill Types' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'sites' | 'dropdowns' | 'dashboard' | 'company'>('sites');
  
  // --- SITES STATE ---
  const [sites, setSites] = useState<Site[]>([]);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteLocation, setNewSiteLocation] = useState('');
  const [newSiteAssemblyPoint, setNewSiteAssemblyPoint] = useState('');
  const [newSiteHospitalName, setNewSiteHospitalName] = useState('');
  const [newSiteHospitalPhone, setNewSiteHospitalPhone] = useState('');
  const [newSiteFirstAider, setNewSiteFirstAider] = useState(false);
  const [loadingSites, setLoadingSites] = useState(true);

  // --- DROPDOWN STATE ---
  const [activeCategory, setActiveCategory] = useState('incident_type');
  const [options, setOptions] = useState<Option[]>([]);
  const [newOption, setNewOption] = useState('');
  const [loadingOptions, setLoadingOptions] = useState(true);

  // --- DASHBOARD CONFIG STATE ---
  const [dashboardConfig, setDashboardConfig] = useState<any>({});

  // --- COMPANY PROFILE STATE ---
  const [companyProfile, setCompanyProfile] = useState<any>({});
  const [profileName, setProfileName] = useState('');
  const [profileOfficer, setProfileOfficer] = useState('');
  const [profileOfficerRole, setProfileOfficerRole] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileLogo, setProfileLogo] = useState<File | null>(null);
  const [existingLogo, setExistingLogo] = useState('');

  useEffect(() => {
    if (activeTab === 'sites') fetchSites();
    if (activeTab === 'dropdowns') fetchOptions();
    if (activeTab === 'dashboard') fetchConfig();
    if (activeTab === 'company') fetchCompanyProfile();
  }, [activeTab, activeCategory]);

  // --- SITE HANDLERS ---
  const fetchSites = async () => {
    setLoadingSites(true);
    const { data } = await supabase.from('sites').select('*').order('created_at');
    setSites(data || []);
    setLoadingSites(false);
  };

  const addSite = async () => {
    if (!newSiteName) return;
    await supabase.from('sites').insert([{ 
      name: newSiteName, 
      location: newSiteLocation,
      assembly_point: newSiteAssemblyPoint,
      hospital_name: newSiteHospitalName,
      hospital_phone: newSiteHospitalPhone,
      first_aider_present: newSiteFirstAider
    }]);
    setNewSiteName(''); setNewSiteLocation(''); setNewSiteAssemblyPoint(''); 
    setNewSiteHospitalName(''); setNewSiteHospitalPhone(''); setNewSiteFirstAider(false);
    fetchSites();
  };

  const deleteSite = async (id: string) => {
    if (!window.confirm("Delete this site?")) return;
    await supabase.from('sites').delete().eq('id', id);
    fetchSites();
  };

  // --- DROPDOWN HANDLERS ---
  const fetchOptions = async () => {
    setLoadingOptions(true);
    const { data } = await supabase.from('dropdown_options').select('*').eq('category', activeCategory).order('option_value');
    setOptions(data || []);
    setLoadingOptions(false);
  };

  const addOption = async () => {
    if (!newOption) return;
    await supabase.from('dropdown_options').insert([{ category: activeCategory, option_value: newOption }]);
    setNewOption(''); fetchOptions();
  };

  const deleteOption = async (id: string) => {
    if (!window.confirm("Delete this option?")) return;
    await supabase.from('dropdown_options').delete().eq('id', id);
    fetchOptions();
  };

  // --- DASHBOARD CONFIG HANDLERS ---
  const fetchConfig = async () => {
    const { data } = await supabase.from('dashboard_config').select('*');
    if (data) {
      const configMap: any = {};
      data.forEach(item => { configMap[item.config_key] = item.config_value; });
      setDashboardConfig(configMap);
    }
  };

  const toggleConfig = async (key: string) => {
    const newVal = dashboardConfig[key] === 'true' ? 'false' : 'true';
    await supabase.from('dashboard_config').upsert([{ config_key: key, config_value: newVal }]);
    setDashboardConfig({ ...dashboardConfig, [key]: newVal });
  };

  // --- COMPANY PROFILE HANDLERS ---
  const fetchCompanyProfile = async () => {
    const { data } = await supabase.from('company_profile').select('*').limit(1).single();
    if (data) {
      setCompanyProfile(data);
      setProfileName(data.company_name || '');
      setProfileOfficer(data.officer_name || '');
      setProfileOfficerRole(data.officer_role || '');
      setProfileAddress(data.address || '');
      setProfilePhone(data.phone || '');
      setProfileEmail(data.email || '');
      setExistingLogo(data.logo_url || '');
    }
  };

  const saveCompanyProfile = async () => {
    try {
      let logoUrl = existingLogo;
      if (profileLogo) {
        const fileExt = profileLogo.name.split('.').pop();
        const fileName = `logo-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('inspection-photos').upload(fileName, profileLogo);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('inspection-photos').getPublicUrl(fileName);
        logoUrl = urlData.publicUrl;
      }

      const payload = {
        company_name: profileName,
        officer_name: profileOfficer,
        officer_role: profileOfficerRole,
        address: profileAddress,
        phone: profilePhone,
        email: profileEmail,
        logo_url: logoUrl
      };

      if (companyProfile.id) {
        await supabase.from('company_profile').update(payload).eq('id', companyProfile.id);
      } else {
        await supabase.from('company_profile').insert([payload]);
      }
      alert("Company profile saved!");
      fetchCompanyProfile();
    } catch (error: any) {
      alert("Error saving profile: " + error.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-subtitle">Manage sites, dropdowns, dashboard preferences, and company profile.</p>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'sites' ? 'active' : ''}`} onClick={() => setActiveTab('sites')}>
          <SettingsIcon size={16} /> Sites
        </button>
        <button className={`tab ${activeTab === 'dropdowns' ? 'active' : ''}`} onClick={() => setActiveTab('dropdowns')}>
          <SettingsIcon size={16} /> Dropdown Manager
        </button>
        <button className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <SettingsIcon size={16} /> Dashboard Config
        </button>
        <button className={`tab ${activeTab === 'company' ? 'active' : ''}`} onClick={() => setActiveTab('company')}>
          <SettingsIcon size={16} /> Company Profile
        </button>
      </div>

      {/* SITES TAB */}
      {activeTab === 'sites' && (
        <div>
          <div className="form-card mb-24">
            <h3 className="form-section-title">Add New Site</h3>
            <div className="form-grid">
              <div className="form-group"><label>Site Name *</label><input type="text" className="form-input" value={newSiteName} onChange={(e) => setNewSiteName(e.target.value)} /></div>
              <div className="form-group"><label>Location</label><input type="text" className="form-input" value={newSiteLocation} onChange={(e) => setNewSiteLocation(e.target.value)} /></div>
              <div className="form-group"><label>Assembly Point</label><input type="text" className="form-input" placeholder="e.g., Main Gate" value={newSiteAssemblyPoint} onChange={(e) => setNewSiteAssemblyPoint(e.target.value)} /></div>
              <div className="form-group"><label>Nearest Hospital</label><input type="text" className="form-input" placeholder="e.g., Ridge Hospital" value={newSiteHospitalName} onChange={(e) => setNewSiteHospitalName(e.target.value)} /></div>
              <div className="form-group"><label>Hospital Phone</label><input type="tel" className="form-input" placeholder="e.g., 0302123456" value={newSiteHospitalPhone} onChange={(e) => setNewSiteHospitalPhone(e.target.value.replace(/\D/g, ''))} /></div>
              <div className="form-group" style={{ justifyContent: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
                  <input type="checkbox" checked={newSiteFirstAider} onChange={(e) => setNewSiteFirstAider(e.target.checked)} /> First Aider on Site
                </label>
              </div>
              <div className="form-group" style={{ justifyContent: 'flex-end' }}><button className="btn-primary" onClick={addSite}><Plus size={18} /> Add Site</button></div>
            </div>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Site Name</th><th>Location</th><th>Assembly Point</th><th>Hospital</th><th>First Aider</th><th style={{ width: '50px' }}></th></tr></thead>
              <tbody>
                {loadingSites ? <tr><td colSpan={6} className="table-message">Loading...</td></tr> :
                  sites.map(s => (
                    <tr key={s.id}>
                      <td className="font-medium">{s.name}</td>
                      <td>{s.location || '-'}</td>
                      <td>{s.assembly_point || '-'}</td>
                      <td>{s.hospital_name || '-'}</td>
                      <td>{s.first_aider_present ? 'Yes' : 'No'}</td>
                      <td><button className="btn-icon danger" onClick={() => deleteSite(s.id)}><Trash2 size={16} /></button></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DROPDOWN MANAGER TAB */}
      {activeTab === 'dropdowns' && (
        <div className="dropdown-manager-layout">
          <div className="category-list">
            <h3 className="form-section-title">Categories</h3>
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                className={`category-btn ${activeCategory === cat.key ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="options-panel">
            <div className="form-card mb-24">
              <h3 className="form-section-title">Add Option to {CATEGORIES.find(c => c.key === activeCategory)?.label}</h3>
              <div className="form-grid" style={{ alignItems: 'flex-end' }}>
                <div className="form-group"><label>New Option</label><input type="text" className="form-input" value={newOption} onChange={(e) => setNewOption(e.target.value)} /></div>
                <div className="form-group"><button className="btn-primary" onClick={addOption}><Plus size={18} /> Add</button></div>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>Option Value</th><th style={{ width: '50px' }}></th></tr></thead>
                <tbody>
                  {loadingOptions ? <tr><td colSpan={2} className="table-message">Loading...</td></tr> :
                    options.map(opt => (
                      <tr key={opt.id}>
                        <td>{opt.option_value}</td>
                        <td><button className="btn-icon danger" onClick={() => deleteOption(opt.id)}><Trash2 size={16} /></button></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD CONFIG TAB */}
      {activeTab === 'dashboard' && (
        <div>
          <div className="form-card mb-24">
            <h3 className="form-section-title">Needs Attention Items</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Choose which alerts appear on the dashboard.</p>
            <div className="checkbox-row">
              {[
                { key: 'show_attention_capa', label: 'CAPA Overdue' },
                { key: 'show_attention_incidents', label: 'Open Incidents' },
                { key: 'show_attention_permits', label: 'Active Permits' },
                { key: 'show_attention_hazards', label: 'Open Hazards' },
                { key: 'show_attention_inspections', label: 'Open Inspections' },
              ].map(item => (
                <label key={item.key} className="checkbox-label">
                  <input type="checkbox" checked={dashboardConfig[item.key] === 'true'} onChange={() => toggleConfig(item.key)} />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-card mb-24">
            <h3 className="form-section-title">Recent Activity Modules</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Choose which modules appear in the recent activity feed.</p>
            <div className="checkbox-row">
              {[
                { key: 'show_activity_incidents', label: 'Incidents' },
                { key: 'show_activity_inspections', label: 'Inspections' },
                { key: 'show_activity_hazards', label: 'Hazards' },
                { key: 'show_activity_permits', label: 'Permits' },
                { key: 'show_activity_capa', label: 'CAPA' },
              ].map(item => (
                <label key={item.key} className="checkbox-label">
                  <input type="checkbox" checked={dashboardConfig[item.key] === 'true'} onChange={() => toggleConfig(item.key)} />
                  {item.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COMPANY PROFILE TAB */}
      {activeTab === 'company' && (
        <div>
          <div className="form-card mb-24">
            <h3 className="form-section-title">Company Details</h3>
            <div className="form-grid">
              <div className="form-group span-2"><label>Company Name</label><input type="text" className="form-input" value={profileName} onChange={(e) => setProfileName(e.target.value)} /></div>
              <div className="form-group"><label>Officer Name</label><input type="text" className="form-input" value={profileOfficer} onChange={(e) => setProfileOfficer(e.target.value)} /></div>
              <div className="form-group"><label>Officer Role</label><input type="text" className="form-input" value={profileOfficerRole} onChange={(e) => setProfileOfficerRole(e.target.value)} /></div>
              <div className="form-group span-2"><label>Address</label><input type="text" className="form-input" value={profileAddress} onChange={(e) => setProfileAddress(e.target.value)} /></div>
              <div className="form-group"><label>Phone</label><input type="tel" className="form-input" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, ''))} /></div>
              <div className="form-group"><label>Email</label><input type="email" className="form-input" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} /></div>
            </div>
            <div className="upload-container mt-16">
              <input type="file" id="logo-file" className="hidden-input" onChange={(e) => setProfileLogo(e.target.files ? e.target.files[0] : null)} />
              <label htmlFor="logo-file" className="upload-label">
                <span className="upload-text">{profileLogo ? profileLogo.name : "Upload Company Logo"}</span>
              </label>
            </div>
            {existingLogo && <div className="mt-16"><img src={existingLogo} alt="Logo" style={{ maxHeight: '60px' }} /></div>}
            <button className="btn-primary mt-16" onClick={saveCompanyProfile}>Save Profile</button>
          </div>
        </div>
      )}
    </div>
  );
}