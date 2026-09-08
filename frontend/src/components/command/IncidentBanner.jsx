import React from 'react';
import { 
  AlertOctagon, 
  Droplets, 
  ShieldCheck, 
  MapPin, 
  Ship, 
  Clock, 
  Radio,
  ExternalLink 
} from 'lucide-react';

export default function IncidentBanner({
  spillData,
  originData,
  candidateVessels,
  onOpenInvestigation
}) {
  const topCandidate = candidateVessels && candidateVessels.length > 0 ? candidateVessels[0] : null;
  const detectionScore = spillData?.confidence ? (spillData.confidence * 100).toFixed(1) : '94.2';
  const spillArea = spillData?.area_km2 || '14.85';
  const topScore = topCandidate?.scores?.total_score || '87';
  const topName = topCandidate?.vessel_name?.replace(' - DEMO', '') || 'MT Ocean Pioneer';

  return (
    <div style={{
      backgroundColor: '#0c1322',
      border: '1px solid #dc2626',
      borderLeft: '6px solid #ef4444',
      borderRadius: '8px',
      padding: '0.85rem 1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.65rem',
      boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Subtle Radar Scan Effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '280px',
        background: 'radial-gradient(circle at 90% 50%, rgba(239, 68, 68, 0.08), transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Top Strip: Incident Classification & Status Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.6rem'
      }}>
        {/* Left: Critical Incident Indicator & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            borderRadius: '4px',
            padding: '0.2rem 0.55rem'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              boxShadow: '0 0 8px #ef4444',
              display: 'inline-block'
            }} className="pulsing-spill-marker" />
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 900,
              color: '#fca5a5',
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              CRITICAL INCIDENT ALERT
            </span>
          </div>

          <h1 style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            color: '#f8fafc',
            letterSpacing: '0.01em',
            margin: 0
          }}>
            POSSIBLE OIL SPILL DETECTED — ARABIAN SEA
          </h1>

          <span style={{
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            color: '#38bdf8',
            fontSize: '0.65rem',
            fontWeight: 800,
            padding: '0.15rem 0.45rem',
            borderRadius: '4px',
            fontFamily: 'monospace'
          }}>
            MUMBAI APPROACHES
          </span>
        </div>

        {/* Right: Operational Badges & Disclaimers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{
            backgroundColor: 'rgba(245, 158, 11, 0.14)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#fbbf24',
            fontSize: '0.66rem',
            fontWeight: 700,
            padding: '0.2rem 0.6rem',
            borderRadius: '4px',
            letterSpacing: '0.04em'
          }}>
            SYNTHETIC DEMO SCENARIO
          </span>

          <span style={{
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#6ee7b7',
            fontSize: '0.66rem',
            fontWeight: 700,
            padding: '0.2rem 0.6rem',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <Radio size={12} color="#10b981" />
            ANALYSIS ACTIVE
          </span>
        </div>
      </div>

      {/* Bottom Compact Metrics Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.75rem',
        paddingTop: '0.5rem',
        borderTop: '1px solid rgba(239, 68, 68, 0.25)'
      }}>
        {/* Metric 1: Incident ID */}
        <div>
          <div style={{ fontSize: '0.64rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Incident ID
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f1f5f9', fontFamily: 'monospace' }}>
            ST-2026-DEMO-001
          </div>
          <div style={{ fontSize: '0.62rem', color: '#64748b' }}>
            Detected: 06:00 UTC
          </div>
        </div>

        {/* Metric 2: Detection Score */}
        <div>
          <div style={{ fontSize: '0.64rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Detection Score
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#10b981' }}>
            {detectionScore}%
          </div>
          <div style={{ fontSize: '0.62rem', color: '#64748b' }}>
            Sentinel-1 SAR C-Band
          </div>
        </div>

        {/* Metric 3: Estimated Spill Area */}
        <div>
          <div style={{ fontSize: '0.64rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Estimated Spill Area
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#ef4444' }}>
            {spillArea} <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>km²</span>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#64748b' }}>
            Prototype Segmentation
          </div>
        </div>

        {/* Metric 4: Probable Origin */}
        <div>
          <div style={{ fontSize: '0.64rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Probable Origin
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#fbbf24' }}>
            ESTIMATED
          </div>
          <div style={{ fontSize: '0.62rem', color: '#64748b' }}>
            ±3.5 km uncertainty
          </div>
        </div>

        {/* Metric 5: Candidate Vessels */}
        <div>
          <div style={{ fontSize: '0.64rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Candidate Vessels
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#38bdf8' }}>
            {candidateVessels?.length || 5} Vessels
          </div>
          <div style={{ fontSize: '0.62rem', color: '#64748b' }}>
            AIS corridor correlated
          </div>
        </div>

        {/* Metric 6: Top Source-Likelihood */}
        <div 
          onClick={onOpenInvestigation}
          style={{ cursor: 'pointer' }}
          title="Click to view detailed attribution"
        >
          <div style={{ fontSize: '0.64rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>Top Candidate</span>
            <ExternalLink size={10} />
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#38bdf8' }}>
            {topScore}<span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>/100</span>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            #{topCandidate?.rank || 1} {topName}
          </div>
        </div>
      </div>
    </div>
  );
}
