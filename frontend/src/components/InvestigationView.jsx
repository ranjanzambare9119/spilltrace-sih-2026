import React, { useState } from 'react';
import { 
  Award, 
  HelpCircle, 
  FileText, 
  Ship, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Navigation,
  ChevronRight,
  ShieldAlert,
  UserCheck,
  AlertTriangle,
  Radio
} from 'lucide-react';
import VesselDetailModal from './VesselDetailModal';
import InvestigationReportModal from './InvestigationReportModal';
import CandidateVerificationModal from './CandidateVerificationModal';

export default function InvestigationView({
  candidateVessels,
  spillData,
  originData,
  selectedVessel,
  onSelectVessel,
  onVerifyCandidate,
  isLeakConfirmed = false,
  investigationState = 'CANDIDATE',
  onLoadDemo,
  isDemoActive
}) {
  const [detailModalVessel, setDetailModalVessel] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [verifyingVessel, setVerifyingVessel] = useState(null);

  const candidates = candidateVessels || [];
  const topCandidate = candidates.length > 0 ? candidates[0] : null;

  return (
    <div
      className="page-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.1rem',
        minHeight: 'calc(100vh - 120px)'
      }}
    >
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0e172a',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '0.8rem 1.1rem',
        flexWrap: 'wrap',
        gap: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: '1 1 260px' }}>
          <div style={{
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '6px',
            padding: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Award size={22} color="#38bdf8" />
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 className="heading-lg" style={{ fontWeight: 800, color: '#f1f5f9', margin: 0 }}>
              Investigation &amp; Candidate Attribution
            </h2>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '0.1rem 0 0 0' }}>
              Algorithmic ranking of 10 candidate vessels based on spatial proximity, release timing, drift alignment, vessel class, and AIS behavioral anomalies
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowReportModal(true)}
            className="btn-primary mobile-full-btn"
            style={{
              padding: '0.52rem 1.05rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <FileText size={15} />
            <span>Investigation Summary Report</span>
          </button>
        </div>
      </div>

      {/* Main Container: Top Candidate Hero Card + Other Candidates OR Clean Empty State */}
      {candidates.length === 0 ? (
        <div style={{
          backgroundColor: '#0a101d',
          border: '1px solid #1e293b',
          borderRadius: '10px',
          padding: '3rem 1.2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '1.2rem',
          minHeight: '380px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={30} color="#38bdf8" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9', margin: '0 0 0.4rem 0' }}>
              NO INCIDENT UNDER INVESTIGATION
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: '480px', margin: 0, lineHeight: 1.5 }}>
              No candidate vessels have been attributed to an incident yet. Complete satellite analysis and AIS vessel correlation, or load the synthetic demo scenario.
            </p>
          </div>
          {onLoadDemo && (
            <button
              onClick={onLoadDemo}
              className="btn-primary mobile-full-btn"
              style={{ padding: '0.65rem 1.6rem', fontSize: '0.85rem', fontWeight: 800 }}
            >
              LOAD DEMO SCENARIO
            </button>
          )}
        </div>
      ) : (
        <div className="investigation-grid">
          {/* Left Column: TOP CANDIDATE VISUALLY DOMINANT HERO */}
          {topCandidate ? (
          <div style={{
            backgroundColor: '#0e172a',
            border: '2px solid #38bdf8',
            borderRadius: '10px',
            padding: '1.15rem',
            boxShadow: '0 0 25px rgba(56, 189, 248, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            minWidth: 0
          }}>
            {/* Hero Top Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ minWidth: 0, flex: '1 1 220px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <span style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px'
                  }}>
                    TOP CANDIDATE (RANK #1)
                  </span>

                  <span style={{
                    backgroundColor: (isLeakConfirmed || topCandidate.verification_status === 'confirmed' || topCandidate.verification_status === 'VERIFIED LEAK')
                      ? 'rgba(239,68,68,0.25)' 
                      : (topCandidate.verification_status === 'not_detected' ? 'rgba(239,68,68,0.2)' : 'rgba(56,189,248,0.2)'),
                    border: `1px solid ${(isLeakConfirmed || topCandidate.verification_status === 'confirmed' || topCandidate.verification_status === 'VERIFIED LEAK') ? '#ef4444' : (topCandidate.verification_status === 'not_detected' ? '#ef4444' : '#38bdf8')}`,
                    color: (isLeakConfirmed || topCandidate.verification_status === 'confirmed' || topCandidate.verification_status === 'VERIFIED LEAK') ? '#fca5a5' : (topCandidate.verification_status === 'not_detected' ? '#f87171' : '#38bdf8'),
                    fontSize: '0.66rem',
                    fontWeight: 900,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    boxShadow: (isLeakConfirmed || topCandidate.verification_status === 'confirmed') ? '0 0 12px rgba(239,68,68,0.5)' : 'none'
                  }}>
                    {(isLeakConfirmed || topCandidate.verification_status === 'confirmed' || topCandidate.verification_status === 'VERIFIED LEAK') && (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 6px #ef4444' }}></span>
                    )}
                    {(isLeakConfirmed || topCandidate.verification_status === 'confirmed' || topCandidate.verification_status === 'VERIFIED LEAK') 
                      ? 'VERIFIED LEAK (SOURCE VERIFIED — DEMO)' 
                      : (topCandidate.verification_status || 'UNVERIFIED')}
                  </span>
                </div>

                <h3 style={{
                  fontSize: 'clamp(1.2rem, 2.2vw, 1.55rem)',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginTop: '0.45rem',
                  marginBottom: '0.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  wordBreak: 'break-word'
                }}>
                  <span>🚢</span>
                  <span>{topCandidate.vessel_name}</span>
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    {topCandidate.vessel_type} • MMSI: <strong>{topCandidate.mmsi}</strong> • Flag: <strong>{topCandidate.flag}</strong>
                  </div>
                  <span style={{
                    fontSize: '0.64rem',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontWeight: 800,
                    backgroundColor: topCandidate.oil_compatible ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.12)',
                    color: topCandidate.oil_compatible ? '#34d399' : '#94a3b8',
                    border: `1px solid ${topCandidate.oil_compatible ? '#10b981' : '#475569'}`
                  }}>
                    {topCandidate.cargo_compatibility || (topCandidate.oil_compatible ? 'Oil Compatible' : 'Not Oil Compatible')}
                  </span>
                </div>
              </div>

              {/* Big Score Box */}
              <div style={{
                textAlign: 'right',
                backgroundColor: '#070b14',
                border: '1px solid #1f345e',
                borderRadius: '8px',
                padding: '0.65rem 1rem'
              }}>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                  Source-Likelihood Score
                </div>
                <div style={{
                  fontSize: 'clamp(1.75rem, 3vw, 2.2rem)',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  color: '#38bdf8',
                  lineHeight: 1.1,
                  marginTop: '0.15rem'
                }}>
                  {topCandidate.scores?.total_score}
                  <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 600 }}> / 100</span>
                </div>
                {topCandidate.original_score && (
                  <div style={{ fontSize: '0.64rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                    (Original: {topCandidate.original_score}/100)
                  </div>
                )}
              </div>
            </div>

            {/* AIS Behavioral Anomaly Alert (if detected) */}
            {topCandidate.ais_anomaly_detected && (
              <div style={{
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid #f59e0b',
                borderRadius: '6px',
                padding: '0.6rem 0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                fontSize: '0.74rem',
                color: '#fbbf24'
              }}>
                <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
                <div>
                  <strong>AIS Behavioral Anomaly Detected:</strong> {topCandidate.ais_anomaly_detail || 'Speed reduction near estimated release window.'}
                </div>
              </div>
            )}

            {/* Key Evidence Summary */}
            <div style={{
              backgroundColor: '#070b14',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Key Evidence Summary:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.78rem', color: '#f1f5f9' }}>
                  <span style={{ fontSize: '0.95rem', flexShrink: 0 }}>📍</span>
                  <span><strong>Near probable origin:</strong> Intersected within <strong>{topCandidate.cpa_distance_km} km</strong> of estimated origin center.</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.78rem', color: '#f1f5f9' }}>
                  <span style={{ fontSize: '0.95rem', flexShrink: 0 }}>🕐</span>
                  <span><strong>Strong time match:</strong> Present at <strong>{topCandidate.cpa_time?.split('T')[1]?.slice(0, 5)} UTC</strong>, coinciding directly with discharge window.</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.78rem', color: '#f1f5f9' }}>
                  <span style={{ fontSize: '0.95rem', flexShrink: 0 }}>🧭</span>
                  <span><strong>Track aligned with drift:</strong> Heading aligned within <strong>{topCandidate.scores?.heading_alignment_deg}°</strong> of the ocean leeway axis.</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.78rem', color: '#f1f5f9' }}>
                  <span style={{ fontSize: '0.95rem', flexShrink: 0 }}>🚢</span>
                  <span><strong>Cargo Profile:</strong> {topCandidate.cargo_compatibility || (topCandidate.oil_compatible ? 'Oil Compatible' : 'Not Oil Compatible')}.</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: WHY Breakdown + 3 Verification Actions (CONFIRM LEAK / SUSPECTED / NOT DETECTED) */}
            <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={() => setDetailModalVessel(topCandidate)}
                style={{
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  color: '#ffffff',
                  border: '1px solid #38bdf8',
                  borderRadius: '6px',
                  padding: '0.5rem 0.9rem',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 0 14px rgba(56, 189, 248, 0.3)'
                }}
              >
                <HelpCircle size={15} />
                <span>[ WHY? ] Breakdown</span>
              </button>

              {/* 1. CONFIRM LEAK */}
              <button
                onClick={() => {
                  if (onVerifyCandidate && !isLeakConfirmed) {
                    onVerifyCandidate(
                      topCandidate.mmsi,
                      'confirmed',
                      'On-scene aerial FLIR & physical inspection confirmed active discharge matching SAR anomaly morphology.'
                    );
                  }
                }}
                disabled={isLeakConfirmed}
                style={{
                  background: isLeakConfirmed 
                    ? 'rgba(16, 185, 129, 0.2)' 
                    : 'linear-gradient(135deg, #dc2626, #991b1b)',
                  color: isLeakConfirmed ? '#34d399' : '#ffffff',
                  border: `1.5px solid ${isLeakConfirmed ? '#10b981' : '#ef4444'}`,
                  borderRadius: '6px',
                  padding: '0.5rem 1.05rem',
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  cursor: isLeakConfirmed ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: isLeakConfirmed ? 'none' : '0 0 20px rgba(239, 68, 68, 0.65)',
                  letterSpacing: '0.04em',
                  transition: 'all 0.2s ease'
                }}
                title="Immediately execute automatic downstream response chain"
              >
                {isLeakConfirmed ? <CheckCircle2 size={16} color="#10b981" /> : <AlertTriangle size={16} />}
                <span>{isLeakConfirmed ? 'LEAK VERIFIED (CHAIN ACTIVE)' : 'CONFIRM LEAK'}</span>
              </button>

              {/* 2. SUSPECTED */}
              <button
                onClick={() => {
                  if (onVerifyCandidate) {
                    onVerifyCandidate(
                      topCandidate.mmsi,
                      'suspected',
                      'Inconclusive telemetry/visual signals; flagged as suspected under heightened monitoring.'
                    );
                  }
                }}
                style={{
                  background: topCandidate.verification_status === 'SUSPECTED' ? 'rgba(245, 158, 11, 0.25)' : '#1e293b',
                  color: '#fbbf24',
                  border: `1px solid ${topCandidate.verification_status === 'SUSPECTED' ? '#f59e0b' : '#d97706'}`,
                  borderRadius: '6px',
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
                title="Keep candidate under active investigation without emergency cascade"
              >
                <AlertTriangle size={15} color="#f59e0b" />
                <span>{topCandidate.verification_status === 'SUSPECTED' ? 'SUSPECTED (ACTIVE)' : 'SUSPECTED'}</span>
              </button>

              {/* 3. NOT DETECTED */}
              <button
                onClick={() => {
                  if (onVerifyCandidate) {
                    onVerifyCandidate(
                      topCandidate.mmsi,
                      'not_detected',
                      'Physical/aerial inspection found clean hull. 60% score penalty applied.'
                    );
                  }
                }}
                style={{
                  background: topCandidate.verification_status === 'NOT DETECTED' ? 'rgba(239, 68, 68, 0.2)' : '#1e293b',
                  color: topCandidate.verification_status === 'NOT DETECTED' ? '#f87171' : '#94a3b8',
                  border: `1px solid ${topCandidate.verification_status === 'NOT DETECTED' ? '#ef4444' : '#475569'}`,
                  borderRadius: '6px',
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
                title="Penalize score by 60% and rerank fleet without response cascade"
              >
                <UserCheck size={15} color="#94a3b8" />
                <span>NOT DETECTED</span>
              </button>

              {/* Modal trigger */}
              <button
                onClick={() => setVerifyingVessel(topCandidate)}
                style={{
                  background: 'transparent',
                  color: '#64748b',
                  border: '1px dashed #334155',
                  borderRadius: '6px',
                  padding: '0.5rem 0.7rem',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                title="Open detailed inspection modal"
              >
                Inspector Form...
              </button>
            </div>
          </div>
        ) : null}

        {/* Right Column: Other Screened Candidate Vessels */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderRadius: '10px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          minWidth: 0
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                All Screened Candidate Vessels ({candidates.length})
              </span>
              <span style={{ fontSize: '0.6rem', backgroundColor: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '1px 5px', borderRadius: '3px', fontWeight: 800 }}>
                SYNTHETIC DEMO AIS SCENARIO
              </span>
            </div>
            <span style={{ fontSize: '0.66rem', color: '#64748b' }}>Dynamic Fleet Reranking</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', overflowY: 'auto', maxHeight: '520px' }}>
            {candidates.map((vessel) => {
              const isRank1 = vessel.rank === 1;
              const score = vessel.scores?.total_score || 0;

              return (
                <div
                  key={vessel.mmsi}
                  style={{
                    backgroundColor: isRank1 ? '#162444' : '#070b14',
                    border: isRank1 ? '1px solid #38bdf8' : '1px solid #1e293b',
                    borderRadius: '6px',
                    padding: '0.65rem 0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.55rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flex: '1 1 180px', minWidth: 0 }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '4px',
                      backgroundColor: isRank1 ? '#0284c7' : '#1e293b',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.76rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      #{vessel.rank}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f1f5f9', wordBreak: 'break-word' }}>
                          {vessel.vessel_name}
                        </span>
                        {vessel.ais_anomaly_detected && (
                          <span style={{ fontSize: '0.58rem', backgroundColor: 'rgba(245,158,11,0.2)', color: '#f59e0b', padding: '1px 4px', borderRadius: '2px', fontWeight: 700 }} title="AIS Anomaly Detected">
                            ANOMALY
                          </span>
                        )}
                        {vessel.verification_status !== 'unverified' && (
                          <span style={{
                            fontSize: '0.58rem',
                            backgroundColor: vessel.verification_status === 'not_detected' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                            color: vessel.verification_status === 'not_detected' ? '#f87171' : '#34d399',
                            padding: '1px 4px',
                            borderRadius: '2px',
                            fontWeight: 800,
                            textTransform: 'uppercase'
                          }}>
                            {vessel.verification_status}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                          {vessel.vessel_type} • CPA: {vessel.cpa_distance_km} km
                        </span>
                        <span style={{
                          fontSize: '0.58rem',
                          padding: '1px 5px',
                          borderRadius: '2px',
                          fontWeight: 700,
                          backgroundColor: vessel.oil_compatible ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.1)',
                          color: vessel.oil_compatible ? '#34d399' : '#64748b'
                        }}>
                          {vessel.oil_compatible ? 'Oil Compatible' : 'Not Oil Compatible'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '0.96rem',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        color: isRank1 ? '#38bdf8' : (score >= 50 ? '#fbbf24' : '#94a3b8')
                      }}>
                        {score}<span style={{ fontSize: '0.68rem', fontWeight: 500 }}>/100</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setDetailModalVessel(vessel)}
                      style={{
                        padding: '0.28rem 0.55rem',
                        backgroundColor: '#1e293b',
                        color: '#38bdf8',
                        border: '1px solid #334155',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                      title="Inspect 5-factor breakdown"
                    >
                      WHY?
                    </button>

                    <button
                      onClick={() => setVerifyingVessel(vessel)}
                      style={{
                        padding: '0.28rem 0.55rem',
                        backgroundColor: '#070b14',
                        color: '#cbd5e1',
                        border: '1px solid #1e293b',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                      title="Log physical inspection outcome"
                    >
                      VERIFY
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {/* MODAL 1: 5-FACTOR SCORE BREAKDOWN */}
      {detailModalVessel && (
        <VesselDetailModal
          vessel={detailModalVessel}
          originData={originData}
          onClose={() => setDetailModalVessel(null)}
        />
      )}

      {/* MODAL 2: INVESTIGATION REPORT */}
      {showReportModal && (
        <InvestigationReportModal
          spillData={spillData}
          originData={originData}
          candidateVessels={candidates}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* MODAL 3: CANDIDATE VERIFICATION FEEDBACK LOOP */}
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
