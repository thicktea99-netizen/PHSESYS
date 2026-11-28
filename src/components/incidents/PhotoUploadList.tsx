// src/components/incidents/PhotoUploadList.tsx
import { Plus, Trash2, Paperclip } from 'lucide-react';

export type PhotoFile = {
  id: number;
  file: File | null;
  caption: string;
  previewUrl?: string;
};

interface PhotoUploadListProps {
  photos: PhotoFile[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onUpdate: (id: number, field: keyof PhotoFile, value: any) => void;
}

export default function PhotoUploadList({ photos, onAdd, onRemove, onUpdate }: PhotoUploadListProps) {
  return (
    <div className="findings-container mt-16">
      <div className="findings-header">
        <div>
          <h3>Photos / Evidence</h3>
          <p>You can upload multiple photos to support this incident.</p>
        </div>
        <button type="button" onClick={onAdd} className="btn-secondary btn-small">
          <Plus size={14} /> Add Photo
        </button>
      </div>

      {photos.length === 0 && <p className="no-findings">No photos added yet.</p>}

      {photos.map((photo) => (
        <div key={photo.id} className="photo-upload-row">
          <div className="form-group" style={{ flex: 1 }}>
            <input
              type="file"
              id={`photo-${photo.id}`}
              className="hidden-input"
              onChange={(e) => {
                const file = e.target.files ? e.target.files[0] : null;
                onUpdate(photo.id, 'file', file);
              }}
            />
            <label htmlFor={`photo-${photo.id}`} className="file-upload-label">
              <Paperclip size={14} /> {photo.file ? photo.file.name : "Select Photo"}
            </label>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Caption (optional)"
              value={photo.caption}
              onChange={(e) => onUpdate(photo.id, 'caption', e.target.value)}
            />
          </div>
          <button type="button" onClick={() => onRemove(photo.id)} className="btn-icon danger">
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}