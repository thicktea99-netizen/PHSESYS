// src/components/IncidentChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import '../styles/Charts.css';

// Mock data for now (we will connect this to Supabase later)
const data = [
  { name: 'Near Miss', count: 2, color: '#3b82f6' },
  { name: 'First Aid', count: 1, color: '#f59e0b' },
  { name: 'LTI', count: 0, color: '#ef4444' },
  { name: 'Property Damage', count: 1, color: '#8b5cf6' },
  { name: 'Environmental', count: 0, color: '#10b981' },
];

export default function IncidentChart() {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Incident Breakdown</h3>
        <span className="chart-subtitle">This Week</span>
      </div>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
            <Tooltip 
              cursor={{ fill: 'transparent' }} 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}