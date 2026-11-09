// src/components/StatCard.tsx
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import '../styles/StatCard.css';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  // We add a "type" to color-code the card (e.g., Incidents are red, CAPA is green)
  variant?: 'default' | 'danger' | 'success'; 
}

export default function StatCard({ 
  title, 
  value, 
  trend, 
  trendValue, 
  variant = 'default' 
}: StatCardProps) {
  
  // Helper to render the correct arrow icon
  const renderTrendIcon = () => {
    if (trend === 'up') return <ArrowUp size={16} className="trend-up" />;
    if (trend === 'down') return <ArrowDown size={16} className="trend-down" />;
    if (trend === 'flat') return <Minus size={16} className="trend-flat" />;
    return null;
  };

  return (
    <div className={`stat-card variant-${variant}`}>
      <h3 className="stat-title">{title}</h3>
      <div className="stat-value">{value}</div>
      
      {trend && trendValue && (
        <div className="stat-trend">
          {renderTrendIcon()}
          <span>{trendValue} vs Last Week</span>
        </div>
      )}
    </div>
  );
}