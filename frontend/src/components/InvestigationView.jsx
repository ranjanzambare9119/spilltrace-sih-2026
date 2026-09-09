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
  investigationState = 'CANDIDATE'
}) {
  const [detailModalVessel, setDetailModalVessel] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [verifyingVessel, setVerifyingVessel] = useState(null);

  const candidates = candidateVessels || [];
  const topCandidate = candidates.length > 0 ? candidates[0] : null;

  return (
    <div style={{ padding: '1.2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', minHeight: 'calc(100vh - 120px)' }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0e172a',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '0.8rem 1.2rem',
        flexWrap: 'wrap',
        gap: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '6px',
            padding: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={22} color="#38bdf8" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>
              Investigation &amp; Candidate Attribution
            </h2>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: 0 }}>
              Algorithmic ranking of 10 candidate vessels based on spatial proximity, release timing, drift alignment, vessel class, and AIS behavioral anomalies
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            onClick={() => setShowReportModal(true)}
            className="btn-primary"
            style={{
              padding: '0.55rem 1.15rem',
              fontSize: '0.8rem',
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

      {/* Main Container: Top Candidate Hero Card + Other Candidates */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.2rem' }}>
        {/* Left Column: TOP CANDIDATE VISUALLY DOMINANT HERO */}
        {topCandidate ? (
          <div style={{
            backgroundColor: '#0e172a',
            border: '2px solid #38bdf8',
            borderRadius: '10px',
            padding: '1.4rem',
            boxShadow: '0 0 25px rgba(56, 189, 248, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.1rem'
          }}>
            {/* Hero Top Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.65rem',
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
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    padding: '0.2rem 0.6rem',
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
                  fontSize: '1.55rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginTop: '0.5rem',
                  marginBottom: '0.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>🚢</span>
                  <span>{topCandidate.vessel_name}</span>
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  {topCandidate.vessel_type} • MMSI: <strong>{topCandidate.mmsi}</strong> • Flag: <strong>{topCandidate.flag}</strong>
                </div>
              </div>

              {/* Big Score Box */}
              <div style={{
                textAlign: 'right',
                backgroundColor: '#070b14',
                border: '1px solid #1f345e',
                borderRadius: '8px',
                padding: '0.75rem 1.15rem'
              }}>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                  Source-Likelihood Score
                </div>
                <div style={{
                  fontSize: '2.2rem',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  color: '#38bdf8',
                  lineHeight: 1.1,
                  marginTop: '0.15rem'
                }}>
                  {topCandidate.scores?.total_score}
                  <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600 }}> / 100</span>
                </div>
                {topCandidate.original_score && (
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.1rem' }}>
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
                padding: '0.65rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                fontSize: '0.76rem',
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
              padding: '0.9rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Key Evidence Summary:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: '#f1f5f9' }}>
                  <span style={{ fontSize: '1rem' }}>📍</span>
                  <span><strong>Near probable origin:</strong> Intersected within <strong>{topCandidate.cpa_distance_km} km</strong> of estimated origin center.</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: '#f1f5f9' }}>
                  <span style={{ fontSize: '1rem' }}>🕐</span>
                  <span><strong>Strong time match:</strong> Present at <strong>{topCandidate.cpa_time?.split('T')[1]?.slice(0, 5)} UTC</strong>, coinciding directly with discharge window.</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: '#f1f5f9' }}>
                  <span style={{ fontSize: '1rem' }}>🧭</span>
                  <span><strong>Track aligned with drift:</strong> Heading aligned within <strong>{topCandidate.scores?.heading_alignment_deg}°</strong> of the ocean leeway axis.</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: '#f1f5f9' }}>
                  <span style={{ fontSize: '1rem' }}>🚢</span>
                  <span><strong>Vessel context compatible:</strong> High-risk tanker / carrier profile matching persistent slick characteristics.</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: WHY Breakdown + Physical Verification + 1-Click CONFIRM LEAK */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={() => setDetailModalVessel(topCandidate)}
                style={{
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  color: '#ffffff',
                  border: '1px solid #38bdf8',
                  borderRadius: '6px',
                  padding: '0.55rem 1.15rem',
                  fontSize: '0.8rem',
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

              <button
                onClick={() => setVerifyingVessel(topCandidate)}
                style={{
                  background: '#1e293b',
                  color: '#38bdf8',
                  border: '1px solid #38bdf8',
                  borderRadius: '6px',
                  padding: '0.55rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <UserCheck size={15} />
                <span>INSPECT / VERIFY</span>
              </button>

              {/* DIRECT 1-CLICK AUTOMATIC POST-VERIFICATION TRIGGER */}
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
                  padding: '0.55rem 1.35rem',
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  cursor: isLeakConfirmed ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: isLeakConfirmed ? 'none' : '0 0 20px rgba(239, 68, 68, 0.65)',
                  letterSpacing: '0.04em',
                  transition: 'all 0.2s ease'
                }}
              >
                {isLeakConfirmed ? <CheckCircle2 size={16} color="#10b981" /> : <AlertTriangle size={16} />}
                <span>{isLeakConfirmed ? 'LEAK VERIFIED (AUTOMATIC CHAIN ACTIVE)' : 'CONFIRM LEAK'}</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* Right Column: Other Screened Candidate Vessels */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderRadius: '10px',
          padding: '1.1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                All Screened Candidate Vessels ({candidates.length})
              </span>
              <span style={{ fontSize: '0.62rem', backgroundColor: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '1px 5px', borderRadius: '3px', fontWeight: 800 }}>
                SYNTHETIC DEMO AIS SCENARIO
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Dynamic Fleet Reranking</span>
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
                    padding: '0.65rem 0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.6rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '4px',
                      backgroundColor: isRank1 ? '#0284c7' : '#1e293b',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      #{vessel.rank}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f1f5f9' }}>
                          {vessel.vessel_name}
                        </span>
                        {vessel.ais_anomaly_detected && (
                          <span style={{ fontSize: '0.6rem', backgroundColor: 'rgba(245,158,11,0.2)', color: '#f59e0b', padding: '1px 4px', borderRadius: '2px', fontWeight: 700 }} title="AIS Anomaly Detected">
                            ANOMALY
                          </span>
                        )}
                        {vessel.verification_status !== 'unverified' && (
                          <span style={{
                            fontSize: '0.6rem',
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
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                        {vessel.vessel_type} • CPA: {vessel.cpa_distance_km} km
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        color: isRank1 ? '#38bdf8' : (score >= 50 ? '#fbbf24' : '#94a3b8')
                      }}>
                        {score}<span style={{ fontSize: '0.7rem', fontWeight: 500 }}>/100</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setDetailModalVessel(vessel)}
                      style={{
                        padding: '0.25rem 0.5rem',
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
                        padding: '0.25rem 0.5rem',
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
