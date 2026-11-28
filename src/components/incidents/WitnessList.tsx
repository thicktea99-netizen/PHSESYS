// src/components/incidents/WitnessList.tsx
import { Plus, Trash2 } from 'lucide-react';

export interface Witness {
  id: number;
  name: string;
  contact: string;
  statement: string;
}

interface WitnessListProps {
  witnesses: Witness[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onUpdate: (id: number, field: keyof Witness, value: string) => void;
}

export default function WitnessList({ witnesses, onAdd, onRemove, onUpdate }: WitnessListProps) {
  return (
    <div className="witness-container">
      <div className="witness-header">
        <h4>Witnesses</h4>
        <button type="button" onClick={onAdd} className="btn-secondary btn-small">
          <Plus size={14} /> Add Witness
        </button>
      </div>

      {witnesses.length === 0 && <p className="no-witnesses">No witnesses added yet.</p>}

      {witnesses.map((witness) => (
        <div key={witness.id} className="witness-row">
          <input
            type="text"
            className="form-input"
            placeholder="Name"
            value={witness.name}
            onChange={(e) => onUpdate(witness.id, 'name', e.target.value)}
          />
          <input
            type="tel"
            className="form-input"
            placeholder="10-digit Contact"
            value={witness.contact}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              if (val.length <= 10) onUpdate(witness.id, 'contact', val);
            }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Brief statement"
            value={witness.statement}
            onChange={(e) => onUpdate(witness.id, 'statement', e.target.value)}
          />
          <button type="button" onClick={() => onRemove(witness.id)} className="btn-icon danger">
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}