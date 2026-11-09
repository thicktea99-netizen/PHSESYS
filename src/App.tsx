// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import LogIncident from './pages/LogIncident';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <TopBar />
          <main className="page-content">
            {/* The Routes decide which page to show based on the URL */}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/incidents" element={<Incidents />} />
              {/* We will add Inspections and CAPA routes later */}
              <Route path="/incidents/new" element={<LogIncident />} />
            </Routes>

          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;