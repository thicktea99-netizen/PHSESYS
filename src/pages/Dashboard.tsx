// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus } from 'lucide-react';
import StatCard from '../components/StatCard';
import IncidentChart from '../components/IncidentChart';
import ManHoursChart from '../components/ManHoursChart';
import ComplianceScore from '../components/ComplianceScore';
import SafetyActivities from '../components/SafetyActivities';
import NeedsAttention from '../components/NeedsAttention';
import RecentActivity from '../components/RecentActivity';

import '../styles/Dashboard.css';



export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  const [selectedSite, setSelectedSite] = useState('All');
  const [dateRange, setDateRange] = useState('This Week');

  



  const [stats, setStats] = useState({
    totalManHours: 0, safeManHours: 0, workforce: 0,
    incidents: 0, inspections: 0, capaOutstanding: 0,
    ltifr: 0, ltifrTarget: 2.0, daysWithoutLTI: 0,
    overallCompliance: 0, tbtCount: 0, tbtAttendees: 0,
    trainingCount: 0,
  });

  const [incidentBreakdown, setIncidentBreakdown] = useState<any[]>([]);
  const [manHoursTrend, setManHoursTrend] = useState<any[]>([]);
  const [capaStatus, setCapaStatus] = useState<any[]>([]);
  const [needsAttention, setNeedsAttention] = useState<any[]>([]);

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchSites();
    fetchDashboardData();
  }, [selectedSite, dateRange]);





  const fetchSites = async () => {
    const { data } = await supabase.from('sites').select('id, name').eq('status', 'active');
    if (data) setSitesList(data);
  };

  const getDateRange = () => {
    const now = new Date();
    let start = new Date();
    if (dateRange === 'This Week') start.setDate(now.getDate() - now.getDay());
    else if (dateRange === 'This Month') start = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (dateRange === 'This Quarter') start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    else if (dateRange === 'This Year') start = new Date(now.getFullYear(), 0, 1);
    return start.toISOString().split('T')[0];
  };

  

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const startDate = getDateRange();
      const siteFilter = selectedSite === 'All' ? null : selectedSite;

      const { data: configData } = await supabase.from('dashboard_config').select('*');
      const config: any = {};
      configData?.forEach(c => { config[c.config_key] = c.config_value === 'true'; });

      // 1. Weekly Snapshot
      const { data: snapshots } = await supabase.from('weekly_snapshots').select('*').order('week_start_date', { ascending: false }).limit(1);
      const currentSnapshot = snapshots && snapshots.length > 0 ? snapshots[0] : null;
      
      if (currentSnapshot) {
        setStats(prev => ({ 
          ...prev, 
          totalManHours: currentSnapshot.total_man_hours, 
          safeManHours: currentSnapshot.safe_man_hours, 
          workforce: currentSnapshot.total_workforce 
        }));
      }

      // 2. Incidents
      let incQuery = supabase.from('incidents').select('*').gte('date_of_occurrence', startDate);
      if (siteFilter) incQuery = incQuery.eq('site', siteFilter);
      const { data: incidents } = await incQuery;
      const incidentsList = incidents || [];
      const incCount = incidentsList.length;

      const breakdown: { [key: string]: number } = {};
      incidentsList.forEach(inc => { 
        const type = inc.incident_type || 'Unknown'; 
        breakdown[type] = (breakdown[type] || 0) + 1; 
      });
      setIncidentBreakdown(Object.keys(breakdown).map(key => ({ name: key, count: breakdown[key] })));

      // Days without LTI
      const { data: ltiData } = await supabase.from('incidents').select('date_of_occurrence').eq('incident_type', 'lti').order('date_of_occurrence', { ascending: false }).limit(1);
      let daysWithout = 0;
      if (ltiData && ltiData.length > 0) {
        const lastLTI = new Date(ltiData[0].date_of_occurrence);
        daysWithout = Math.max(0, Math.floor((new Date().getTime() - lastLTI.getTime()) / (1000 * 3600 * 24)));
      }

      // 3. Inspections
      let inspQuery = supabase.from('inspections').select('*').gte('date', startDate);
      if (siteFilter) inspQuery = inspQuery.eq('site', siteFilter);
      const { data: inspections } = await inspQuery;
      const inspCount = (inspections || []).length;

      // 4. CAPA
      const { data: capaActions } = await supabase.from('capa_actions').select('*');
      const capaList = capaActions || [];
      const openCapa = capaList.filter(c => c.status === 'open' || c.status === 'in progress');
      const overdueCapa = capaList.filter(c => c.due_date && new Date(c.due_date) < new Date() && c.status !== 'closed');

      setCapaStatus([
        { name: 'Open', value: capaList.filter(c => c.status === 'open').length, color: '#ef4444' },
        { name: 'In Progress', value: capaList.filter(c => c.status === 'in progress').length, color: '#f59e0b' },
        { name: 'Closed', value: capaList.filter(c => c.status === 'closed').length, color: '#10b981' },
      ]);

      // 5. Hazards & Permits (Needs Attention)
      let hazQuery = supabase.from('hazards').select('*').eq('status', 'open');
      if (siteFilter) hazQuery = hazQuery.eq('project_site', siteFilter);
      const { data: hazards } = await hazQuery;
      const hazardsList = hazards || [];

      let permQuery = supabase.from('permits').select('*').eq('status', 'Active');
      if (siteFilter) permQuery = permQuery.eq('site', siteFilter);
      const { data: permits } = await permQuery;
      const permitsList = permits || [];

      // 6. TBTs & Training
      let tbtQuery = supabase.from('toolbox_talks').select('*').gte('date', startDate);
      if (siteFilter) tbtQuery = tbtQuery.eq('site', siteFilter);
      const { data: tbts } = await tbtQuery;
      const tbtList = tbts || [];
      const tbtAttendees = tbtList.reduce((sum, t) => sum + (t.attendee_count || 0), 0);

      const { data: trainings } = await supabase.from('certifications').select('*').gte('created_at', startDate);
      const trainingCount = (trainings || []).length;

      // 7. LTIFR Settings
      const { data: settings } = await supabase.from('app_settings').select('*');
      const target = parseFloat(settings?.find(s => s.key === 'ltifr_target')?.value || '2.0');
      const multiplier = parseFloat(settings?.find(s => s.key === 'ltifr_multiplier')?.value || '1000000');

      const ltiCount = incidentsList.filter(i => i.incident_type === 'lti').length;
      const totalHours = currentSnapshot?.total_man_hours || 1;
      const ltifr = (ltiCount * multiplier) / totalHours;

      // 8. Compliance (simplified)
      const overall = 94;

      // 9. Needs Attention
      const attention = [];
      if (overdueCapa.length > 0) attention.push({ label: 'CAPA Overdue', count: overdueCapa.length, link: '/capa' });
      const openIncidents = incidentsList.filter(i => i.status !== 'closed').length;
      if (openIncidents > 0) attention.push({ label: 'Open Incidents', count: openIncidents, link: '/incidents' });
      if (permitsList.length > 0) attention.push({ label: 'Active Permits', count: permitsList.length, link: '/permits' });
      if (hazardsList.length > 0) attention.push({ label: 'Open Hazards', count: hazardsList.length, link: '/hazards' });
      setNeedsAttention(attention);

      // 10. Recent Activity
      // setRecentActivity([
      //   { text: 'Incident INC-0001 logged', time: '2 hours ago' },
      //   { text: 'Inspection INS-0003 completed', time: 'Yesterday' },
      // ]);

      // 10. Recent Activity (from audit_logs)
      const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      const filteredLogs = (logs || []).filter(log => {
        if (log.module === 'Incidents' && !config.show_activity_incidents) return false;
        if (log.module === 'Inspections' && !config.show_activity_inspections) return false;
        if (log.module === 'Hazards' && !config.show_activity_hazards) return false;
        if (log.module === 'Permits' && !config.show_activity_permits) return false;
        if (log.module === 'CAPA' && !config.show_activity_capa) return false;
        return true;
      });

      setRecentActivity(filteredLogs.map(log => ({
        text: `${log.action}: ${log.reference}`,
        time: new Date(log.created_at).toLocaleString()
      })));




      // 11. Man-Hours Trend
      setManHoursTrend([
        { month: 'Jun', totalHours: 4000, safeHours: 4000 },
        { month: 'Jul', totalHours: 5200, safeHours: 5200 },
        { month: 'Aug', totalHours: 4800, safeHours: 4780 },
        { month: 'Sep', totalHours: 6100, safeHours: 6100 },
        { month: 'Oct', totalHours: 5400, safeHours: 5400 },
        { month: 'Nov', totalHours: totalHours, safeHours: currentSnapshot?.safe_man_hours || totalHours },
      ]);

      setStats(prev => ({
        ...prev, incidents: incCount, inspections: inspCount,
        capaOutstanding: openCapa.length, ltifr: ltifr, ltifrTarget: target,
        daysWithoutLTI: daysWithout, overallCompliance: overall,
        tbtCount: tbtList.length, tbtAttendees: tbtAttendees, trainingCount: trainingCount,
      }));

    } catch (error: any) {
      console.error("Dashboard error: ", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading dashboard...</div>;

  return (
    <div>
      {/* HEADER & FILTERS */}
      
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Dashboard</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
         
          
          <select className="form-input" value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)} style={{ width: '200px' }}>
            <option value="All">All Sites</option>
            {sitesList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          <select className="form-input" value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={{ width: '150px' }}>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="This Quarter">This Quarter</option>
            <option value="This Year">This Year</option>
          </select>
        </div>
      </div>



      {/* QUICK ACTIONS */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button className="btn-primary" onClick={() => window.location.href = '/incidents/new'}><Plus size={16} /> Log Incident</button>
        <button className="btn-primary" onClick={() => window.location.href = '/inspections/new'}><Plus size={16} /> Start Inspection</button>
        <button className="btn-primary" onClick={() => window.location.href = '/hazards/new'}><Plus size={16} /> Log Hazard</button>
        <button className="btn-primary" onClick={() => window.location.href = '/permits/new'}><Plus size={16} /> Issue Permit</button>
      </div>

      {/* ROW 1: STAT CARDS */}
      <div className="dashboard-grid">
        <StatCard title="Total Man-Hours" value={stats.totalManHours.toLocaleString()} trend="flat" trendValue="0" />
        <StatCard title="Safe Man-Hours" value={stats.safeManHours.toLocaleString()} trend="flat" trendValue="0" />
        <StatCard title="Avg Daily Workforce" value={stats.workforce.toString()} trend="flat" trendValue="0" />
        <StatCard title="Incidents" value={stats.incidents.toString()} trend="flat" trendValue="0" variant="danger" />
        <StatCard title="Inspections" value={stats.inspections.toString()} trend="flat" trendValue="0" />
        <StatCard title="CAPA Outstanding" value={stats.capaOutstanding.toString()} trend="flat" trendValue="0" variant="success" />
      </div>

      {/* ROW 2: COMPACT KPI CARDS */}
      <div className="kpi-row">
        <div className="kpi-compact-card">
          <h4>LTIFR</h4>
          <div className="kpi-value" style={{ color: stats.ltifr <= stats.ltifrTarget ? 'var(--success)' : 'var(--danger)' }}>
            {stats.ltifr.toFixed(2)}
          </div>
          <p className="kpi-sub">Target: {stats.ltifrTarget}</p>
        </div>
        <div className="kpi-compact-card">
          <h4>Days Without LTI</h4>
          <div className="kpi-value" style={{ color: 'var(--success)' }}>{stats.daysWithoutLTI}</div>
          <p className="kpi-sub">Consecutive days</p>
        </div>
        <div className="kpi-compact-card">
          <h4>Overall Compliance</h4>
          <div className="kpi-value" style={{ color: 'var(--primary)' }}>{stats.overallCompliance}%</div>
          <p className="kpi-sub">PPE • Certs • Compliance</p>
        </div>
        <div className="kpi-compact-card">
          <h4>Safety Activities</h4>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '8px' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="kpi-value" style={{ fontSize: '1.2rem' }}>{stats.tbtCount}</div>
              <p className="kpi-sub">TBTs</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="kpi-value" style={{ fontSize: '1.2rem' }}>{stats.trainingCount}</div>
              <p className="kpi-sub">Trainings</p>
            </div>
          </div>
        </div>
      </div>

     


      {/* ROW 3: COMPLIANCE & ACTIVITIES */}
      <div className="row-3-grid">
        <ComplianceScore />
        <SafetyActivities />
        <div className="chart-card">
          <div className="chart-header"><h3>CAPA Status</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {capaStatus.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem' }}>{item.name}</span>
                <span className={`badge severity-${item.name.toLowerCase() === 'open' ? 'critical' : item.name.toLowerCase() === 'in progress' ? 'high' : 'low'}`} style={{ fontSize: '0.9rem', padding: '4px 12px' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 4: CHARTS */}
      <div className="charts-row">
        <IncidentChart data={incidentBreakdown} />
        <ManHoursChart data={manHoursTrend} />
      </div>

      {/* ROW 5: NEEDS ATTENTION & RECENT ACTIVITY */}
      <div className="row-4-grid">
        <NeedsAttention items={needsAttention} />
        <RecentActivity items={recentActivity} />
      </div>


      

    </div>
  );
}