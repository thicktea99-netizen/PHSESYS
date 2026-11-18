// src/pages/RiskAssessmentDetail.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Forms.css';
import '../styles/LogInspection.css';
import '../styles/RiskAssessment.css';

interface Hazard {
  id: number;
  hazard_description: string;
  who_harmed: string;
  consequence: string;
  initial_likelihood: number;
  initial_consequence: number;
  initial_controls: string;
  residual_likelihood: number;
  residual_consequence: number;
  additional_controls: string;
  responsible_person: string;
  target_date: string;
}

interface Step {
  id: number;
  step_number: number;
  step_description: string;
  hazards: Hazard[];
}

export default function RiskAssessmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [assessment, setAssessment] = useState<any>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [flatHazards, setFlatHazards] = useState<Hazard[]>([]); // For RAMS
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [taskName, setTaskName] = useState('');
  const [site, setSite] = useState('');
  const [locationDetail, setLocationDetail] = useState('');

  useEffect(() => { fetchAssessment(); }, [id]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const { data: raData, error: raError } = await supabase.from('risk_assessments').select('*').eq('id', id).single();
      if (raError) throw raError;
      setAssessment(raData);
      setStatus(raData.status);
      setTaskName(raData.task_name);
      setSite(raData.site);
      setLocationDetail(raData.location_detail || '');

      if (raData.assessment_type === 'JSA') {
        const { data: stepsData } = await supabase.from('ra_steps').select('*').eq('assessment_id', id).order('step_number');
        const { data: hazardsData } = await supabase.from('ra_hazards').select('*');
        
        const formattedSteps = (stepsData || []).map(step => ({
          ...step,
          hazards: (hazardsData || []).filter(h => h.step_id === step.id)
        }));
        setSteps(formattedSteps);
      } else {
        // RAMS: Fetch hazards directly (assuming they are linked to a dummy step or just the assessment)
        // For simplicity in this schema, we will link RAMS hazards to a single hidden step.
        const { data: stepsData } = await supabase.from('ra_steps').select('*').eq('assessment_id', id);
        if (stepsData && stepsData.length > 0) {
          const { data: hazardsData } = await supabase.from('ra_hazards').select('*').eq('step_id', stepsData[0].id);
          setFlatHazards(hazardsData || []);
        }
      }
    } catch (error: any) {
      alert("Error: " + error.message);
      navigate('/risk-assessments');
    } finally {
      setLoading(false);
    }
  };

  // --- JSA HANDLERS ---
  const addStep = () => setSteps([...steps, { id: Date.now(), step_number: steps.length + 1, step_description: '', hazards: [] }]);
  const removeStep = (stepId: number) => setSteps(steps.filter(s => s.id !== stepId));
  const updateStep = (stepId: number, value: string) => setSteps(steps.map(s => s.id === stepId ? { ...s, step_description: value } : s));
  
  const addHazardToStep = (stepId: number) => {
    const newHazard: Hazard = { id: Date.now(), hazard_description: '', who_harmed: '', consequence: '', initial_likelihood: 3, initial_consequence: 3, initial_controls: '', residual_likelihood: 1, residual_consequence: 3, additional_controls: '', responsible_person: '', target_date: '' };
    setSteps(steps.map(s => s.id === stepId ? { ...s, hazards: [...s.hazards, newHazard] } : s));
  };

  const removeHazardFromStep = (stepId: number, hazardId: number) => {
    setSteps(steps.map(s => s.id === stepId ? { ...s, hazards: s.hazards.filter(h => h.id !== hazardId) } : s));
  };

  const updateStepHazard = (stepId: number, hazardId: number, field: keyof Hazard, value: any) => {
    setSteps(steps.map(s => s.id === stepId ? { ...s, hazards: s.hazards.map(h => h.id === hazardId ? { ...h, [field]: value } : h) } : s));
  };

  // --- RAMS HANDLERS ---
  const addFlatHazard = () => {
    const newHazard: Hazard = { id: Date.now(), hazard_description: '', who_harmed: '', consequence: '', initial_likelihood: 3, initial_consequence: 3, initial_controls: '', residual_likelihood: 1, residual_consequence: 3, additional_controls: '', responsible_person: '', target_date: '' };
    setFlatHazards([...flatHazards, newHazard]);
  };
  const removeFlatHazard = (hazardId: number) => setFlatHazards(flatHazards.filter(h => h.id !== hazardId));
  const updateFlatHazard = (hazardId: number, field: keyof Hazard, value: any) => {
    setFlatHazards(flatHazards.map(h => h.id === hazardId ? { ...h, [field]: value } : h));
  };

  const getRiskColor = (score: number) => {
    if (score <= 4) return 'severity-low';
    if (score <= 9) return 'severity-medium';
    if (score <= 15) return 'severity-high';
    return 'severity-critical';
  };

  const handleUpdateAssessment = async () => {
    try {
      const { error } = await supabase.from('risk_assessments').update({ task_name: taskName, site, location_detail: locationDetail, status }).eq('id', id);
      if (error) throw error;
      alert("Assessment details updated!");
    } catch (error: any) { alert(error.message); }
  };

  const handleSaveAll = async () => {
    try {
      if (assessment.assessment_type === 'JSA') {
        for (const step of steps) {
          let dbStepId = step.id;
          if (step.id > 1000000000) {
            const { data } = await supabase.from('ra_steps').insert([{ assessment_id: id, step_number: step.step_number, step_description: step.step_description }]).select().single();
            dbStepId = data.id;
          } else {
            await supabase.from('ra_steps').update({ step_description: step.step_description }).eq('id', step.id);
          }
          for (const hazard of step.hazards) {
            const payload = { step_id: dbStepId, hazard_description: hazard.hazard_description, consequence: hazard.consequence, initial_controls: hazard.initial_controls };
            if (hazard.id > 1000000000) await supabase.from('ra_hazards').insert([payload]);
            else await supabase.from('ra_hazards').update(payload).eq('id', hazard.id);
          }
        }
      } else {
        // Save RAMS (using a hidden step as the parent)
        let parentStepId = null;
        const { data: existingSteps } = await supabase.from('ra_steps').select('id').eq('assessment_id', id).limit(1);
        
        if (existingSteps && existingSteps.length > 0) {
          parentStepId = existingSteps[0].id;
        } else {
          const { data } = await supabase.from('ra_steps').insert([{ assessment_id: id, step_number: 1, step_description: 'Overall Task Hazards' }]).select().single();
          parentStepId = data.id;
        }

        for (const hazard of flatHazards) {
          const initialRisk = hazard.initial_likelihood * hazard.initial_consequence;
          const residualRisk = hazard.residual_likelihood * hazard.residual_consequence;
          const payload = { step_id: parentStepId, hazard_description: hazard.hazard_description, who_harmed: hazard.who_harmed, consequence: hazard.consequence, initial_likelihood: hazard.initial_likelihood, initial_consequence: hazard.initial_consequence, initial_risk: initialRisk, initial_controls: hazard.initial_controls, residual_likelihood: hazard.residual_likelihood, residual_consequence: hazard.residual_consequence, residual_risk: residualRisk, additional_controls: hazard.additional_controls, responsible_person: hazard.responsible_person, target_date: hazard.target_date || null };
          if (hazard.id > 1000000000) await supabase.from('ra_hazards').insert([payload]);
          else await supabase.from('ra_hazards').update(payload).eq('id', hazard.id);
        }
      }
      alert("Saved successfully!");
      navigate('/risk-assessments');
    } catch (error: any) { alert(error.message); }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;
  if (!assessment) return <div style={{ padding: '40px' }}>Not found.</div>;

  const isJSA = assessment.assessment_type === 'JSA';

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <Link to="/risk-assessments" className="back-link"><ArrowLeft size={24} /></Link>
          <div>
            <h1>RA-{String(assessment.ra_number).padStart(4, '0')}: {isJSA ? 'JSA/JHA' : 'RAMS'}</h1>
          </div>
        </div>
      </div>

      <div className="form-card mb-24 bg-blue" style={{ borderColor: '#bfdbfe' }}>
        <h3 className="form-section-title">Assessment Details</h3>
        <div className="form-grid">
          <div className="form-group span-2"><label>Task Name</label><input type="text" className="form-input" value={taskName} onChange={(e) => setTaskName(e.target.value)} /></div>
          <div className="form-group"><label>Site</label><input type="text" className="form-input" value={site} onChange={(e) => setSite(e.target.value)} /></div>
          <div className="form-group"><label>Location Detail</label><input type="text" className="form-input" value={locationDetail} onChange={(e) => setLocationDetail(e.target.value)} /></div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Draft">Draft</option><option value="Approved">Approved</option><option value="Expired">Expired</option>
            </select>
          </div>
          <div className="form-group" style={{ justifyContent: 'flex-end' }}><button className="btn-primary" onClick={handleUpdateAssessment}><Save size={16} /> Update Header</button></div>
        </div>
      </div>

      {/* JSA BUILDER */}
      {isJSA && (
        <div className="form-card">
          <h3 className="form-section-title">Task Steps</h3>
          <button type="button" onClick={addStep} className="btn-secondary mb-16"><Plus size={16} /> Add Task Step</button>
          {steps.map((step, stepIndex) => (
            <div key={step.id} className="step-card mb-24">
              <div className="step-header"><h4>Step {stepIndex + 1}</h4><button type="button" onClick={() => removeStep(step.id)} className="btn-icon danger"><Trash2 size={16} /></button></div>
              <div className="form-group mb-16"><label>Step Description</label><input type="text" className="form-input" value={step.step_description} onChange={(e) => updateStep(step.id, e.target.value)} /></div>
              <div className="hazards-container">
                <div className="findings-header"><h5>Hazards</h5><button type="button" onClick={() => addHazardToStep(step.id)} className="btn-primary btn-small"><Plus size={14} /> Add Hazard</button></div>
                {step.hazards.map((hazard, hazardIndex) => (
                  <div key={hazard.id} className="hazard-card">
                    <div className="finding-card-header"><h6>Hazard #{hazardIndex + 1}</h6><button type="button" onClick={() => removeHazardFromStep(step.id, hazard.id)} className="btn-icon danger"><Trash2 size={14} /></button></div>
                    <div className="form-grid">
                      <div className="form-group span-2"><label>Hazard Description</label><input type="text" className="form-input" value={hazard.hazard_description} onChange={(e) => updateStepHazard(step.id, hazard.id, 'hazard_description', e.target.value)} /></div>
                      <div className="form-group"><label>Consequence</label><input type="text" className="form-input" value={hazard.consequence} onChange={(e) => updateStepHazard(step.id, hazard.id, 'consequence', e.target.value)} /></div>
                      <div className="form-group"><label>Initial Controls</label><input type="text" className="form-input" value={hazard.initial_controls} onChange={(e) => updateStepHazard(step.id, hazard.id, 'initial_controls', e.target.value)} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RAMS FLAT LIST */}
      {!isJSA && (
        <div className="form-card">
          <h3 className="form-section-title">Hazards & Controls</h3>
          <button type="button" onClick={addFlatHazard} className="btn-primary mb-16"><Plus size={16} /> Add Hazard</button>
          {flatHazards.map((hazard, index) => {
            const initScore = hazard.initial_likelihood * hazard.initial_consequence;
            const resScore = hazard.residual_likelihood * hazard.residual_consequence;
            return (
              <div key={hazard.id} className="hazard-card mb-16">
                <div className="finding-card-header"><h6>Hazard #{index + 1}</h6><button type="button" onClick={() => removeFlatHazard(hazard.id)} className="btn-icon danger"><Trash2 size={14} /></button></div>
                <div className="form-grid">
                  <div className="form-group span-2"><label>Hazard Description</label><input type="text" className="form-input" value={hazard.hazard_description} onChange={(e) => updateFlatHazard(hazard.id, 'hazard_description', e.target.value)} /></div>
                  <div className="form-group"><label>Who might be harmed?</label><input type="text" className="form-input" value={hazard.who_harmed} onChange={(e) => updateFlatHazard(hazard.id, 'who_harmed', e.target.value)} /></div>
                  <div className="form-group"><label>Consequence</label><input type="text" className="form-input" value={hazard.consequence} onChange={(e) => updateFlatHazard(hazard.id, 'consequence', e.target.value)} /></div>
                </div>
                <div className="risk-row mt-16">
                  <div className="risk-block bg-red">
                    <h5>Initial Risk</h5>
                    <div className="form-grid">
                      <div className="form-group"><label>Likelihood</label><select className="form-input" value={hazard.initial_likelihood} onChange={(e) => updateFlatHazard(hazard.id, 'initial_likelihood', parseInt(e.target.value))}>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                      <div className="form-group"><label>Consequence</label><select className="form-input" value={hazard.initial_consequence} onChange={(e) => updateFlatHazard(hazard.id, 'initial_consequence', parseInt(e.target.value))}>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                      <div className="form-group"><label>Score</label><div className={`form-input ${getRiskColor(initScore)}`} style={{ fontWeight: 600, textAlign: 'center' }}>{initScore}</div></div>
                    </div>
                    <div className="form-group mt-8"><label>Initial Controls</label><textarea className="form-input" rows={2} value={hazard.initial_controls} onChange={(e) => updateFlatHazard(hazard.id, 'initial_controls', e.target.value)}></textarea></div>
                  </div>
                  <div className="risk-block bg-green">
                    <h5>Residual Risk</h5>
                    <div className="form-grid">
                      <div className="form-group"><label>Likelihood</label><select className="form-input" value={hazard.residual_likelihood} onChange={(e) => updateFlatHazard(hazard.id, 'residual_likelihood', parseInt(e.target.value))}>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                      <div className="form-group"><label>Consequence</label><select className="form-input" value={hazard.residual_consequence} onChange={(e) => updateFlatHazard(hazard.id, 'residual_consequence', parseInt(e.target.value))}>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                      <div className="form-group"><label>Score</label><div className={`form-input ${getRiskColor(resScore)}`} style={{ fontWeight: 600, textAlign: 'center' }}>{resScore}</div></div>
                    </div>
                    <div className="form-group mt-8"><label>Additional Controls Required</label><textarea className="form-input" rows={2} value={hazard.additional_controls} onChange={(e) => updateFlatHazard(hazard.id, 'additional_controls', e.target.value)}></textarea></div>
                    <div className="form-grid mt-8">
                      <div className="form-group"><label>Responsible Person</label><input type="text" className="form-input" value={hazard.responsible_person} onChange={(e) => updateFlatHazard(hazard.id, 'responsible_person', e.target.value)} /></div>
                      <div className="form-group"><label>Target Date</label><input type="date" className="form-input" value={hazard.target_date} onChange={(e) => updateFlatHazard(hazard.id, 'target_date', e.target.value)} /></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="sticky-action-bar">
        <Link to="/risk-assessments" className="btn-secondary">Cancel</Link>
        <button className="btn-primary" onClick={handleSaveAll}>Save Assessment</button>
      </div>
    </div>
  );
}