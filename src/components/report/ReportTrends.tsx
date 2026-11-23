// src/components/report/ReportTrends.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, LabelList } from 'recharts';

interface TrendData {
  month: string;
  value: number;
}

interface ReportTrendsProps {
  ltifrData: TrendData[];
  incidentsData: TrendData[];
}

export default function ReportTrends({ ltifrData, incidentsData }: ReportTrendsProps) {
  return (
    <div className="report-section">
      <h3>Trends (Last 6 Months)</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* LTIFR Trend - Line Chart */}
        <div>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>LTIFR Trend</h4>
          <div style={{ width: '100%', height: '180px' }}>
            <ResponsiveContainer>
              <LineChart data={ltifrData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }}>
                  <LabelList dataKey="value" position="top" style={{ fontSize: '10px', fontWeight: 600, fill: '#2563eb' }} 
                  />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incidents Trend - Bar Chart */}
        <div>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>Incidents Trend</h4>
          <div style={{ width: '100%', height: '180px' }}>
            <ResponsiveContainer>

              <BarChart data={incidentsData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />

                <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]}
                >
                  <LabelList dataKey="value" position="top" style={{ fontSize: '10px', fontWeight: 600, fill: '#1f2937' }} />
                </Bar>

              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}