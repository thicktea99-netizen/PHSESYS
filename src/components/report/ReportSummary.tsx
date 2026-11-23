// src/components/report/ReportSummary.tsx

interface ReportSummaryProps {
  summaryNote: string;
  isEditable?: boolean;
  onChange?: (value: string) => void;
}

export default function ReportSummary({ summaryNote, isEditable = false, onChange }: ReportSummaryProps) {
  return (
    <div className="report-section">
      <h3>Summary & Recommendations</h3>
      {isEditable ? (
        <textarea
          className="form-input"
          rows={4}
          value={summaryNote}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Enter summary and recommendations..."
        />
      ) : (
        <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>{summaryNote || 'No summary provided.'}</p>
      )}
    </div>
  );
}