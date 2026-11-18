// src/pages/EmergencyContacts.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/EmergencyContacts.css';

interface Contact {
  id: string;
  name: string;
  role: string;
  company: string;
  primary_contact: string;
  alternative_contact: string;
  service_type: string;
  category: string;
  site: string;
}

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('emergency_contacts').select('*').order('service_type');
      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this contact?")) return;
    try {
      const { error } = await supabase.from('emergency_contacts').delete().eq('id', id);
      if (error) throw error;
      setContacts(contacts.filter(c => c.id !== id));
    } catch (error: any) { alert(error.message); }
  };

  // Group by Service Type
  const grouped: { [key: string]: Contact[] } = {};
  contacts.forEach(c => {
    const type = c.service_type || 'Other';
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(c);
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Emergency Contacts</h1>
          <p className="page-subtitle">Key contacts for emergency response, grouped by service type.</p>
        </div>
        <Link to="/emergency-contacts/new" className="btn-primary"><Plus size={18} /> Add Contact</Link>
      </div>

      {loading ? (
        <div className="table-message">Loading contacts...</div>
      ) : contacts.length === 0 ? (
        <div className="table-message">No emergency contacts added yet.</div>
      ) : (
        <div className="contacts-grid">
          {Object.keys(grouped).map(type => (
            <div key={type} className="contact-category-group">
              <h3 className="contact-category-title">{type}</h3>
              <div className="contact-cards">
                {grouped[type].map(contact => (
                  <div key={contact.id} className="contact-card">
                    <div className="contact-card-header">
                      <div>
                        <h4>{contact.name}</h4>
                        <p className="contact-role">
                          {contact.role ? contact.role : ''} 
                          {contact.company ? ` • ${contact.company}` : ''}
                        </p>
                      </div>
                      <button className="btn-icon danger" onClick={() => handleDelete(contact.id)}><Trash2 size={14} /></button>
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
          ))}
        </div>
      )}
    </div>
  );
}