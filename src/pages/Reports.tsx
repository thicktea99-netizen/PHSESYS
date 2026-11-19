// src/pages/Reports.tsx
import { useState, useEffect, useRef } from 'react';
import { Download, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '../styles/Forms.css';
import '../styles/Reports.css';

const ALL_SECTIONS = [
  { key: 'incidents', label: 'Incidents' },
  { key: 'inspections', label: 'Inspections' },
  { key: 'hazards', label: 'Hazards & Observations' },
  { key: 'capa', label: 'CAPA Status' },
  { key: 'permits', label: 'Permits' },
  { key: 'equipment', label: 'Equipment' },
  { key: 'ppe', label: 'PPE Checks' },
  { key: 'toolbox', label: 'Toolbox Talks' },
  { key: 'training', label: 'Training & Certifications' },
  { key: 'drills', label: 'Drills & Exercises' },
  { key: 'audits', label: 'Audits' },
  { key: 'compliance', label: 'Compliance Status' },
  { key: 'photos', label: 'Photo Evidence' },
];

export default function Reports() {
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  const [companyProfile, setCompanyProfile] = useState<any>({});
  
  const [selectedSite, setSelectedSite] = useState('All');
  const [periodType, setPeriodType] = useState('Weekly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [summaryNote, setSummaryNote] = useState('');
  const [reviewedBy, setReviewedBy] = useState('');
  const [reviewedByRole, setReviewedByRole] = useState('');
  const [reviewedDate, setReviewedDate] = useState('');
  const [approvedBy, setApprovedBy] = useState('');
  const [approvedByRole, setApprovedByRole] = useState('');
  const [approvedDate, setApprovedDate] = useState('');

  const [selectedSections, setSelectedSections] = useState<string[]>(ALL_SECTIONS.map(s => s.key));


  
  const [reportData, setReportData] = useState<any>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSites();
    fetchCompanyProfile();
    setDefaultDates();
  }, [periodType]);

  const fetchSites = async () => {
    const { data } = await supabase.from('sites').select('id, name').eq('status', 'active');
    if (data) setSitesList(data);
  };

  const fetchCompanyProfile = async () => {
    const { data } = await supabase.from('company_profile').select('*').limit(1).single();
    if (data) setCompanyProfile(data);
  };

  const setDefaultDates = () => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (periodType === 'Weekly') {
      start.setDate(now.getDate() - 7);
    } else if (periodType === 'Bi-Weekly') {
      start.setDate(now.getDate() - 14);
    } else if (periodType === 'Monthly') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const toggleSection = (key: string) => {
    if (selectedSections.includes(key)) {
      setSelectedSections(selectedSections.filter(s => s !== key));
    } else {
      setSelectedSections([...selectedSections, key]);
    }
  };

  const fetchReportData = async () => {
    setIsGenerating(true);
    try {
      const siteFilter = selectedSite === 'All' ? null : selectedSite;
      const data: any = {};

      if (selectedSections.includes('incidents')) {
        let q = supabase.from('incidents').select('*').gte('date_of_occurrence', startDate).lte('date_of_occurrence', endDate);
        if (siteFilter) q = q.eq('site', siteFilter);
        const { data: incidents } = await q;
        data.incidents = incidents || [];
      }

      if (selectedSections.includes('inspections')) {
        let q = supabase.from('inspections').select('*').gte('date', startDate).lte('date', endDate);
        if (siteFilter) q = q.eq('site', siteFilter);
        const { data: inspections } = await q;
        data.inspections = inspections || [];
      }

      if (selectedSections.includes('hazards')) {
        let q = supabase.from('hazards').select('*').gte('date_observed', startDate).lte('date_observed', endDate);
        if (siteFilter) q = q.eq('project_site', siteFilter);
        const { data: hazards } = await q;
        data.hazards = hazards || [];
      }

      if (selectedSections.includes('capa')) {
        const { data: capa } = await supabase.from('capa_actions').select('*');
        data.capa = capa || [];
      }

      if (selectedSections.includes('permits')) {
        let q = supabase.from('permits').select('*').gte('valid_from', startDate).lte('valid_from', endDate);
        if (siteFilter) q = q.eq('site', siteFilter);
        const { data: permits } = await q;
        data.permits = permits || [];
      }

      if (selectedSections.includes('equipment')) {
        let q = supabase.from('equipment').select('*');
        if (siteFilter) q = q.eq('site', siteFilter);
        const { data: equipment } = await q;
        data.equipment = equipment || [];
      }

      if (selectedSections.includes('ppe')) {
        let q = supabase.from('ppe_checks').select('*').gte('date', startDate).lte('date', endDate);
        if (siteFilter) q = q.eq('site', siteFilter);
        const { data: ppe } = await q;
        data.ppe = ppe || [];
      }

      if (selectedSections.includes('toolbox')) {
        let q = supabase.from('toolbox_talks').select('*').gte('date', startDate).lte('date', endDate);
        if (siteFilter) q = q.eq('site', siteFilter);
        const { data: tbts } = await q;
        data.toolbox = tbts || [];
      }

      if (selectedSections.includes('training')) {
        const { data: trainings } = await supabase.from('certifications').select('*').gte('created_at', startDate).lte('created_at', endDate + 'T23:59:59');
        data.training = trainings || [];
      }

      if (selectedSections.includes('drills')) {
        let q = supabase.from('drills').select('*').gte('date', startDate).lte('date', endDate);
        if (siteFilter) q = q.eq('site', siteFilter);
        const { data: drills } = await q;
        data.drills = drills || [];
      }

      if (selectedSections.includes('audits')) {
        let q = supabase.from('audits').select('*').gte('audit_date', startDate).lte('audit_date', endDate);
        if (siteFilter) q = q.eq('site', siteFilter);
        const { data: audits } = await q;
        data.audits = audits || [];
      }

      if (selectedSections.includes('compliance')) {
        let q = supabase.from('compliance_register').select('*');
        if (siteFilter) q = q.eq('site', siteFilter);
        const { data: compliance } = await q;
        data.compliance = compliance || [];
      }

      if (selectedSections.includes('photos')) {
        const photoUrls: { url: string, caption: string }[] = [];

        // 1. Incident photos
        if (data.incidents) {
          data.incidents.forEach((i: any) => {
            if (i.photo_url) photoUrls.push({ url: i.photo_url, caption: `Incident INC-${String(i.incident_number).padStart(4, '0')}: ${i.description}` });
          });
        }

        // 2. Inspection Finding photos
        if (data.inspections) {
          for (const insp of data.inspections) {
            const { data: findings } = await supabase.from('inspection_findings').select('*').eq('inspection_id', insp.id);
            if (findings) {
              findings.forEach((f: any) => {
                if (f.photo_url) photoUrls.push({ url: f.photo_url, caption: `Inspection INS-${String(insp.inspection_number).padStart(4, '0')}: ${f.description}` });
              });
            }
          }
        }

        // 3. Hazard photos
        if (data.hazards) {
          data.hazards.forEach((h: any) => {
            if (h.photo_url) photoUrls.push({ url: h.photo_url, caption: `Hazard HAZ-${String(h.hazard_number).padStart(4, '0')}: ${h.description}` });
          });
        }

        data.photos = photoUrls;
      }

      const { data: snapshots } = await supabase.from('weekly_snapshots').select('*').gte('week_start_date', startDate).lte('week_start_date', endDate).order('week_start_date');
      data.snapshots = snapshots || [];

      setReportData(data);
      setShowPreview(true);
    } catch (error: any) {
      alert("Error generating report: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDF = async () => {
    if (!previewRef.current) return;
    
    setIsGenerating(true);
    try {
      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pdfWidth - (margin * 2);

      // Get all section elements from the preview
      const sections = previewRef.current.querySelectorAll('.report-section, .report-header, .report-kpi-grid, .report-footer');
      
      let currentY = margin;
      let isFirstPage = true;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;
        
        const canvas = await html2canvas(section, { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // If the section doesn't fit on the current page, add a new page
        if (currentY + imgHeight > pdfHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 5; // 5mm gap between sections
      }

      const fileName = `HSE_Report_${startDate}_to_${endDate}.pdf`;
      pdf.save(fileName);

      // Save to Document Library
      const pdfBlob = pdf.output('blob');
      const fileNameStorage = `report-${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage.from('inspection-photos').upload(fileNameStorage, pdfBlob);
      
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('inspection-photos').getPublicUrl(fileNameStorage);
        
        await supabase.from('reports').insert([{
          title: `HSE Report ${startDate} to ${endDate}`,
          period_start: startDate,
          period_end: endDate,
          site: selectedSite,
          sections_included: selectedSections,
          file_url: urlData.publicUrl
        }]);

        await supabase.from('documents').insert([{
          title: `HSE Report ${startDate} to ${endDate}`,
          category: 'Reports',
          description: `Generated report for period ${startDate} to ${endDate}`,
          file_url: urlData.publicUrl,
          file_type: 'PDF',
          site: selectedSite === 'All' ? null : selectedSite,
          tags: 'report, hse, generated'
        }]);
      }

      alert("Report generated and saved to Document Library!");
    } catch (error: any) {
      alert("Error generating PDF: " + error.message);
    } finally {
      setIsGenerating(false);
    }

    const sections = previewRef.current.querySelectorAll('.report-section, .report-header, .report-kpi-grid, .report-footer, .report-section-header');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Report Builder</h1>
          <p className="page-subtitle">Generate professional HSE reports for any period.</p>
        </div>
      </div>

      <div className="form-card mb-24">
        <h3 className="form-section-title">1. Report Parameters</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Site</label>
            <select className="form-input" value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)}>
              <option value="All">All Sites</option>
              {sitesList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Period Type</label>
            <select className="form-input" value={periodType} onChange={(e) => setPeriodType(e.target.value)}>
              <option value="Weekly">Weekly</option>
              <option value="Bi-Weekly">Bi-Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
          <div className="form-group"><label>Start Date</label><input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
          <div className="form-group"><label>End Date</label><input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
        </div>

        <h3 className="form-section-title mt-32">2. Sections to Include</h3>
        <div className="sections-grid">
          {ALL_SECTIONS.map(section => (
            <label key={section.key} className="section-checkbox">
              <input type="checkbox" checked={selectedSections.includes(section.key)} onChange={() => toggleSection(section.key)} />
              {section.label}
            </label>
          ))}
        </div>


        {/* Summary Notes */}
        <h3 className="form-section-title mt-32">
          3. Summary & Recommendations
        </h3>

        <div className="form-group">
          <label>Summary Note (Optional)</label>
          <textarea 
            className="form-input" 
            rows={4} 
            placeholder="Enter a summary or recommendations for this report..."
            value={summaryNote}
            onChange={(e) => setSummaryNote(e.target.value)}
          ></textarea>
        </div>



        <h3 className="form-section-title mt-32">4. Sign-Off</h3>
        <div className="form-grid">
          <div className="form-group"><label>Reviewed By (Name)</label><input type="text" className="form-input" value={reviewedBy} onChange={(e) => setReviewedBy(e.target.value)} /></div>
          <div className="form-group"><label>Reviewed By (Role)</label><input type="text" className="form-input" value={reviewedByRole} onChange={(e) => setReviewedByRole(e.target.value)} /></div>
          <div className="form-group"><label>Reviewed Date</label><input type="date" className="form-input" value={reviewedDate} onChange={(e) => setReviewedDate(e.target.value)} /></div>
          <div className="form-group"><label>Approved By (Name)</label><input type="text" className="form-input" value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} /></div>
          <div className="form-group"><label>Approved By (Role)</label><input type="text" className="form-input" value={approvedByRole} onChange={(e) => setApprovedByRole(e.target.value)} /></div>
          <div className="form-group"><label>Approved Date</label><input type="date" className="form-input" value={approvedDate} onChange={(e) => setApprovedDate(e.target.value)} /></div>
        </div>



        <button className="btn-primary mt-24 preview" onClick={fetchReportData} disabled={isGenerating}>
          <Eye size={18} /> {isGenerating ? 'Generating...' : 'Preview Report'}
        </button>
      </div>

      {showPreview && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>Report Preview</h2>
            <button className="btn-primary" onClick={generatePDF} disabled={isGenerating}>
              <Download size={18} /> {isGenerating ? 'Saving...' : 'Download & Save PDF'}
            </button>
          </div>

          <div className="report-preview-container">
            <div ref={previewRef} className="report-preview">
              {/* BRANDED HEADER */}
              <div className="report-header">
                <div className="report-brand">
                  {companyProfile.logo_url && <img src={companyProfile.logo_url} alt="Logo" style={{ maxHeight: '60px', marginBottom: '8px' }} />}
                  <h1>{companyProfile.company_name || 'Company Name'}</h1>
                  <p>{companyProfile.address || ''}</p>
                  <p>{companyProfile.phone || ''} | {companyProfile.email || ''}</p>
                </div>
                <div className="report-meta">
                  <h2>HSE Report</h2>
                  <p><strong>Report No:</strong> RPT-{Date.now().toString().slice(-6)}</p>
                  <p><strong>Period:</strong> {startDate} to {endDate}</p>
                  <p><strong>Site:</strong> {selectedSite}</p>
                  <p><strong>Prepared By:</strong> {companyProfile.officer_name || 'Officer'}</p>
                  <p><strong>Role:</strong> {companyProfile.officer_role || 'HSE Manager'}</p>
                </div>
              </div>

              <div className="report-section-header">
                <h2>1. HSE Performance</h2>
              </div>

              {/* KPI CARDS */}
                            {/* HSE PERFORMANCE KPI CARDS */}
              <div className="report-kpi-grid">
                <div className="report-kpi-card">
                  <h4>Man-Hours</h4>
                  <div className="value">{reportData.snapshots?.reduce((sum: number, s: any) => sum + s.total_man_hours, 0).toLocaleString() || '0'}</div>
                  <div className="sub">Total this period</div>
                </div>
                <div className="report-kpi-card">
                  <h4>Safe Man-Hours</h4>
                  <div className="value">{reportData.snapshots?.reduce((sum: number, s: any) => sum + s.safe_man_hours, 0).toLocaleString() || '0'}</div>
                  <div className="sub">Safe hours</div>
                </div>
                <div className="report-kpi-card">
                  <h4>LTIs</h4>
                  <div className="value">{reportData.incidents?.filter((i: any) => i.incident_type === 'lti').length || 0}</div>
                  <div className="sub">Lost Time Injuries</div>
                </div>
                <div className="report-kpi-card">
                  <h4>Days Without LTI</h4>
                  <div className="value">
                    {(() => {
                      const ltiIncidents = reportData.incidents?.filter((i: any) => i.incident_type === 'lti') || [];
                      if (ltiIncidents.length === 0) return '∞';
                      const lastLTI = new Date(Math.max(...ltiIncidents.map((i: any) => new Date(i.date_of_occurrence).getTime())));
                      return Math.floor((new Date().getTime() - lastLTI.getTime()) / (1000 * 3600 * 24));
                    })()}
                  </div>
                  <div className="sub">Consecutive days</div>
                </div>
              </div>

              {/* KPI COMPARISON TABLE */}
              <div className="report-section">
                <h3>HSE Performance vs. Targets</h3>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>KPI</th>
                      <th>Current</th>
                      <th>Target</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>LTIFR</td>
                      <td>{(() => {
                        const ltiCount = reportData.incidents?.filter((i: any) => i.incident_type === 'lti').length || 0;
                        const totalHours = reportData.snapshots?.reduce((sum: number, s: any) => sum + s.total_man_hours, 0) || 1;
                        return ((ltiCount * 1000000) / totalHours).toFixed(2);
                      })()}</td>
                      <td>{companyProfile.ltifr_target || '2.0'}</td>
                      <td>🟢 On Target</td>
                    </tr>
                    <tr>
                      <td>Incidents</td>
                      <td>{reportData.incidents?.length || 0}</td>
                      <td>0</td>
                      <td>{reportData.incidents?.length === 0 ? '🟢 On Target' : '🔴 Off Target'}</td>
                    </tr>
                    <tr>
                      <td>CAPA Open</td>
                      <td>{reportData.capa?.filter((c: any) => c.status !== 'closed').length || 0}</td>
                      <td>0</td>
                      <td>{reportData.capa?.filter((c: any) => c.status !== 'closed').length === 0 ? '🟢 On Target' : '🟡 Needs Attention'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="report-section-header">
                <h2>2. Lagging Indicators</h2>
              </div>

              {/* INCIDENTS */}
              {reportData.incidents && reportData.incidents.length > 0 && (
                <div className="report-section">
                  <h3>Incidents ({reportData.incidents.length})</h3>
                  <table className="report-table">
                    <thead>
                      <tr><th>Date</th><th>Type</th><th>Severity</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {reportData.incidents.map((i: any) => (
                        <tr key={i.id}>
                          <td>INC-{String(i.incident_number).padStart(4, '0')}</td>
                          <td>{i.date_of_occurrence}</td>
                          <td>{i.incident_type}</td>
                          <td>{i.severity}</td>
                          <td>{i.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}


              <div className="report-section-header">
                <h2>3. Leading Indicators</h2>
              </div>
              {/* INSPECTIONS */}
              {reportData.inspections && reportData.inspections.length > 0 && (
                <div className="report-section">
                  <h3>Inspections ({reportData.inspections.length})</h3>
                  <table className="report-table">
                    <thead>
                      <tr><th>Date</th><th>Type</th><th>Site</th></tr>
                    </thead>
                    <tbody>
                      {reportData.inspections.map((i: any) => (
                        <tr key={i.id}>
                          <td>INS-{String(i.inspection_number).padStart(4, '0')}</td>
                          <td>{i.date}</td>
                          <td>{i.inspection_type}</td>
                          <td>{i.site}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* HAZARDS */}
              {reportData.hazards && reportData.hazards.length > 0 && (
                <div className="report-section">
                  <h3>Hazards & Observations ({reportData.hazards.length})</h3>
                  <table className="report-table">
                    <thead>
                      <tr><th>Date</th><th>Type</th><th>Risk Score</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {reportData.hazards.map((h: any) => (
                        <tr key={h.id}>
                          <td>HAZ-{String(h.hazard_number).padStart(4, '0')}</td>
                          <td>{h.date_observed}</td>
                          <td>{h.entry_type}</td>
                          <td>{h.risk_score || '-'}</td>
                          <td>{h.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
              }
              
          
              {reportData.toolbox && reportData.toolbox.length > 0 && (
                <div className="report-section">
                  <h3>Toolbox Talks ({reportData.toolbox.length})</h3>
                  <table className="report-table">
                    <thead>
                      <tr><th>Date</th><th>Topic</th><th>Presenter</th><th>Attendees</th></tr>
                    </thead>
                    <tbody>
                      {reportData.toolbox.map((t: any) => (
                        <tr key={t.id}>
                          <td>{t.date}</td>
                          <td>{t.topic}</td>
                          <td>{t.presenter_name}</td>
                          <td>{t.attendee_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}



              {/* CAPA */}
                            {/* CAPA */}
              {reportData.capa && reportData.capa.length > 0 && (
                <div className="report-section">
                  <h3>CAPA Status</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '32px', padding: '16px' }}>
                    {/* SVG Donut Chart */}
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                      {(() => {
                        const total = reportData.capa.length;
                        const open = reportData.capa.filter((c: any) => c.status === 'open').length;
                        const inProgress = reportData.capa.filter((c: any) => c.status === 'in progress').length;
                        const closed = reportData.capa.filter((c: any) => c.status === 'closed').length;
                        
                        const circumference = 2 * Math.PI * 50;
                        const openDash = (open / total) * circumference;
                        const inProgressDash = (inProgress / total) * circumference;
                        const closedDash = (closed / total) * circumference;

                        let offset = 0;
                        
                        return (
                          <>
                            <circle cx="60" cy="60" r="50" fill="none" stroke="#ef4444" strokeWidth="20"
                              strokeDasharray={`${openDash} ${circumference - openDash}`}
                              strokeDashoffset={offset}
                              transform="rotate(-90 60 60)"
                            />
                            {(() => { offset -= openDash; return null; })()}
                            <circle cx="60" cy="60" r="50" fill="none" stroke="#f59e0b" strokeWidth="20"
                              strokeDasharray={`${inProgressDash} ${circumference - inProgressDash}`}
                              strokeDashoffset={offset}
                              transform="rotate(-90 60 60)"
                            />
                            {(() => { offset -= inProgressDash; return null; })()}
                            <circle cx="60" cy="60" r="50" fill="none" stroke="#10b981" strokeWidth="20"
                              strokeDasharray={`${closedDash} ${circumference - closedDash}`}
                              strokeDashoffset={offset}
                              transform="rotate(-90 60 60)"
                            />
                          </>
                        );
                      })()}
                      <text x="60" y="55" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#1f2937">{reportData.capa.length}</text>
                      <text x="60" y="70" textAnchor="middle" fontSize="10" fill="#6b7280">Total</text>
                    </svg>
                    {/* Legend */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px' }}></span>
                        <span style={{ fontSize: '0.8rem' }}>Open: {reportData.capa.filter((c: any) => c.status === 'open').length}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '2px' }}></span>
                        <span style={{ fontSize: '0.8rem' }}>In Progress: {reportData.capa.filter((c: any) => c.status === 'in progress').length}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' }}></span>
                        <span style={{ fontSize: '0.8rem' }}>Closed: {reportData.capa.filter((c: any) => c.status === 'closed').length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              
              {summaryNote && (
                <div className="report-section">
                  <h3>Summary & Recommendations</h3>
                  <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>{summaryNote}</p>
                </div>
              )}

              
              {/* <h3 className="form-section-title mt-32">4. Sign-Off</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Reviewed By (Name)</label>
                  <input type="text" className="form-input" value={reviewedBy} onChange={(e) => setReviewedBy(e.target.value)} />
                </div>

                <div className="form-group">
                  <label>Reviewed By (Role)</label>
                  <input type="text" className="form-input" value={reviewedByRole} onChange={(e) => setReviewedByRole(e.target.value)} />
                </div>

                <div className="form-group">
                  <label>Reviewed Date</label>
                  <input type="date" className="form-input" value={reviewedDate} onChange={(e) => setReviewedDate(e.target.value)} />
                </div>

                <div className="form-group">
                  <label>Approved By (Name)</label>
                  <input type="text" className="form-input" value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} />
                </div>

                <div className="form-group">
                  <label>Approved By (Role)</label>
                  <input type="text" className="form-input" value={approvedByRole} onChange={(e) => setApprovedByRole(e.target.value)} />
                </div>

                <div className="form-group">
                  <label>Approved Date</label>
                  <input type="date" className="form-input" value={approvedDate} onChange={(e) => setApprovedDate(e.target.value)} />
                </div>
              </div> */}

              {/* PHOTO EVIDENCE */}
              {reportData.photos && reportData.photos.length > 0 && (
                <div className="report-section">
                  <h3>Photo Evidence</h3>
                  <div className="report-photos-grid">
                    {reportData.photos.map((photo: any, index: number) => (
                      <div key={index} className="report-photo-item">
                        <img src={photo.url} alt="Evidence" />
                        <p>{photo.caption}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )} 

              {/* SignOff */}
              <div className="report-section">
                <h3>Sign-Off</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
                      Reviewed By:
                    </h4>

                    <p style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                      Name: {reviewedBy || '.......................................................'}
                    </p>

                    <p style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                      Role: {reviewedByRole || '.......................................................'}
                    </p>

                    <p style={{ fontSize: '0.8rem' }}>
                      Date: {reviewedDate || '.......................................................'}
                    </p>

                    <p style={{ fontSize: '0.8rem' }}>
                      Signature: { '.......................................................'}
                    </p>


                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
                      Approved By:
                    </h4>

                    <p style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                      Name: {approvedBy || '.......................................................'}
                    </p>

                    <p style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                      Role: {approvedByRole || '.......................................................'}
                    </p>
                    <p style={{ fontSize: '0.8rem' }}>
                      Date: {approvedDate || '.......................................................'}
                    </p>

                    <p style={{ fontSize: '0.8rem' }}>
                      Signature: { '.......................................................'}
                    </p>

                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="report-footer">
                <p>Generated on {new Date().toLocaleString()} • {companyProfile.company_name} • Confidential</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}