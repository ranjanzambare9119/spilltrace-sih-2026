import React from 'react';
import { 
  Play, 
  Droplets, 
  ShieldCheck, 
  MapPin, 
  Award, 
  ArrowRight,
  Compass,
  Ship,
  Satellite,
  Search,
  ExternalLink
} from 'lucide-react';
import MaritimeMap from './MaritimeMap';

export default function DashboardView({
  spillData,
  originData,
  candidateVessels,
  selectedVessel,
  onSelectVessel,
  onNavigateTab,
  onStartDemo
}) {
  const topCandidate = candidateVessels && candidateVessels.length > 0 ? candidateVessels[0] : null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.65rem',
      padding: '0.65rem 1.2rem',
      height: 'calc(100vh - 65px)',
      maxHeight: 'calc(100vh - 65px)',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Top Hero Banner & Decision Pipeline Flow */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0e172a',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '0.6rem 1.2rem',
        flexShrink: 0
      }}>
        {/* Title & Subtitle */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(90deg, #ffffff, #93c5fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textTransform: 'uppercase'
            }}>
              SPILLTRACE
            </h1>
            <span className="badge-demo">PROTOTYPE / DEMO DATA</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.1rem' }}>
            AI-Assisted Maritime Oil Spill Source Attribution
          </p>
        </div>

        {/* Short Visual Flow */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#cbd5e1',
          backgroundColor: '#070b14',
          padding: '0.35rem 0.8rem',
          borderRadius: '20px',
          border: '1px solid #1e293b'
        }}>
          <span style={{ color: '#38bdf8' }}>SATELLITE</span>
          <span style={{ color: '#475569' }}>➔</span>
          <span style={{ color: '#ef4444' }}>SPILL DETECTED</span>
          <span style={{ color: '#475569' }}>➔</span>
          <span style={{ color: '#fbbf24' }}>ORIGIN ESTIMATED</span>
          <span style={{ color: '#475569' }}>➔</span>
          <span style={{ color: '#38bdf8' }}>VESSELS CORRELATED</span>
          <span style={{ color: '#475569' }}>➔</span>
          <span style={{ color: '#10b981' }}>TOP CANDIDATE</span>
        </div>

        {/* Action Buttons: RUN 2-MIN DEMO & EXPLORE SYSTEM */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={onStartDemo}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: '1px solid #38bdf8',
              borderRadius: '6px',
              padding: '0.45rem 1.1rem',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)',
              letterSpacing: '0.04em'
            }}
          >
            <Play size={14} fill="#ffffff" />
            <span>RUN 2-MIN DEMO</span>
          </button>

          <button
            onClick={() => onNavigateTab('satellite')}
            style={{
              background: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '0.45rem 0.9rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            EXPLORE SYSTEM
          </button>
        </div>
      </div>

      {/* 4 Main KPI Cards (Minimal, Clean) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.8rem',
        flexShrink: 0
      }}>
        {/* KPI 1: POSSIBLE SPILL */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderLeft: '4px solid #ef4444',
          borderRadius: '6px',
          padding: '0.6rem 0.9rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Possible Spill
            </span>
            <Droplets size={15} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f1f5f9', marginTop: '0.1rem' }}>
            {spillData ? spillData.area_km2 : '14.8'} <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>km²</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
            Sentinel-1B SAR Anomaly
          </div>
        </div>

        {/* KPI 2: DETECTION SCORE */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderLeft: '4px solid #10b981',
          borderRadius: '6px',
          padding: '0.6rem 0.9rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Detection Score
            </span>
            <ShieldCheck size={15} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#10b981', marginTop: '0.1rem' }}>
            {spillData ? (spillData.confidence * 100).toFixed(0) : '94'}%
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
            AI Segmentation Confidence
          </div>
        </div>

        {/* KPI 3: PROBABLE ORIGIN */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderLeft: '4px solid #f59e0b',
          borderRadius: '6px',
          padding: '0.6rem 0.9rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Probable Origin
            </span>
            <MapPin size={15} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fbbf24', marginTop: '0.1rem' }}>
            ±{originData ? originData.origin_uncertainty_km : '3.5'} <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>km</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
            Dispersion Envelope
          </div>
        </div>

        {/* KPI 4: TOP CANDIDATE */}
        <div 
          onClick={() => {
            if (topCandidate) onSelectVessel(topCandidate);
            onNavigateTab('investigation');
          }}
          style={{
            backgroundColor: '#0e172a',
            border: '1px solid #38bdf8',
            borderRadius: '6px',
            padding: '0.6rem 0.9rem',
            cursor: 'pointer',
            boxShadow: '0 0 12px rgba(56, 189, 248, 0.15)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700 }}>
              Top Candidate
            </span>
            <Award size={15} color="#38bdf8" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.1rem' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace' }}>
              {topCandidate ? topCandidate.scores.total_score : '87'}<span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/100</span>
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
              {topCandidate ? topCandidate.vessel_name.replace(' - DEMO', '') : 'Ocean Pioneer'}
            </span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#38bdf8' }}>
            Source-Likelihood Score &rarr;
          </div>
        </div>
      </div>

      {/* Large Interactive Map Taking ~70% of Screen (No-Scroll 1080p fit) */}
      <div style={{
        flex: 1,
        minHeight: '380px',
        backgroundColor: '#0e172a',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <MaritimeMap 
          spillData={spillData}
          originData={originData}
          candidateVessels={candidateVessels}
          selectedVessel={selectedVessel}
          onSelectVessel={onSelectVessel}
          height="100%"
          autoFit={true}
        />
      </div>
    </div>
  );
}
