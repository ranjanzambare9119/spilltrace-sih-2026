import React, { useState } from 'react';
import { 
  Award, 
  HelpCircle, 
  ChevronRight, 
  Sparkles, 
  Bot, 
  Clock, 
  CheckCircle2, 
  Compass, 
  Navigation, 
  Ship, 
  ShieldAlert, 
  ExternalLink,
  LifeBuoy,
  Send,
  FileText,
  Radio,
  Eye
} from 'lucide-react';

export function ActiveSpillCard({
  spillData,
  originData,
  onOpenInvestigation,
  onViewMap,
  onRunCorrelation,
  isCorrelating
}) {
  const area = spillData?.area_km2 || '14.85';
  const confidence = spillData?.confidence ? (spillData.confidence * 100).toFixed(1) : '94.2';
  const lat = spillData?.latitude || '18.9500';
  const lon = spillData?.longitude || '72.4000';
  const driftDir = originData?.net_drift_direction_deg ? `${originData.net_drift_direction_deg}° (${originData.net_drift_speed_kts} kts)` : '54.3° (1.68 kts)';

  return (
    <div style={{
      backgroundColor: '#0c1322',
      border: '1px solid #1e293b',
      borderLeft: '4px solid #ef4444',
      borderRadius: '8px',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
    }}>
      {/* Card Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#ef4444',
            boxShadow: '0 0 8px #ef4444'
          }} />
          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>
            ACTIVE OIL SPILL
          </span>
        </div>
        <span style={{
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: '#6ee7b7',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '4px',
          padding: '1px 6px',
          fontSize: '0.62rem',
          fontWeight: 700
        }}>
          ANALYSIS ACTIVE
        </span>
      </div>

      {/* Incident Details Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.5rem',
        fontSize: '0.74rem',
        backgroundColor: '#070b14',
        padding: '0.65rem 0.8rem',
        borderRadius: '6px',
        border: '1px solid #1e293b'
      }}>
        <div>
          <span style={{ color: '#64748b' }}>Incident:</span>{' '}
          <strong style={{ color: '#f1f5f9', fontFamily: 'monospace' }}>ST-2026-DEMO-001</strong>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Location:</span>{' '}
          <strong style={{ color: '#38bdf8' }}>Arabian Sea</strong>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Coordinates:</span>{' '}
          <span style={{ color: '#cbd5e1', fontFamily: 'monospace' }}>{lat}°N, {lon}°E</span>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Detection Score:</span>{' '}
          <strong style={{ color: '#10b981' }}>{confidence}%</strong>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Spill Area:</span>{' '}
          <strong style={{ color: '#ef4444' }}>{area} km²</strong>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Probable Origin:</span>{' '}
          <span style={{ color: '#fbbf24', fontWeight: 700 }}>Estimated</span>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Net Leeway Drift:</span>{' '}
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>{driftDir}</span>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Dispersion:</span>{' '}
          <span style={{ color: '#f59e0b' }}>±3.5 km envelope</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={onOpenInvestigation}
          style={{
            flex: 1,
            backgroundColor: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '5px',
            padding: '0.42rem 0.6rem',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem'
          }}
        >
          <ExternalLink size={12} color="#38bdf8" />
          <span>OPEN INCIDENT</span>
        </button>

        <button
          onClick={onViewMap}
          style={{
            flex: 1,
            backgroundColor: '#1e293b',
            color: '#cbd5e1',
            border: '1px solid #334155',
            borderRadius: '5px',
            padding: '0.42rem 0.6rem',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem'
          }}
        >
          <Eye size={12} color="#38bdf8" />
          <span>VIEW MAP</span>
        </button>

        <button
          onClick={onRunCorrelation}
          disabled={isCorrelating}
          style={{
            flex: 1,
            background: isCorrelating ? '#1e293b' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            border: '1px solid #38bdf8',
            borderRadius: '5px',
            padding: '0.42rem 0.6rem',
            fontSize: '0.72rem',
            fontWeight: 800,
            cursor: isCorrelating ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem'
          }}
        >
          <span>{isCorrelating ? 'CORRELATING...' : 'RUN CORRELATION'}</span>
        </button>
      </div>
    </div>
  );
}

export function ResponseActionsCard({
  responseRequested,
  notificationPrepared,
  onDeployResponse,
  onNotifyAuthorities,
  onViewSpread,
  onEmergencyReport
}) {
  return (
    <div style={{
      backgroundColor: '#0c1322',
      border: '1px solid #1e293b',
      borderRadius: '8px',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.65rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>
          RESPONSE ACTIONS
        </span>
        <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>
          DECISION WORKFLOW
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {/* Action 1 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#070b14',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          padding: '0.45rem 0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LifeBuoy size={15} color="#ef4444" />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#e2e8f0' }}>Response Request</span>
          </div>
          <button
            onClick={onDeployResponse}
            style={{
              backgroundColor: responseRequested ? 'rgba(16, 185, 129, 0.2)' : '#1e293b',
              color: responseRequested ? '#6ee7b7' : '#cbd5e1',
              border: `1px solid ${responseRequested ? '#10b981' : '#334155'}`,
              borderRadius: '4px',
              padding: '0.2rem 0.55rem',
              fontSize: '0.66rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {responseRequested ? 'REQUESTED ✓' : 'DEPLOY'}
          </button>
        </div>

        {/* Action 2 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#070b14',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          padding: '0.45rem 0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Send size={15} color="#38bdf8" />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#e2e8f0' }}>Authority Notification</span>
          </div>
          <button
            onClick={onNotifyAuthorities}
            style={{
              backgroundColor: notificationPrepared ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
              color: notificationPrepared ? '#7dd3fc' : '#cbd5e1',
              border: `1px solid ${notificationPrepared ? '#38bdf8' : '#334155'}`,
              borderRadius: '4px',
              padding: '0.2rem 0.55rem',
              fontSize: '0.66rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {notificationPrepared ? 'PREPARED ✓' : 'NOTIFY'}
          </button>
        </div>

        {/* Action 3 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#070b14',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          padding: '0.45rem 0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={15} color="#f59e0b" />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#e2e8f0' }}>Spread Prediction</span>
          </div>
          <button
            onClick={onViewSpread}
            style={{
              backgroundColor: '#1e293b',
              color: '#fbbf24',
              border: '1px solid #f59e0b',
              borderRadius: '4px',
              padding: '0.2rem 0.55rem',
              fontSize: '0.66rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            ACTIVE ➔
          </button>
        </div>

        {/* Action 4 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#070b14',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          padding: '0.45rem 0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={15} color="#38bdf8" />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#e2e8f0' }}>Emergency Report</span>
          </div>
          <button
            onClick={onEmergencyReport}
            style={{
              backgroundColor: '#1e293b',
              color: '#38bdf8',
              border: '1px solid #38bdf8',
              borderRadius: '4px',
              padding: '0.2rem 0.55rem',
              fontSize: '0.66rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            GENERATE
          </button>
        </div>
      </div>
    </div>
  );
}

export function VesselRankingCard({ candidateVessels = [], onSelectVessel }) {
  const candidates = [...candidateVessels].sort((a, b) => (b.scores?.total_score || 0) - (a.scores?.total_score || 0));

  return (
    <div style={{
      backgroundColor: '#0c1322',
      border: '1px solid #1e293b',
      borderRadius: '8px',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.65rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>
            CANDIDATE VESSEL RANKING
          </span>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
            Source-Likelihood Score (0–100)
          </div>
        </div>
        <span style={{
          fontSize: '0.62rem',
          color: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.1)',
          padding: '2px 6px',
          borderRadius: '4px',
          fontWeight: 700
        }}>
          {candidates.length} CORRELATED
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {candidates.map((vessel, idx) => {
          const isTop = idx === 0;
          const score = vessel.scores?.total_score || 0;
          const barWidth = Math.max(8, score);
          const barColor = isTop ? '#38bdf8' : (score >= 50 ? '#f59e0b' : '#64748b');

          return (
            <div
              key={vessel.mmsi || idx}
              onClick={() => onSelectVessel(vessel)}
              style={{
                backgroundColor: isTop ? 'rgba(56, 189, 248, 0.08)' : '#070b14',
                border: `1px solid ${isTop ? '#0284c7' : '#1e293b'}`,
                borderRadius: '6px',
                padding: '0.45rem 0.65rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Click to view why this vessel is ranked"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', maxWidth: '75%' }}>
                  <span style={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    color: isTop ? '#38bdf8' : '#94a3b8',
                    fontFamily: 'monospace'
                  }}>
                    #{idx + 1}
                  </span>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#f1f5f9',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {vessel.vessel_name}
                  </span>
                  {isTop && (
                    <span style={{
                      backgroundColor: 'rgba(56, 189, 248, 0.2)',
                      color: '#38bdf8',
                      fontSize: '0.55rem',
                      fontWeight: 900,
                      padding: '1px 4px',
                      borderRadius: '3px',
                      border: '1px solid #38bdf8'
                    }}>
                      TOP CANDIDATE
                    </span>
                  )}
                </div>

                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 900,
                  color: barColor,
                  fontFamily: 'monospace'
                }}>
                  {score}<span style={{ fontSize: '0.62rem', color: '#64748b' }}>/100</span>
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{
                width: '100%',
                height: '5px',
                backgroundColor: '#1e293b',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${barWidth}%`,
                  height: '100%',
                  backgroundColor: barColor,
                  borderRadius: '3px',
                  boxShadow: isTop ? '0 0 8px #38bdf8' : 'none'
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ScoringBreakdownCard({ topCandidate }) {
  const scores = topCandidate?.scores || {
    distance_score: 26.5,
    time_score: 22.0,
    drift_score: 17.5,
    heading_score: 13.0,
    type_score: 8.0,
    total_score: 87.0
  };

  const factors = [
    {
      name: 'Distance to Probable Origin',
      weight: '30%',
      score: scores.distance_score,
      max: 30,
      note: 'Closest approach: 0.24 km from origin center',
      color: '#38bdf8'
    },
    {
      name: 'Release Window Time Match',
      weight: '25%',
      score: scores.time_score,
      max: 25,
      note: 'Transit at 00:30 UTC coincident with release window',
      color: '#10b981'
    },
    {
      name: 'Drift Plume Corridor Consistency',
      weight: '20%',
      score: scores.drift_score,
      max: 20,
      note: '0.01 km cross-track offset from backward leeway drift axis',
      color: '#00f0ff'
    },
    {
      name: 'Heading & Route Alignment',
      weight: '15%',
      score: scores.heading_score,
      max: 15,
      note: '0.2° deviation from shipping corridor / drift trajectory',
      color: '#f59e0b'
    },
    {
      name: 'Vessel Risk Profile & Carriage Class',
      weight: '10%',
      score: scores.type_score,
      max: 10,
      note: 'Crude Oil Tanker — heavy persistent hydrocarbon risk',
      color: '#ef4444'
    }
  ];

  return (
    <div style={{
      backgroundColor: '#0c1322',
      border: '1px solid #1e293b',
      borderRadius: '8px',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.65rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>
            WHY IS THIS VESSEL RANKED #1?
          </span>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
            5-Factor Physical Attribution Breakdown
          </div>
        </div>
        <span style={{
          fontSize: '0.74rem',
          fontWeight: 900,
          color: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.15)',
          padding: '2px 8px',
          borderRadius: '4px',
          fontFamily: 'monospace'
        }}>
          {scores.total_score} / 100 PTS
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {factors.map((f, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
              <span style={{ color: '#cbd5e1', fontWeight: 600 }}>
                {f.name} <span style={{ color: '#64748b', fontSize: '0.66rem' }}>({f.weight})</span>
              </span>
              <span style={{ color: f.color, fontWeight: 800, fontFamily: 'monospace' }}>
                {f.score} / {f.max}
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#1e293b',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(f.score / f.max) * 100}%`,
                height: '100%',
                backgroundColor: f.color
              }} />
            </div>
            <div style={{ fontSize: '0.62rem', color: '#64748b' }}>
              {f.note}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InvestigationTimeline() {
  const steps = [
    { title: 'SATELLITE DETECTION', time: '06:00 UTC', desc: 'Sentinel-1 C-Band SAR image ingested', status: 'COMPLETE', color: '#10b981' },
    { title: 'SPILL SEGMENTATION', time: '06:05 UTC', desc: '14.85 km² dark slick delineated', status: 'COMPLETE', color: '#10b981' },
    { title: 'PROBABLE ORIGIN', time: '06:08 UTC', desc: 'Estimated release timestamp ~00:30 UTC', status: 'COMPLETE', color: '#10b981' },
    { title: 'DRIFT ESTIMATION', time: '06:10 UTC', desc: '17.1 km leeway drift trajectory modeled', status: 'COMPLETE', color: '#10b981' },
    { title: 'AIS CORRELATION', time: '06:12 UTC', desc: '105 records filtered across 5 vessels', status: 'COMPLETE', color: '#10b981' },
    { title: 'SOURCE RANKING', time: '06:15 UTC', desc: '5-factor multi-attribute score computed', status: 'COMPLETE', color: '#10b981' },
    { title: 'INVESTIGATION', time: 'READY', desc: 'Actionable decision support dossier ready', status: 'READY', color: '#38bdf8' }
  ];

  return (
    <div style={{
      backgroundColor: '#0c1322',
      border: '1px solid #1e293b',
      borderRadius: '8px',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.65rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>
          INVESTIGATION TIMELINE
        </span>
        <span style={{ fontSize: '0.64rem', color: '#10b981', fontWeight: 700 }}>
          PIPELINE COLD-START READY
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {steps.map((step, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.35rem 0.55rem',
              backgroundColor: step.status === 'READY' ? 'rgba(56, 189, 248, 0.08)' : '#070b14',
              border: `1px solid ${step.status === 'READY' ? '#0284c7' : '#141c2e'}`,
              borderRadius: '4px',
              fontSize: '0.72rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: step.color,
                boxShadow: `0 0 6px ${step.color}`
              }} />
              <strong style={{ color: '#f1f5f9' }}>{step.title}</strong>
              <span style={{ color: '#64748b', fontSize: '0.64rem' }}>— {step.desc}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.64rem', fontFamily: 'monospace' }}>{step.time}</span>
              <span style={{ color: step.color, fontWeight: 800, fontSize: '0.66rem' }}>{step.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AiAssistantCard({ topCandidate }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{
      backgroundColor: '#0c1322',
      border: '1px solid #0284c7',
      borderRadius: '8px',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      boxShadow: '0 0 16px rgba(56, 189, 248, 0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            backgroundColor: 'rgba(56, 189, 248, 0.2)',
            padding: '0.3rem',
            borderRadius: '6px'
          }}>
            <Bot size={18} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc' }}>
              AI INVESTIGATION ASSISTANT
            </div>
            <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
              Explainable Decision Support Summary
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            border: '1px solid #38bdf8',
            borderRadius: '5px',
            padding: '0.35rem 0.8rem',
            fontSize: '0.72rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            boxShadow: '0 0 10px rgba(56, 189, 248, 0.3)'
          }}
        >
          <Sparkles size={12} />
          <span>{isExpanded ? 'COLLAPSE BRIEFING' : 'ASK AI TO EXPLAIN'}</span>
        </button>
      </div>

      {isExpanded ? (
        <div style={{
          backgroundColor: '#070b14',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          padding: '0.85rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          fontSize: '0.74rem',
          lineHeight: 1.5,
          color: '#cbd5e1'
        }}>
          <div>
            <strong style={{ color: '#38bdf8' }}>1. Primary Attribution Finding:</strong>
            <p style={{ margin: '0.2rem 0 0 0', color: '#e2e8f0' }}>
              Candidate vessel <strong style={{ color: '#f1f5f9' }}>MT Ocean Pioneer - DEMO</strong> scores highest with an explainable Source-Likelihood Score of <strong style={{ color: '#38bdf8' }}>87 / 100</strong>. This indicates high space-time convergence with the estimated discharge window.
            </p>
          </div>

          <div>
            <strong style={{ color: '#10b981' }}>2. Supporting Physical Evidence:</strong>
            <ul style={{ margin: '0.2rem 0 0 1.1rem', padding: 0 }}>
              <li>Closest Point of Approach (CPA): <strong>0.24 km</strong> from probable origin center.</li>
              <li>Temporal alignment: Crossed at <strong>00:30 UTC</strong>, matching the 5.5h backward leeway window.</li>
              <li>Heading congruency: Course deviation is only <strong>0.2°</strong> relative to the drift axis.</li>
              <li>Vessel carriage class: <strong>Crude Oil Tanker</strong> with persistent hydrocarbon cargo.</li>
            </ul>
          </div>

          <div>
            <strong style={{ color: '#fbbf24' }}>3. Remaining Scientific Uncertainties:</strong>
            <ul style={{ margin: '0.2rem 0 0 1.1rem', padding: 0 }}>
              <li>Ocean surface leeway vectors assume steady 14 kt wind and 1.2 kt current over 5.5 hours.</li>
              <li>AIS interval gaps between waypoints require linear kinematic interpolation.</li>
            </ul>
          </div>

          <div>
            <strong style={{ color: '#fca5a5' }}>4. Recommended Investigator Action:</strong>
            <p style={{ margin: '0.2rem 0 0 0' }}>
              Request port state control inspection of MT Ocean Pioneer's Oil Record Book (Part II), bilge discharge monitors, and bunker soundings upon next port of call.
            </p>
          </div>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#070b14',
          border: '1px solid #141c2e',
          borderRadius: '6px',
          padding: '0.65rem 0.8rem',
          fontSize: '0.72rem',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>Click "ASK AI TO EXPLAIN" to generate a deterministic 4-part evidence and uncertainty briefing for investigators.</span>
          <ChevronRight size={14} color="#38bdf8" />
        </div>
      )}
    </div>
  );
}
