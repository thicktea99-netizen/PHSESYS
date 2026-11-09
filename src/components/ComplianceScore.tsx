
// src/components/ComplianceScore.tsx
import '../styles/Charts.css';

export default function ComplianceScore() {
  // Mock score (we will calculate this dynamically later)
  const score = 94;

  return (
    <div className="chart-card" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="chart-header" style={{ width: '100%', justifyContent: 'center' }}>
        <h3>Overall HSE Compliance</h3>
      </div>
      
      {/* A CSS-based circular progress indicator */}
      <div style={{
        width: '140px',
        height: '140px',
        borderRadius: '50%',
        background: `conic-gradient(var(--success) ${score * 3.6}deg, #e5e7eb 0deg)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '20px'
      }}>
        {/* Inner white circle to make it a ring */}
        <div style={{
          width: '110px',
          height: '110px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--success)' }}>
            {score}%
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score</span>
        </div>
      </div>
    </div>
  );
}