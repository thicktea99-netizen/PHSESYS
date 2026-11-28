// src/components/incidents/VictimList.tsx
import { Plus, Trash2 } from 'lucide-react';

export interface Victim {
  id: number;
  name: string;
  role: string;
  contact: string;
}

interface VictimListProps {
  victims: Victim[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onUpdate: (id: number, field: keyof Victim, value: string) => void;
}

export default function VictimList({ victims, onAdd, onRemove, onUpdate }: VictimListProps) {
  return (
    <div className="findings-container mt-16">
      <div className="findings-header">
        <div>
          <h3>Victim Details</h3>
          <p>Record each person involved in the incident.</p>
        </div>
        <button type="button" onClick={onAdd} className="btn-secondary btn-small">
          <Plus size={14} /> Add Victim
        </button>
      </div>

      {victims.length === 0 && <p className="no-findings">No victims added yet.</p>}

      {victims.map((victim) => (
        <div key={victim.id} className="witness-row" style={{ gridTemplateColumns: '2fr 2fr 2fr auto' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Name"
            value={victim.name}
            onChange={(e) => onUpdate(victim.id, 'name', e.target.value)}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Role / Company"
            value={victim.role}
            onChange={(e) => onUpdate(victim.id, 'role', e.target.value)}
          />
          <input
            type="tel"
            className="form-input"
            placeholder="10-digit Contact"
            value={victim.contact}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              if (val.length <= 10) onUpdate(victim.id, 'contact', val);
            }}
          />
          <button type="button" onClick={() => onRemove(victim.id)} className="btn-icon danger">
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}