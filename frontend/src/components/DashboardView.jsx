import React, { useState } from 'react';
import { 
  Play, 
  Droplets, 
  ShieldCheck, 
  Compass, 
  Ship, 
  Award, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Info, 
  AlertTriangle,
  Layers,
  Clock,
  Radio,
  ShieldAlert,
  UserCheck,
  RefreshCw,
  Send,
  AlertOctagon,
  FileText
} from 'lucide-react';
import MaritimeMap from './MaritimeMap';
import HumanConfirmationModal from './HumanConfirmationModal';
import CandidateVerificationModal from './CandidateVerificationModal';
import { getStaticUrl } from '../api/client';

export default function DashboardView({
  spillData,
  originData,
  forwardDrift,
  atRiskVessels = [],
  recommendedActions = [],
  timelineEvents = [],
  candidateVessels = [],
  selectedVessel,
  onSelectVessel,
  onNavigateTab,
  onStartDemo,
  onSelectScenario,
  onTriggerAction,
  onVerifyCandidate,
  isLeakConfirmed = false,
  investigationState = 'CANDIDATE',
  confirmedSource = null,
  incidentSeverity = 'ACTIVE RESPONSE (CRITICAL)',
  responseDeployment = null,
  navigationalWarning = null
}) {
  const [activeModalAction, setActiveModalAction] = useState(null);
  const [verifyingVessel, setVerifyingVessel] = useState(null);
  const [navWarningBroadcasted, setNavWarningBroadcasted] = useState(false);
  const [responseDispatched, setResponseDispatched] = useState(false);
  const [allNotified, setAllNotified] = useState(false);
  const [showNavDraft, setShowNavDraft] = useState(false);

  // Automatic state propagation: On leak confirmation, all downstream responses execute automatically
  const isNavBroadcasted = isLeakConfirmed || navWarningBroadcasted;
  const isFlotillaDispatched = isLeakConfirmed || responseDispatched;
  const areShipsNotified = isLeakConfirmed || allNotified;

  const topCandidate = candidateVessels && candidateVessels.length > 0 ? candidateVessels[0] : null;

  // Size-aware & confidence-aware evaluation
  const isQuantitative = spillData?.is_quantitative !== undefined 
    ? spillData.is_quantitative 
    : (spillData?.area_km2 ? spillData.area_km2 >= 2.0 && (spillData.confidence || 0.94) >= 0.75 : true);

  const confidencePct = spillData?.confidence !== undefined 
    ? (spillData.confidence * 100).toFixed(1) 
    : '94.2';

  const confidenceClass = spillData?.confidence_class || (parseFloat(confidencePct) >= 80 ? 'HIGH' : (parseFloat(confidencePct) >= 60 ? 'MEDIUM' : 'LOW'));
  const severityClass = isLeakConfirmed ? 'CRITICAL (TIER-2)' : (spillData?.severity_class || (isQuantitative ? 'CRITICAL' : 'WATCHLIST'));
  const appearanceClass = spillData?.appearance_class || 'Thick/dark appearance';
  const isWatchlist = !isLeakConfirmed && (severityClass === 'WATCHLIST' || spillData?.incident_workflow === 'watchlist_monitoring');
  const distanceToCoast = spillData?.distance_to_coast_km !== undefined ? spillData.distance_to_coast_km : 43.2;
  const nearestCoastName = spillData?.nearest_coast_name || 'Colaba Point (Mumbai)';

  // Count vessels with active risk
  const approachingCount = atRiskVessels.filter(v => v.risk_state === 'APPROACHING').length;
  const insideZoneCount = atRiskVessels.filter(v => v.risk_state === 'INSIDE ZONE').length;
  const onRouteCount = atRiskVessels.filter(v => v.risk_state === 'ON ROUTE').length;
  const flaggedRouteVessels = atRiskVessels.filter(v => v.risk_state !== 'OUTSIDE RISK');
  const flaggedTrafficCount = flaggedRouteVessels.length;

  const handleOpenActionModal = (action) => {
    setActiveModalAction(action);
  };

  const handleConfirmAction = async () => {
    if (activeModalAction && onTriggerAction) {
      await onTriggerAction(activeModalAction);
    }
    setActiveModalAction(null);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      padding: '1rem 1.4rem',
      maxWidth: '1720px',
      margin: '0 auto',
      minHeight: 'calc(100vh - 80px)',
      boxSizing: 'border-box'
    }}>
      {/* 1. TOP SITUATION BAR & RAPID ACTION BAR */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0e172a',
        border: '1px solid #1e293b',
        borderRadius: '10px',
        padding: '0.85rem 1.25rem',
        boxShadow: '0 4px 18px rgba(0,0,0,0.5)',
        flexWrap: 'wrap',
        gap: '0.8rem'
      }}>
        {/* Left: Incident Title & Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span className="badge-demo" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }}></span>
              DEMO INCIDENT — MUMBAI APPROACHES
            </span>

            <span style={{
              backgroundColor: isLeakConfirmed 
                ? 'rgba(239, 68, 68, 0.22)' 
                : (isWatchlist ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)'),
              border: `1px solid ${isLeakConfirmed ? '#ef4444' : (isWatchlist ? '#f59e0b' : '#ef4444')}`,
              color: isLeakConfirmed ? '#fca5a5' : (isWatchlist ? '#fbbf24' : '#f87171'),
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '0.2rem 0.6rem',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              boxShadow: isLeakConfirmed ? '0 0 14px rgba(239, 68, 68, 0.4)' : 'none'
            }}>
              {isLeakConfirmed 
                ? `INCIDENT STATUS: TIER-2 RESPONSE ACTIVE (CONFIRMED SOURCE: ${confirmedSource?.name?.replace(' - DEMO', '') || topCandidate?.vessel_name?.replace(' - DEMO', '') || 'MT OCEAN PIONEER'})` 
                : (isWatchlist ? 'INCIDENT STATUS: WATCHLIST RECHECK' : 'INCIDENT STATUS: ACTIVE RESPONSE (CRITICAL)')}
            </span>

            {/* Scenario Quick Selector */}
            {onSelectScenario && (
              <select
                onChange={(e) => onSelectScenario(e.target.value === 'default' ? null : e.target.value)}
                defaultValue="default"
                style={{
                  backgroundColor: '#070b14',
                  color: '#38bdf8',
                  border: '1px solid #0284c7',
                  borderRadius: '4px',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Switch test scenario archetype"
              >
                <option value="default">Demo: 14.85 km² (Large Obvious Spill)</option>
                <option value="scenario_small_high_conf">Demo: 0.45 km² (Small High-Conf)</option>
                <option value="scenario_small_low_conf">Demo: 0.22 km² (Small Low-Conf Watchlist)</option>
                <option value="scenario_small_nearshore">Demo: 0.35 km² (Near Coast 2.4 km)</option>
                <option value="scenario_large_offshore">Demo: 8.5 km² (Far Offshore 73 km)</option>
              </select>
            )}
          </div>

          <h1 style={{
            fontSize: '1.35rem',
            fontWeight: 900,
            color: '#f8fafc',
            letterSpacing: '-0.02em',
            margin: 0,
            lineHeight: 1.2
          }}>
            {isLeakConfirmed 
              ? 'CRITICAL INCIDENT COMMAND: TIER-2 ESCALATION (CONFIRMED SOURCE)' 
              : (isWatchlist ? 'POSSIBLE OIL SLICK (WATCHLIST ANOMALY)' : 'MARITIME OIL SPILL INCIDENT COMMAND DASHBOARD')}
          </h1>
          <p style={{
            fontSize: '0.74rem',
            color: '#94a3b8',
            margin: 0
          }}>
            Spatiotemporal Satellite SAR Detection • Backward Drift Attribution • Forward Trajectory (+6h) &amp; Dynamic Exclusion Zone
          </p>
        </div>

        {/* Right: Quick Command Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={() => onNavigateTab('satellite')}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: '1px solid #38bdf8',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 0 14px rgba(56, 189, 248, 0.3)'
            }}
          >
            <Play size={14} fill="#ffffff" />
            <span>ANALYZE SAR</span>
          </button>

          <button
            onClick={() => onNavigateTab('investigation')}
            style={{
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '0.5rem 0.95rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <Search size={14} color="#38bdf8" />
            <span>INVESTIGATION</span>
          </button>

          <button
            onClick={onStartDemo}
            style={{
              background: 'transparent',
              color: '#94a3b8',
              border: '1px dashed #334155',
              borderRadius: '6px',
              padding: '0.45rem 0.8rem',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Clock size={13} />
            <span>2-Min Demo</span>
          </button>
        </div>
      </div>

      {/* 2. 50/50 HERO SPLIT: HERO SYNTHETIC SAR VISUAL + SPATIAL INTELLIGENCE MAP */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        minHeight: '290px'
      }}>
        {/* LEFT 50%: HERO SYNTHETIC SAR VISUAL */}
        <div 
          onClick={() => onNavigateTab('satellite')}
          style={{
            position: 'relative',
            backgroundColor: '#070b14',
            border: '1px solid #1e293b',
            borderRadius: '10px',
            overflow: 'hidden',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column'
          }}
          title="Click to view full Satellite SAR Analysis"
        >
          {/* Header Strip */}
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '12px',
            zIndex: 10,
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            <div style={{
              backgroundColor: 'rgba(7, 11, 20, 0.92)',
              border: '1px solid #38bdf8',
              borderRadius: '4px',
              padding: '0.2rem 0.55rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.8)'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#38bdf8', boxShadow: '0 0 6px #38bdf8' }}></span>
              <span style={{ color: '#38bdf8', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                SYNTHETIC SAR-LIKE DEMONSTRATION
              </span>
            </div>

            <span style={{
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid #334155',
              color: '#cbd5e1',
              fontSize: '0.65rem',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px'
            }}>
              demo_sar_oil.png (Hero Visual)
            </span>
          </div>

          {/* Base SAR Image with dark slick bounding box */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <img
              src={getStaticUrl('/static/satellite/demo_sar_oil.png')}
              alt="Synthetic SAR-like demonstration scene"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'contrast(1.18) brightness(0.92)'
              }}
            />

            {/* Slick Highlight Box */}
            <div style={{
              position: 'absolute',
              left: '37%',
              top: '22%',
              width: '44%',
              height: '48%',
              border: '2px solid #38bdf8',
              borderRadius: '4px',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.5)',
              pointerEvents: 'none'
            }}>
              <span style={{
                position: 'absolute',
                top: '-9px',
                left: '8px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontSize: '0.62rem',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: '3px',
                letterSpacing: '0.04em'
              }}>
                DARK SLICK REGION
              </span>
            </div>
          </div>

          {/* Bottom SAR Assessment Strip */}
          <div style={{
            backgroundColor: '#0a1120',
            borderTop: '1px solid #1e293b',
            padding: '0.55rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.72rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Spill Area: </span>
                <strong style={{ color: '#f8fafc' }}>{spillData ? spillData.area_km2 : 14.85} km²</strong>
              </div>
              <div style={{ borderLeft: '1px solid #1e293b', paddingLeft: '0.8rem' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Volume: </span>
                {isQuantitative ? (
                  <strong style={{ color: '#10b981' }}>~{Math.round(spillData?.volume_estimate || 17820).toLocaleString()} m³</strong>
                ) : (
                  <strong style={{ color: '#fbbf24' }}>NOT QUANTIFIED</strong>
                )}
              </div>
              <div style={{ borderLeft: '1px solid #1e293b', paddingLeft: '0.8rem' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Detection Conf: </span>
                <strong style={{ color: '#38bdf8' }}>{confidencePct}% ({confidenceClass})</strong>
              </div>
            </div>

            <span style={{ color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              Inspect Segmentation &rarr;
            </span>
          </div>
        </div>

        {/* RIGHT 50%: SPATIAL INTELLIGENCE MAP */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderRadius: '10px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 20px rgba(0,0,0,0.6)'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#0a1120',
            padding: '0.5rem 1rem',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={14} color="#38bdf8" />
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>
                SPATIAL INTELLIGENCE &amp; DRIFT CORRIDOR
              </span>
            </div>

            <div style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'flex', gap: '0.6rem' }}>
              <span>Forward: <strong style={{ color: '#fbbf24' }}>+6h Forecast</strong></span>
              <span>Corridor: <strong style={{ color: '#f43f5e' }}>±4.5 km</strong></span>
            </div>
          </div>

          {/* Interactive Leaflet Map */}
          <div style={{ flex: 1, minHeight: '235px', position: 'relative' }}>
            <MaritimeMap
              spillData={spillData}
              originData={originData}
              forwardDrift={forwardDrift}
              candidateVessels={candidateVessels}
              atRiskVessels={atRiskVessels}
              selectedVessel={selectedVessel}
              onSelectVessel={onSelectVessel}
              height="100%"
              minHeight="235px"
              autoFit={true}
            />
          </div>
        </div>
      </div>

      {/* 2.5 TIER-2 OPERATIONAL ESCALATION COMMAND PANEL (LEAK CONFIRMED WORKFLOW) */}
      {isLeakConfirmed && (
        <div style={{
          backgroundColor: '#0c1322',
          border: '1.5px solid #ef4444',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          boxShadow: '0 0 24px rgba(239, 68, 68, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.9rem'
        }}>
          {/* Header Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                borderRadius: '6px',
                padding: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertTriangle size={18} color="#ef4444" />
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#f87171', letterSpacing: '0.04em' }}>
                  INCIDENT COMMAND ESCALATION • MARPOL ANNEX I VIOLATION CASE
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span>TIER-2 RESPONSE ACTIVE — CONFIRMED SOURCE CANDIDATE:</span>
                  <span style={{ color: '#38bdf8' }}>{confirmedSource?.name?.replace(' - DEMO', '') || topCandidate?.vessel_name?.replace(' - DEMO', '') || 'MT OCEAN PIONEER'}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>(MMSI: {confirmedSource?.mmsi || topCandidate?.mmsi || '419001234'})</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '0.25rem 0.6rem',
                borderRadius: '4px'
              }}>
                SEVERITY: CRITICAL (TIER-2 ESCALATION)
              </span>
              <span style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                color: '#34d399',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '0.25rem 0.6rem',
                borderRadius: '4px'
              }}>
                CANDIDATE RANK #1 LOCKED ({topCandidate?.scores?.total_score || 96}/100)
              </span>
            </div>
          </div>

          {/* COMPACT AUTOMATIC STATUS SUMMARY BAR (6 Post-Verification Milestones) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '0.6rem',
            backgroundColor: '#070b14',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '0.55rem 0.75rem'
          }}>
            {[
              { label: 'Source Verified', detail: confirmedSource?.name?.replace(' - DEMO', '') || 'MT Ocean Pioneer', sub: 'VERIFIED LEAK' },
              { label: 'Forward Drift', detail: '+12h Trajectory Forecast', sub: 'Corridor Modeled' },
              { label: 'Exclusion Zone Active', detail: '~220 km² Active Zone', sub: 'Radius 4.5 NM' },
              { label: '8 Vessels Notified', detail: 'Route Advisories Sent', sub: 'Simulated Broadcast' },
              { label: 'Nav Warning Broadcast', detail: 'NAVAREA VIII 142/2026', sub: 'NAVTEX / VHF Active' },
              { label: 'Response Team Initiated', detail: 'Tier-2 JNPT Flotilla', sub: 'Deployment Initiated' }
            ].map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '5px',
                padding: '0.35rem 0.55rem'
              }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>✓</div>
                <div style={{ overflow: 'hidden', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#34d399', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 3 Operational Escalation Command Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.05fr 1.05fr 1.25fr',
            gap: '0.85rem'
          }}>
            {/* CARD 1: NAVIGATIONAL WARNING (NAVAREA VIII 142/2026) */}
            <div style={{
              backgroundColor: '#070b14',
              border: `1px solid ${isNavBroadcasted ? '#10b981' : '#f59e0b'}`,
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.6rem'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    backgroundColor: isNavBroadcasted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: isNavBroadcasted ? '#34d399' : '#fbbf24',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {isNavBroadcasted && <span>✓</span>}
                    {isNavBroadcasted ? 'BROADCAST ACTIVE (SIMULATED)' : (navigationalWarning?.navarea_number || 'NAVAREA VIII 142/2026')}
                  </span>
                  <Radio size={15} color={isNavBroadcasted ? '#10b981' : '#f59e0b'} />
                </div>

                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f1f5f9', marginTop: '0.4rem' }}>
                  Navigational Warning (NAVTEX 518 kHz)
                </div>

                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.3rem', lineHeight: 1.4 }}>
                  <div>Station: <strong style={{ color: '#cbd5e1' }}>{navigationalWarning?.station || 'MUMBAI VTMS / COAST RADIO (VWX)'}</strong></div>
                  <div>Channels: <strong style={{ color: '#cbd5e1' }}>NAVTEX 518 kHz • VHF CH 16/12 • SafetyNET</strong></div>
                  <div>Hazard Corridor: <strong style={{ color: '#f43f5e' }}>220 km² (Radius 4.5 NM)</strong></div>
                  <div style={{ marginTop: '0.2rem', color: isNavBroadcasted ? '#34d399' : '#fbbf24', fontStyle: 'italic' }}>
                    {isNavBroadcasted ? 'Directive Active: Transmitted over NAVTEX & VHF CH 16/12.' : 'Directive: Maintain min 3 NM CPA. Cease raw seawater cooling intake.'}
                  </div>
                </div>

                {/* Collapsible raw draft toggle */}
                <button
                  onClick={() => setShowNavDraft(!showNavDraft)}
                  style={{
                    marginTop: '0.35rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#38bdf8',
                    fontSize: '0.65rem',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline'
                  }}
                >
                  {showNavDraft ? 'Hide Broadcast Message' : 'View Full Broadcast Text'}
                </button>

                {showNavDraft && (
                  <pre style={{
                    backgroundColor: '#030712',
                    border: '1px solid #1e293b',
                    borderRadius: '4px',
                    padding: '0.4rem',
                    fontSize: '0.62rem',
                    color: '#a5f3fc',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    marginTop: '0.3rem',
                    maxHeight: '120px',
                    overflowY: 'auto'
                  }}>
                    {navigationalWarning?.message_text || 'NAVAREA VIII 142/2026: POLLUTION HAZARD IN MUMBAI APPROACHES...'}
                  </pre>
                )}
              </div>

              <button
                onClick={() => {
                  onTriggerAction({
                    action_id: 'act_navarea_broadcast',
                    action_type: 'broadcast_warning',
                    title: 'Broadcast NAVAREA VIII 142/2026 Warning via NAVTEX & VHF',
                    rationale: 'Urgent marine safety alert broadcast over NAVTEX 518 kHz and VHF CH 16/12 alerting regional shipping of continuous hydrocarbon discharge corridor.',
                    priority: 'CRITICAL',
                    targetEntity: 'Mumbai VTMS & Coast Radio (VWX)'
                  });
                  setNavWarningBroadcasted(true);
                }}
                style={{
                  backgroundColor: isNavBroadcasted ? 'rgba(16, 185, 129, 0.2)' : '#b45309',
                  color: isNavBroadcasted ? '#34d399' : '#ffffff',
                  border: `1px solid ${isNavBroadcasted ? '#10b981' : '#f59e0b'}`,
                  borderRadius: '5px',
                  padding: '0.42rem 0.75rem',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  boxShadow: isNavBroadcasted ? 'none' : '0 0 12px rgba(245, 158, 11, 0.3)'
                }}
              >
                {isNavBroadcasted ? <CheckCircle2 size={13} color="#10b981" /> : <Radio size={13} />}
                <span>{isNavBroadcasted ? 'BROADCAST TRANSMITTED (SIMULATED)' : 'BROADCAST WARNING (SIMULATED)'}</span>
              </button>
            </div>

            {/* CARD 2: TIER-2 RESPONSE FLOTILLA DEPLOYMENT */}
            <div style={{
              backgroundColor: '#070b14',
              border: `1px solid ${isFlotillaDispatched ? '#10b981' : '#0284c7'}`,
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.6rem'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    backgroundColor: isFlotillaDispatched ? 'rgba(16, 185, 129, 0.15)' : 'rgba(2, 132, 199, 0.15)',
                    color: isFlotillaDispatched ? '#34d399' : '#38bdf8',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {isFlotillaDispatched && <span>✓</span>}
                    {isFlotillaDispatched ? 'RESPONSE INITIATED (SIMULATED)' : 'TIER-2 OFFSHORE FLOTILLA'}
                  </span>
                  <ShieldAlert size={15} color={isFlotillaDispatched ? '#10b981' : '#38bdf8'} />
                </div>

                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f1f5f9', marginTop: '0.4rem' }}>
                  Pollution Response Strike Team Staged
                </div>

                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.3rem', lineHeight: 1.4 }}>
                  <div>Base: <strong style={{ color: '#cbd5e1' }}>JNPT Anchorage / MbPT (45m ETA)</strong></div>
                  <div>Containment: <strong style={{ color: '#38bdf8' }}>1,200m offshore booms + 800m deflection</strong></div>
                  <div>Recovery: <strong style={{ color: '#38bdf8' }}>2 dynamic offshore skimming vessels</strong></div>
                  <div style={{ marginTop: '0.2rem', color: isFlotillaDispatched ? '#34d399' : '#cbd5e1' }}>
                    {isFlotillaDispatched ? 'Status: RESPONSE TEAM DEPLOYMENT INITIATED — SIMULATED' : 'Assets: ICG Samudra Prahari (PCV), OSRV-1 Skimmer, Boom Tender-04'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onTriggerAction({
                    action_id: 'act_dispatch_tier2',
                    action_type: 'deploy_response',
                    title: 'Deploy Tier-2 Offshore Response Flotilla (JNPT Base)',
                    rationale: 'Deployment of 1,200m containment booms, 2 skimmers, and 800m deflection booms from JNPT Base to intercept slick drifting towards Mumbai approaches.',
                    priority: 'CRITICAL',
                    targetEntity: 'Indian Coast Guard & JNPT Disaster Response Team'
                  });
                  setResponseDispatched(true);
                }}
                style={{
                  backgroundColor: isFlotillaDispatched ? 'rgba(16, 185, 129, 0.2)' : '#0284c7',
                  color: isFlotillaDispatched ? '#34d399' : '#ffffff',
                  border: `1px solid ${isFlotillaDispatched ? '#10b981' : '#38bdf8'}`,
                  borderRadius: '5px',
                  padding: '0.42rem 0.75rem',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  boxShadow: isFlotillaDispatched ? 'none' : '0 0 12px rgba(2, 132, 199, 0.4)'
                }}
              >
                {isFlotillaDispatched ? <CheckCircle2 size={13} color="#10b981" /> : <ShieldAlert size={13} />}
                <span>{isFlotillaDispatched ? 'FLOTILLA DISPATCHED (SIMULATED)' : 'DISPATCH RESPONSE (SIMULATED)'}</span>
              </button>
            </div>

            {/* CARD 3: SHIPS ON AFFECTED ROUTE IDENTIFIED (>5 FLAGGED) */}
            <div style={{
              backgroundColor: '#070b14',
              border: `1px solid ${areShipsNotified ? '#10b981' : '#ef4444'}`,
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.6rem'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    backgroundColor: areShipsNotified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: areShipsNotified ? '#34d399' : '#f87171',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {areShipsNotified && <span>✓</span>}
                    {flaggedTrafficCount || 8} SHIPS ON ROUTE IDENTIFIED & NOTIFIED (SIMULATED)
                  </span>
                  <Ship size={15} color={areShipsNotified ? '#10b981' : '#ef4444'} />
                </div>

                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f1f5f9', marginTop: '0.4rem' }}>
                  Affected Route Traffic Advisories Active
                </div>

                {/* Mini list of all route vessels with notification status */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  marginTop: '0.35rem',
                  maxHeight: '105px',
                  overflowY: 'auto'
                }}>
                  {flaggedRouteVessels.map((v) => (
                    <div key={v.mmsi} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#0a1120',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '0.66rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: v.risk_state === 'INSIDE ZONE' ? '#ef4444' : (v.risk_state === 'APPROACHING' ? '#f59e0b' : '#38bdf8') }}>●</span>
                        <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{v.vessel_name}</span>
                        <span style={{ color: '#64748b' }}>({v.vessel_type})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ color: '#94a3b8' }}>{v.distance_to_zone_km.toFixed(1)} km</span>
                        <span style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.2)',
                          color: '#34d399',
                          padding: '1px 5px',
                          borderRadius: '2px',
                          fontWeight: 800,
                          fontSize: '0.6rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}>
                          ✓ {v.notification_status || 'NOTIFIED — SIMULATED'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  onTriggerAction({
                    action_id: 'act_notify_all_route_vessels',
                    action_type: 'notify_vessel',
                    title: `Emergency Route Safety Advisories Transmitted to ${flaggedTrafficCount || 8} Flagged Vessels`,
                    rationale: `Targeted route notifications transmitted to Master of ${flaggedTrafficCount || 8} vessels transiting hazard fairway. Direct course divergence advised.`,
                    priority: 'CRITICAL',
                    targetEntity: `${flaggedTrafficCount || 8} Flagged Route Vessels`
                  });
                  setAllNotified(true);
                }}
                style={{
                  backgroundColor: areShipsNotified ? 'rgba(16, 185, 129, 0.2)' : '#991b1b',
                  color: areShipsNotified ? '#34d399' : '#ffffff',
                  border: `1px solid ${areShipsNotified ? '#10b981' : '#ef4444'}`,
                  borderRadius: '5px',
                  padding: '0.42rem 0.75rem',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  boxShadow: areShipsNotified ? 'none' : '0 0 12px rgba(239, 68, 68, 0.4)'
                }}
              >
                {areShipsNotified ? <CheckCircle2 size={13} color="#10b981" /> : <Send size={13} />}
                <span>{areShipsNotified ? `ALL ${flaggedTrafficCount || 8} NOTIFIED (SIMULATED)` : `NOTIFY ALL ${flaggedTrafficCount || 8} VESSELS (SIMULATED)`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. 5 KEY OPERATIONAL KPI CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '0.75rem'
      }}>
        {/* KPI 1: POSSIBLE SPILL */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderLeft: isWatchlist ? '4px solid #f59e0b' : '4px solid #ef4444',
          borderRadius: '8px',
          padding: '0.7rem 0.9rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Possible Spill
            </span>
            <Droplets size={15} color={isWatchlist ? '#f59e0b' : '#ef4444'} />
          </div>

          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f8fafc', marginTop: '0.15rem' }}>
            {spillData ? spillData.area_km2 : '14.85'} <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>km²</span>
          </div>

          <div style={{ fontSize: '0.7rem', color: isQuantitative ? '#10b981' : '#fbbf24', marginTop: '0.15rem', fontWeight: 700 }}>
            {isQuantitative 
              ? `Est. Vol: ~${Math.round(spillData?.volume_estimate || 17820).toLocaleString()} m³` 
              : 'Volume: NOT QUANTIFIED'}
          </div>

          <div style={{ fontSize: '0.64rem', color: '#64748b', marginTop: '0.1rem' }}>
            {isQuantitative ? 'Quantitative Threshold Passed' : `Appearance: ${appearanceClass}`}
          </div>
        </div>

        {/* KPI 2: PROBABLE ORIGIN */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderLeft: '4px solid #f59e0b',
          borderRadius: '8px',
          padding: '0.7rem 0.9rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Probable Origin
            </span>
            <Compass size={15} color="#f59e0b" />
          </div>

          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fbbf24', marginTop: '0.15rem' }}>
            ±{originData ? originData.origin_uncertainty_km : '3.5'} <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>km</span>
          </div>

          <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '0.15rem', fontWeight: 600 }}>
            Window: {originData?.release_window_start?.split('T')[1]?.slice(0, 5) || '01:45'} - {originData?.release_window_end?.split('T')[1]?.slice(0, 5) || '03:15'} UTC
          </div>

          <div style={{ fontSize: '0.64rem', color: '#64748b', marginTop: '0.1rem' }}>
            Coast: {distanceToCoast} km to {nearestCoastName}
          </div>
        </div>

        {/* KPI 3: FORWARD DRIFT & EXCLUSION */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderLeft: '4px solid #f43f5e',
          borderRadius: '8px',
          padding: '0.7rem 0.9rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Forward Exclusion Zone
            </span>
            <AlertOctagon size={15} color="#f43f5e" />
          </div>

          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f43f5e', marginTop: '0.15rem' }}>
            +{isLeakConfirmed ? 12 : (forwardDrift?.forecast_hours || 6)}h <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>Corridor</span>
          </div>

          <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '0.15rem', fontWeight: 600 }}>
            Area: ~{isLeakConfirmed ? 220 : (forwardDrift?.hazard_area_km2 || 24.8)} km² ({forwardDrift?.net_drift_speed_kts || 1.15} kts)
          </div>

          <div style={{ fontSize: '0.64rem', color: '#f43f5e', marginTop: '0.1rem', fontWeight: 700 }}>
            {isLeakConfirmed ? 'Expanded Active Safety Corridor' : 'Active Navigational Warning'}
          </div>
        </div>

        {/* KPI 4: AT-RISK VESSELS */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderLeft: isLeakConfirmed ? '4px solid #ef4444' : (approachingCount > 0 ? '4px solid #f59e0b' : '4px solid #10b981'),
          borderRadius: '8px',
          padding: '0.7rem 0.9rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              At-Risk Vessels
            </span>
            <Radio size={15} color={isLeakConfirmed ? '#ef4444' : (approachingCount > 0 ? '#f59e0b' : '#10b981')} />
          </div>

          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: isLeakConfirmed ? '#ef4444' : (approachingCount > 0 ? '#f59e0b' : '#10b981'), marginTop: '0.15rem' }}>
            {isLeakConfirmed ? (flaggedTrafficCount || 8) : (approachingCount + insideZoneCount)} <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>Alerted</span>
          </div>

          <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '0.15rem', fontWeight: 600 }}>
            {isLeakConfirmed ? `${insideZoneCount || 2} Inside Zone • ${approachingCount + onRouteCount || 6} Approaching/Route` : `${approachingCount} Approaching • ${insideZoneCount} In Zone`}
          </div>

          <div style={{ fontSize: '0.64rem', color: isLeakConfirmed ? '#f87171' : '#64748b', marginTop: '0.1rem', fontWeight: isLeakConfirmed ? 700 : 400 }}>
            {isLeakConfirmed ? '8 Vessels Identified & Notified (Simulated)' : `${atRiskVessels.length || 10} Screened in Mumbai Corridor`}
          </div>
        </div>

        {/* KPI 5: TOP CANDIDATE & VERIFICATION STATUS */}
        <div style={{
          backgroundColor: '#0e172a',
          border: `1px solid ${isLeakConfirmed ? '#10b981' : '#38bdf8'}`,
          borderRadius: '8px',
          padding: '0.7rem 0.9rem',
          boxShadow: isLeakConfirmed ? '0 0 16px rgba(16, 185, 129, 0.2)' : '0 0 14px rgba(56, 189, 248, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.68rem', color: isLeakConfirmed ? '#34d399' : '#38bdf8', textTransform: 'uppercase', fontWeight: 700 }}>
                {isLeakConfirmed ? 'Confirmed Source' : 'Top Candidate'}
              </span>
              <Award size={15} color={isLeakConfirmed ? '#34d399' : '#38bdf8'} />
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.15rem' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: isLeakConfirmed ? '#34d399' : '#38bdf8', fontFamily: 'monospace' }}>
                {isLeakConfirmed ? (topCandidate?.scores?.total_score || 96) : (topCandidate ? topCandidate.scores.total_score : '87')}<span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>/100</span>
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#f8fafc',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '110px'
              }}>
                {confirmedSource?.name?.replace(' - DEMO', '') || (topCandidate ? topCandidate.vessel_name.replace(' - DEMO', '') : 'Ocean Pioneer')}
              </span>
            </div>

            <div style={{ fontSize: '0.66rem', color: '#94a3b8', marginTop: '0.1rem' }}>
              Status: <strong style={{
                color: isLeakConfirmed ? '#34d399' : (topCandidate?.verification_status === 'not_detected' ? '#f87171' : (topCandidate?.verification_status === 'confirmed' ? '#10b981' : '#38bdf8')),
                textTransform: 'uppercase'
              }}>
                {isLeakConfirmed ? (investigationState || 'SOURCE VERIFIED — DEMO') : (topCandidate?.verification_status || 'UNVERIFIED')}
              </strong>
            </div>
          </div>

          <button
            onClick={() => setVerifyingVessel(topCandidate)}
            style={{
              marginTop: '0.35rem',
              backgroundColor: isLeakConfirmed ? '#065f46' : '#0284c7',
              color: '#ffffff',
              border: `1px solid ${isLeakConfirmed ? '#10b981' : '#38bdf8'}`,
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.68rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem'
            }}
          >
            <UserCheck size={12} />
            <span>{isLeakConfirmed ? 'RE-INSPECT / STATUS' : 'VERIFY VESSEL'}</span>
          </button>
        </div>
      </div>

      {/* 4. ACTION & INTELLIGENCE CENTER (2 COLUMNS: CONDITIONAL RECOMMENDED ACTIONS + AT-RISK VESSELS WATCHLIST) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '1rem'
      }}>
        {/* LEFT: CONDITIONAL RECOMMENDED RESPONSE ACTIONS */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          boxShadow: '0 4px 18px rgba(0,0,0,0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={16} color="#38bdf8" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>
                RECOMMENDED RESPONSE ACTIONS (CONDITIONAL AI DECISION-SUPPORT)
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              Simulated Triggers • Human-in-the-Loop Required
            </span>
          </div>

          {/* Action List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {recommendedActions.length > 0 ? (
              recommendedActions.map((act) => {
                const isCritical = act.priority === 'CRITICAL';
                const isHigh = act.priority === 'HIGH';
                const isExecuted = act.status?.includes('EXECUTED');
                const pColor = isCritical ? '#ef4444' : (isHigh ? '#f59e0b' : '#38bdf8');

                return (
                  <div
                    key={act.action_id}
                    style={{
                      backgroundColor: '#070b14',
                      border: `1px solid ${isExecuted ? '#065f46' : '#1e293b'}`,
                      borderLeft: `3.5px solid ${pColor}`,
                      borderRadius: '6px',
                      padding: '0.65rem 0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.8rem'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          backgroundColor: `${pColor}22`,
                          color: pColor,
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: '3px'
                        }}>
                          {act.priority}
                        </span>
                        <strong style={{ fontSize: '0.82rem', color: '#f1f5f9' }}>{act.title}</strong>
                        {isExecuted && (
                          <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <CheckCircle2 size={12} /> EXECUTED (SIMULATED)
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0, lineHeight: 1.35 }}>
                        {act.rationale}
                      </p>
                    </div>

                    {!isExecuted ? (
                      <button
                        onClick={() => handleOpenActionModal({
                          action_id: act.action_id,
                          action_type: act.action_type || 'deploy_response',
                          title: act.title,
                          rationale: act.rationale,
                          priority: act.priority,
                          targetEntity: act.category === 'containment' ? 'Pollution Response Fleet' : (act.category === 'maritime_safety' ? 'All Area Vessels (NAVTEX)' : 'Port State Control')
                        })}
                        style={{
                          backgroundColor: isCritical ? '#991b1b' : '#0369a1',
                          color: '#ffffff',
                          border: `1px solid ${pColor}`,
                          borderRadius: '4px',
                          padding: '0.4rem 0.75rem',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          boxShadow: `0 0 10px ${pColor}33`
                        }}
                      >
                        <Send size={12} />
                        <span>SIMULATE</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>Logged</span>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ color: '#64748b', fontSize: '0.75rem', padding: '0.5rem' }}>
                Analyzing incident data for conditional recommendations...
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: AT-RISK VESSELS WATCHLIST */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          boxShadow: '0 4px 18px rgba(0,0,0,0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Radio size={16} color="#f59e0b" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>
                AT-RISK VESSELS IN HAZARD CORRIDOR ({atRiskVessels.filter(v => v.risk_state !== 'OUTSIDE RISK').length})
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              Direct Vessel Warning (Simulated)
            </span>
          </div>

          {/* At-Risk Vessels List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', overflowY: 'auto', maxHeight: '250px' }}>
            {atRiskVessels.filter(v => v.risk_state !== 'OUTSIDE RISK').length > 0 ? (
              atRiskVessels.filter(v => v.risk_state !== 'OUTSIDE RISK').map((v) => {
                const isInside = v.risk_state === 'INSIDE ZONE';
                const bColor = isInside ? '#ef4444' : '#f59e0b';

                return (
                  <div
                    key={v.mmsi}
                    style={{
                      backgroundColor: '#070b14',
                      border: `1px solid ${v.notification_sent ? '#065f46' : '#1e293b'}`,
                      borderLeft: `3.5px solid ${bColor}`,
                      borderRadius: '6px',
                      padding: '0.65rem 0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.8rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1rem' }}>{isInside ? '🔴' : '⚠️'}</span>
                        <strong style={{ fontSize: '0.84rem', color: '#f8fafc' }}>{v.vessel_name}</strong>
                        <span style={{
                          backgroundColor: `${bColor}22`,
                          color: bColor,
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: '3px'
                        }}>
                          {v.risk_state}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                        {v.vessel_type} • Spd: <strong>{v.speed.toFixed(1)} kts</strong> • Hdg: <strong>{v.heading.toFixed(0)}°</strong> • Dist: <strong>{v.distance_to_zone_km.toFixed(2)} km</strong>
                        {v.eta_minutes ? ` • ETA: ~${Math.round(v.eta_minutes)}m` : ''}
                      </div>
                    </div>

                    {!(isLeakConfirmed || v.notification_sent) ? (
                      <button
                        onClick={() => handleOpenActionModal({
                          action_id: `notify_${v.mmsi}`,
                          action_type: 'notify_vessel',
                          title: `Simulated Direct Safety Warning: ${v.vessel_name}`,
                          rationale: `Direct AIS safety broadcast alerting Master of ${v.vessel_name} of the active +6h oil slick corridor. Recommend course adjustment to clear exclusion boundary.`,
                          priority: isInside ? 'CRITICAL' : 'HIGH',
                          targetEntity: `${v.vessel_name} (MMSI: ${v.mmsi})`,
                          vessel_mmsi: v.mmsi,
                          messagePreview: `SECURITE SECURITE SECURITE. ALL SHIPS PLEASE BE ADVISED: Active hydrocarbon discharge corridor centered at 18.91°N 72.34°E drifting northeast. Course alteration recommended.`
                        })}
                        style={{
                          backgroundColor: '#1e293b',
                          color: '#38bdf8',
                          border: '1px solid #38bdf8',
                          borderRadius: '4px',
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <Radio size={12} />
                        <span>NOTIFY</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <CheckCircle2 size={12} /> {v.notification_status || 'NOTIFIED — SIMULATED'} {v.notification_time ? `(${v.notification_time})` : ''}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ color: '#64748b', fontSize: '0.75rem', padding: '0.5rem' }}>
                No commercial vessels currently inside the forward exclusion corridor.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. BOTTOM SECTION: INVESTIGATION STATUS & CHRONOLOGICAL TIMELINE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.6fr',
        gap: '1rem'
      }}>
        {/* INVESTIGATION STATUS COMPACT CARD */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '0.85rem 1.15rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.6rem'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              INVESTIGATION PIPELINE AUDIT
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.74rem', color: '#cbd5e1' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', fontWeight: 700 }}>
                <CheckCircle2 size={14} /> Satellite SAR Segmentation
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', fontWeight: 700 }}>
                <CheckCircle2 size={14} /> Probable Origin Inversion
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', fontWeight: 700 }}>
                <CheckCircle2 size={14} /> Backward/Forward Drift
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', fontWeight: 700 }}>
                <CheckCircle2 size={14} /> AIS 10-Vessel Ranking
              </span>
            </div>

            <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
              Current #1 Candidate: <strong style={{ color: '#f1f5f9' }}>{topCandidate?.vessel_name || 'MT Ocean Pioneer'}</strong> ({topCandidate?.scores?.total_score || 87}/100 Score).
              Verification: <strong style={{ color: '#38bdf8' }}>{topCandidate?.verification_status?.toUpperCase() || 'UNVERIFIED'}</strong>.
            </div>
          </div>

          <div style={{
            fontSize: '0.64rem',
            color: '#64748b',
            lineHeight: 1.35,
            borderTop: '1px solid #14223f',
            paddingTop: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <Info size={13} color="#38bdf8" style={{ flexShrink: 0 }} />
            <span>
              <strong>Guardrail:</strong> Decision-support rankings are probabilistic correlations. Physical port inspections and oil-fingerprinting confirmation are mandatory prior to enforcement.
            </span>
          </div>
        </div>

        {/* CHRONOLOGICAL INCIDENT INVESTIGATION TIMELINE */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '0.85rem 1.15rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          maxHeight: '220px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Clock size={15} color="#38bdf8" />
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>
                CHRONOLOGICAL INCIDENT TIMELINE ({timelineEvents.length} EVENTS)
              </span>
            </div>
            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Real-time Audit Trail</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', overflowY: 'auto', paddingRight: '0.3rem' }}>
            {timelineEvents.map((evt) => {
              const bColor = evt.badge_color === 'red' ? '#ef4444' : (evt.badge_color === 'green' ? '#10b981' : (evt.badge_color === 'purple' ? '#a855f7' : '#38bdf8'));

              return (
                <div
                  key={evt.event_id}
                  style={{
                    backgroundColor: '#070b14',
                    border: '1px solid #1e293b',
                    borderRadius: '5px',
                    padding: '0.4rem 0.65rem',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.6rem'
                  }}
                >
                  <span style={{
                    color: '#64748b',
                    fontFamily: 'monospace',
                    fontSize: '0.66rem',
                    whiteSpace: 'nowrap',
                    marginTop: '1px'
                  }}>
                    {evt.timestamp?.split('T')[1]?.slice(0, 5) || '12:00'} UTC
                  </span>

                  <span style={{
                    backgroundColor: `${bColor}22`,
                    color: bColor,
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: '3px',
                    whiteSpace: 'nowrap',
                    marginTop: '1px'
                  }}>
                    {evt.event_type.replace('_', ' ').toUpperCase()}
                  </span>

                  <div style={{ flex: 1 }}>
                    <strong style={{ color: '#f1f5f9' }}>{evt.title}</strong>
                    <span style={{ color: '#94a3b8', marginLeft: '0.4rem' }}>{evt.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL 1: HUMAN CONFIRMATION SIMULATED ACTION MODAL */}
      {activeModalAction && (
        <HumanConfirmationModal
          isOpen={Boolean(activeModalAction)}
          actionType={activeModalAction.action_type || 'deploy_response'}
          targetEntity={activeModalAction.targetEntity || 'Maritime Command Authorities'}
          incidentId="ST-2026-MUMBAI-01"
          reason={activeModalAction.rationale || 'Decision-support action generated from hydrodynamic drift & vessel correlation.'}
          messagePreview={activeModalAction.messagePreview || `Action: ${activeModalAction.title}. Authorized by Operator.`}
          onConfirm={handleConfirmAction}
          onClose={() => setActiveModalAction(null)}
        />
      )}

      {/* MODAL 2: CANDIDATE VERIFICATION FEEDBACK LOOP MODAL */}
      {verifyingVessel && (
        <CandidateVerificationModal
          isOpen={Boolean(verifyingVessel)}
          vessel={verifyingVessel}
          onVerify={async (mmsi, outcome, notes) => {
            if (onVerifyCandidate) {
              await onVerifyCandidate(mmsi, outcome, notes);
            }
            setVerifyingVessel(null);
          }}
          onClose={() => setVerifyingVessel(null)}
        />
      )}
    </div>
  );
}
