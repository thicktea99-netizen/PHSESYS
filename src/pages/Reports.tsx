// src/pages/Reports.tsx
import { useState, useEffect, useRef } from 'react';
import { Eye, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReportHeader from '../components/report/ReportHeader';
import ReportHighlight from '../components/report/ReportHighlight';
import ReportKpiTable from '../components/report/ReportKpiTable';
import ReportClosedLoop from '../components/report/ReportClosedLoop';
import ReportTrends from '../components/report/ReportTrends';
import ReportSummary from '../components/report/ReportSummary';
import ReportPhotos from '../components/report/ReportPhotos';
import ReportSignOff from '../components/report/ReportSignOff';

import ReportHighRiskTasks from '../components/report/ReportHighRiskTasks';



import '../styles/Forms.css';
import '../styles/Reports.css';

const ALL_SECTIONS = [
  { key: 'incidents', label: 'Incidents' },
  { key: 'inspections', label: 'Inspections' },
  { key: 'hazards', label: 'Hazards & Observations' },
  { key: 'capa', label: 'CAPA Status' },
  { key: 'permits', label: 'Permits' },
  { key: 'high_risk', label: 'High-Risk Tasks' },
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
  const [targets, setTargets] = useState<any[]>([]);
  
  const [selectedSite, setSelectedSite] = useState('All');
  const [periodType, setPeriodType] = useState('Weekly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>(ALL_SECTIONS.map(s => s.key));
  
  const [reportData, setReportData] = useState<any>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Summary & Sign-Off
  const [summaryNote, setSummaryNote] = useState('');
  const [reviewedBy, setReviewedBy] = useState('');
  const [reviewedByRole, setReviewedByRole] = useState('');
  const [reviewedDate, setReviewedDate] = useState('');
  const [approvedBy, setApprovedBy] = useState('');
  const [approvedByRole, setApprovedByRole] = useState('');
  const [approvedDate, setApprovedDate] = useState('');

  const [isPdfMode, setIsPdfMode] = useState(false);

  // Remarks
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchSites();
    fetchCompanyProfile();
    fetchTargets();
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

  const fetchTargets = async () => {
    const { data } = await supabase.from('targets').select('*');
    if (data) setTargets(data);
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

  const handleRemarkChange = (indicator: string, value: string) => {
    setRemarks({ ...remarks, [indicator]: value });
  };

  const fetchReportData = async () => {
    setIsGenerating(true);
    try {
      const siteFilter = selectedSite === 'All' ? null : selectedSite;
      const data: any = {};

      // --- CALCULATE PREVIOUS PERIOD DATES ---
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
      const prevEnd = new Date(start.getTime() - 1);
      const prevStart = new Date(prevEnd.getTime() - (diffDays - 1) * 24 * 3600 * 1000);

      data.periodInfo = {
        currentStart: startDate,
        currentEnd: endDate,
        previousStart: prevStart.toISOString().split('T')[0],
        previousEnd: prevEnd.toISOString().split('T')[0],
      };

      // 1. Incidents (Current)
      let incQ = supabase.from('incidents').select('*').gte('date_of_occurrence', startDate).lte('date_of_occurrence', endDate);
      if (siteFilter) incQ = incQ.eq('site', siteFilter);
      const { data: incidents } = await incQ;
      data.incidents = incidents || [];

      // 2. Incidents (Previous)
      let incPrevQ = supabase.from('incidents').select('*').gte('date_of_occurrence', data.periodInfo.previousStart).lte('date_of_occurrence', data.periodInfo.previousEnd);
      if (siteFilter) incPrevQ = incPrevQ.eq('site', siteFilter);
      const { data: prevIncidents } = await incPrevQ;
      data.prevIncidents = prevIncidents || [];

      // 3. Inspections
      let inspQ = supabase.from('inspections').select('*').gte('date', startDate).lte('date', endDate);
      if (siteFilter) inspQ = inspQ.eq('site', siteFilter);
      const { data: inspections } = await inspQ;
      data.inspections = inspections || [];

      // 4. Hazards
      let hazQ = supabase.from('hazards').select('*').gte('date_observed', startDate).lte('date_observed', endDate);
      if (siteFilter) hazQ = hazQ.eq('project_site', siteFilter);
      const { data: hazards } = await hazQ;
      data.hazards = hazards || [];

      // 5. CAPA
      const { data: capa } = await supabase.from('capa_actions').select('*');
      data.capa = capa || [];

      // 6. Permits
      let permQ = supabase.from('permits').select('*').gte('valid_from', startDate).lte('valid_from', endDate);
      if (siteFilter) permQ = permQ.eq('site', siteFilter);
      const { data: permits } = await permQ;
      data.permits = permits || [];

      // 7. High Risk Tasks from active permit
            // High-Risk Tasks (from active permits)
      let hrPermQ = supabase.from('permits').select('*, permit_hazards(control_measure)').eq('status', 'Active');
      if (siteFilter) hrPermQ = hrPermQ.eq('site', siteFilter);
      const { data: hrPermits } = await hrPermQ;
      
      data.highRiskTasks = (hrPermits || []).map((p: any) => ({
        permitType: p.permit_type,
        activity: p.work_description,
        site: p.site,
        controlsVerified: p.permit_hazards?.map((h: any) => h.control_measure).filter(Boolean).join(', ') || 'Not verified',
        status: p.status
      }));

      // 8. Toolbox Talks
      let tbtQ = supabase.from('toolbox_talks').select('*').gte('date', startDate).lte('date', endDate);
      if (siteFilter) tbtQ = tbtQ.eq('site', siteFilter);
      const { data: toolbox } = await tbtQ;
      data.toolbox = toolbox || [];

      // 9. Training
      const { data: training } = await supabase.from('certifications').select('*').gte('created_at', startDate).lte('created_at', endDate + 'T23:59:59');
      data.training = training || [];

      // 10. Drills
      let drillQ = supabase.from('drills').select('*').gte('date', startDate).lte('date', endDate);
      if (siteFilter) drillQ = drillQ.eq('site', siteFilter);
      const { data: drills } = await drillQ;
      data.drills = drills || [];

      // 11. Audits
      let auditQ = supabase.from('audits').select('*').gte('audit_date', startDate).lte('audit_date', endDate);
      if (siteFilter) auditQ = auditQ.eq('site', siteFilter);
      const { data: audits } = await auditQ;
      data.audits = audits || [];

      // 12. Equipment
      let equipQ = supabase.from('equipment').select('*');
      if (siteFilter) equipQ = equipQ.eq('site', siteFilter);
      const { data: equipment } = await equipQ;
      data.equipment = equipment || [];

      // 13. Compliance
      let compQ = supabase.from('compliance_register').select('*');
      if (siteFilter) compQ = compQ.eq('site', siteFilter);
      const { data: compliance } = await compQ;
      data.compliance = compliance || [];

      // 14. Snapshots (Man-Hours)
      const { data: snapshots } = await supabase.from('weekly_snapshots').select('*').gte('week_start_date', startDate).lte('week_start_date', endDate).order('week_start_date');
      data.snapshots = snapshots || [];

      // --- CALCULATE KPIs ---
      const safeManHours = snapshots?.reduce((sum: number, s: any) => sum + (s.safe_man_hours || 0), 0) || 0;
      const ltiCount = data.incidents.filter((i: any) => i.incident_type === 'lti').length;
      const prevLtiCount = data.prevIncidents.filter((i: any) => i.incident_type === 'lti').length;
      const totalHours = snapshots?.reduce((sum: number, s: any) => sum + (s.total_man_hours || 0), 0) || 1;
      
      const ltifr = (ltiCount * 1000000) / totalHours;
      const prevLtifr = (prevLtiCount * 1000000) / totalHours;

      // Days without LTI
      const { data: ltiData } = await supabase.from('incidents').select('date_of_occurrence').eq('incident_type', 'lti').order('date_of_occurrence', { ascending: false }).limit(1);
      let daysWithout = 0;
      if (ltiData && ltiData.length > 0) {
        const lastLTI = new Date(ltiData[0].date_of_occurrence);
        daysWithout = Math.max(0, Math.floor((new Date().getTime() - lastLTI.getTime()) / (1000 * 3600 * 24)));
      }

      // Prepare KPI Rows
      const getTarget = (key: string) => targets.find(t => t.indicator_key === key)?.target_value ?? '-';
      const kpiRows = [
        { indicator: 'LTIFR', thisWeek: ltifr.toFixed(2), previousWeek: prevLtifr.toFixed(2), target: getTarget('ltifr'), trend: ltifr < prevLtifr ? 'down' : ltifr > prevLtifr ? 'up' : 'flat', status: ltifr <= parseFloat(getTarget('ltifr') as string) ? 'on_target' : 'off_target', remark: remarks['LTIFR'] || '' 

        },

        { indicator: 'Incidents', thisWeek: data.incidents.length, previousWeek: data.prevIncidents.length, target: getTarget('incidents'), trend: data.incidents.length < data.prevIncidents.length ? 'down' : data.incidents.length > data.prevIncidents.length ? 'up' : 'flat', status: data.incidents.length === 0 ? 'on_target' : 'off_target', remark: remarks['Incidents'] || '' 

        },

        { indicator: 'Inspections', thisWeek: data.inspections.length, previousWeek: '-', target: getTarget('inspections'), trend: 'flat', status: data.inspections.length > 0 ? 'on_target' : 'needs_attention', remark: remarks['Inspections'] || '' 

        },

        { indicator: 'Hazards', thisWeek: data.hazards.length, previousWeek: '-', target: getTarget('hazards'), trend: 'flat', status: data.hazards.length > 0 ? 'on_target' : 'needs_attention', remark: remarks['Hazards'] || '' 

        },

        { indicator: 'CAPA Open', thisWeek: data.capa.filter((c: any) => c.status !== 'closed').length, previousWeek: '-', target: getTarget('capa_open'), trend: 'flat', status: data.capa.filter((c: any) => c.status !== 'closed').length === 0 ? 'on_target' : 'needs_attention', remark: remarks['CAPA Open'] || '' 

        },

        { indicator: 'Permits Issued', thisWeek: data.permits.length, previousWeek: '-', target: getTarget('permits_issued') || '-', trend: 'flat', status: 'no_target', remark: remarks['Permits Issued'] || '' 

        },

        { indicator: 'Active Permits', thisWeek: data.highRiskTasks.length, previousWeek: '-', target: getTarget('active_permits') || '-', trend: 'flat', status: 'no_target', remark: remarks['Active Permits'] || '' 
          
        },


      ];
      data.kpiRows = kpiRows;

      // --- CLOSED-LOOP ITEMS ---
      const closedLoop: any[] = [];
      
      // Open Incidents
      data.incidents.filter((i: any) => i.status !== 'closed').forEach((i: any) => {
        closedLoop.push({
          date: i.date_of_occurrence,
          issue: `${i.incident_type}: ${i.description}`,
          location: i.area || i.site,
          rootCause: 'Pending investigation',
          correctiveAction: i.immediate_action || 'Pending',
          owner: i.reporter_name || 'Unassigned',
          dueDate: '-',
          status: i.status
        });
      });

      // Open CAPA
      data.capa.filter((c: any) => c.status !== 'closed').forEach((c: any) => {
        closedLoop.push({
          date: c.created_at ? new Date(c.created_at).toLocaleDateString() : '-',
          issue: `CAPA: ${c.action_title}`,
          location: 'Various',
          rootCause: c.description || '-',
          correctiveAction: c.action_type || '-',
          owner: c.owner || 'Unassigned',
          dueDate: c.due_date,
          status: c.status
        });
      });

      // Open Hazards
      data.hazards.filter((h: any) => h.status !== 'closed').forEach((h: any) => {
        closedLoop.push({
          date: h.date_observed,
          issue: `Hazard: ${h.description}`,
          location: h.area || h.project_site,
          rootCause: 'Pending',
          correctiveAction: h.immediate_action || 'Pending',
          owner: h.observer_name || 'Unassigned',
          dueDate: '-',
          status: h.status
        });
      });

      data.closedLoop = closedLoop;

      // --- PHOTOS ---
      const photoUrls: { url: string, caption: string }[] = [];
      data.incidents.forEach((i: any) => { if (i.photo_url) photoUrls.push({ url: i.photo_url, caption: `Incident: ${i.description}` }); });
      data.hazards.forEach((h: any) => { if (h.photo_url) photoUrls.push({ url: h.photo_url, caption: `Hazard: ${h.description}` }); });
      data.photos = photoUrls;


    // --- DYNAMIC TREND DATA (Last 6 Months) ---

      
      const ltifrTrend = [];
      const incidentsTrend = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthName = d.toLocaleString('default', { month: 'short' });
        const year = d.getFullYear();
        const monthNum = d.getMonth() + 1;
        
        // First and last day of that month
        const firstDay = new Date(year, monthNum - 1, 1).toISOString().split('T')[0];
        const lastDay = new Date(year, monthNum, 0).toISOString().split('T')[0];

        // Fetch incidents for this month
        let monthIncQ = supabase.from('incidents').select('*').gte('date_of_occurrence', firstDay).lte('date_of_occurrence', lastDay);
        if (siteFilter) monthIncQ = monthIncQ.eq('site', siteFilter);
        const { data: monthIncidents } = await monthIncQ;

        // Fetch man-hours for this month
        const { data: monthSnapshots } = await supabase.from('weekly_snapshots').select('*').gte('week_start_date', firstDay).lte('week_start_date', lastDay);
        
        const monthHours = monthSnapshots?.reduce((sum: number, s: any) => sum + (s.total_man_hours || 0), 0) || 1;
        const monthLtiCount = monthIncidents?.filter((i: any) => i.incident_type === 'lti').length || 0;
        const monthLtifr = (monthLtiCount * 1000000) / monthHours;

        ltifrTrend.push({ month: monthName, value: parseFloat(monthLtifr.toFixed(2)) });
        incidentsTrend.push({ month: monthName, value: monthIncidents?.length || 0 });
      }

      data.ltifrTrend = ltifrTrend;
      data.incidentsTrend = incidentsTrend;

      

      // Safe Man-Hours Target
      data.safeManHours = safeManHours;
      data.safeManHoursTarget = getTarget('safe_man_hours');
      data.daysWithoutLTI = daysWithout;
      data.ltifr = ltifr;

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
    setIsPdfMode(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pdfWidth - (margin * 2);

      const sections = previewRef.current.querySelectorAll('.report-section, .report-header, .report-kpi-grid, .report-footer, .report-section-header, .report-highlight-card');
      
      let currentY = margin;

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

        if (currentY + imgHeight > pdfHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 5;
      }

      const fileName = `HSE_Report_${startDate}_to_${endDate}.pdf`;
      pdf.save(fileName);

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
      setIsPdfMode(false);
    }
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

        <h3 className="form-section-title mt-32">3. Summary & Recommendations</h3>
        <textarea className="form-input" rows={4} placeholder="Enter summary..." value={summaryNote} onChange={(e) => setSummaryNote(e.target.value)}></textarea>

        <h3 className="form-section-title mt-32">4. Sign-Off</h3>
        <div className="form-grid">
          <div className="form-group"><label>Reviewed By (Name)</label><input type="text" className="form-input" value={reviewedBy} onChange={(e) => setReviewedBy(e.target.value)} /></div>
          <div className="form-group"><label>Reviewed By (Role)</label><input type="text" className="form-input" value={reviewedByRole} onChange={(e) => setReviewedByRole(e.target.value)} /></div>
          <div className="form-group"><label>Reviewed Date</label><input type="date" className="form-input" value={reviewedDate} onChange={(e) => setReviewedDate(e.target.value)} /></div>
          <div className="form-group"><label>Approved By (Name)</label><input type="text" className="form-input" value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} /></div>
          <div className="form-group"><label>Approved By (Role)</label><input type="text" className="form-input" value={approvedByRole} onChange={(e) => setApprovedByRole(e.target.value)} /></div>
          <div className="form-group"><label>Approved Date</label><input type="date" className="form-input" value={approvedDate} onChange={(e) => setApprovedDate(e.target.value)} /></div>
        </div>

        <button className="btn-primary mt-24" onClick={fetchReportData} disabled={isGenerating}>
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
              <ReportHeader 
                companyProfile={companyProfile}
                reportNumber={`RPT-${Date.now().toString().slice(-6)}`}
                startDate={startDate}
                endDate={endDate}
                selectedSite={selectedSite}
              />

              <ReportHighlight 
                daysWithoutLTI={reportData.daysWithoutLTI ?? 0}
                safeManHours={reportData.safeManHours ?? 0}
                safeManHoursTarget={reportData.safeManHoursTarget ?? '-'}
              />

              <ReportKpiTable 
                rows={reportData.kpiRows || []}
                remarks={remarks}
                onRemarkChange={handleRemarkChange}
                isEditable={!isPdfMode}
              />


              <ReportTrends 
                ltifrData={reportData.ltifrTrend || []}
                incidentsData={reportData.incidentsTrend || []}
              />



              <ReportClosedLoop 
                items={reportData.closedLoop || []}
              />

              {selectedSections.includes('high_risk') && (
                <ReportHighRiskTasks 
                  tasks={reportData.highRiskTasks || []}
                />
              )}

              

              <ReportSummary 
                summaryNote={summaryNote}
              />

              <ReportPhotos 
                photos={reportData.photos || []}
              />

              <ReportSignOff 
                reviewedBy={reviewedBy}
                reviewedByRole={reviewedByRole}
                reviewedDate={reviewedDate}
                approvedBy={approvedBy}
                approvedByRole={approvedByRole}
                approvedDate={approvedDate}
              />

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