// src/pages/LogDrill.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Paperclip } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Forms.css';
import '../styles/LogInspection.css';

interface Personnel {
  id: number;
  role: string;
  name: string;
  contact: string;
}

export default function LogDrill() {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- DRILL STATE ---
  const [drillType, setDrillType] = useState('');
  const [site, setSite] = useState('');
  const [area, setArea] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [duration, setDuration] = useState('');
  const [totalParticipants, setTotalParticipants] = useState('');
  const [participantsNotes, setParticipantsNotes] = useState('');
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [findings, setFindings] = useState('');
  const [correctiveActions, setCorrectiveActions] = useState('');
  const [requiresCapa, setRequiresCapa] = useState(false);
  const [status, setStatus] = useState('Completed');
  
  // --- FILE UPLOAD ---
  const [existingFile, setExistingFile] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --- PERSONNEL ---
  const [personnel, setPersonnel] = useState<Personnel[]>([]);

  // --- DYNAMIC DATA ---
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  const [drillTypes, setDrillTypes] = useState<{ id: string, option_value: string }[]>([]);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    const fetchData = async () => {
      const { data: sitesData } = await supabase.from('sites').select('id, name').eq('status', 'active');
      if (sitesData) setSitesList(sitesData);

      const { data: typeData } = await supabase.from('dropdown_options').select('id, option_value').eq('category', 'drill_type').order('option_value');
      if (typeData) setDrillTypes(typeData);
    };
    fetchData();
    if (id) fetchDrill();
  }, [id]);

  const fetchDrill = async () => {
    try {
      const { data, error } = await supabase.from('drills').select('*').eq('id', id).single();
      if (error) throw error;
      
      setDrillType(data.drill_type || '');
      setSite(data.site || '');
      setArea(data.area || '');
      setDate(data.date || '');
      setTime(data.time ? data.time.slice(0, 5) : '');
      setDuration(data.duration_mins?.toString() || '');
      setTotalParticipants(data.total_participants?.toString() || '');
      setParticipantsNotes(data.participants_notes || '');
      setScenarioDescription(data.scenario_description || '');
      setFindings(data.findings || '');
      setCorrectiveActions(data.corrective_actions || '');
      setRequiresCapa(data.requires_capa || false);
      setStatus(data.status || 'Completed');
      setExistingFile(data.evidence_url || '');

      const { data: pData } = await supabase.from('drill_personnel').select('*').eq('drill_id', id);
      if (pData) {
        setPersonnel(pData.map((p, index) => ({ id: Date.now() + index, role: p.role, name: p.name, contact: p.contact || '' })));
      }
    } catch (error: any) {
      alert("Error loading drill: " + error.message);
      navigate('/drills');
    } finally {
      setLoading(false);
    }
  };

  const addPersonnel = () => {
    setPersonnel([...personnel, { id: Date.now(), role: 'Drill Coordinator', name: '', contact: '' }]);
  };
  const removePersonnel = (id: number) => setPersonnel(personnel.filter(p => p.id !== id));
  const updatePersonnel = (id: number, field: keyof Personnel, value: string) => {
    setPersonnel(personnel.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleSave = async () => {
    if (!drillType || !site || !date || !time) {
      alert("Please fill in required fields: Drill Type, Site, Date, and Time.");
      return;
    }

    for (const p of personnel) {
      if (p.contact && p.contact.length !== 10) {
        alert(`Contact must be 10 digits for ${p.name || 'Unnamed'}`);
        return;
      }
    }

    try {
      let evidenceUrl = existingFile;
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `drill-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('inspection-photos').upload(fileName, selectedFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = await supabase.storage.from('inspection-photos').getPublicUrl(fileName);
        evidenceUrl = urlData.publicUrl;
      }

      const payload = {
        drill_type: drillType, site, area, date, time,
        duration_mins: duration ? parseInt(duration) : null,
        total_participants: totalParticipants ? parseInt(totalParticipants) : null,
        participants_notes: participantsNotes,
        scenario_description: scenarioDescription,
        findings, corrective_actions: correctiveActions,
        requires_capa: requiresCapa, status, evidence_url: evidenceUrl
      };

      let drillId = id;
      if (!drillId) {
        const { data, error } = await supabase.from('drills').insert([payload]).select().single();
        if (error) throw error;
        drillId = data.id;

        // Log to audit trail
        await supabase.from('audit_logs').insert([{
          module: 'Drills',
          action: 'Logged Drill',
          reference: `DRL-${String(data.drill_number).padStart(4, '0')}`
        }]);

        // Auto-generate CAPA if required
        if (requiresCapa) {
          await supabase.from('capa_actions').insert([{
            action_title: `Drill Finding: ${drillType}`,
            description: findings || 'Drill findings require corrective action.',
            source_type: 'Drill',
            source_reference: `DRL-${String(data.drill_number).padStart(4, '0')}`,
            action_type: 'Corrective', priority: 'Medium',
            owner: 'Unassigned',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'open'
          }]);
        }
      } else {
        const { error } = await supabase.from('drills').update(payload).eq('id', drillId);
        if (error) throw error;
        await supabase.from('drill_personnel').delete().eq('drill_id', drillId);
      }

      if (personnel.length > 0) {
        const personnelData = personnel.map(p => ({ drill_id: drillId, role: p.role, name: p.name, contact: p.contact }));
        const { error: pError } = await supabase.from('drill_personnel').insert(personnelData);
        if (pError) throw pError;
      }

      alert("Drill saved successfully!");
      navigate('/drills');
    } catch (error: any) {
      alert("Error saving drill: " + error.message);
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading drill...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="header-left">

          <Link to="/drills" className="back-link"><ArrowLeft size={24} /></Link>

          <div><h1>{id ? 'Edit Drill' : 'Log Drill / Exercise'}</h1><p className="page-subtitle">Record an emergency drill or exercise.</p></div>
        </div>
      </div>

      <div className="form-card">
        <h3 className="form-section-title">1. Drill Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Drill Type *</label>
            <select className="form-input" value={drillType} onChange={(e) => setDrillType(e.target.value)}>
              <option value="">Select Type...</option>
              {drillTypes.map((type) => (<option key={type.id} value={type.option_value}>{type.option_value}</option>))}
            </select>
          </div>
          <div className="form-group">
            <label>Site *</label>
            <select className="form-input" value={site} onChange={(e) => setSite(e.target.value)}>
              <option value="">Select Site...</option>
              {sitesList.map((s) => (<option key={s.id} value={s.name}>{s.name}</option>))}
            </select>
          </div>
          <div className="form-group"><label>Area / Location</label><input type="text" className="form-input" value={area} onChange={(e) => setArea(e.target.value)} /></div>
          <div className="form-group"><label>Date *</label><input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div className="form-group"><label>Time *</label><input type="time" className="form-input" value={time} onChange={(e) => setTime(e.target.value)} /></div>
          <div className="form-group"><label>Duration (mins)</label><input type="number" className="form-input" value={duration} onChange={(e) => setDuration(e.target.value)} /></div>
        </div>

        <h3 className="form-section-title mt-32">2. Participants & Scenario</h3>
        <div className="form-grid">
          <div className="form-group"><label>Total Participants</label><input type="number" className="form-input" value={totalParticipants} onChange={(e) => setTotalParticipants(e.target.value)} /></div>
          <div className="form-group"><label>Status</label><select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}><option value="Planned">Planned</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option></select></div>
          <div className="form-group span-2"><label>Participants Names / Departments</label><textarea className="form-input" rows={2} placeholder="e.g., All site crew, 3 subcontractors" value={participantsNotes} onChange={(e) => setParticipantsNotes(e.target.value)}></textarea></div>
          <div className="form-group span-2"><label>Scenario Description</label><textarea className="form-input" rows={3} placeholder="Describe the simulated scenario..." value={scenarioDescription} onChange={(e) => setScenarioDescription(e.target.value)}></textarea></div>
        </div>

        <div className="findings-container mt-32">
          <div className="findings-header">
            <div><h3>Key Personnel</h3><p>Add the key personnel involved in this drill.</p></div>
            <button type="button" onClick={addPersonnel} className="btn-primary btn-small"><Plus size={16} /> Add Personnel</button>
          </div>
          {personnel.map((p) => (
            <div key={p.id} className="witness-row" style={{ gridTemplateColumns: '1.5fr 2fr 2fr auto' }}>
              <select className="form-input" value={p.role} onChange={(e) => updatePersonnel(p.id, 'role', e.target.value)}>
                <option value="Drill Coordinator">Drill Coordinator</option>
                <option value="Safety Officer">Safety Officer</option>
                <option value="Fire Warden">Fire Warden</option>
                <option value="First Aider">First Aider</option>
                <option value="Other">Other</option>
              </select>
              <input type="text" className="form-input" placeholder="Name" value={p.name} onChange={(e) => updatePersonnel(p.id, 'name', e.target.value)} />
              <input type="tel" className="form-input" placeholder="10-digit Contact" value={p.contact} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 10) updatePersonnel(p.id, 'contact', val); }} />
              <button type="button" onClick={() => removePersonnel(p.id)} className="btn-icon danger"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>

        <h3 className="form-section-title mt-32">3. Findings & Actions</h3>
        <div className="form-group mb-16"><label>Findings / Observations</label><textarea className="form-input" rows={3} placeholder="What worked? What didn't?" value={findings} onChange={(e) => setFindings(e.target.value)}></textarea></div>
        <div className="form-group mb-16"><label>Corrective Actions</label><textarea className="form-input" rows={3} value={correctiveActions} onChange={(e) => setCorrectiveActions(e.target.value)}></textarea></div>
        <div className="checkbox-group">
          <input type="checkbox" id="requiresCapa" checked={requiresCapa} onChange={(e) => setRequiresCapa(e.target.checked)} />
          <label htmlFor="requiresCapa" className={requiresCapa ? 'text-danger' : ''}>Requires CAPA Action</label>
        </div>

        <h3 className="form-section-title mt-32">4. Evidence</h3>
        {existingFile && <div className="mb-12"><a href={existingFile} target="_blank" rel="noreferrer" className="evidence-link">View Current Evidence</a></div>}
        <div className="upload-container">
          <input type="file" id="drill-file" className="hidden-input" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
          <label htmlFor="drill-file" className="upload-label">
            <Paperclip size={24} color="var(--text-muted)" />
            <span className="upload-text">{selectedFile ? selectedFile.name : "Upload Photos / Scanned Drill Report"}</span>
          </label>
        </div>
      </div>

      <div className="sticky-action-bar">
        <Link to="/drills" className="btn-secondary">Cancel</Link>
        <button className="btn-primary" onClick={handleSave}>Save Drill</button>
      </div>
    </div>
  );
}