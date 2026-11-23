// src/components/report/ReportPhotos.tsx

interface Photo {
  url: string;
  caption: string;
}

interface ReportPhotosProps {
  photos: Photo[];
}

export default function ReportPhotos({ photos }: ReportPhotosProps) {
  return (
    <div className="report-section">
      <h3>Photo Evidence</h3>
      {photos.length === 0 ? (
        <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>No photos available for this period.</p>
      ) : (
        <div className="report-photos-grid">
          {photos.map((photo, index) => (
            <div key={index} className="report-photo-item">
              <img src={photo.url} alt="Evidence" />
              <p>{photo.caption}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}