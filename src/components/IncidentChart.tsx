// src/components/IncidentChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import '../styles/Charts.css';

export default function IncidentChart({ data }: { data: any[] }) {
  const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#ec4899', '#06b6d4'];

  // Helper to shorten long labels
  const shortenLabel = (label: string) => {
    if (label.length > 12) {
      return label.substring(0, 10) + '...';
    }
    return label;
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Incident Breakdown</h3>
        <span className="chart-subtitle">This Period</span>
      </div>
      <div style={{ width: '100%', height: 280 }}>
        {data.length === 0 ? (
          <p style={{ textAlign: 'center', paddingTop: '100px', color: 'var(--text-muted)' }}>No incidents recorded.</p>
        ) : (
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#6b7280' }} 
                tickFormatter={shortenLabel}
                interval={0}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                formatter={(value:any) => [`${value}`,'Count']}
                
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}