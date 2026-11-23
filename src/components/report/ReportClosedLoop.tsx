// src/components/report/ReportClosedLoop.tsx

interface ClosedLoopItem {
  date: string;
  issue: string;
  location: string;
  rootCause: string;
  correctiveAction: string;
  owner: string;
  dueDate: string;
  status: string;
}

interface ReportClosedLoopProps {
  items: ClosedLoopItem[];
}

export default function ReportClosedLoop({ items }: ReportClosedLoopProps) {
  return (
    <div className="report-section">
      <h3>Closed-Loop (Open Items)</h3>
      {items.length === 0 ? (
        <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>✅ No open items. Everything is closed!</p>
      ) : (
        <table className="report-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Issue</th>
              <th>Location</th>
              <th>Root Cause</th>
              <th>Corrective Action</th>
              <th>Owner</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.date}</td>
                <td>{item.issue}</td>
                <td>{item.location}</td>
                <td>{item.rootCause}</td>
                <td>{item.correctiveAction}</td>
                <td>{item.owner}</td>
                <td>{item.dueDate}</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}