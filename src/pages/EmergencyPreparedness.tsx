// src/pages/EmergencyPreparedness.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2, Phone, Siren, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/EmergencyContacts.css';
import '../styles/Inspections.css';

interface Drill {
  id: string;
  drill_number: number;
  drill_type: string;
  site: string;
  date: string;
  total_participants: number;
  status: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  company: string;
  primary_contact: string;
  alternative_contact: string;
  category: string;
  site: string;
}

export default function EmergencyPreparedness() {
  const [activeTab, setActiveTab] = useState<'drills' | 'contacts'>('drills');
  
  // --- DRILLS STATE ---
  const [drills, setDrills] = useState<Drill[]>([]);
  const [loadingDrills, setLoadingDrills] = useState(true);

  // --- CONTACTS STATE ---
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);

  useEffect(() => {
    if (activeTab === 'drills') fetchDrills();
    if (activeTab === 'contacts') fetchContacts();
  }, [activeTab]);

  // --- DRILL HANDLERS ---
  const fetchDrills = async () => {
    try {
      setLoadingDrills(true);
      const { data, error } = await supabase.from('drills').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setDrills(data || []);
    } catch (error: any) {
      alert("Error fetching drills: " + error.message);
    } finally {
      setLoadingDrills(false);
    }
  };

  const deleteDrill = async (id: string) => {
    if (!window.confirm("Delete this drill record?")) return;
    await supabase.from('drills').delete().eq('id', id);
    fetchDrills();
  };

  // --- CONTACT HANDLERS ---
  const fetchContacts = async () => {
    try {
      setLoadingContacts(true);
      const { data, error } = await supabase.from('emergency_contacts').select('*').order('category');
      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      alert("Error fetching contacts: " + error.message);
    } finally {
      setLoadingContacts(false);
    }
  };

  const deleteContact = async (id: string) => {
    if (!window.confirm("Delete this contact?")) return;
    await supabase.from('emergency_contacts').delete().eq('id', id);
    fetchContacts();
  };

  // Group contacts by category
  const groupedContacts: { [key: string]: Contact[] } = {};
  contacts.forEach(c => {
    if (!groupedContacts[c.category]) groupedContacts[c.category] = [];
    groupedContacts[c.category].push(c);
  });

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <Link to="/emergency-preparedness" className="back-link">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1>Emergency Preparedness</h1>
            <p className="page-subtitle">Manage drills, exercises, and emergency contacts.</p>
          </div>
        </div>
        {activeTab === 'drills' ? (
          <Link to="/drills/new" className="btn-primary"><Plus size={18} /> Log Drill</Link>
        ) : (
          <Link to="/emergency-contacts/new" className="btn-primary"><Plus size={18} /> Add Contact</Link>
        )}
      </div>

      {/* TABS */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'drills' ? 'active' : ''}`} onClick={() => setActiveTab('drills')}>
          <Siren size={16} /> Drills & Exercises
        </button>
        <button className={`tab ${activeTab === 'contacts' ? 'active' : ''}`} onClick={() => setActiveTab('contacts')}>
          <Phone size={16} /> Emergency Contacts
        </button>
      </div>

      {/* DRILLS TAB */}
      {activeTab === 'drills' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Drill Type</th>
                <th>Site</th>
                <th>Date</th>
                <th>Participants</th>
                <th>Status</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {loadingDrills ? (
                <tr><td colSpan={7} className="table-message">Loading drills...</td></tr>
              ) : drills.length === 0 ? (
                <tr><td colSpan={7} className="table-message">No drills logged yet.</td></tr>
              ) : (
                drills.map((drill) => (
                  <tr key={drill.id} className="clickable-row" onClick={() => window.location.href = `/drills/${drill.id}`}>
                    <td className="font-medium">DRL-{String(drill.drill_number).padStart(4, '0')}</td>
                    <td>{drill.drill_type}</td>
                    <td>{drill.site}</td>
                    <td>{new Date(drill.date).toLocaleDateString()}</td>
                    <td>{drill.total_participants || '-'}</td>
                    <td>
                      <span className={`badge ${drill.status === 'Completed' ? 'severity-low' : drill.status === 'Cancelled' ? 'severity-critical' : 'severity-medium'}`}>
                        {drill.status}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button className="btn-icon danger" onClick={() => deleteDrill(drill.id)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CONTACTS TAB */}
      {activeTab === 'contacts' && (
        <div className="contacts-grid">
          {loadingContacts ? (
            <div className="table-message">Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="table-message">No emergency contacts added yet.</div>
          ) : (
            Object.keys(groupedContacts).map(category => (
              <div key={category} className="contact-category-group">
                <h3 className="contact-category-title">{category}</h3>
                <div className="contact-cards">
                  {groupedContacts[category].map(contact => (
                    <div key={contact.id} className="contact-card">
                      <div className="contact-card-header">
                        <div>
                          <h4>{contact.name}</h4>
                          <p className="contact-role">{contact.role} {contact.company ? `• ${contact.company}` : ''}</p>
                        </div>
                        <button className="btn-icon danger" onClick={() => deleteContact(contact.id)}><Trash2 size={14} /></button>
                      </div>
                      <div className="contact-numbers">
                        <a href={`tel:${contact.primary_contact}`} className="contact-number">
                          <Phone size={14} /> {contact.primary_contact}
                        </a>
                        {contact.alternative_contact && (
                          <a href={`tel:${contact.alternative_contact}`} className="contact-number secondary">
                            <Phone size={14} /> {contact.alternative_contact}
                          </a>
                        )}
                      </div>
                      {contact.site && <span className="contact-site">{contact.site}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}