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
  ShieldAlert
} from 'lucide-react';
import VesselDetailModal from './VesselDetailModal';
import InvestigationReportModal from './InvestigationReportModal';

export default function InvestigationView({
  candidateVessels,
  spillData,
  originData,
  selectedVessel,
  onSelectVessel
}) {
  const [detailModalVessel, setDetailModalVessel] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

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
        padding: '0.8rem 1.2rem'
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
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9' }}>
              Investigation &amp; Candidate Attribution
            </h2>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Objective algorithmic ranking based on spatial proximity, release timing, drift alignment, and vessel type
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          className="btn-primary"
          style={{
            padding: '0.6rem 1.2rem',
            fontSize: '0.82rem',
            fontWeight: 700
          }}
        >
          <FileText size={15} />
          <span>Investigation Summary Report</span>
        </button>
      </div>

      {/* Main Container: Top Candidate Hero Card + Other Candidates */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.2rem' }}>
        {/* Left Column: TOP CANDIDATE VISUALLY DOMINANT HERO */}
        {topCandidate ? (
          <div style={{
            backgroundColor: '#0e172a',
            border: '2px solid #38bdf8',
            borderRadius: '10px',
            padding: '1.5rem',
            boxShadow: '0 0 25px rgba(56, 189, 248, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem'
          }}>
            {/* Hero Top Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '0.25rem 0.7rem',
                  borderRadius: '4px'
                }}>
                  TOP CANDIDATE
                </span>
                <h3 style={{
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginTop: '0.6rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>🚢</span>
                  <span>{topCandidate.vessel_name}</span>
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  {topCandidate.vessel_type}
                </div>
              </div>

              {/* Big Score Box */}
              <div style={{
                textAlign: 'right',
                backgroundColor: '#070b14',
                border: '1px solid #1f345e',
                borderRadius: '8px',
                padding: '0.8rem 1.2rem'
              }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                  Source-Likelihood Score
                </div>
                <div style={{
                  fontSize: '2.4rem',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  color: '#38bdf8',
                  lineHeight: 1.1,
                  marginTop: '0.2rem'
                }}>
                  {topCandidate.scores?.total_score}
                  <span style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 600 }}> / 100</span>
                </div>
                <div style={{
                  marginTop: '0.3rem',
                  display: 'inline-block',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  letterSpacing: '0.05em'
                }}>
                  STRONG CANDIDATE
                </div>
              </div>
            </div>

            {/* 3-4 Visual Reasons with Icons */}
            <div style={{
              backgroundColor: '#070b14',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.7rem'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Key Evidence Summary:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.84rem', color: '#f1f5f9' }}>
                  <span style={{ fontSize: '1.1rem' }}>📍</span>
                  <span><strong>Near probable origin:</strong> Intersected within <strong>{topCandidate.cpa_distance_km} km</strong> of estimated origin center.</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.84rem', color: '#f1f5f9' }}>
                  <span style={{ fontSize: '1.1rem' }}>🕐</span>
                  <span><strong>Strong time match:</strong> Present at <strong>{topCandidate.cpa_time?.split('T')[1]?.slice(0, 5)} UTC</strong>, coinciding directly with discharge window.</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.84rem', color: '#f1f5f9' }}>
                  <span style={{ fontSize: '1.1rem' }}>🧭</span>
                  <span><strong>Track aligned with drift:</strong> Heading aligned within <strong>{topCandidate.scores?.heading_alignment_deg}°</strong> of the ocean leeway axis.</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.84rem', color: '#f1f5f9' }}>
                  <span style={{ fontSize: '1.1rem' }}>🚢</span>
                  <span><strong>Vessel context compatible:</strong> High-capacity Crude Oil Tanker with persistent cargo discharge profile.</span>
                </div>
              </div>
            </div>

            {/* [ WHY? ] Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <button
                onClick={() => setDetailModalVessel(topCandidate)}
                style={{
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  color: '#ffffff',
                  border: '1px solid #38bdf8',
                  borderRadius: '6px',
                  padding: '0.6rem 1.4rem',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 0 14px rgba(56, 189, 248, 0.3)',
                  letterSpacing: '0.04em'
                }}
              >
                <HelpCircle size={16} />
                <span>[ WHY? ] Full 5-Factor Score Breakdown</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* Right Column: Other Candidate Vessels */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderRadius: '10px',
          padding: '1.2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            All Screened Candidate Vessels ({candidates.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', overflowY: 'auto' }}>
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
                    padding: '0.75rem 0.9rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '4px',
                      backgroundColor: isRank1 ? '#0284c7' : '#1e293b',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      #{vessel.rank}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f1f5f9' }}>
                        {vessel.vessel_name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {vessel.vessel_type}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        color: isRank1 ? '#38bdf8' : (score >= 50 ? '#fbbf24' : '#94a3b8')
                      }}>
                        {score}<span style={{ fontSize: '0.72rem', fontWeight: 500 }}>/100</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setDetailModalVessel(vessel)}
                      style={{
                        padding: '0.25rem 0.55rem',
                        backgroundColor: '#1e293b',
                        color: '#38bdf8',
                        border: '1px solid #334155',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      WHY?
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      {detailModalVessel && (
        <VesselDetailModal
          vessel={detailModalVessel}
          originData={originData}
          onClose={() => setDetailModalVessel(null)}
        />
      )}

      {showReportModal && (
        <InvestigationReportModal
          spillData={spillData}
          originData={originData}
          candidateVessels={candidates}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
