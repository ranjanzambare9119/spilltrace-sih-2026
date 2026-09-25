import React, { useState } from 'react';
import { 
  Droplets, 
  Compass, 
  Award, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  ShieldAlert, 
  UserCheck, 
  Send, 
  Search, 
  Play, 
  X,
  Bell,
  Clock,
  ArrowRight,
  Info
} from 'lucide-react';
import MaritimeMap from './MaritimeMap';
import HumanConfirmationModal from './HumanConfirmationModal';
import CandidateVerificationModal from './CandidateVerificationModal';

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
  onLoadDemo,
  onExitDemo,
  onStartDemo,
  onSelectScenario,
  onTriggerAction,
  onVerifyCandidate,
  isDemoActive = false,
  isLeakConfirmed = false,
  investigationState = 'CANDIDATE',
  confirmedSource = null,
  incidentSeverity = 'ACTIVE RESPONSE (CRITICAL)',
  responseDeployment = null,
  navigationalWarning = null
}) {
  const [activeModalAction, setActiveModalAction] = useState(null);
  const [verifyingVessel, setVerifyingVessel] = useState(null);

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
  const flaggedRouteVessels = atRiskVessels.filter(v => v.risk_state !== 'OUTSIDE RISK');
  const flaggedTrafficCount = flaggedRouteVessels.length || (isLeakConfirmed ? 8 : 0);

  const handleOpenActionModal = (action) => {
    setActiveModalAction(action);
  };

  const handleConfirmAction = async () => {
    if (activeModalAction && onTriggerAction) {
      await onTriggerAction(activeModalAction);
    }
    setActiveModalAction(null);
  };

  const hasIncident = Boolean(isDemoActive || spillData);

  const handleDemoClick = () => {
    if (onLoadDemo) onLoadDemo();
    else if (onStartDemo) onStartDemo();
  };

  if (!hasIncident) {
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
        {/* TOP STATUS BAR: MARITIME SURVEILLANCE & MONITORING */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#0a101d',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '0.8rem 1.3rem',
          flexWrap: 'wrap',
          gap: '0.8rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 700,
                color: '#94a3b8',
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px'
              }}>
                DATA MODE: NO LIVE FEED
              </span>
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 700,
                color: '#34d399',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px'
              }}>
                SYSTEM STATUS: ONLINE
              </span>
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 700,
                color: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px'
              }}>
                SECTOR 04: ARABIAN SEA (MONITORING)
              </span>
            </div>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#f8fafc',
              margin: 0
            }}>
              MARITIME SURVEILLANCE & MONITORING DASHBOARD
            </h1>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
              Autonomous satellite SAR slick detection, leeway drift hindcasting, and historical AIS correlation.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={handleDemoClick}
              className="btn-primary"
              style={{
                padding: '0.5rem 1.1rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                borderRadius: '6px'
              }}
            >
              <Play size={14} fill="#ffffff" />
              <span>LOAD DEMO SCENARIO</span>
            </button>
          </div>
        </div>

        {/* 2-COLUMN MAIN CONTENT GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 420px',
          gap: '1rem',
          flex: 1
        }}>
          {/* LEFT: BASE NAUTICAL MARITIME MAP */}
          <div style={{
            backgroundColor: '#0a101d',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '520px',
            position: 'relative'
          }}>
            <div style={{
              padding: '0.6rem 1rem',
              borderBottom: '1px solid #1e293b',
              backgroundColor: '#070c16',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#cbd5e1', letterSpacing: '0.04em' }}>
                SPATIAL INTELLIGENCE MAP — BASE SURVEILLANCE CHART
              </span>
              <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                OpenStreetMap Maritime Base • No Active Incident
              </span>
            </div>
            <div style={{ flex: 1, minHeight: '480px', position: 'relative' }}>
              <MaritimeMap
                spillData={null}
                originData={null}
                candidateVessels={[]}
                onLoadDemo={handleDemoClick}
                interactiveLegend={false}
              />
            </div>
          </div>

          {/* RIGHT: MONITORING STATUS & CORE PIPELINE CAPABILITIES */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {/* NO ACTIVE INCIDENT STATUS BOX */}
            <div style={{
              backgroundColor: '#0a101d',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '1.2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.7rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '6px',
                  padding: '0.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShieldCheck size={20} color="#34d399" />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>
                    NO ACTIVE INCIDENT DETECTED
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Sector clean • Metocean monitoring standby
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                No active oil-spill incident is currently loaded. No live satellite or AIS telemetry feed is currently connected. System is ready for analysis.
              </p>

              <div style={{
                backgroundColor: '#070c16',
                border: '1px solid #142033',
                borderRadius: '6px',
                padding: '0.7rem 0.9rem',
                fontSize: '0.72rem',
                color: '#94a3b8',
                lineHeight: 1.45
              }}>
                To evaluate the end-to-end attribution and proactive response workflow under Smart India Hackathon (SIH 2026 PS-143), click below to ingest the synthetic Arabian Sea demonstration scenario.
              </div>

              <button
                onClick={handleDemoClick}
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.6rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  borderRadius: '6px',
                  marginTop: '0.3rem'
                }}
              >
                <Play size={14} fill="#ffffff" />
                <span>LOAD DEMO SCENARIO</span>
              </button>
            </div>

            {/* CORE CAPABILITIES CHECKLIST (SIH PS-143 ALIGNMENT) */}
            <div style={{
              backgroundColor: '#0a101d',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              flex: 1
            }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                SpillTrace Decision Support Capabilities
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                <div style={{
                  backgroundColor: '#070c16',
                  border: '1px solid #142033',
                  borderRadius: '6px',
                  padding: '0.6rem 0.8rem'
                }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.15rem' }}>
                    1. Satellite SAR Slick Detection
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    Deep U-Net segmentation mask, geometric area calculation, and appearance classification.
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#070c16',
                  border: '1px solid #142033',
                  borderRadius: '6px',
                  padding: '0.6rem 0.8rem'
                }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.15rem' }}>
                    2. Hydrodynamic Leeway Hindcasting
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    Oceanographic drift backtracking to compute probable release origin envelope (±3.5 km) & release window.
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#070c16',
                  border: '1px solid #142033',
                  borderRadius: '6px',
                  padding: '0.6rem 0.8rem'
                }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#34d399', marginBottom: '0.15rem' }}>
                    3. AIS Multi-Vessel Correlation
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    Screening of 10 scenario vessels with 8-factor Source-Likelihood scoring & cargo carriage validation.
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#070c16',
                  border: '1px solid #142033',
                  borderRadius: '6px',
                  padding: '0.6rem 0.8rem'
                }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#fca5a5', marginBottom: '0.15rem' }}>
                    4. Forward Drift & Fairway Protection
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    Dynamic exclusion zone generation, identification of 8 at-risk vessels, and simulated NAVAREA VIII dispatches.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.9rem',
      padding: '0.9rem 1.4rem',
      maxWidth: '1720px',
      margin: '0 auto',
      minHeight: 'calc(100vh - 80px)',
      boxSizing: 'border-box'
    }}>
      {/* 1. TOP SITUATION COMMAND BAR */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0e172a',
        border: '1px solid #1e293b',
        borderRadius: '10px',
        padding: '0.75rem 1.2rem',
        boxShadow: '0 4px 18px rgba(0,0,0,0.5)',
        flexWrap: 'wrap',
        gap: '0.8rem'
      }}>
        {/* Left: Incident Title & Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span className="badge-demo" style={{ fontSize: '0.68rem', padding: '0.15rem 0.55rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }}></span>
              SYNTHETIC DEMO AIS SCENARIO
            </span>

            <span style={{
              backgroundColor: isLeakConfirmed 
                ? 'rgba(239, 68, 68, 0.22)' 
                : (isWatchlist ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)'),
              border: `1px solid ${isLeakConfirmed ? '#ef4444' : (isWatchlist ? '#f59e0b' : '#ef4444')}`,
              color: isLeakConfirmed ? '#fca5a5' : (isWatchlist ? '#fbbf24' : '#f87171'),
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '0.18rem 0.55rem',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              boxShadow: isLeakConfirmed ? '0 0 14px rgba(239, 68, 68, 0.4)' : 'none'
            }}>
              {isLeakConfirmed 
                ? `STATUS: TIER-2 ESCALATION (CONFIRMED SOURCE: ${confirmedSource?.name?.replace(' - DEMO', '') || topCandidate?.vessel_name?.replace(' - DEMO', '') || 'MT OCEAN PIONEER'})` 
                : (isWatchlist ? 'STATUS: WATCHLIST RECHECK' : 'STATUS: ACTIVE INVESTIGATION')}
            </span>

            {/* Quick Scenario Archetype Selector */}
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
                <option value="default">Demo Scenario 1: 14.85 km² (Large Quantitative Spill)</option>
                <option value="scenario_small_high_conf">Demo Scenario 2: 0.45 km² (Small Rainbow Sheen)</option>
                <option value="scenario_small_low_conf">Demo Scenario 3: 0.22 km² (Small Low-Conf Watchlist)</option>
                <option value="scenario_small_nearshore">Demo Scenario 4: 0.35 km² (Near Coast 2.4 km)</option>
                <option value="scenario_large_offshore">Demo Scenario 5: 8.5 km² (Deep Offshore 73 km)</option>
              </select>
            )}
          </div>

          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: 900,
            color: '#f8fafc',
            letterSpacing: '-0.02em',
            margin: 0,
            lineHeight: 1.2
          }}>
            {isLeakConfirmed 
              ? 'INCIDENT COMMAND: TIER-2 RESPONSE ACTIVE (CONFIRMED SOURCE)' 
              : (isWatchlist ? 'POSSIBLE OIL SPILL (WATCHLIST SURVEILLANCE)' : 'MARITIME OIL SPILL INCIDENT COMMAND DASHBOARD')}
          </h1>
        </div>

        {/* Right: Quick Action Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          {onExitDemo && (
            <button
              onClick={onExitDemo}
              style={{
                background: '#162033',
                color: '#cbd5e1',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              title="Exit demo mode and return to clean monitoring state"
            >
              <X size={13} color="#94a3b8" />
              <span>Exit Demo</span>
            </button>
          )}

          <button
            onClick={() => onNavigateTab('satellite')}
            style={{
              background: '#070b14',
              color: '#38bdf8',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Play size={13} fill="#38bdf8" />
            <span>Satellite Analysis</span>
          </button>

          <button
            onClick={() => onNavigateTab('investigation')}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: '1px solid #38bdf8',
              borderRadius: '6px',
              padding: '0.48rem 1rem',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 0 14px rgba(56, 189, 248, 0.3)'
            }}
          >
            <Search size={14} />
            <span>Investigation</span>
          </button>

          <button
            onClick={() => onNavigateTab('notifications')}
            style={{
              background: isLeakConfirmed ? 'rgba(239, 68, 68, 0.15)' : '#1e293b',
              color: isLeakConfirmed ? '#f87171' : '#f1f5f9',
              border: `1px solid ${isLeakConfirmed ? '#ef4444' : '#334155'}`,
              borderRadius: '6px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Bell size={13} color={isLeakConfirmed ? '#ef4444' : '#38bdf8'} />
            <span>Notifications ({isLeakConfirmed ? 8 : 0})</span>
          </button>
        </div>
      </div>

      {/* 2. THE 4 PRIMARY INCIDENT KPI CARDS (CLEAN & NON-DUPLICATE) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.85rem'
      }}>
        {/* CARD 1: POSSIBLE OIL SPILL */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderLeft: isWatchlist ? '4px solid #f59e0b' : '4px solid #ef4444',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.3rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Possible Oil Spill
            </span>
            <Droplets size={16} color={isWatchlist ? '#f59e0b' : '#ef4444'} />
          </div>

          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#f8fafc', lineHeight: 1.1 }}>
              {spillData ? spillData.area_km2 : '14.85'} <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>km²</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: isQuantitative ? '#10b981' : '#fbbf24', marginTop: '0.2rem', fontWeight: 700 }}>
              {isQuantitative 
                ? `Est. Volume: ~${Math.round(spillData?.volume_estimate || 17820).toLocaleString()} m³` 
                : 'Volume: LOW CONFIDENCE / NOT QUANTIFIED'}
            </div>
          </div>

          <div style={{ fontSize: '0.66rem', color: '#64748b', borderTop: '1px solid #14223f', paddingTop: '0.35rem' }}>
            {distanceToCoast} km to {nearestCoastName} • {isQuantitative ? 'Quantitative Pathway' : `Appearance: ${appearanceClass}`}
          </div>
        </div>

        {/* CARD 2: DETECTION SCORE */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderLeft: '4px solid #38bdf8',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.3rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Detection Score
            </span>
            <span style={{
              backgroundColor: confidenceClass === 'HIGH' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
              color: confidenceClass === 'HIGH' ? '#34d399' : '#fbbf24',
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '1px 5px',
              borderRadius: '3px'
            }}>
              {confidenceClass} CONFIDENCE
            </span>
          </div>

          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace', lineHeight: 1.1 }}>
              {confidencePct}%
            </div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '0.2rem', fontWeight: 600 }}>
              Synthetic SAR Anomaly (Sentinel-1 Reference)
            </div>
          </div>

          <div style={{ fontSize: '0.66rem', color: '#64748b', borderTop: '1px solid #14223f', paddingTop: '0.35rem' }}>
            U-Net Deep Segmentation Mask • Prototype Score
          </div>
        </div>

        {/* CARD 3: PROBABLE ORIGIN */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderLeft: '4px solid #f59e0b',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.3rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Probable Origin
            </span>
            <Compass size={16} color="#f59e0b" />
          </div>

          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#fbbf24', lineHeight: 1.1 }}>
              ±{originData ? originData.origin_uncertainty_km : '3.5'} <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>km</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '0.2rem', fontWeight: 600 }}>
              Window: {originData?.release_window_start?.split('T')[1]?.slice(0, 5) || '01:45'} - {originData?.release_window_end?.split('T')[1]?.slice(0, 5) || '03:15'} UTC
            </div>
          </div>

          <div style={{ fontSize: '0.66rem', color: '#64748b', borderTop: '1px solid #14223f', paddingTop: '0.35rem' }}>
            Leeway Vector: {originData?.net_drift_direction_deg || 236}° at {originData?.net_drift_speed_kts || 1.15} kts
          </div>
        </div>

        {/* CARD 4: TOP CANDIDATE */}
        <div style={{
          backgroundColor: '#0e172a',
          border: `1px solid ${isLeakConfirmed ? '#10b981' : '#38bdf8'}`,
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          boxShadow: isLeakConfirmed ? '0 0 16px rgba(16, 185, 129, 0.2)' : '0 0 14px rgba(56, 189, 248, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.3rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: isLeakConfirmed ? '#34d399' : '#38bdf8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              {isLeakConfirmed ? 'Confirmed Source' : 'Top Candidate'}
            </span>
            <Award size={16} color={isLeakConfirmed ? '#34d399' : '#38bdf8'} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: isLeakConfirmed ? '#34d399' : '#38bdf8', fontFamily: 'monospace', lineHeight: 1.1 }}>
                {isLeakConfirmed ? (topCandidate?.scores?.total_score || 96) : (topCandidate?.scores?.total_score || 87)}
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>/100</span>
              </div>
              <strong style={{ fontSize: '0.82rem', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                {confirmedSource?.name?.replace(' - DEMO', '') || (topCandidate ? topCandidate.vessel_name.replace(' - DEMO', '') : 'MT Ocean Pioneer')}
              </strong>
            </div>

            <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Status: <strong style={{
                color: isLeakConfirmed ? '#34d399' : (topCandidate?.verification_status === 'NOT DETECTED' ? '#f87171' : (topCandidate?.verification_status === 'SUSPECTED' ? '#fbbf24' : '#38bdf8')),
                textTransform: 'uppercase'
              }}>
                {isLeakConfirmed ? 'VERIFIED LEAK (SOURCE VERIFIED — DEMO)' : (topCandidate?.verification_status || 'UNVERIFIED')}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #14223f', paddingTop: '0.35rem' }}>
            <span style={{ fontSize: '0.64rem', color: '#64748b' }}>
              {topCandidate?.cargo_compatibility || 'Oil Compatible'}
            </span>
            <button
              onClick={() => onNavigateTab('investigation')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                padding: 0
              }}
            >
              Verify Candidate &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* 3. MAIN CENTER STAGE: SPATIAL INTELLIGENCE MAP (LEFT) + CURRENT RESPONSE STATUS & ACTIONS (RIGHT) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '0.9rem',
        flex: 1,
        minHeight: '420px'
      }}>
        {/* PANEL 5: SPATIAL INTELLIGENCE MAP */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderRadius: '10px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 20px rgba(0,0,0,0.6)'
        }}>
          <div style={{
            backgroundColor: '#0a1120',
            padding: '0.55rem 1rem',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={15} color="#38bdf8" />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>
                SPATIAL INTELLIGENCE MAP
              </span>
            </div>

            <div style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'flex', gap: '0.8rem' }}>
              <span>Forward: <strong style={{ color: '#fbbf24' }}>+{isLeakConfirmed ? 12 : 6}h Forecast</strong></span>
              <span>Exclusion Corridor: <strong style={{ color: '#f43f5e' }}>~{isLeakConfirmed ? 220 : 25} km²</strong></span>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: '380px', position: 'relative' }}>
            <MaritimeMap
              spillData={spillData}
              originData={originData}
              forwardDrift={forwardDrift}
              candidateVessels={candidateVessels}
              atRiskVessels={atRiskVessels}
              selectedVessel={selectedVessel}
              onSelectVessel={onSelectVessel}
              height="100%"
              minHeight="380px"
              autoFit={true}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: CURRENT RESPONSE STATUS (PANEL 6) + TOP RECOMMENDED ACTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* PANEL 6: CURRENT RESPONSE STATUS */}
          <div style={{
            backgroundColor: '#0e172a',
            border: isLeakConfirmed ? '1.5px solid #ef4444' : '1px solid #1e293b',
            borderRadius: '10px',
            padding: '0.9rem 1.1rem',
            boxShadow: isLeakConfirmed ? '0 0 20px rgba(239,68,68,0.2)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={16} color={isLeakConfirmed ? '#ef4444' : '#38bdf8'} />
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>
                  CURRENT RESPONSE STATUS
                </span>
              </div>

              <span style={{
                backgroundColor: isLeakConfirmed ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                color: isLeakConfirmed ? '#fca5a5' : '#38bdf8',
                border: `1px solid ${isLeakConfirmed ? '#ef4444' : '#38bdf8'}`,
                fontSize: '0.64rem',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '3px',
                textTransform: 'uppercase'
              }}>
                {isLeakConfirmed ? 'TIER-2 OFFSHORE ACTIVE' : 'INVESTIGATION PHASE'}
              </span>
            </div>

            {isLeakConfirmed ? (
              /* Automatic 6-Milestone Post-Verification Response Chain */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.4rem',
                  backgroundColor: '#070b14',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  padding: '0.55rem'
                }}>
                  {[
                    { label: 'Source Verified', detail: 'VERIFIED LEAK (MT Ocean Pioneer)' },
                    { label: 'Forward Drift', detail: '+12h Hydrodynamic Forecast' },
                    { label: 'Exclusion Zone', detail: '~220 km² Active Corridor' },
                    { label: 'At-Risk Ships', detail: '8 Flagged on Route' },
                    { label: 'Nav Warning', detail: 'NAVAREA VIII 142/2026 Broadcast' },
                    { label: 'Response Team', detail: 'Deployment Initiated (Tier-2)' }
                  ].map((m, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.68rem',
                      color: '#cbd5e1'
                    }}>
                      <div style={{
                        width: '15px',
                        height: '15px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        fontSize: '0.6rem',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>✓</div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 800, color: '#34d399', whiteSpace: 'nowrap' }}>{m.label}</div>
                        <div style={{ fontSize: '0.6rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{m.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    🚨 8 route vessels automatically notified. Broadcast active via NAVTEX & VHF.
                  </span>
                  <button
                    onClick={() => onNavigateTab('notifications')}
                    style={{
                      background: 'rgba(56, 189, 248, 0.12)',
                      color: '#38bdf8',
                      border: '1px solid #38bdf8',
                      borderRadius: '4px',
                      padding: '0.25rem 0.6rem',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    View Notifications &rarr;
                  </button>
                </div>
              </div>
            ) : (
              /* Pre-Confirmation Ready State */
              <div style={{
                backgroundColor: '#070b14',
                border: '1px solid #1e293b',
                borderRadius: '6px',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#f1f5f9' }}>
                    Top Candidate: {topCandidate?.vessel_name || 'MT Ocean Pioneer'} (Score: {topCandidate?.scores?.total_score || 87}/100)
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                    Awaiting human-in-the-loop verification on the Investigation page to trigger automatic response cascade.
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab('investigation')}
                  style={{
                    background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                    color: '#ffffff',
                    border: '1px solid #ef4444',
                    borderRadius: '5px',
                    padding: '0.45rem 0.9rem',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    boxShadow: '0 0 12px rgba(239,68,68,0.4)'
                  }}
                >
                  <AlertTriangle size={14} />
                  <span>CONFIRM LEAK</span>
                </button>
              </div>
            )}
          </div>

          {/* TOP RECOMMENDED ACTIONS (STREAMLINED LIST) */}
          <div style={{
            backgroundColor: '#0e172a',
            border: '1px solid #1e293b',
            borderRadius: '10px',
            padding: '0.9rem 1.1rem',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <ShieldCheck size={16} color="#38bdf8" />
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>
                  TOP RECOMMENDED ACTIONS
                </span>
              </div>
              <span style={{ fontSize: '0.66rem', color: '#64748b' }}>
                Conditional Decision Support
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', maxHeight: '280px' }}>
              {(recommendedActions || []).slice(0, 4).map((act) => {
                const isCrit = act.priority === 'CRITICAL';
                const isHigh = act.priority === 'HIGH';
                const pColor = isCrit ? '#ef4444' : (isHigh ? '#f59e0b' : '#38bdf8');
                const isExec = act.status?.includes('EXECUTED');

                return (
                  <div
                    key={act.action_id}
                    style={{
                      backgroundColor: '#070b14',
                      border: `1px solid ${isExec ? '#065f46' : '#1e293b'}`,
                      borderLeft: `3px solid ${pColor}`,
                      borderRadius: '5px',
                      padding: '0.55rem 0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.6rem'
                    }}
                  >
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{
                          backgroundColor: `${pColor}22`,
                          color: pColor,
                          fontSize: '0.58rem',
                          fontWeight: 800,
                          padding: '1px 4px',
                          borderRadius: '2px'
                        }}>
                          {act.priority}
                        </span>
                        <strong style={{ fontSize: '0.78rem', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {act.title}
                        </strong>
                      </div>
                      <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: '0.15rem 0 0 0', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {act.rationale}
                      </p>
                    </div>

                    {!isExec ? (
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
                          backgroundColor: isCrit ? '#991b1b' : '#0369a1',
                          color: '#ffffff',
                          border: `1px solid ${pColor}`,
                          borderRadius: '4px',
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          boxShadow: `0 0 8px ${pColor}33`
                        }}
                      >
                        <Send size={11} />
                        <span>SIMULATE</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 800, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <CheckCircle2 size={12} /> EXECUTED
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
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
