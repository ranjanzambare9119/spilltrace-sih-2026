import React from 'react';
import { 
  Shield, 
  Satellite, 
  Compass, 
  Ship, 
  Search, 
  LayoutDashboard, 
  Play, 
  X,
  CheckCircle2, 
  AlertCircle,
  Bell
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  onLoadDemo,
  onExitDemo,
  onStartDemo, 
  isDemoActive = false,
  backendStatus = true,
  isLeakConfirmed = false,
  investigationState = 'CANDIDATE',
  notificationsCount = 0
}) {
  const tabs = [
    { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
    { id: 'satellite', label: '2. Satellite Analysis', icon: Satellite },
    { id: 'origin', label: '3. Origin Analysis', icon: Compass },
    { id: 'vessels', label: '4. Vessel Correlation', icon: Ship },
    { id: 'investigation', label: '5. Investigation', icon: Search },
    { id: 'notifications', label: '6. Notifications', icon: Bell, count: notificationsCount }
  ];

  return (
    <header style={{
      backgroundColor: '#0a1120',
      borderBottom: '1px solid #1e293b',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 4px 16px rgba(0,0,0,0.6)'
    }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.45rem 1.2rem',
        borderBottom: '1px solid #14223f'
      }}>
        {/* Brand & Context */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            padding: '0.35rem 0.5rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 10px rgba(56, 189, 248, 0.35)'
          }}>
            <Shield size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                fontSize: '1.15rem',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, #ffffff, #93c5fd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textTransform: 'uppercase'
              }}>
                SpillTrace
              </span>
              <span className="badge-tag badge-cyan" style={{ fontSize: '0.65rem' }}>SIH 2026 PS-143</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontWeight: 700, color: '#cbd5e1' }}>AI-Assisted Maritime Oil Spill Attribution</span>
              <span style={{ color: '#475569' }}>•</span>
              <span style={{ color: '#38bdf8' }}>Satellite + Drift + AIS Decision Support</span>
            </div>
          </div>
        </div>

        {/* Center/Right: Realistic Operational Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* TIER-2 ACTIVE Escalation Badge */}
          {isLeakConfirmed && (
            <span style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              fontSize: '0.66rem',
              fontWeight: 800,
              padding: '0.2rem 0.55rem',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              letterSpacing: '0.04em'
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                boxShadow: '0 0 6px #ef4444'
              }}></span>
              TIER-2 RESPONSE ACTIVE • {investigationState || 'SOURCE VERIFIED — DEMO'}
            </span>
          )}

          {/* DATA MODE Indicator (Requirement 4 & 24) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.68rem',
            padding: '0.2rem 0.55rem',
            borderRadius: '4px',
            fontWeight: 700,
            backgroundColor: isDemoActive ? 'rgba(245, 158, 11, 0.12)' : '#0d1526',
            border: isDemoActive ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid #1e293b',
            color: isDemoActive ? '#fbbf24' : '#94a3b8'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isDemoActive ? '#f59e0b' : '#64748b',
              boxShadow: isDemoActive ? '0 0 6px #f59e0b' : 'none'
            }}></span>
            <span>DATA MODE: {isDemoActive ? 'DEMO SCENARIO (SIMULATED)' : 'NO LIVE FEED'}</span>
          </div>

          {/* SYSTEM ONLINE Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.68rem',
            color: backendStatus ? '#34d399' : '#f87171',
            backgroundColor: backendStatus ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${backendStatus ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.3)'}`,
            padding: '0.2rem 0.55rem',
            borderRadius: '4px',
            fontWeight: 700
          }}>
            <span style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: backendStatus ? '#10b981' : '#ef4444',
              boxShadow: backendStatus ? '0 0 5px #10b981' : 'none'
            }}></span>
            <span>{backendStatus ? 'SYSTEM ONLINE' : 'CONNECTING...'}</span>
          </div>

          {/* LOAD DEMO SCENARIO / EXIT DEMO Button */}
          {!isDemoActive ? (
            <button 
              onClick={() => {
                if (onLoadDemo) onLoadDemo();
                else if (onStartDemo) onStartDemo();
              }}
              className="btn-primary"
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.74rem',
                fontWeight: 800,
                borderRadius: '5px',
                gap: '0.4rem',
                cursor: 'pointer'
              }}
              title="Activate synthetic SIH demonstration scenario"
            >
              <Play size={12} fill="#ffffff" />
              <span>LOAD DEMO SCENARIO</span>
            </button>
          ) : (
            <button
              onClick={onExitDemo}
              style={{
                background: '#162033',
                color: '#cbd5e1',
                border: '1px solid #334155',
                padding: '0.35rem 0.75rem',
                borderRadius: '5px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease'
              }}
              title="Exit demo and return to clean monitoring state"
            >
              <X size={12} color="#94a3b8" />
              <span>EXIT DEMO</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.2rem',
        background: '#070b14',
        overflowX: 'auto'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 0.9rem',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #38bdf8' : '2px solid transparent',
                color: isActive ? '#38bdf8' : '#94a3b8',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.78rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={14} color={isActive ? '#38bdf8' : '#64748b'} />
              <span>{tab.label}</span>
              {Boolean(tab.count) && (
                <span style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '0.05rem 0.38rem',
                  borderRadius: '10px',
                  lineHeight: '1.2',
                  boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
