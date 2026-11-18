// src/components/EmergencyModal.tsx
import { X, Phone, MapPin, Cross, Building2 } from 'lucide-react';
import '../styles/EmergencyModal.css';

interface Contact {
  id: string;
  name: string;
  role: string;
  primary_contact: string;
  service_type: string;
  category: string;
}

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  assemblyPoint?: string;
  hospital?: string;
  hospitalPhone?: string;
  firstAider?: boolean;
}

export default function EmergencyModal({ isOpen, onClose, contacts, assemblyPoint, hospital, hospitalPhone, firstAider }: EmergencyModalProps) {
  if (!isOpen) return null;

  const filteredContacts = contacts.filter(c => c.service_type !== 'Hospital' && c.service_type !== 'General Emergency');

  const grouped: { [key: string]: Contact[] } = {};
  filteredContacts.forEach(c => {
    const type = c.service_type || 'Other';
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(c);
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content emergency-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🚨 Emergency Information</h2>
          <button className="btn-icon" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="modal-body">
          <div className="emergency-key-info">
            <div className="emergency-info-item">
              <MapPin size={20} />
              <div>
                <h4>Assembly Point</h4>
                <p>{assemblyPoint || 'Not specified'}</p>
              </div>
            </div>
            <div className="emergency-info-item">
              <Cross size={20} />
              <div>
                <h4>First Aider on Site</h4>
                <p>{firstAider ? 'Yes' : 'No'}</p>
              </div>
            </div>
            <div className="emergency-info-item">
              <Building2 size={20} />
              <div>
                <h4>Nearest Hospital</h4>
                <p>{hospital || 'Not specified'}</p>
                {hospitalPhone && (
                  <a href={`tel:${hospitalPhone}`} style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                    <Phone size={12} /> {hospitalPhone}
                  </a>
                )}
              </div>
            </div>
          </div>

          {Object.keys(grouped).map(type => (
            <div key={type} style={{ marginBottom: '16px' }}>
              <h3 className="emergency-contacts-title">{type}</h3>
              <div className="emergency-contacts-list">
                {grouped[type].map(contact => (
                  <a key={contact.id} href={`tel:${contact.primary_contact}`} className="emergency-contact-item">
                    <div>
                      <h4>{contact.name}</h4>
                      <p>{contact.role || contact.category}</p>
                    </div>
                    <span className="emergency-phone"><Phone size={16} /> {contact.primary_contact}</span> 
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}