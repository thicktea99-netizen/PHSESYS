// src/components/ManHoursChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/Charts.css';

// Mock data for now
const data = [
  { month: 'May', totalHours: 4000, safeHours: 4000 },
  { month: 'Jun', totalHours: 5000, safeHours: 4980 },
  { month: 'Jul', totalHours: 4800, safeHours: 4800 },
  { month: 'Aug', totalHours: 5500, safeHours: 5500 },
  { month: 'Sep', totalHours: 6000, safeHours: 5950 },
  { month: 'Oct', totalHours: 6200, safeHours: 6200 },
];

export default function ManHoursChart() {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Man-Hours Trend</h3>
        <span className="chart-subtitle">Last 6 Months</span>
      </div>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="totalHours" name="Total Hours" fill="#93c5fd" radius={[4, 4, 0, 0]} />
            <Bar dataKey="safeHours" name="Safe Hours" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}