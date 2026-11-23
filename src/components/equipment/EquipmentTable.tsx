// src/components/equipment/EquipmentTable.tsx
import { Trash2, ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Equipment {
  id: string;
  equipment_number: number;
  name: string;
  type: string;
  site: string;
  status: string;
  assigned_to_name: string;
  next_inspection_due: string;
}

interface EquipmentTableProps {
  equipment: Equipment[];
  loading: boolean;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

const getInspectionStatus = (dueDate: string) => {
  if (!dueDate) return { label: 'No Date', color: 'severity-low' };
  const today = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: 'Overdue', color: 'severity-critical' };
  if (diffDays <= 7) return { label: 'Due Soon', color: 'severity-high' };
  return { label: 'Current', color: 'severity-low' };
};

export default function EquipmentTable({ equipment, loading, onStatusChange, onDelete }: EquipmentTableProps) {
  const navigate = useNavigate();

  const handleLogInspection = (equipName: string, siteName: string) => {
    navigate(`/inspections/new?equipment=${encodeURIComponent(equipName)}&site=${encodeURIComponent(siteName)}`);
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>Site</th>
            <th>Assigned To</th>
            <th>Next Inspection</th>
            <th>Status</th>
            <th style={{ width: '100px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={8} className="table-message">Loading equipment...</td></tr>
          ) : equipment.length === 0 ? (
            <tr><td colSpan={8} className="table-message">No equipment found.</td></tr>
          ) : (
            equipment.map((item) => {
              const inspStatus = getInspectionStatus(item.next_inspection_due);
              return (
                <tr key={item.id} className="clickable-row" onClick={() => window.location.href = `/equipment/${item.id}`}
                >
                  <td className="font-medium">EQP-{String(item.equipment_number).padStart(4, '0')}</td>
                  <td>{item.name}</td>
                  <td>{item.type}</td>
                  <td>{item.site || '-'}</td>
                  <td>{item.assigned_to_name || '-'}</td>
                  <td>
                    {item.next_inspection_due ? (
                      <div>
                        <div>{new Date(item.next_inspection_due).toLocaleDateString()}</div>
                        <span className={`badge ${inspStatus.color}`} style={{ fontSize: '0.6rem' }}>{inspStatus.label}</span>
                      </div>
                    ) : '-'}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select 
                      value={item.status} 
                      onChange={(e) => onStatusChange(item.id, e.target.value)} 
                      className={`table-select status-${item.status.toLowerCase().replace(' ', '-')}`}
                    >
                      <option value="In Service">In Service</option>
                      <option value="Damaged">Damaged</option>
                      <option value="Under Repair">Under Repair</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn-icon" 
                      title="Log Inspection" 
                      onClick={() => handleLogInspection(item.name, item.site)} 
                      style={{ color: 'var(--primary)' }}
                    >
                      <ClipboardCheck size={16} />
                    </button>
                    <button className="btn-icon danger" onClick={() => onDelete(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}