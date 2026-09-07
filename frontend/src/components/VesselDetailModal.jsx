import React from 'react';
import { X, HelpCircle, Ship, Compass, Clock, MapPin, ShieldAlert } from 'lucide-react';

export default function VesselDetailModal({ vessel, originData, onClose }) {
  if (!vessel) return null;
  const scores = vessel.scores;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#0e172a',
        border: '1px solid #334155',
        borderRadius: '10px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1rem 1.4rem',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#0a1120'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Ship size={20} color="#38bdf8" />
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f1f5f9' }}>
                {vessel.vessel_name} — Explainability Deep Dive
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                MMSI: {vessel.mmsi} • Rank #{vessel.rank} • Source-Likelihood: {scores?.total_score}/100
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '0',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.2rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Why Section */}
          <div style={{
            backgroundColor: '#070b14',
            border: '1px solid #1f345e',
            borderRadius: '6px',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.6rem' }}>
              <HelpCircle size={16} />
              <span>Attribution Rationale Summary</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {vessel.why_reasons?.map((reason, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  <span style={{ color: '#38bdf8', marginTop: '2px' }}>✓</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Telemetry Summary */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.8rem'
          }}>
            <div style={{ backgroundColor: '#070b14', padding: '0.6rem', borderRadius: '6px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>CPA Distance</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8' }}>{vessel.cpa_distance_km} km</div>
            </div>
            <div style={{ backgroundColor: '#070b14', padding: '0.6rem', borderRadius: '6px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>CPA Time</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>{vessel.cpa_time?.split('T')[1]?.slice(0, 5)} UTC</div>
            </div>
            <div style={{ backgroundColor: '#070b14', padding: '0.6rem', borderRadius: '6px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Heading Alignment</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fde68a' }}>{scores?.heading_alignment_deg}° offset</div>
            </div>
            <div style={{ backgroundColor: '#070b14', padding: '0.6rem', borderRadius: '6px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Vessel Type</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#a78bfa' }}>{vessel.vessel_type}</div>
            </div>
          </div>

          {/* Mathematical Factors Grid */}
          <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
            <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '0.4rem' }}>
              Transparent Component Breakdown (0–100 Points):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div style={{ backgroundColor: '#070b14', padding: '0.5rem', borderRadius: '4px' }}>
                Distance Score: <strong>{scores?.distance_score} / 30</strong>
              </div>
              <div style={{ backgroundColor: '#070b14', padding: '0.5rem', borderRadius: '4px' }}>
                Time Match Score: <strong>{scores?.time_score} / 25</strong>
              </div>
              <div style={{ backgroundColor: '#070b14', padding: '0.5rem', borderRadius: '4px' }}>
                Drift Consistency: <strong>{scores?.drift_score} / 20</strong>
              </div>
              <div style={{ backgroundColor: '#070b14', padding: '0.5rem', borderRadius: '4px' }}>
                Heading Alignment: <strong>{scores?.heading_score} / 15</strong>
              </div>
              <div style={{ backgroundColor: '#070b14', padding: '0.5rem', borderRadius: '4px', gridColumn: 'span 2' }}>
                Vessel Risk Class: <strong>{scores?.vessel_type_score} / 10</strong>
              </div>
            </div>
          </div>

          {/* Legal Protection Disclaimer */}
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            padding: '0.75rem',
            fontSize: '0.72rem',
            color: '#fca5a5',
            lineHeight: 1.4
          }}>
            <strong>Legal Notice:</strong> This score represents an empirical probabilistic correlation based on spatial-temporal tracking. It serves as an investigative aid for maritime authorities (e.g. Coast Guard / DG Shipping) and does NOT constitute legal culpability or conclusive proof of discharge.
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '0.8rem 1.4rem',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          justifyContent: 'flex-end',
          backgroundColor: '#0a1120'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.45rem 1rem',
              backgroundColor: '#1e293b',
              color: '#ffffff',
              border: '1px solid #334155',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
