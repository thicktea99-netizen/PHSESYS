// src/pages/LogInspection.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Paperclip } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Forms.css';
import '../styles/LogInspection.css';

interface Finding {
  id: number;
  findingType: string;
  description: string;
  severity: string;
  immediateAction: string;
  requiresCapa: boolean;
  file: File | null;
}

export default function LogInspection() {
  const [searchParams] = useSearchParams();
  const prefillEquipment = searchParams.get('equipment');
  const prefillSite = searchParams.get('site');

  const [inspectorName, setInspectorName] = useState('');
  const [inspectorRole, setInspectorRole] = useState('');
  const [inspectorContact, setInspectorContact] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));

  const [inspectionType, setInspectionType] = useState(prefillEquipment ? 'Plant & Equipment' : '');
  const [projectId, setProjectId] = useState('');
  const [site, setSite] = useState(prefillSite || '');
  const [area, setArea] = useState('');
  const [weather, setWeather] = useState('');
  const [overallNotes, setOverallNotes] = useState(prefillEquipment ? `Inspection for: ${prefillEquipment}` : '');

  const [findings, setFindings] = useState<Finding[]>([]);
  const [sitesList, setSitesList] = useState<{ id: string, name: string, project_id: string }[]>([]);
  const [projectsList, setProjectsList] = useState<{ id: string, project_name: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: sitesData } = await supabase.from('sites').select('id, name, project_id').eq('status', 'active');
      if (sitesData) setSitesList(sitesData);

      const { data: projectsData } = await supabase.from('projects').select('id, project_name').eq('status', 'active');
      if (projectsData) setProjectsList(projectsData);
    };
    fetchData();
  }, []);

  // Auto-fill project when site is selected
  useEffect(() => {
    if (site) {
      const selectedSite = sitesList.find(s => s.name === site);
      if (selectedSite && selectedSite.project_id) {
        setProjectId(selectedSite.project_id);
      }
    }
  }, [site, sitesList]);

  const addFinding = () => {
    setFindings([...findings, { 
      id: Date.now(), findingType: '', description: '', severity: 'Medium', 
      immediateAction: '', requiresCapa: false, file: null
    }]);
  };

  const removeFinding = (id: number) => setFindings(findings.filter(f => f.id !== id));

  const updateFinding = (id: number, field: keyof Finding, value: any) => {
    setFindings(findings.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const handleSave = async () => {
    if (!inspectorName || !inspectionType || !site || !date || !time) {
      alert("Please fill in required fields: Inspector Name, Type, Site, Date, and Time.");
      return;
    }
    
    if (inspectorContact && inspectorContact.length !== 10) {
      alert("Inspector contact number must be exactly 10 digits.");
      return;
    }

    try {
      const { data: inspectionData, error: inspectionError } = await supabase
        .from('inspections')
        .insert([{
          inspection_type: inspectionType, project_id: projectId || null, site: site, area: area, date: date, time: time,
          weather: weather, overall_notes: overallNotes, 
          inspector_name: inspectorName, inspector_role: inspectorRole, inspector_contact: inspectorContact
        }])
        .select()
        .single();

      if (inspectionError) throw inspectionError;

      if (findings.length > 0) {
        const findingsData = [];

        for (const f of findings) {
          let photoUrl = null;

          if (f.file) {
            const fileExt = f.file.name.split('.').pop();
            const fileName = `finding-${Date.now()}-${Math.random()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('inspection-photos').upload(fileName, f.file);
            if (uploadError) throw uploadError;
            const { data: urlData } = supabase.storage.from('inspection-photos').getPublicUrl(fileName);
            photoUrl = urlData.publicUrl;
          }

          findingsData.push({
            inspection_id: inspectionData.id, finding_type: f.findingType, description: f.description,
            severity: f.severity, immediate_action: f.immediateAction, requires_capa: f.requiresCapa, photo_url: photoUrl
          });
        }

        const { error: findingsError } = await supabase.from('inspection_findings').insert(findingsData);
        if (findingsError) throw findingsError;

        const capaFindings = findings.filter(f => f.requiresCapa);
        if (capaFindings.length > 0) {
          const capaData = capaFindings.map(f => ({
            action_title: `Inspection Finding: ${f.findingType}`,
            description: f.description,
            source_type: 'Inspection Finding',
            source_reference: `INS-${String(inspectionData.inspection_number).padStart(4, '0')}`,
            action_type: 'Corrective', priority: f.severity, owner: 'Unassigned',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'open'
          }));
          const { error: capaError } = await supabase.from('capa_actions').insert(capaData);
          if (capaError) throw capaError;
        }
      }

      await supabase.from('audit_logs').insert([{
        module: 'Inspections',
        action: 'Completed Inspection',
        reference: `INS-${String(inspectionData.inspection_number).padStart(4, '0')}`
      }]);

      alert("Inspection saved successfully!");
      window.location.href = '/inspections';

    } catch (error: any) {
      alert("Error saving inspection: " + error.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <Link to="/inspections" className="back-link"><ArrowLeft size={24} /></Link>
          <div><h1>Log New Inspection</h1><p className="page-subtitle">Record a site walk or specific inspection.</p></div>
        </div>
      </div>

      <div className="form-card">
        <h3 className="form-section-title">1. Inspector Details</h3>
        <div className="form-grid">
          <div className="form-group"><label>Inspector Name *</label><input type="text" className="form-input" placeholder="Who is doing the inspection?" value={inspectorName} onChange={(e) => setInspectorName(e.target.value)} /></div>
          <div className="form-group"><label>Inspector Role / Company</label><input type="text" className="form-input" placeholder="e.g., HSE Manager - BuildCorp" value={inspectorRole} onChange={(e) => setInspectorRole(e.target.value)} /></div>
          <div className="form-group">
            <label>Inspector Contact</label>
            <input type="tel" className="form-input" placeholder="10-digit Contact" value={inspectorContact} onChange={(e) => {
              const numericValue = e.target.value.replace(/\D/g, '');
              if (numericValue.length <= 10) setInspectorContact(numericValue);
            }} />
          </div>
          <div className="form-group"><label>Date *</label><input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div className="form-group"><label>Time *</label><input type="time" className="form-input" value={time} onChange={(e) => setTime(e.target.value)} /></div>
        </div>

        <h3 className="form-section-title mt-32">2. Inspection Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Inspection Type *</label>
            <select className="form-input" value={inspectionType} onChange={(e) => setInspectionType(e.target.value)}>
              <option value="">Select Type...</option>
              <option value="Daily Walk">Daily Walk</option>
              <option value="Scaffold Inspection">Scaffold Inspection</option>
              <option value="Excavation Inspection">Excavation Inspection</option>
              <option value="Fire Extinguisher Check">Fire Extinguisher Check</option>
              <option value="PPE Compliance Check">PPE Compliance Check</option>
              <option value="Housekeeping Inspection">Housekeeping Inspection</option>
              <option value="Electrical Inspection">Electrical Inspection</option>
              <option value="Plant & Equipment">Plant & Equipment</option>
            </select>
          </div>
          <div className="form-group">
            <label>Project</label>
            <select className="form-input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Select Project...</option>
              {projectsList.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Site *</label>
            <select className="form-input" value={site} onChange={(e) => setSite(e.target.value)}>
              <option value="">Select Site...</option>
              {sitesList.map((s) => (<option key={s.id} value={s.name}>{s.name}</option>))}
            </select>
          </div>
          <div className="form-group"><label>Area / Location Detail</label><input type="text" className="form-input" placeholder="e.g., Level 3 - East wing" value={area} onChange={(e) => setArea(e.target.value)} /></div>
          <div className="form-group"><label>Weather</label><input type="text" className="form-input" placeholder="e.g., Sunny, Rainy" value={weather} onChange={(e) => setWeather(e.target.value)} /></div>
        </div>

        <div className="findings-container mt-32">
          <div className="findings-header">
            <div><h3>3. Findings</h3><p>Add any hazards, defects, or issues found during the inspection.</p></div>
            <button type="button" onClick={addFinding} className="btn-primary btn-small"><Plus size={16} /> Add Finding</button>
          </div>
          
          {findings.length === 0 && <p className="no-findings">No findings added. This means a clean inspection!</p>}

          {findings.map((finding, index) => (
            <div key={finding.id} className="finding-card">
              <div className="finding-card-header">
                <h4>Finding #{index + 1}</h4>
                <button type="button" onClick={() => removeFinding(finding.id)} className="btn-icon danger"><Trash2 size={16} /></button>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Finding Type</label>
                  <select className="form-input" value={finding.findingType} onChange={(e) => updateFinding(finding.id, 'findingType', e.target.value)}>
                    <option value="">Select...</option>
                    <option value="Scaffold">Scaffold</option>
                    <option value="PPE">PPE</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Fire">Fire</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Excavation">Excavation</option>
                    <option value="Access / Egress">Access / Egress</option>
                    <option value="Plant & Equipment">Plant & Equipment</option>
                    <option value="Environment">Environment</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Severity</label>
                  <select className="form-input" value={finding.severity} onChange={(e) => updateFinding(finding.id, 'severity', e.target.value)}>
                    <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                    <option value="Critical">Critical</option><option value="Catastrophic">Catastrophic</option>
                  </select>
                </div>
                <div className="form-group span-2"><label>Description</label><input type="text" className="form-input" placeholder="What did you find?" value={finding.description} onChange={(e) => updateFinding(finding.id, 'description', e.target.value)} /></div>
                <div className="form-group span-2"><label>Immediate Action Taken</label><input type="text" className="form-input" placeholder="e.g., Stopped work, informed foreman" value={finding.immediateAction} onChange={(e) => updateFinding(finding.id, 'immediateAction', e.target.value)} /></div>
              </div>

              <div className="finding-footer">
                <div className="checkbox-group">
                  <input type="checkbox" id={`capa-${finding.id}`} checked={finding.requiresCapa} onChange={(e) => updateFinding(finding.id, 'requiresCapa', e.target.checked)} />
                  <label htmlFor={`capa-${finding.id}`} className={finding.requiresCapa ? 'text-danger' : ''}>Requires CAPA Action</label>
                </div>
                <div>
                  <input type="file" id={`photo-${finding.id}`} className="hidden-input" onChange={(e) => updateFinding(finding.id, 'file', e.target.files ? e.target.files[0] : null)} />
                  <label htmlFor={`photo-${finding.id}`} className="file-upload-label">
                    <Paperclip size={14} /> {finding.file ? finding.file.name : "Attach Photo"}
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h3 className="form-section-title mt-32">4. Overall Notes</h3>
        <div className="form-group">
          <textarea className="form-input" rows={3} placeholder="Summary of the walk..." value={overallNotes} onChange={(e) => setOverallNotes(e.target.value)}></textarea>
        </div>
      </div>

      <div className="sticky-action-bar">
        <Link to="/inspections" className="btn-secondary">Cancel</Link>
        <button className="btn-primary" onClick={handleSave}>Save Inspection</button>
      </div>
    </div>
  );
}