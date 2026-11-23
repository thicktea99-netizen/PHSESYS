// src/components/report/ReportSignOff.tsx

interface ReportSignOffProps {
  reviewedBy: string;
  reviewedByRole: string;
  reviewedDate: string;
  approvedBy: string;
  approvedByRole: string;
  approvedDate: string;
}

export default function ReportSignOff({
  reviewedBy, reviewedByRole, reviewedDate,
  approvedBy, approvedByRole, approvedDate
}: ReportSignOffProps) {
  return (
    <div className="report-section">
      <h3>Sign-Off</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>Reviewed By:</h4>
          <p style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Name: {reviewedBy || '_________________'}</p>
          <p style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Role: {reviewedByRole || '_________________'}</p>
          <p style={{ fontSize: '0.8rem' }}>Date: {reviewedDate || '_________________'}</p>
          <p style={{ fontSize: '0.8rem' }}>Signature: _________________</p>
        </div>
        <div>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>Approved By:</h4>
          <p style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Name: {approvedBy || '_________________'}</p>
          <p style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Role: {approvedByRole || '_________________'}</p>
          <p style={{ fontSize: '0.8rem' }}>Date: {approvedDate || '_________________'}</p>

          <p style={{ fontSize: '0.8rem' }}>Signature: _________________</p>
        </div>
      </div>
    </div>
  );
}