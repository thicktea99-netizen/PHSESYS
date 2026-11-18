// src/pages/LogToolboxTalk.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Paperclip } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Forms.css';
import '../styles/LogInspection.css';
import '../styles/LogPermit.css';

interface Hazard { id: number; hazard: string; control: string; ppe: string; }
interface Action { id: number; action: string; responsible: string; dueDate: string; status: string; }

export default function LogToolboxTalk() {
  // --- CORE STATE ---
  const [topic, setTopic] = useState('');
  const [site, setSite] = useState('');
  const [area, setArea] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [duration, setDuration] = useState('');
  const [language, setLanguage] = useState('');
  const [category, setCategory] = useState('Routine');
  const [specificTask, setSpecificTask] = useState('');
  const [siteCondition, setSiteCondition] = useState('');
  
  const [presenterName, setPresenterName] = useState('');
  const [presenterRole, setPresenterRole] = useState('');
  const [presenterContact, setPresenterContact] = useState('');
  
  const [workerConcerns, setWorkerConcerns] = useState('');
  const [attendeeCount, setAttendeeCount] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --- DYNAMIC LISTS ---
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  
  // --- DYNAMIC DATA ---
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  const [talkCategories, setTalkCategories] = useState<{ id: string, option_value: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: sitesData } = await supabase.from('sites').select('id, name').eq('status', 'active');
      if (sitesData) setSitesList(sitesData);

      const { data: catData } = await supabase.from('dropdown_options').select('id, option_value').eq('category', 'talk_category').order('option_value');
      if (catData) setTalkCategories(catData);
    };
    fetchData();
  }, []);

  const addHazard = () => setHazards([...hazards, { id: Date.now(), hazard: '', control: '', ppe: '' }]);
  const removeHazard = (id: number) => setHazards(hazards.filter(h => h.id !== id));
  const updateHazard = (id: number, field: keyof Hazard, value: string) => {
    setHazards(hazards.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const addAction = () => setActions([...actions, { id: Date.now(), action: '', responsible: '', dueDate: '', status: 'open' }]);
  const removeAction = (id: number) => setActions(actions.filter(a => a.id !== id));
  const updateAction = (id: number, field: keyof Action, value: string) => {
    setActions(actions.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const handleSave = async () => {
    if (!topic || !site || !date || !time || !presenterName) {
      alert("Please fill in required fields: Topic, Site, Date, Time, and Presenter Name.");
      return;
    }

    try {
      let fileUrl = null;
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `tbt-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('inspection-photos').upload(fileName, selectedFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('inspection-photos').getPublicUrl(fileName);
        fileUrl = urlData.publicUrl;
      }

      const { data: talkData, error: talkError } = await supabase
        .from('toolbox_talks')
        .insert([{
          topic, site, area, date, time,
          duration_mins: duration ? parseInt(duration) : null,
          language, category, specific_task: specificTask, site_condition: siteCondition,
          presenter_name: presenterName, presenter_role: presenterRole, presenter_contact: presenterContact,
          worker_concerns: workerConcerns,
          attendee_count: attendeeCount ? parseInt(attendeeCount) : 0,
          scanned_doc_url: fileUrl
        }])
        .select()
        .single();

      if (talkError) throw talkError;

      if (hazards.length > 0) {
        const hazardsData = hazards.map(h => ({ talk_id: talkData.id, hazard: h.hazard, control_measure: h.control, ppe_required: h.ppe }));
        const { error: hazError } = await supabase.from('tbt_hazards').insert(hazardsData);
        if (hazError) throw hazError;
      }

      if (actions.length > 0) {
        const actionsData = actions.map(a => ({ talk_id: talkData.id, action: a.action, responsible_person: a.responsible, due_date: a.dueDate || null, status: a.status }));
        const { error: actError } = await supabase.from('tbt_actions').insert(actionsData);
        if (actError) throw actError;
      }

      alert("Toolbox Talk saved successfully!");
      window.location.href = '/toolbox-talks';

    } catch (error: any) {
      alert("Error saving talk: " + error.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <Link to="/toolbox-talks" className="back-link"><ArrowLeft size={24} /></Link>
          <div>
            <h1>Log Toolbox Talk</h1>
            <p className="page-subtitle">Record safety briefings, hazards, and engagement.</p>
          </div>
        </div>
      </div>

      <div className="form-card">
        <h3 className="form-section-title">1. Talk Details</h3>
        <div className="form-grid">
          <div className="form-group span-2">
            <label>Topic / Title *</label>
            <input type="text" className="form-input" placeholder="e.g., Working at Height - Fall Protection" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Site *</label>
            <select className="form-input" value={site} onChange={(e) => setSite(e.target.value)}>
              <option value="">Select Site...</option>
              {sitesList.map((s) => (<option key={s.id} value={s.name}>{s.name}</option>))}
            </select>
          </div>
          <div className="form-group">
            <label>Area / Location</label>
            <input type="text" className="form-input" placeholder="e.g., Level 3 muster point" value={area} onChange={(e) => setArea(e.target.value)} />
          </div>
          <div className="form-group"><label>Date *</label><input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div className="form-group"><label>Time *</label><input type="time" className="form-input" value={time} onChange={(e) => setTime(e.target.value)} /></div>
          <div className="form-group"><label>Duration (mins)</label><input type="number" className="form-input" value={duration} onChange={(e) => setDuration(e.target.value)} /></div>
          <div className="form-group"><label>Language Used</label><input type="text" className="form-input" placeholder="e.g., English / Twi" value={language} onChange={(e) => setLanguage(e.target.value)} /></div>
          <div className="form-group">
            <label>Talk Category</label>
            <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select Category...</option>
              {talkCategories.map((cat) => (
                <option key={cat.id} value={cat.option_value}>{cat.option_value}</option>
              ))}
            </select>
          </div>
          <div className="form-group"><label>Specific Task of the Day</label><input type="text" className="form-input" placeholder="e.g., Pouring concrete L3" value={specificTask} onChange={(e) => setSpecificTask(e.target.value)} /></div>
          <div className="form-group span-2"><label>Site Condition</label><input type="text" className="form-input" placeholder="e.g., Sunny, 32°C, windy" value={siteCondition} onChange={(e) => setSiteCondition(e.target.value)} /></div>
        </div>

        <h3 className="form-section-title mt-32">2. Presenter Details</h3>
        <div className="form-grid">
          <div className="form-group"><label>Presenter Name *</label><input type="text" className="form-input" value={presenterName} onChange={(e) => setPresenterName(e.target.value)} /></div>
          <div className="form-group"><label>Role / Company</label><input type="text" className="form-input" value={presenterRole} onChange={(e) => setPresenterRole(e.target.value)} /></div>
          <div className="form-group">
            <label>Contact Number</label>
            <input type="tel" className="form-input" placeholder="10-digit Contact" value={presenterContact} onChange={(e) => {
              const numericValue = e.target.value.replace(/\D/g, '');
              if (numericValue.length <= 10) setPresenterContact(numericValue);
            }} />
          </div>
        </div>

        <div className="findings-container mt-32">
          <div className="findings-header">
            <div>
              <h3>3. Hazards, Controls & PPE</h3>
              <p>Pair each hazard with its control measure and required PPE.</p>
            </div>
            <button type="button" onClick={addHazard} className="btn-primary btn-small"><Plus size={16} /> Add Hazard</button>
          </div>
          {hazards.map((h) => (
            <div key={h.id} className="finding-card">
              <div className="finding-card-header">
                <h4>Hazard #{hazards.indexOf(h) + 1}</h4>
                <button type="button" onClick={() => removeHazard(h.id)} className="btn-icon danger"><Trash2 size={16} /></button>
              </div>
              <div className="form-grid">
                <div className="form-group span-2">
                  <label>Hazard Identified</label>
                  <input type="text" className="form-input" placeholder="e.g., Exposed edges on L3" value={h.hazard} onChange={(e) => updateHazard(h.id, 'hazard', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Control Measure</label>
                  <input type="text" className="form-input" placeholder="e.g., Install guardrails before work" value={h.control} onChange={(e) => updateHazard(h.id, 'control', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>PPE Required</label>
                  <input type="text" className="form-input" placeholder="e.g., Harness, hard hat" value={h.ppe} onChange={(e) => updateHazard(h.id, 'ppe', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <h3 className="form-section-title mt-32">4. Worker Engagement & Actions</h3>
        <div className="form-group">
          <label>Worker Questions / Concerns Raised</label>
          <textarea className="form-input" rows={3} placeholder="What did the workers ask or raise?" value={workerConcerns} onChange={(e) => setWorkerConcerns(e.target.value)}></textarea>
        </div>

        <div className="findings-container mt-16">
          <div className="findings-header">
            <div>
              <h3>Corrective Actions</h3>
              <p>Actions to address concerns raised during the talk.</p>
            </div>
            <button type="button" onClick={addAction} className="btn-primary btn-small"><Plus size={16} /> Add Action</button>
          </div>
          {actions.map((a) => (
            <div key={a.id} className="finding-card">
              <div className="finding-card-header">
                <h4>Action #{actions.indexOf(a) + 1}</h4>
                <button type="button" onClick={() => removeAction(a.id)} className="btn-icon danger"><Trash2 size={16} /></button>
              </div>
              <div className="form-grid">
                <div className="form-group span-2">
                  <label>Action Required</label>
                  <input type="text" className="form-input" placeholder="e.g., Replace damaged harnesses" value={a.action} onChange={(e) => updateAction(a.id, 'action', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Responsible Person</label>
                  <input type="text" className="form-input" value={a.responsible} onChange={(e) => updateAction(a.id, 'responsible', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Target Date</label>
                  <input type="date" className="form-input" value={a.dueDate} onChange={(e) => updateAction(a.id, 'dueDate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-input" value={a.status} onChange={(e) => updateAction(a.id, 'status', e.target.value)}>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h3 className="form-section-title mt-32">5. Attendance & Documentation</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Number of Attendees</label>
            <input type="number" className="form-input" placeholder="e.g., 15" value={attendeeCount} onChange={(e) => setAttendeeCount(e.target.value)} />
          </div>
        </div>
        <div className="upload-container mt-16">
          <input type="file" id="tbt-file" className="hidden-input" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
          <label htmlFor="tbt-file" className="upload-label">
            <Paperclip size={24} color="var(--text-muted)" />
            <span className="upload-text">{selectedFile ? selectedFile.name : "Upload Attendance Sheet / Method Statement"}</span>
          </label>
        </div>
      </div>

      <div className="sticky-action-bar">
        <Link to="/toolbox-talks" className="btn-secondary">Cancel</Link>
        <button className="btn-primary" onClick={handleSave}>Save Talk</button>
      </div>
    </div>
  );
}