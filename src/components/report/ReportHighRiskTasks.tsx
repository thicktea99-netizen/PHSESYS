// src/components/report/ReportHighRiskTasks.tsx

interface HighRiskTask {
  permitType: string;
  activity: string;
  site: string;
  controlsVerified: string;
  status: string;
}

interface ReportHighRiskTasksProps {
  tasks: HighRiskTask[];
}

export default function ReportHighRiskTasks({ tasks }: ReportHighRiskTasksProps) {
  return (
    <div className="report-section">
      <h3>High-Risk Tasks (Active Permits)</h3>
      {tasks.length === 0 ? (
        <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>No active high-risk permits for this period.</p>
      ) : (
        <table className="report-table">
          <thead>
            <tr>
              <th>Permit Type</th>
              <th>Activity</th>
              <th>Site</th>
              <th>Verified Controls</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => (
              <tr key={index}>
                <td>{task.permitType}</td>
                <td>{task.activity}</td>
                <td>{task.site}</td>
                <td>{task.controlsVerified}</td>
                <td>{task.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}