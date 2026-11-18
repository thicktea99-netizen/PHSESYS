// src/pages/LogEmergencyContact.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Forms.css';
import '../styles/LogInspection.css';

export default function LogEmergencyContact() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [primaryContact, setPrimaryContact] = useState('');
  const [alternativeContact, setAlternativeContact] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [category, setCategory] = useState('');
  const [site, setSite] = useState('');
  const [notes, setNotes] = useState('');
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    const fetchSites = async () => {
      const { data } = await supabase.from('sites').select('id, name').eq('status', 'active');
      if (data) setSitesList(data);
    };
    fetchSites();
    if (id) fetchContact();
  }, [id]);

  const fetchContact = async () => {
    try {
      const { data, error } = await supabase.from('emergency_contacts').select('*').eq('id', id).single();
      if (error) throw error;
      setName(data.name);
      setRole(data.role || '');
      setCompany(data.company || '');
      setPrimaryContact(data.primary_contact);
      setAlternativeContact(data.alternative_contact || '');
      setServiceType(data.service_type || '');
      setCategory(data.category);
      setSite(data.site || '');
      setNotes(data.notes || '');
    } catch (error: any) {
      alert("Error loading contact: " + error.message);
      navigate('/emergency-contacts');
    } finally {
      setLoading(false);
    }
  };

  // Relaxed validation: Only require numeric characters, no length restriction
  const validateNumber = (num: string) => {
    return num === '' || /^\d+$/.test(num);
  };

  const handleSave = async () => {
    if (!name || !primaryContact || !serviceType || !category) {
      alert("Please fill in required fields: Name, Primary Contact, Service Type, and Category.");
      return;
    }
    if (!validateNumber(primaryContact)) {
      alert("Primary contact must contain only numbers.");
      return;
    }
    if (alternativeContact && !validateNumber(alternativeContact)) {
      alert("Alternative contact must contain only numbers.");
      return;
    }

    try {
      const payload = {
        name, role: role || null, company, primary_contact: primaryContact,
        alternative_contact: alternativeContact || null,
        service_type: serviceType, category, site, notes
      };

      if (!id) {
        const { error } = await supabase.from('emergency_contacts').insert([payload]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('emergency_contacts').update(payload).eq('id', id);
        if (error) throw error;
      }

      alert("Contact saved successfully!");
      navigate('/emergency-contacts');
    } catch (error: any) {
      alert("Error saving contact: " + error.message);
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="header-left">

          <Link to="/emergency-contacts" className="back-link">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1>{id ? 'Edit Contact' : ' Add Emergency Contact'}</h1><p className="page-subtitle">Add a key emergency contact.</p>
          </div>
        </div>
      </div>

      <div className="form-card">
        <h3 className="form-section-title">1. Contact Details</h3>
        <div className="form-grid">
          <div className="form-group"><label>Name / Service *</label><input type="text" className="form-input" placeholder="e.g., Ghana Fire Service" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="form-group"><label>Role / Position</label><input type="text" className="form-input" placeholder="e.g., Duty Officer (optional)" value={role} onChange={(e) => setRole(e.target.value)} /></div>
          <div className="form-group"><label>Company / Organization</label><input type="text" className="form-input" value={company} onChange={(e) => setCompany(e.target.value)} /></div>
          <div className="form-group">
            <label>Service Type *</label>
            <select className="form-input" value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
              <option value="">Select Service Type...</option>
              <option value="General Emergency">General Emergency</option>
              <option value="Fire Service">Fire Service</option>
              <option value="Police">Police</option>
              <option value="Ambulance / Medical">Ambulance / Medical</option>
              <option value="Hospital">Hospital</option>
              <option value="Internal Contact">Internal Contact</option>
              <option value="External Authority">External Authority</option>
            </select>
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select Category...</option>
              <option value="Site Management">Site Management</option>
              <option value="HSE Team">HSE Team</option>
              <option value="First Aid">First Aid</option>
              <option value="Fire Warden">Fire Warden</option>
              <option value="Client Representative">Client Representative</option>
              <option value="External Authority">External Authority</option>
              <option value="Hospital">Hospital / Clinic</option>
              <option value="General Emergency">General Emergency</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group"><label>Site</label><select className="form-input" value={site} onChange={(e) => setSite(e.target.value)}><option value="">All Sites</option>{sitesList.map((s) => (<option key={s.id} value={s.name}>{s.name}</option>))}</select></div>
        </div>

        <h3 className="form-section-title mt-32">2. Contact Numbers</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Primary Contact *</label>
            <input 
              type="tel" 
              className="form-input" 
              placeholder="e.g., 112, 999, or 0244123456" 
              value={primaryContact} 
              onChange={(e) => setPrimaryContact(e.target.value.replace(/[^\d]/g, ''))} 
            />
            {/* <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Main contact .</span> */}
          </div>
          <div className="form-group">
            <label>Alternative Contact</label>
            <input 
              type="tel" 
              className="form-input" 
              placeholder="Optional" 
              value={alternativeContact} 
              onChange={(e) => setAlternativeContact(e.target.value.replace(/[^\d]/g, ''))} 
            />
          </div>
        </div>

        <div className="form-group mt-16"><label>Notes</label><textarea className="form-input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}></textarea></div>
      </div>

      <div className="sticky-action-bar">
        <Link to="/emergency-contacts" className="btn-secondary">Cancel</Link>
        <button className="btn-primary" onClick={handleSave}>Save Contact</button>
      </div>
    </div>
  );
}