// src/pages/LogRiskAssessment.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Link, useSearchParams, useParams, useNavigate } from 'react-router-dom';
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

export default function LogRiskAssessment() {
  const { id } = useParams(); // If editing
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // If no ID, it's a new form based on URL type. If ID, it's an edit.
  const urlType = searchParams.get('type') || 'JSA';
  const [assessmentType, setAssessmentType] = useState(urlType);
  
  // Core State
  const [taskName, setTaskName] = useState('');
  const [site, setSite] = useState('');
  const [locationDetail, setLocationDetail] = useState('');
  const [assessorName, setAssessorName] = useState('');
  const [assessorRole, setAssessorRole] = useState('');
  const [assessorContact, setAssessorContact] = useState('');
  const [dateOfAssessment, setDateOfAssessment] = useState(new Date().toISOString().split('T')[0]);
  const [reviewDate, setReviewDate] = useState('');
  const [status, setStatus] = useState('Draft');
  
  // Builder State
  const [steps, setSteps] = useState<Step[]>([]);
  const [flatHazards, setFlatHazards] = useState<Hazard[]>([]);
  
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    const fetchSites = async () => {
      const { data } = await supabase.from('sites').select('id, name').eq('status', 'active');
      if (data) setSitesList(data);
    };
    fetchSites();
    
    if (id) {
      fetchExistingData();
    }
  }, [id]);

  const fetchExistingData = async () => {
    try {
      const { data: raData, error } = await supabase.from('risk_assessments').select('*').eq('id', id).single();
      if (error) throw error;
      
      setAssessmentType(raData.assessment_type);
      setTaskName(raData.task_name);
      setSite(raData.site);
      setLocationDetail(raData.location_detail || '');
      setAssessorName(raData.assessor_name);
      setAssessorRole(raData.assessor_role || '');
      setAssessorContact(raData.assessor_contact || '');
      setDateOfAssessment(raData.date_of_assessment);
      setReviewDate(raData.review_date || '');
      setStatus(raData.status);

      if (raData.assessment_type === 'JSA') {
        const { data: stepsData } = await supabase.from('ra_steps').select('*').eq('assessment_id', id).order('step_number');
        const { data: hazardsData } = await supabase.from('ra_hazards').select('*');
        
        const formattedSteps = (stepsData || []).map(step => ({
          ...step,
          hazards: (hazardsData || []).filter(h => h.step_id === step.id)
        }));
        setSteps(formattedSteps);
      } else {
        const { data: stepsData } = await supabase.from('ra_steps').select('*').eq('assessment_id', id);
        if (stepsData && stepsData.length > 0) {
          const { data: hazardsData } = await supabase.from('ra_hazards').select('*').eq('step_id', stepsData[0].id);
          setFlatHazards(hazardsData || []);
        }
      }
    } catch (error: any) {
      alert(error.message);
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

  const handleSaveAll = async () => {
    if (!taskName || !site || !assessorName || !dateOfAssessment) {
      alert("Please fill in required fields: Task Name, Site, Assessor Name, and Date.");
      return;
    }
    if (assessorContact && assessorContact.length !== 10) {
      alert("Assessor contact must be exactly 10 digits.");
      return;
    }

    try {
      let assessmentId = id;

      // 1. Save or Update the Parent Assessment
      if (!assessmentId) {
        const { data, error } = await supabase.from('risk_assessments').insert([{
          task_name: taskName, assessment_type: assessmentType, site, location_detail: locationDetail,
          assessor_name: assessorName, assessor_role: assessorRole, assessor_contact: assessorContact,
          date_of_assessment: dateOfAssessment, review_date: reviewDate || null, status
        }]).select().single();
        if (error) throw error;
        assessmentId = data.id;
      } else {
        const { error } = await supabase.from('risk_assessments').update({
          task_name: taskName, site, location_detail: locationDetail,
          assessor_name: assessorName, assessor_role: assessorRole, assessor_contact: assessorContact,
          date_of_assessment: dateOfAssessment, review_date: reviewDate || null, status
        }).eq('id', assessmentId);
        if (error) throw error;
      }

      // 2. Save Steps and Hazards
      if (assessmentType === 'JSA') {
        for (const step of steps) {
          let dbStepId = step.id;
          if (step.id > 1000000000) {
            const { data } = await supabase.from('ra_steps').insert([{ assessment_id: assessmentId, step_number: step.step_number, step_description: step.step_description }]).select().single();
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
        // RAMS
        let parentStepId = null;
        const { data: existingSteps } = await supabase.from('ra_steps').select('id').eq('assessment_id', assessmentId).limit(1);
        if (existingSteps && existingSteps.length > 0) {
          parentStepId = existingSteps[0].id;
        } else {
          const { data } = await supabase.from('ra_steps').insert([{ assessment_id: assessmentId, step_number: 1, step_description: 'Overall Task Hazards' }]).select().single();
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

      alert("Risk Assessment saved successfully!");
      navigate('/risk-assessments');
    } catch (error: any) {
      alert("Error saving: " + error.message);
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <Link to="/risk-assessments" className="back-link"><ArrowLeft size={24} /></Link>
          <div>
            <h1>{id ? 'Edit' : 'New'} {assessmentType === 'JSA' ? 'JSA / JHA' : 'Risk Assessment (RAMS)'}</h1>
          </div>
        </div>
      </div>

      <div className="form-card mb-24">
        <h3 className="form-section-title">1. Assessor Details</h3>
        <div className="form-grid">
          <div className="form-group"><label>Assessor Name *</label><input type="text" className="form-input" value={assessorName} onChange={(e) => setAssessorName(e.target.value)} /></div>
          <div className="form-group"><label>Role / Company</label><input type="text" className="form-input" value={assessorRole} onChange={(e) => setAssessorRole(e.target.value)} /></div>
          <div className="form-group">
            <label>Contact Number</label>
            <input type="tel" className="form-input" placeholder="10-digit Contact" value={assessorContact} onChange={(e) => {
              const numericValue = e.target.value.replace(/\D/g, '');
              if (numericValue.length <= 10) setAssessorContact(numericValue);
            }} />
          </div>
        </div>

        <h3 className="form-section-title mt-32">2. Task Details</h3>
        <div className="form-grid">
          <div className="form-group span-2">
            <label>Task / Activity Name *</label>
            <input type="text" className="form-input" placeholder="e.g., Erection of Scaffold - Zone A" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Site *</label>
            <select className="form-input" value={site} onChange={(e) => setSite(e.target.value)}>
              <option value="">Select Site...</option>
              {sitesList.map((s) => (<option key={s.id} value={s.name}>{s.name}</option>))}
            </select>
          </div>
          <div className="form-group">
            <label>Location Detail</label>
            <input type="text" className="form-input" placeholder="e.g., Level 3 - East Wing" value={locationDetail} onChange={(e) => setLocationDetail(e.target.value)} />
          </div>
        </div>
      </div>

      {/* BUILDER SECTION */}
      <div className="form-card mb-24">
        <h3 className="form-section-title">{assessmentType === 'JSA' ? '3. Task Steps & Hazards' : '3. Hazards & Controls'}</h3>
        
        {assessmentType === 'JSA' ? (
          <>
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
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      <div className="form-card mb-24">
        <h3 className="form-section-title">{assessmentType === 'JSA' ? '4. Validity & Status' : '4. Validity & Status'}</h3>
        <div className="form-grid">
          <div className="form-group"><label>Date of Assessment *</label><input type="date" className="form-input" value={dateOfAssessment} onChange={(e) => setDateOfAssessment(e.target.value)} /></div>
          <div className="form-group"><label>Review Date</label><input type="date" className="form-input" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} /></div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Draft">Draft</option><option value="Approved">Approved</option><option value="Expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      <div className="sticky-action-bar">
        <Link to="/risk-assessments" className="btn-secondary">Cancel</Link>
        <button className="btn-primary" onClick={handleSaveAll}>Save Assessment</button>
      </div>
    </div>
  );
}