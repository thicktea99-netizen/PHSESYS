// src/components/TopBar.tsx
import { useState, useEffect } from 'react';
import { Siren } from 'lucide-react';
import { supabase } from '../lib/supabase';
import EmergencyModal from './EmergencyModal';
import '../styles/TopBar.css';

// Greeting based on the hour of the day (uses the device clock)
function getGreeting(date: Date) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Working late'; // 21:00 - 04:59
}

export default function TopBar() {
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [emergencyInfo, setEmergencyInfo] = useState({ 
    assemblyPoint: '', 
    hospital: '', 
    hospitalPhone: '', 
    firstAider: false 
  });

  // Header info: officer, project and site
  const [headerInfo, setHeaderInfo] = useState({
    officerName: '',
    companyName: '',
    projectName: '',
    siteLabel: 'All Sites'
  });

  // Current time, refreshed every minute so the greeting and date stay correct
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchHeaderData = async () => {
      const selectedSite = localStorage.getItem('selectedSite') || 'All';

      // Fetch global emergency contacts
      const { data: contacts } = await supabase.from('emergency_contacts').select('*').order('service_type');
      if (contacts) setEmergencyContacts(contacts);

      // Fetch the emergency info for the selected site (or first active site if 'All')
      let query = supabase.from('sites').select('*').eq('status', 'active');
      if (selectedSite !== 'All') {
        query = query.eq('name', selectedSite);
      } else {
        query = query.limit(1);
      }

      const { data: sites } = await query;

      // Project name only makes sense when one specific site is selected
      let projectName = '';

      if (sites && sites.length > 0) {
        const site = sites[0];
        setEmergencyInfo({
          assemblyPoint: site.assembly_point || '',
          hospital: site.hospital_name || '',
          hospitalPhone: site.hospital_phone || '',
          firstAider: site.first_aider_present || false
        });

        if (selectedSite !== 'All' && site.project_id) {
          const { data: project } = await supabase
            .from('projects')
            .select('project_name')
            .eq('id', site.project_id)
            .maybeSingle();
          projectName = project?.project_name || '';
        }
      }

      // Officer and company details come from Settings > Company Profile
      const { data: profile } = await supabase
        .from('company_profile')
        .select('company_name, officer_name')
        .limit(1)
        .maybeSingle();

      setHeaderInfo({
        officerName: profile?.officer_name || '',
        companyName: profile?.company_name || '',
        projectName,
        siteLabel: selectedSite === 'All' ? 'All Sites' : selectedSite
      });
    };
    fetchHeaderData();

    // Re-fetch when the site changes: 'storage' covers other tabs,
    // 'siteChanged' is fired by the Dashboard in the same tab
    const handleSiteChange = () => {
      fetchHeaderData();
    };
    window.addEventListener('storage', handleSiteChange);
    window.addEventListener('siteChanged', handleSiteChange);
    return () => {
      window.removeEventListener('storage', handleSiteChange);
      window.removeEventListener('siteChanged', handleSiteChange);
    };
  }, []);

  const greeting = getGreeting(now);
  const dateText = now.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const title = headerInfo.projectName || headerInfo.companyName || 'HSE Management System';

  return (
    <>
            <header className="topbar">
        <div className="topbar-left">
          <h2 title={title}>{title}</h2>
          <p className="topbar-meta">{headerInfo.siteLabel}</p>
        </div>
        <div className="topbar-center">
          <p className="topbar-greeting">
            {greeting}{headerInfo.officerName ? `, ${headerInfo.officerName}` : ''}
          </p>
          <p className="topbar-meta">{dateText}</p>
        </div>
        <div className="topbar-right">
          <button 
            className="emergency-bell" 
            onClick={() => setIsEmergencyModalOpen(true)}
          >
            <Siren size={22} />
            <span className="emergency-dot"></span>
            <span className="tooltip-text">Emergency Info</span>
          </button>
        </div>
      </header>

      <EmergencyModal 
        isOpen={isEmergencyModalOpen} 
        onClose={() => setIsEmergencyModalOpen(false)}
        contacts={emergencyContacts}
        assemblyPoint={emergencyInfo.assemblyPoint}
        hospital={emergencyInfo.hospital}
        hospitalPhone={emergencyInfo.hospitalPhone}
        firstAider={emergencyInfo.firstAider}
      />
    </>
  );
}