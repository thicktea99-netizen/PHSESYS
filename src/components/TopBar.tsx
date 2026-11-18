// src/components/TopBar.tsx
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import EmergencyModal from './EmergencyModal';
import '../styles/TopBar.css';

export default function TopBar() {
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [emergencyInfo, setEmergencyInfo] = useState({ 
    assemblyPoint: '', 
    hospital: '', 
    hospitalPhone: '', 
    firstAider: false 
  });

  useEffect(() => {
    const fetchEmergencyData = async () => {
      // Fetch global emergency contacts
      const { data: contacts } = await supabase.from('emergency_contacts').select('*').order('service_type');
      if (contacts) setEmergencyContacts(contacts);

      // Fetch the first active site's emergency info
      const { data: sites } = await supabase
        .from('sites')
        .select('*')
        .eq('status', 'active')
        .limit(1);

      if (sites && sites.length > 0) {
        const site = sites[0];
        setEmergencyInfo({
          assemblyPoint: site.assembly_point || '',
          hospital: site.hospital_name || '',
          hospitalPhone: site.hospital_phone || '',
          firstAider: site.first_aider_present || false
        });
      }
    };
    fetchEmergencyData();
  }, []);

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <h2>Globe Project - Tower Site</h2>
        </div>
        <div className="topbar-right">
          <button 
            className="emergency-bell" 
            onClick={() => setIsEmergencyModalOpen(true)}
          >
            <Bell size={22} />
            <span className="emergency-dot"></span>
            <span className="tooltip-text">Emergency Info</span>
          </button>
          <span className="user-profile">Welcome, Kwame</span>
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