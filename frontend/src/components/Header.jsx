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
  backendStatus 
}) {
  const tabs = [
    { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
    { id: 'satellite', label: '2. Satellite', icon: Satellite },
    { id: 'origin', label: '3. Origin', icon: Compass },
    { id: 'vessels', label: '4. Vessels', icon: Ship },
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
          </div>
        </div>

        {/* Center: Clear Prototype & Disclaimer Warning */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <span className="badge-demo" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#f59e0b',
              boxShadow: '0 0 6px #f59e0b'
            }}></span>
            PROTOTYPE / DEMO DATA
          </span>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.7rem',
            color: '#64748b',
            borderLeft: '1px solid #1e293b',
            paddingLeft: '0.6rem'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: backendStatus ? '#10b981' : '#ef4444'
            }}></span>
            <span>{backendStatus ? 'API Online' : 'Connecting...'}</span>
          </div>
        </div>

        {/* Right: Quick Demo Flow Trigger */}
        <div>
          <button 
            onClick={onStartDemo}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: '1px solid #38bdf8',
              borderRadius: '6px',
              padding: '0.4rem 0.95rem',
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
            <span>RUN 2-MIN DEMO</span>
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
