// src/pages/LogAudit.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Paperclip } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Forms.css';
import '../styles/LogInspection.css';

interface Auditor { id: number; name: string; role: string; contact: string; }
interface Finding { 
  id: number; findingType: string; description: string; severity: string; 
  responsiblePerson: string; dueDate: string; status: string; requiresCapa: boolean; 
}

export default function LogAudit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [auditType, setAuditType] = useState('Internal');
  const [site, setSite] = useState('');
  const [auditDate, setAuditDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Open');
  const [score, setScore] = useState('');
  const [summary, setSummary] = useState('');
  const [existingFile, setExistingFile] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [auditors, setAuditors] = useState<Auditor[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  const [auditTypes, setAuditTypes] = useState<{ id: string, option_value: string }[]>([]);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    const fetchData = async () => {
      const { data: sitesData } = await supabase.from('sites').select('id, name').eq('status', 'active');
      if (sitesData) setSitesList(sitesData);
      const { data: typeData } = await supabase.from('dropdown_options').select('id, option_value').eq('category', 'audit_type').order('option_value');
      if (typeData) setAuditTypes(typeData);
    };
    fetchData();
    if (id) fetchAuditData();
  }, [id]);

  const fetchAuditData = async () => {
    try {
      const { data: auditData, error } = await supabase.from('audits').select('*').eq('id', id).single();
      if (error) throw error;
      
      setTitle(auditData.title);
      setAuditType(auditData.audit_type);
      setSite(auditData.site);
      setAuditDate(auditData.audit_date);
      setStatus(auditData.status);
      setScore(auditData.score || '');
      setSummary(auditData.summary || '');
      setExistingFile(auditData.report_url || '');

      const { data: teamData } = await supabase.from('audit_team').select('*').eq('audit_id', id);
      if (teamData) setAuditors(teamData.map((t, index) => ({ id: Date.now() + index, name: t.auditor_name, role: t.auditor_role || '', contact: t.auditor_contact || '' })));

      const { data: findingsData } = await supabase.from('audit_findings').select('*').eq('audit_id', id);
      if (findingsData) setFindings(findingsData.map((f, index) => ({
        id: Date.now() + index + 100, findingType: f.finding_type, description: f.description,
        severity: f.severity, responsiblePerson: f.responsible_person || '', dueDate: f.due_date || '',
        status: f.status || 'Open', requiresCapa: f.requires_capa
      })));
    } catch (error: any) {
      alert("Error loading audit: " + error.message);
      navigate('/audits');
    } finally {
      setLoading(false);
    }
  };

  const addAuditor = () => setAuditors([...auditors, { id: Date.now(), name: '', role: '', contact: '' }]);
  const removeAuditor = (id: number) => setAuditors(auditors.filter(a => a.id !== id));
  const updateAuditor = (id: number, field: keyof Auditor, value: string) => {
    setAuditors(auditors.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const addFinding = () => {
    setFindings([...findings, { id: Date.now(), findingType: 'Non-Conformance', description: '', severity: 'Medium', responsiblePerson: '', dueDate: '', status: 'Open', requiresCapa: false }]);
  };
  const removeFinding = (id: number) => setFindings(findings.filter(f => f.id !== id));
  const updateFinding = (id: number, field: keyof Finding, value: any) => {
    setFindings(findings.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const handleSave = async () => {
    if (!title || !site || !auditDate || auditors.length === 0) {
      alert("Please fill in Title, Site, Date, and add at least one Auditor.");
      return;
    }
    for (const auditor of auditors) {
      if (auditor.contact && auditor.contact.length !== 10) {
        alert(`Auditor contact must be 10 digits for ${auditor.name || 'Unnamed'}`);
        return;
      }
    }

    try {
      let reportUrl = existingFile;
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `audit-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('inspection-photos').upload(fileName, selectedFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('inspection-photos').getPublicUrl(fileName);
        reportUrl = urlData.publicUrl;
      }

      let auditId = id;
      if (!auditId) {
        const { data, error } = await supabase.from('audits').insert([{
          title, audit_type: auditType, site, audit_date: auditDate, status, score, summary, report_url: reportUrl
        }]).select().single();
        if (error) throw error;
        auditId = data.id;

        // Log to audit trail
        await supabase.from('audit_logs').insert([{
          module: 'Audits',
          action: 'Logged Audit',
          reference: `AUD-${String(data.audit_number).padStart(4, '0')}`
        }]);
      } else {
        const { error } = await supabase.from('audits').update({ 
          title, audit_type: auditType, site, audit_date: auditDate, status, score, summary, report_url: reportUrl 
        }).eq('id', auditId);
        if (error) throw error;
        await supabase.from('audit_team').delete().eq('audit_id', auditId);
        await supabase.from('audit_findings').delete().eq('audit_id', auditId);
      }

      const auditorData = auditors.map(a => ({ audit_id: auditId, auditor_name: a.name, auditor_role: a.role, auditor_contact: a.contact }));
      const { error: audError } = await supabase.from('audit_team').insert(auditorData);
      if (audError) throw audError;

      if (findings.length > 0) {
        const findingsData = findings.map(f => ({
          audit_id: auditId, finding_type: f.findingType, description: f.description,
          severity: f.severity, responsible_person: f.responsiblePerson, due_date: f.dueDate || null,
          status: f.status, requires_capa: f.requiresCapa
        }));
        const { error: findError } = await supabase.from('audit_findings').insert(findingsData);
        if (findError) throw findError;

        const capaFindings = findings.filter(f => f.requiresCapa);
        if (capaFindings.length > 0) {
          const capaData = capaFindings.map(f => ({
            action_title: `Audit Finding: ${f.findingType}`,
            description: f.description, source_type: 'Audit',
            source_reference: `AUD-${id ? 'EDIT' : 'NEW'}`,
            action_type: 'Corrective', priority: f.severity, owner: f.responsiblePerson || 'Unassigned',
            due_date: f.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'open'
          }));
          await supabase.from('capa_actions').insert(capaData);
        }
      }

      alert("Audit saved successfully!");
      navigate('/audits');
    } catch (error: any) { alert("Error saving: " + error.message); }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading audit...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <Link to="/audits" className="back-link"><ArrowLeft size={24} /></Link>
          <div><h1>{id ? 'Edit Audit' : 'Log Audit'}</h1><p className="page-subtitle">Record an internal or external audit.</p></div>
        </div>
      </div>

      <div className="form-card">
        <h3 className="form-section-title">1. Audit Details</h3>
        <div className="form-grid">
          <div className="form-group span-2"><label>Audit Title *</label><input type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="form-group">
            <label>Audit Type</label>
            <select className="form-input" value={auditType} onChange={(e) => setAuditType(e.target.value)}>
              <option value="">Select Type...</option>
              {auditTypes.map((type) => (<option key={type.id} value={type.option_value}>{type.option_value}</option>))}
            </select>
          </div>
          <div className="form-group"><label>Site *</label><select className="form-input" value={site} onChange={(e) => setSite(e.target.value)}><option value="">Select Site...</option>{sitesList.map((s) => (<option key={s.id} value={s.name}>{s.name}</option>))}</select></div>
          <div className="form-group"><label>Audit Date *</label><input type="date" className="form-input" value={auditDate} onChange={(e) => setAuditDate(e.target.value)} /></div>
          <div className="form-group"><label>Status</label><select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}><option value="Open">Open</option><option value="Actions Pending">Actions Pending</option><option value="Closed">Closed</option></select></div>
          <div className="form-group"><label>Score / Rating</label><input type="text" className="form-input" value={score} onChange={(e) => setScore(e.target.value)} /></div>
          <div className="form-group span-2"><label>Summary</label><textarea className="form-input" rows={2} value={summary} onChange={(e) => setSummary(e.target.value)}></textarea></div>
        </div>

        <div className="findings-container mt-32">
          <div className="findings-header"><div><h3>2. Audit Team</h3></div><button type="button" onClick={addAuditor} className="btn-secondary btn-small"><Plus size={16} /> Add Auditor</button></div>
          {auditors.map((auditor) => (
            <div key={auditor.id} className="witness-row" style={{ gridTemplateColumns: '2fr 2fr 2fr auto' }}>
              <input type="text" className="form-input" placeholder="Name" value={auditor.name} onChange={(e) => updateAuditor(auditor.id, 'name', e.target.value)} />
              <input type="text" className="form-input" placeholder="Role" value={auditor.role} onChange={(e) => updateAuditor(auditor.id, 'role', e.target.value)} />
              <input type="tel" className="form-input" placeholder="10-digit Contact" value={auditor.contact} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 10) updateAuditor(auditor.id, 'contact', val); }} />
              <button type="button" onClick={() => removeAuditor(auditor.id)} className="btn-icon danger"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>

        <div className="findings-container mt-32">
          <div className="findings-header"><div><h3>3. Audit Findings</h3></div><button type="button" onClick={addFinding} className="btn-primary btn-small"><Plus size={16} /> Add Finding</button></div>
          {findings.map((finding, index) => (
            <div key={finding.id} className="finding-card">
              <div className="finding-card-header"><h4>Finding #{index + 1}</h4><button type="button" onClick={() => removeFinding(finding.id)} className="btn-icon danger"><Trash2 size={16} /></button></div>
              <div className="form-grid">
                <div className="form-group"><label>Type</label><select className="form-input" value={finding.findingType} onChange={(e) => updateFinding(finding.id, 'findingType', e.target.value)}><option value="Non-Conformance">Non-Conformance</option><option value="Observation">Observation</option><option value="Positive Practice">Positive Practice</option></select></div>
                <div className="form-group"><label>Severity</label><select className="form-input" value={finding.severity} onChange={(e) => updateFinding(finding.id, 'severity', e.target.value)}><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option></select></div>
                <div className="form-group span-2"><label>Description</label><input type="text" className="form-input" value={finding.description} onChange={(e) => updateFinding(finding.id, 'description', e.target.value)} /></div>
                <div className="form-group"><label>Responsible Person</label><input type="text" className="form-input" value={finding.responsiblePerson} onChange={(e) => updateFinding(finding.id, 'responsiblePerson', e.target.value)} /></div>
                <div className="form-group"><label>Due Date</label><input type="date" className="form-input" value={finding.dueDate} onChange={(e) => updateFinding(finding.id, 'dueDate', e.target.value)} /></div>
                <div className="form-group"><label>Status</label><select className="form-input" value={finding.status} onChange={(e) => updateFinding(finding.id, 'status', e.target.value)}><option value="Open">Open</option><option value="In Progress">In Progress</option><option value="Closed">Closed</option></select></div>
              </div>
              <div className="finding-footer"><div className="checkbox-group"><input type="checkbox" id={`capa-${finding.id}`} checked={finding.requiresCapa} onChange={(e) => updateFinding(finding.id, 'requiresCapa', e.target.checked)} /><label htmlFor={`capa-${finding.id}`} className={finding.requiresCapa ? 'text-danger' : ''}>Requires CAPA Action</label></div></div>
            </div>
          ))}
        </div>

        <h3 className="form-section-title mt-32">4. Attachments</h3>
        {existingFile && <div className="mb-12"><a href={existingFile} target="_blank" rel="noreferrer" className="evidence-link">View Current Report</a></div>}
        <div className="upload-container">
          <input type="file" id="audit-file" className="hidden-input" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
          <label htmlFor="audit-file" className="upload-label">
            <Paperclip size={24} color="var(--text-muted)" />
            <span className="upload-text">{selectedFile ? selectedFile.name : "Upload New Report (Replaces Old)"}</span>
          </label>
        </div>
      </div>

      <div className="sticky-action-bar">
        <Link to="/audits" className="btn-secondary">Cancel</Link>
        <button className="btn-primary" onClick={handleSave}>Save Audit</button>
      </div>
    </div>
  );
}