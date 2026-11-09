

import {PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend} from 'recharts';

import '../styles/Charts.css';

// Mock data for now
const data = [
  {name: 'Open', value: 3, color: '#ef4444'}, // Red
  {name: 'In Progress', value: 2, color: '#f59e0b'},  // Amber

  {name: 'Overdue', value: 1, color: '#991b1b'}, // Dark red

  {name: 'Closed', value: 1, color: '#10b981'} // Green
];

const total = data.reduce((acc,curr) => acc + curr.value, 0);

export default function CapaChart() {

  return(
    <div className="chart-card">
      <div className="chart-header">
        <h3>CAPA Status</h3>
        <span className="chart-subtitle">{total} Total Actions</span>

      </div>


      {/* Container for the chart with a relative position */}
      <div style={{width: '100%', height: 220, position: 'relative'}}>
        <ResponsiveContainer>
          <PieChart>
            <Pie 
              data={data} 
              cx="50%" 
              cy="50%" 
              innerRadius={60} 
              outerRadius={80} 
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}

            </Pie>

            <Tooltip 
              contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'}}
            />

            <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} 
            />

          </PieChart>
        </ResponsiveContainer>

        {/* Text inside the doughnut */}
        <div 
          style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center'}}
        >
          <span style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'block'}}>
            {total}
          
          </span>
          <br />

          <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>
            Total Actions
          </span>

        </div>
      </div>


       



    </div>
  )
}