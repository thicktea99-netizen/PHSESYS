// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import LogIncident from './pages/LogIncident';
import IncidentDetail from './pages/IncidentDetail';
import InspectionDetail from './pages/InspectionDetail';
import LogInspection from './pages/LogInspection';
import Inspections from './pages/Inspections';
import Capa from './pages/Capa';
import LogCapa from './pages/LogCapa';
import CapaDetail from './pages/CapaDetail';
import Hazards from './pages/Hazards';
import LogHazard from './pages/LogHazard';
import ToolboxTalks from './pages/ToolboxTalks';
import LogToolboxTalk from './pages/LogToolboxTalk';
import Permits from './pages/Permits';
import LogPermit from './pages/LogPermit';
import PpeChecks from './pages/PpeChecks';
import LogPpeCheck from './pages/LogPpeCheck';
import Compliance from './pages/Compliance';
import LogCompliance from './pages/LogCompliance';
import EditCompliance from './pages/EditCompliance';
import Training from './pages/Training';
import LogTraining from './pages/LogTraining';
import EditTraining from './pages/EditTraining';
import Documents from './pages/Documents';
import UploadDocument from './pages/UploadDocument';
import Settings from './pages/Settings';
import People from './pages/People';
import Equipment from './pages/Equipment';
import LogEquipment from './pages/LogEquipment';
import RiskAssessments from './pages/RiskAssessments';
import LogRiskAssessment from './pages/LogRiskAssessment';
import Audits from './pages/Audits';
import LogAudit from './pages/LogAudit';
import ManHoursLog from './pages/ManHoursLog';
import Drills from './pages/Drills';
import LogDrill from './pages/LogDrill';
import EmergencyContacts from './pages/EmergencyContacts';
import LogEmergencyContact from './pages/LogEmergencyContact';

import LogInvestigation from './pages/LogInvestigation';

import Reports from './pages/Reports';

import Footer from './components/Footer';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <TopBar />
          <main className="page-content">
            <Routes>
              {/* Dashboard */}
              <Route path="/" element={<Dashboard />} />

              {/* Incidents */}
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/incidents/new" element={<LogIncident />} />
              <Route path="/incidents/:id/investigation/new" element={<LogInvestigation />} />
              <Route path="/incidents/:id/investigation" element={<LogInvestigation />} />
              <Route path="/incidents/:id" element={<IncidentDetail />} />

              {/* Inspections */}
              <Route path="/inspections" element={<Inspections />} />
              <Route path="/inspections/new" element={<LogInspection />} />
              <Route path="/inspections/:id" element={<InspectionDetail />} />

              {/* CAPA */}
              <Route path="/capa" element={<Capa />} 
              />

              <Route path="/capa/new" element={<LogCapa />} 
              />

              <Route path="/capa/:id" element={<CapaDetail />} 
              />

              {/* Hazards */}
              <Route path="/hazards" element={<Hazards />} />
              <Route path="/hazards/new" element={<LogHazard />} />
              <Route path="/hazards/:id" element={<LogHazard />} />

              {/* Toolbox Talks */}
              <Route path="/toolbox-talks" element={<ToolboxTalks />} />
              <Route path="/toolbox-talks/new" element={<LogToolboxTalk />} />

              {/* Permits */}
              <Route path="/permits" element={<Permits />} />
              <Route path="/permits/new" element={<LogPermit />} />
              <Route path="/permits/:id" element={<LogPermit />} />

              {/* PPE Checks */}
              <Route path="/ppe-checks" element={<PpeChecks />} />
              <Route path="/ppe-checks/new" element={<LogPpeCheck />} />

              {/* Compliance */}
              <Route path="/compliance" element={<Compliance />} />
              <Route path="/compliance/new" element={<LogCompliance />} />
              <Route path="/compliance/:id" element={<EditCompliance />} />

              {/* Training */}
              <Route path="/training" element={<Training />} />
              <Route path="/training/new" element={<LogTraining />} />
              <Route path="/training/:id" element={<EditTraining />} />

              {/* Documents */}
              <Route path="/documents" element={<Documents />} />
              <Route path="/documents/new" element={<UploadDocument />} />

              {/* Settings */}
              <Route path="/settings" element={<Settings />} />

              {/* People */}
              <Route path="/people" element={<People />} />

              {/* Equipment */}
              <Route path="/equipment" element={<Equipment />} />
              <Route path="/equipment/new" element={<LogEquipment />} />

              {/* Risk Assessments */}
              <Route path="/risk-assessments" element={<RiskAssessments />} />
              <Route path="/risk-assessments/new" element={<LogRiskAssessment />} />
              <Route path="/risk-assessments/:id" element={<LogRiskAssessment />} />

              {/* Audits */}
              <Route path="/audits" element={<Audits />} />
              <Route path="/audits/new" element={<LogAudit />} />
              <Route path="/audits/:id" element={<LogAudit />} />

              {/* Man-Hours Log */}
              <Route path="/man-hours" element={<ManHoursLog />} />

              {/* Drills & Exercises */}
              <Route path="/drills" element={<Drills />} />
              <Route path="/drills/new" element={<LogDrill />} />
              <Route path="/drills/:id" element={<LogDrill />} />

              {/* Emergency Contacts */}
              <Route path="/emergency-contacts" element={<EmergencyContacts />} 
              />

              <Route path="/emergency-contacts/new" element={<LogEmergencyContact />} 
              />

              <Route path="/reports/" element={<Reports />}
              />

              <Route path="/emergency-contacts/:id" element={<LogEmergencyContact />}
              />





            </Routes>
            
            {/* Footer             */}
            <Footer />
           


          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;