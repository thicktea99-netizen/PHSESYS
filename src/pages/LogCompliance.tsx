// src/pages/LogCompliance.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Paperclip } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Forms.css';
import '../styles/LogInspection.css';

export default function LogCompliance() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [obligationName, setObligationName] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [authority, setAuthority] = useState('');
  const [authorityContact, setAuthorityContact] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  
  const [project, setProject] = useState('');
  const [site, setSite] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [responsiblePersonRole, setResponsiblePersonRole] = useState('');
  const [responsiblePersonContact, setResponsiblePersonContact] = useState('');
  
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [renewalLeadDays, setRenewalLeadDays] = useState('60');
  
  const [notes, setNotes] = useState('');
  const [existingFile, setExistingFile] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [complianceTypes, setComplianceTypes] = useState<{ id: string, option_value: string }[]>([]);
  const [complianceCategories, setComplianceCategories] = useState<{ id: string, option_value: string }[]>([]);
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  const [loading, setLoading] = useState(!!id);

  // 1. Fetch dropdown options and sites
  useEffect(() => {
    const fetchOptions = async () => {
      const { data: typeData } = await supabase.from('dropdown_options').select('id, option_value').eq('category', 'compliance_type').order('option_value');
      if (typeData) setComplianceTypes(typeData);

      const { data: catData } = await supabase.from('dropdown_options').select('id, option_value').eq('category', 'compliance_category').order('option_value');
      if (catData) setComplianceCategories(catData);

      const { data: sitesData } = await supabase.from('sites').select('id, name').eq('status', 'active');
      if (sitesData) setSitesList(sitesData);
    };
    fetchOptions();
  }, []);

  // 2. Fetch existing record (if editing)
  useEffect(() => {
    if (!id) return;
    const fetchRecord = async () => {
      try {
        const { data, error } = await supabase.from('compliance_register').select('*').eq('id', id).single();
        if (error) throw error;
        
        setObligationName(data.obligation_name);
        setType(data.type);
        setCategory(data.category);
        setAuthority(data.authority || '');
        setAuthorityContact(data.authority_contact || '');
        setReferenceNumber(data.reference_number || '');
        setProject(data.project || '');
        setSite(data.site || '');
        setResponsiblePerson(data.responsible_person || '');
        setResponsiblePersonRole(data.responsible_person_role || '');
        setResponsiblePersonContact(data.responsible_person_contact || '');
        setIssueDate(data.issue_date || '');
        setExpiryDate(data.expiry_date || '');
        setRenewalLeadDays(data.renewal_lead_days?.toString() || '60');
        setNotes(data.notes || '');
        setExistingFile(data.file_url || '');
      } catch (error: any) {
        alert("Error loading record: " + error.message);
        navigate('/compliance');
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  const handleSave = async () => {
    if (!obligationName || !type || !category) {
      alert("Please fill in required fields: Name, Type, and Category.");
      return;
    }
    if (authorityContact && authorityContact.length !== 10) {
      alert("Authority contact must be 10 digits.");
      return;
    }
    if (responsiblePersonContact && responsiblePersonContact.length !== 10) {
      alert("Responsible person contact must be 10 digits.");
      return;
    }

    try {
      let fileUrl = existingFile;
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `compliance-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('inspection-photos').upload(fileName, selectedFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('inspection-photos').getPublicUrl(fileName);
        fileUrl = urlData.publicUrl;
      }

      const payload = {
        obligation_name: obligationName, type, category, authority,
        authority_contact: authorityContact, reference_number: referenceNumber,
        project, site, responsible_person: responsiblePerson,
        responsible_person_role: responsiblePersonRole, responsible_person_contact: responsiblePersonContact,
        issue_date: issueDate || null, expiry_date: expiryDate || null,
        renewal_lead_days: parseInt(renewalLeadDays) || 60,
        file_url: fileUrl, notes
      };

      if (!id) {
        const { error } = await supabase.from('compliance_register').insert([payload]);
        if (error) throw error;
        await supabase.from('audit_logs').insert([{ module: 'Compliance', action: 'Added Compliance Record', reference: obligationName }]);
      } else {
        const { error } = await supabase.from('compliance_register').update(payload).eq('id', id);
        if (error) throw error;
      }

      alert("Compliance record saved successfully!");
      navigate('/compliance');
    } catch (error: any) {
      alert("Error saving record: " + error.message);
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <Link to="/compliance" className="back-link"><ArrowLeft size={24} /></Link>
          <div><h1>{id ? 'Edit Compliance Record' : 'Add Compliance Record'}</h1><p className="page-subtitle">Track statutory certificates, licenses, and permits.</p></div>
        </div>
      </div>

      <div className="form-card">
        <h3 className="form-section-title">1. Core Details</h3>
        <div className="form-grid">
          <div className="form-group span-2"><label>Obligation Name *</label><input type="text" className="form-input" placeholder="e.g., Fire Certificate - Site A" value={obligationName} onChange={(e) => setObligationName(e.target.value)} /></div>
          <div className="form-group">
            <label>Type *</label>
            <select className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Select Type...</option>
              {complianceTypes.map((t) => (<option key={t.id} value={t.option_value}>{t.option_value}</option>))}
            </select>
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select Category...</option>
              {complianceCategories.map((c) => (<option key={c.id} value={c.option_value}>{c.option_value}</option>))}
            </select>
          </div>
          <div className="form-group"><label>Authority / Regulator</label><input type="text" className="form-input" placeholder="e.g., Ghana National Fire Service" value={authority} onChange={(e) => setAuthority(e.target.value)} /></div>
          <div className="form-group"><label>Authority Contact</label><input type="tel" className="form-input" placeholder="10-digit Contact" value={authorityContact} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 10) setAuthorityContact(val); }} /></div>
          <div className="form-group"><label>Reference Number</label><input type="text" className="form-input" placeholder="e.g., FC-2025-0412" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} /></div>
        </div>

        <h3 className="form-section-title mt-32">2. Location & Ownership</h3>
        <div className="form-grid">
          <div className="form-group"><label>Project</label><input type="text" className="form-input" placeholder="e.g., Riverside Tower" value={project} onChange={(e) => setProject(e.target.value)} /></div>
          <div className="form-group">
            <label>Site</label>
            <select className="form-input" value={site} onChange={(e) => setSite(e.target.value)}>
              <option value="">Select Site...</option>
              {sitesList.map((s) => (<option key={s.id} value={s.name}>{s.name}</option>))}
            </select>
          </div>
          <div className="form-group"><label>Responsible Person Name</label><input type="text" className="form-input" value={responsiblePerson} onChange={(e) => setResponsiblePerson(e.target.value)} /></div>
          <div className="form-group"><label>Responsible Person Role</label><input type="text" className="form-input" value={responsiblePersonRole} onChange={(e) => setResponsiblePersonRole(e.target.value)} /></div>
          <div className="form-group"><label>Responsible Person Contact</label><input type="tel" className="form-input" placeholder="10-digit Contact" value={responsiblePersonContact} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 10) setResponsiblePersonContact(val); }} /></div>
        </div>

        <h3 className="form-section-title mt-32">3. Validity & Tracking</h3>
        <div className="form-grid">
          <div className="form-group"><label>Issue Date</label><input type="date" className="form-input" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} /></div>
          <div className="form-group"><label>Expiry Date</label><input type="date" className="form-input" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} /></div>
          <div className="form-group"><label>Renewal Lead Time (Days)</label><input type="number" className="form-input" value={renewalLeadDays} onChange={(e) => setRenewalLeadDays(e.target.value)} /></div>
        </div>

        <h3 className="form-section-title mt-32">4. Document & Notes</h3>
        {existingFile && <div className="mb-12"><a href={existingFile} target="_blank" rel="noreferrer" className="evidence-link">View Current Document</a></div>}
        <div className="upload-container">
          <input type="file" id="compliance-file" className="hidden-input" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
          <label htmlFor="compliance-file" className="upload-label">
            <Paperclip size={24} color="var(--text-muted)" />
            <span className="upload-text">{selectedFile ? selectedFile.name : "Upload Certificate / License (PDF or Image)"}</span>
          </label>
        </div>
        <div className="form-group mt-16"><label>Notes</label><textarea className="form-input" rows={3} placeholder="e.g., Renewal requires an inspection" value={notes} onChange={(e) => setNotes(e.target.value)}></textarea></div>
      </div>

      <div className="sticky-action-bar">
        <Link to="/compliance" className="btn-secondary">Cancel</Link>
        <button className="btn-primary" onClick={handleSave}>Save Record</button>
      </div>
    </div>
  );
}