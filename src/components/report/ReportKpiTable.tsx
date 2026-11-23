// src/components/report/ReportKpiTable.tsx

interface KpiRow {
  indicator: string;
  thisWeek: number | string;
  previousWeek: number | string;
  target: number | string;
  trend: 'up' | 'down' | 'flat' | 'na';
  status: 'on_target' | 'needs_attention' | 'off_target' | 'no_target';
  remark: string;
}

interface ReportKpiTableProps {
  rows: KpiRow[];
  remarks: { [key: string]: string };
  onRemarkChange?: (indicator: string, value: string) => void;
  isEditable?: boolean;
}

const getTrendIcon = (trend: string) => {
  if (trend === 'up') return '↑';
  if (trend === 'down') return '↓';
  if (trend === 'flat') return '→';
  return '—';
};

const getStatusBadge = (status: string) => {
  if (status === 'on_target') return <span className="report-badge green">🟢 On Target</span>;
  if (status === 'needs_attention') return <span className="report-badge yellow">🟡 Needs Attention</span>;
  if (status === 'off_target') return <span className="report-badge red">🔴 Off Target</span>;
  return <span className="report-badge gray">⚪ No Target</span>;
};

export default function ReportKpiTable({ rows, remarks, onRemarkChange, isEditable = true }: ReportKpiTableProps) {
  return (
    <div className="report-section">
      <h3>HSE Performance</h3>
      <table className="report-table">
        <thead>
          <tr>
            <th>Indicator</th>
            <th>This Week</th>
            <th>Previous Week</th>
            <th>Target</th>
            <th>Trend</th>
            <th>Status</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.indicator}>
              <td className="font-medium">{row.indicator}</td>
              <td>{row.thisWeek}</td>
              <td>{row.previousWeek}</td>

              <td>{row.target 
                || '-'}</td>
              <td style={{ textAlign: 'center' }}>{getTrendIcon(row.trend)}</td>
              <td>{getStatusBadge(row.status)}</td>
              <td style={{ fontSize: '0.7rem', color: '#4b5563' }}>
                {isEditable ? (
                  <input
                    type="text"
                    className="report-remark-input"
                    value={remarks[row.indicator] || ''}
                    onChange={(e) => onRemarkChange?.(row.indicator, e.target.value)}
                    placeholder="Add remark..."
                  />
                ) : (
                  remarks[row.indicator] || '-'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}