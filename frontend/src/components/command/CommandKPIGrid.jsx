import React from 'react';
import { 
  ShieldCheck, 
  Droplets, 
  Ship, 
  Award, 
  MapPin, 
  ArrowUpRight 
} from 'lucide-react';

export default function CommandKPIGrid({
  spillData,
  originData,
  candidateVessels,
  onOpenInvestigation,
  onOpenOrigin
}) {
  const topCandidate = candidateVessels && candidateVessels.length > 0 ? candidateVessels[0] : null;
  const detectionScore = spillData?.confidence ? (spillData.confidence * 100).toFixed(1) : '94.2';
  const spillArea = spillData?.area_km2 || '14.85';
  const topScore = topCandidate?.scores?.total_score || '87';
  const topName = topCandidate?.vessel_name?.replace(' - DEMO', '') || 'MT Ocean Pioneer';
  const uncertainty = originData?.origin_uncertainty_km ? `±${originData.origin_uncertainty_km} km` : '±3.5 km';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
      gap: '0.75rem'
    }}>
      {/* KPI 1: Detection Score */}
      <div style={{
        backgroundColor: '#0c1322',
        border: '1px solid #1e293b',
        borderLeft: '4px solid #10b981',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            DETECTION SCORE
          </span>
          <ShieldCheck size={16} color="#10b981" />
        </div>
        <div style={{ margin: '0.35rem 0' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
            {detectionScore}%
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
            Prototype Detection
          </div>
        </div>
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: '#1e293b',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${detectionScore}%`,
            height: '100%',
            backgroundColor: '#10b981'
          }} />
        </div>
      </div>

      {/* KPI 2: Spill Area */}
      <div style={{
        backgroundColor: '#0c1322',
        border: '1px solid #1e293b',
        borderLeft: '4px solid #ef4444',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            SPILL AREA
          </span>
          <Droplets size={16} color="#ef4444" />
        </div>
        <div style={{ margin: '0.35rem 0' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f8fafc', lineHeight: 1 }}>
            {spillArea} <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>km²</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
            Demo Estimate
          </div>
        </div>
        <div style={{
          fontSize: '0.68rem',
          color: '#ef4444',
          fontFamily: 'monospace',
          fontWeight: 700
        }}>
          ● SAR Radar Anomaly
        </div>
      </div>

      {/* KPI 3: Candidate Vessels */}
      <div style={{
        backgroundColor: '#0c1322',
        border: '1px solid #1e293b',
        borderLeft: '4px solid #38bdf8',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            CANDIDATE VESSELS
          </span>
          <Ship size={16} color="#38bdf8" />
        </div>
        <div style={{ margin: '0.35rem 0' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#38bdf8', lineHeight: 1 }}>
            {candidateVessels?.length || 5}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
            AIS Correlated
          </div>
        </div>
        <div style={{
          fontSize: '0.68rem',
          color: '#94a3b8',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>Corridor Filtered</span>
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>105 Pings</span>
        </div>
      </div>

      {/* KPI 4: Top Candidate */}
      <div 
        onClick={onOpenInvestigation}
        style={{
          backgroundColor: '#0c1322',
          border: '1px solid #0284c7',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: '0 0 16px rgba(56, 189, 248, 0.15)',
          transition: 'all 0.15s ease'
        }}
        title="Click to view full investigation breakdown"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            TOP CANDIDATE
          </span>
          <Award size={16} color="#38bdf8" />
        </div>
        <div style={{ margin: '0.35rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#38bdf8', lineHeight: 1, fontFamily: 'monospace' }}>
              {topScore}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/100</span>
          </div>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '0.2rem' }}>
            {topName}
          </div>
        </div>
        <div style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <span>Source-Likelihood</span>
          <ArrowUpRight size={12} />
        </div>
      </div>

      {/* KPI 5: Probable Origin */}
      <div 
        onClick={onOpenOrigin}
        style={{
          backgroundColor: '#0c1322',
          border: '1px solid #1e293b',
          borderLeft: '4px solid #f59e0b',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}
        title="Click to view drift prediction"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            PROBABLE ORIGIN
          </span>
          <MapPin size={16} color="#f59e0b" />
        </div>
        <div style={{ margin: '0.35rem 0' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fbbf24', lineHeight: 1.1 }}>
            ESTIMATED
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
            Simplified Drift Analysis
          </div>
        </div>
        <div style={{
          fontSize: '0.68rem',
          color: '#fbbf24',
          fontFamily: 'monospace',
          fontWeight: 700
        }}>
          Envelope: {uncertainty}
        </div>
      </div>
    </div>
  );
}
