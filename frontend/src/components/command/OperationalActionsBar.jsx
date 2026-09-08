import React from 'react';
import { 
  LifeBuoy, 
  Send, 
  Compass, 
  FileText, 
  CheckCircle2, 
  Radio, 
  AlertTriangle,
  Play
} from 'lucide-react';

export default function OperationalActionsBar({
  responseRequested,
  notificationPrepared,
  onDeployResponse,
  onViewSpread,
  onNotifyAuthorities,
  onEmergencyReport,
  onStartDemo
}) {
  const pipelineStages = [
    { id: 'satellite', label: 'SATELLITE ANALYSIS', status: 'COMPLETE', color: '#10b981' },
    { id: 'detection', label: 'SPILL DETECTION', status: 'COMPLETE', color: '#10b981' },
    { id: 'origin', label: 'ORIGIN ESTIMATION', status: 'COMPLETE', color: '#10b981' },
    { id: 'ais', label: 'AIS CORRELATION', status: 'COMPLETE', color: '#10b981' },
    { id: 'ranking', label: 'SOURCE RANKING', status: 'COMPLETE', color: '#10b981' },
    { id: 'investigation', label: 'INVESTIGATION', status: 'READY', color: '#38bdf8', activeGlow: true }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {/* 1. Action Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.6rem',
        backgroundColor: '#0c1424',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '0.6rem 0.9rem'
      }}>
        {/* Left: Operational Response Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.55rem' }}>
          {/* Action 1: Deploy Response Team */}
          <button
            onClick={onDeployResponse}
            style={{
              backgroundColor: responseRequested ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.18)',
              color: responseRequested ? '#6ee7b7' : '#fca5a5',
              border: `1px solid ${responseRequested ? '#10b981' : '#ef4444'}`,
              borderRadius: '6px',
              padding: '0.48rem 0.9rem',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: responseRequested ? '0 0 12px rgba(16, 185, 129, 0.25)' : '0 0 12px rgba(239, 68, 68, 0.2)',
              transition: 'all 0.15s ease'
            }}
          >
            {responseRequested ? (
              <>
                <CheckCircle2 size={14} color="#10b981" />
                <span>RESPONSE REQUESTED</span>
              </>
            ) : (
              <>
                <LifeBuoy size={14} color="#ef4444" />
                <span>DEPLOY RESPONSE TEAM</span>
              </>
            )}
          </button>

          {/* Action 2: View Spread Prediction */}
          <button
            onClick={onViewSpread}
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.16)',
              color: '#fbbf24',
              border: '1px solid #f59e0b',
              borderRadius: '6px',
              padding: '0.48rem 0.9rem',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 0 12px rgba(245, 158, 11, 0.2)',
              transition: 'all 0.15s ease'
            }}
          >
            <Compass size={14} color="#f59e0b" />
            <span>VIEW SPREAD PREDICTION</span>
          </button>

          {/* Action 3: Notify Authorities */}
          <button
            onClick={onNotifyAuthorities}
            style={{
              backgroundColor: notificationPrepared ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
              color: notificationPrepared ? '#7dd3fc' : '#e2e8f0',
              border: `1px solid ${notificationPrepared ? '#38bdf8' : '#334155'}`,
              borderRadius: '6px',
              padding: '0.48rem 0.9rem',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            {notificationPrepared ? (
              <>
                <CheckCircle2 size={14} color="#38bdf8" />
                <span>NOTIFICATION PREPARED</span>
              </>
            ) : (
              <>
                <Send size={14} color="#38bdf8" />
                <span>NOTIFY AUTHORITIES</span>
              </>
            )}
          </button>

          {/* Action 4: Emergency Report */}
          <button
            onClick={onEmergencyReport}
            style={{
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid #475569',
              borderRadius: '6px',
              padding: '0.48rem 0.9rem',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            <FileText size={14} color="#38bdf8" />
            <span>EMERGENCY REPORT</span>
          </button>
        </div>

        {/* Right: Guided 2-Min Demo Button */}
        {onStartDemo && (
          <button
            onClick={onStartDemo}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: '1px solid #38bdf8',
              borderRadius: '6px',
              padding: '0.48rem 1.05rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.35)',
              letterSpacing: '0.04em'
            }}
          >
            <Play size={13} fill="#ffffff" />
            <span>RUN 2-MIN DEMO</span>
          </button>
        )}
      </div>

      {/* 2. Incident Command Status Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.5rem',
        backgroundColor: '#090f1b',
        border: '1px solid #1e293b',
        borderRadius: '6px',
        padding: '0.45rem 0.8rem'
      }}>
        {pipelineStages.map((stage) => (
          <div
            key={stage.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.25rem 0.4rem',
              borderRadius: '4px',
              backgroundColor: stage.activeGlow ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
              border: stage.activeGlow ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
              boxShadow: stage.activeGlow ? '0 0 10px rgba(56, 189, 248, 0.2)' : 'none'
            }}
          >
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: stage.color,
              boxShadow: `0 0 6px ${stage.color}`,
              flexShrink: 0
            }} />
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.03em' }}>
                {stage.label}
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, color: stage.color, fontFamily: 'monospace' }}>
                {stage.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
