import React from 'react';
import { 
  Shield, 
  Satellite, 
  Compass, 
  Ship, 
  Search, 
  LayoutDashboard, 
  Play, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  onStartDemo, 
  backendStatus,
  isLeakConfirmed = false,
  investigationState = 'CANDIDATE'
}) {
  const tabs = [
    { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
    { id: 'satellite', label: '2. Satellite Analysis', icon: Satellite },
    { id: 'origin', label: '3. Origin Analysis', icon: Compass },
    { id: 'vessels', label: '4. Vessel Correlation', icon: Ship },
    { id: 'investigation', label: '5. Investigation', icon: Search }
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

        {/* Center/Right: Operational Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* TIER-2 ACTIVE Escalation Badge */}
          {isLeakConfirmed && (
            <span style={{
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '0.2rem 0.6rem',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)',
              letterSpacing: '0.04em'
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                boxShadow: '0 0 8px #ef4444'
              }}></span>
              TIER-2 RESPONSE ACTIVE • {investigationState || 'SOURCE VERIFIED — DEMO'}
            </span>
          )}

          {/* DEMO MODE Badge */}
          <span className="badge-demo" style={{ fontSize: '0.68rem', padding: '0.2rem 0.6rem' }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#f59e0b',
              boxShadow: '0 0 6px #f59e0b'
            }}></span>
            DEMO MODE
          </span>

          {/* SYSTEM ONLINE Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.7rem',
            color: backendStatus ? '#10b981' : '#f87171',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: `1px solid ${backendStatus ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            padding: '0.2rem 0.6rem',
            borderRadius: '4px',
            fontWeight: 700
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: backendStatus ? '#10b981' : '#ef4444',
              boxShadow: backendStatus ? '0 0 6px #10b981' : '0 0 6px #ef4444'
            }}></span>
            <span>{backendStatus ? 'SYSTEM ONLINE' : 'SYSTEM CONNECTING...'}</span>
          </div>

          {/* Quick Demo Flow Trigger */}
          <button 
            onClick={onStartDemo}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: '1px solid #38bdf8',
              borderRadius: '6px',
              padding: '0.38rem 0.9rem',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.35)',
              letterSpacing: '0.04em'
            }}
          >
            <Play size={13} fill="#ffffff" />
          </button>
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
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
