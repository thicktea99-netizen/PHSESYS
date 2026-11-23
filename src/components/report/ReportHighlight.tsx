// src/components/report/ReportHighlight.tsx

interface ReportHighlightProps {
  daysWithoutLTI: number | string;
  safeManHours: number;
  safeManHoursTarget: number | string;
}

export default function ReportHighlight({ daysWithoutLTI, safeManHours, safeManHoursTarget }: ReportHighlightProps) {
  return (
    <div className="report-highlight-card">
      <div className="report-highlight-item">
        <span className="highlight-label">Days Without LTI</span>
        <span className="highlight-value" style={{ color: '#10b981' }}>{daysWithoutLTI}</span>
      </div>
      <div className="report-highlight-divider"></div>
      <div className="report-highlight-item">
        <span className="highlight-label">Safe Man-Hours</span>
        <span className="highlight-value" style={{ color: '#2563eb' }}>{safeManHours.toLocaleString()}</span>
        <span className="highlight-target">Target: {safeManHoursTarget}</span>
      </div>
    </div>
  );
}