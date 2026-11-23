// src/components/report/ReportHeader.tsx

interface ReportHeaderProps {
  companyProfile: {
    company_name?: string;
    address?: string;
    phone?: string;
    email?: string;
    logo_url?: string;
    officer_name?: string;
    officer_role?: string;
  };
  reportNumber: string;
  startDate: string;
  endDate: string;
  selectedSite: string;
}

export default function ReportHeader({ companyProfile, reportNumber, startDate, endDate, selectedSite }: ReportHeaderProps) {
  return (
    <div className="report-header">
      <div className="report-brand">
        {companyProfile.logo_url && (
          <img src={companyProfile.logo_url} alt="Logo" style={{ maxHeight: '60px', marginBottom: '8px' }} />
        )}
        <h1>{companyProfile.company_name || 'Company Name'}</h1>
        <p>{companyProfile.address || ''}</p>
        <p>{companyProfile.phone || ''} | {companyProfile.email || ''}</p>
      </div>
      <div className="report-meta">
        <h2>HSE Report</h2>
        <p><strong>Report No:</strong> {reportNumber}</p>
        <p><strong>Period:</strong> {startDate} to {endDate}</p>
        <p><strong>Site:</strong> {selectedSite}</p>
        <p><strong>Prepared By:</strong> {companyProfile.officer_name || 'HSE Officer'}</p>
        <p><strong>Role:</strong> {companyProfile.officer_role || 'HSE Manager'}</p>
      </div>
    </div>
  );
}