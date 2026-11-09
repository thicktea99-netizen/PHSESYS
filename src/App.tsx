// src/App.tsx
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import StatCard from './components/StatCard';
import './styles/Dashboard.css'; // We will create this next

import IncidentChart from './components/IncidentChart';

import ManHoursChart from './components/ManHoursChart';

import CapaChart from './components/CapaChart';
import ComplianceScore from './components/ComplianceScore';
import SafetyActivities from './components/SafetyActivities';

import NeedsAttention from './components/NeedsAttention';
import RecentActivity from './components/RecentActivity';





function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />

        <main className="page-content">
          
          <div className="dashboard-header">
            <h1>This Week at a Glance</h1>
          </div>

          {/* Row 1: The 6 Core Metrics */}
          <div className="dashboard-grid">
            <StatCard 
              title="Total Man-Hours" 
              value="1,144" 
              trend="down" 
              trendValue="20%" 
            />
            <StatCard 
              title="Safe Man-Hours" 
              value="1,144" 
              trend="down" 
              trendValue="20%" 
            />
            <StatCard 
              title="Avg Daily Workforce" 
              value="11" 
              trend="down" 
              trendValue="1" 
            />
            <StatCard 
              title="Incidents" 
              value="0" 
              trend="flat" 
              trendValue="0" 
              variant="danger" 
            />
            <StatCard 
              title="Inspections" 
              value="4" 
              trend="up" 
              trendValue="1" 
            />
            <StatCard 
              title="CAPA Outstanding" 
              value="3" 
              trend="down" 
              trendValue="2" 
              variant="success" 
            />
          </div>

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

        </main>

      </div>
    </div>
  );
}

export default App;