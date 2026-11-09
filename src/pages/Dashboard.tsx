

// src/pages/Dashboard.tsx
import StatCard from '../components/StatCard';
import IncidentChart from '../components/IncidentChart';
import ManHoursChart from '../components/ManHoursChart';
import CapaChart from '../components/CapaChart';
import ComplianceScore from '../components/ComplianceScore';
import SafetyActivities from '../components/SafetyActivities';
import NeedsAttention from '../components/NeedsAttention';
import RecentActivity from '../components/RecentActivity';
import '../styles/Dashboard.css';

export default function Dashboard() {
  return (
    <>
      <div className="dashboard-header">
        <h1>What's happening </h1>
      </div>

      {/* Row 1: The 6 Core Metrics */}
      <div className="dashboard-grid">
        <StatCard title="Total Man-Hours" value="1,144" trend="down" trendValue="20%" />
        <StatCard title="Safe Man-Hours" value="1,144" trend="down" trendValue="20%" />
        <StatCard title="Avg Daily Workforce" value="11" trend="down" trendValue="1" />
        <StatCard title="Incidents" value="0" trend="flat" trendValue="0" variant="danger" />
        <StatCard title="Inspections" value="4" trend="up" trendValue="1" />
        <StatCard title="CAPA Outstanding" value="3" trend="down" trendValue="2" variant="success" />
      </div>

      {/* Row 2: Charts */}
      <div className="charts-row">
        <IncidentChart />
        <ManHoursChart />
      </div>

      {/* Row 3: Operations & Compliance */}
      <div className="row-3-grid">
        <CapaChart />
        <ComplianceScore />
        <SafetyActivities />
      </div>

      {/* Row 4: Needs Attention & Recent Activity */}
      <div className="row-4-grid">
        <NeedsAttention />
        <RecentActivity />
      </div>
    </>
  );
}