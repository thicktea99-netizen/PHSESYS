// src/pages/LogPpeCheck.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Paperclip } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Forms.css';
import '../styles/LogInspection.css';

interface PpeLine {
  id: number;
  category: string;
  quantity: number;
  condition: string;
  nonCompliant: number;
  action: string;
  notes: string;
  file: File | null;
}

export default function LogPpeCheck() {
  // --- INSPECTOR DETAILS ---
  const [checkedBy, setCheckedBy] = useState('');
  const [inspectorRole, setInspectorRole] = useState('');
  const [inspectorContact, setInspectorContact] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [ppeCategories, setPpeCategories] = useState<{ id: string, option_value: string }[]>([]);

  // --- CHECK DETAILS ---
  const [checkType, setCheckType] = useState('');
  const [site, setSite] = useState('');
  const [area, setArea] = useState('');
  const [overallNotes, setOverallNotes] = useState('');
  
  // --- DYNAMIC LINES ---
  const [lines, setLines] = useState<PpeLine[]>([]);

  // --- DYNAMIC DATA ---
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  const [checkTypes, setCheckTypes] = useState<{ id: string, option_value: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: sitesData } = await supabase.from('sites').select('id, name').eq('status', 'active');
      if (sitesData) setSitesList(sitesData);

      const { data: typeData } = await supabase.from('dropdown_options').select('id, option_value').eq('category', 'ppe_check_type').order('option_value');
      if (typeData) setCheckTypes(typeData);

      const { data: catData } = await supabase.from('dropdown_options').select('id, option_value').eq('category', 'ppe_category').order('option_value');
      if (catData) setPpeCategories(catData);
    };
    fetchData();
  }, []);

  

  const addLine = () => {
    setLines([...lines, { 
      id: Date.now(), category: '', quantity: 0, condition: 'Compliant', 
      nonCompliant: 0, action: '', notes: '', file: null
    }]);
  };

  const removeLine = (id: number) => setLines(lines.filter(l => l.id !== id));

  const updateLine = (id: number, field: keyof PpeLine, value: any) => {
    setLines(lines.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleSave = async () => {
    if (!checkedBy || !checkType || !site || !date) {
      alert("Please fill in required fields: Inspector Name, Check Type, Site, and Date.");
      return;
    }

    if (inspectorContact && inspectorContact.length !== 10) {
      alert("Inspector contact number must be exactly 10 digits.");
      return;
    }

    try {
      const { data: checkData, error: checkError } = await supabase
        .from('ppe_checks')
        .insert([{ 
          check_type: checkType, 
          site: site, 
          area: area, 
          date: date, 
          checked_by: checkedBy, 
          inspector_role: inspectorRole,
          inspector_contact: inspectorContact,
          overall_notes: overallNotes 
        }])
        .select()
        .single();

      if (checkError) throw checkError;

      if (lines.length > 0) {
        const linesData = [];

        for (const l of lines) {
          let photoUrl = null;

          if (l.file) {
            const fileExt = l.file.name.split('.').pop();
            const fileName = `ppe-${Date.now()}-${Math.random()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('inspection-photos').upload(fileName, l.file);
            if (uploadError) throw uploadError;
            const { data: urlData } = supabase.storage.from('inspection-photos').getPublicUrl(fileName);
            photoUrl = urlData.publicUrl;
          }

          linesData.push({
            check_id: checkData.id, 
            category: l.category, 
            quantity_checked: l.quantity,
            condition: l.condition, 
            quantity_non_compliant: l.nonCompliant, 
            action_taken: l.action,
            notes: l.notes, 
            photo_url: photoUrl
          });
        }

        const { error: linesError } = await supabase.from('ppe_check_lines').insert(linesData);
        if (linesError) throw linesError;
      }

      alert("PPE Check saved successfully!");
      window.location.href = '/ppe-checks';

    } catch (error: any) {
      alert("Error saving check: " + error.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <Link to="/ppe-checks" className="back-link"><ArrowLeft size={24} /></Link>
          <div><h1>Log PPE Check</h1><p className="page-subtitle">Record a PPE inspection round.</p></div>
        </div>
      </div>

      <div className="form-card">
        <h3 className="form-section-title">1. Inspector Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Inspector Name *</label>
            <input type="text" className="form-input" placeholder="Who is doing the check?" value={checkedBy} onChange={(e) => setCheckedBy(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Inspector Role / Company</label>
            <input type="text" className="form-input" placeholder="e.g., HSE Manager - BuildCorp" value={inspectorRole} onChange={(e) => setInspectorRole(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Inspector Contact</label>
            <input 
              type="tel" 
              className="form-input" 
              placeholder="10-digit Contact" 
              value={inspectorContact} 
              onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, '');
                if (numericValue.length <= 10) {
                  setInspectorContact(numericValue);
                }
              }} 
            />
          </div>
          <div className="form-group">
            <label>Date *</label>
            <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <h3 className="form-section-title mt-32">2. Check Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Check Type *</label>
            <select className="form-input" value={checkType} onChange={(e) => setCheckType(e.target.value)}>
              <option value="">Select Type...</option>
              {checkTypes.map((type) => (
                <option key={type.id} value={type.option_value}>{type.option_value}</option>
              ))}
            </select>
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
            <input type="text" className="form-input" placeholder="e.g., PPE Store, Level 1" value={area} onChange={(e) => setArea(e.target.value)} />
          </div>
        </div>

        <div className="findings-container mt-32">
          <div className="findings-header">
            <div><h3>3. Items Checked</h3><p>Add the PPE categories you inspected.</p></div>
            <button type="button" onClick={addLine} className="btn-primary btn-small"><Plus size={16} /> Add Category</button>
          </div>
          
          {lines.length === 0 && <p className="no-findings">No items added yet.</p>}

          {lines.map((line, index) => (
            <div key={line.id} className="finding-card">
              <div className="finding-card-header">
                <h4>Item #{index + 1}</h4>
                <button type="button" onClick={() => removeLine(line.id)} className="btn-icon danger"><Trash2 size={16} /></button>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>PPE Category</label>

                  <select className="form-input" value={line.category} onChange={(e) => updateLine(line.id, 'category', e.target.value)}>
                    <option value="">Select...</option>
                    {ppeCategories.map((cat) => (
                      <option key={cat.id} value={cat.option_value}>{cat.option_value}</option>
                    ))}
                  </select>


                </div>
                <div className="form-group">
                  <label>Condition</label>
                  <select className="form-input" value={line.condition} onChange={(e) => updateLine(line.id, 'condition', e.target.value)}>
                    <option value="Compliant">Compliant</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Quarantined">Quarantined</option>
                  </select>
                </div>
                <div className="form-group"><label>Quantity Checked</label><input type="number" className="form-input" value={line.quantity} onChange={(e) => updateLine(line.id, 'quantity', parseInt(e.target.value) || 0)} /></div>
                <div className="form-group"><label>Qty Non-Compliant</label><input type="number" className="form-input" value={line.nonCompliant} onChange={(e) => updateLine(line.id, 'nonCompliant', parseInt(e.target.value) || 0)} /></div>
                <div className="form-group span-2"><label>Action Taken</label><input type="text" className="form-input" placeholder="e.g., Removed 2 harnesses from service" value={line.action} onChange={(e) => updateLine(line.id, 'action', e.target.value)} /></div>
              </div>

              <div className="finding-footer">
                <div></div>
                <div>
                  <input type="file" id={`ppe-photo-${line.id}`} className="hidden-input" onChange={(e) => updateLine(line.id, 'file', e.target.files ? e.target.files[0] : null)} />
                  <label htmlFor={`ppe-photo-${line.id}`} className="file-upload-label">
                    <Paperclip size={14} /> {line.file ? line.file.name : "Attach Photo of Damaged PPE"}
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="form-group mt-32">
          <label>Overall Notes</label>
          <textarea className="form-input" rows={3} placeholder="Summary of the check..." value={overallNotes} onChange={(e) => setOverallNotes(e.target.value)}></textarea>
        </div>
      </div>

      <div className="sticky-action-bar">
        <Link to="/ppe-checks" className="btn-secondary">Cancel</Link>
        <button className="btn-primary" onClick={handleSave}>Save Check</button>
      </div>
    </div>
  );
}