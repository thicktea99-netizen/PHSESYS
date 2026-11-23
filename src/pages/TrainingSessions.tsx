// src/pages/TrainingSessions.tsx
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import TrainingSessionStats from '../components/trainingSessions/TrainingSessionStats';
import TrainingSessionFilters from '../components/trainingSessions/TrainingSessionFilters';
import TrainingSessionTable from '../components/trainingSessions/TrainingSessionTable';
import '../styles/Incidents.css';

interface TrainingSession {
  id: string;
  training_number: number;
  title: string;
  training_type: string;
  site: string;
  date: string;
  attendee_count: number;
  certificate_issued: boolean;
}

export default function TrainingSessions() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  
  const [siteFilter, setSiteFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSessions();
    fetchSites();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('training_sessions').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      alert("Error fetching sessions: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    const { data } = await supabase.from('sites').select('id, name').eq('status', 'active');
    if (data) setSitesList(data);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this training session?")) return;
    await supabase.from('training_sessions').delete().eq('id', id);
    setSessions(sessions.filter(s => s.id !== id));
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSite = siteFilter === 'All' || session.site === siteFilter;
    const matchesSearch = searchQuery === '' || session.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSite && matchesSearch;
  });

  const total = sessions.length;
  const totalAttendees = sessions.reduce((sum, s) => sum + (s.attendee_count || 0), 0);
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = sessions.filter(s => new Date(s.date) >= firstOfMonth).length;
  const withCertificate = sessions.filter(s => s.certificate_issued).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Training Sessions</h1>
          <p className="page-subtitle">Log formal training events and attendees.</p>
        </div>
        <Link to="/training-sessions/new" className="btn-primary"><Plus size={18} /> Log Session</Link>
      </div>

      <TrainingSessionStats total={total} totalAttendees={totalAttendees} thisMonth={thisMonth} withCertificate={withCertificate} />

      <TrainingSessionFilters 
        siteFilter={siteFilter}
        onSiteChange={setSiteFilter}
        sitesList={sitesList}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <TrainingSessionTable 
        sessions={filteredSessions}
        loading={loading}
        onDelete={handleDelete}
      />
    </div>
  );
}