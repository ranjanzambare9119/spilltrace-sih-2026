import React, { useState } from 'react';
import { UserCheck, AlertTriangle, CheckCircle2, X, RefreshCw, ShieldQuestion } from 'lucide-react';

export default function CandidateVerificationModal({
  isOpen,
  vessel,
  onVerify,
  onClose
}) {
  if (!isOpen || !vessel) return null;

  const [selectedOutcome, setSelectedOutcome] = useState('not_detected');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApply = async () => {
    setIsSubmitting(true);
    try {
      await onVerify(vessel.mmsi, selectedOutcome, notes);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 4000,
      backgroundColor: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#0e172a',
        border: '1px solid #38bdf8',
        borderRadius: '10px',
        width: '580px',
        maxWidth: '95vw',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.9), 0 0 24px rgba(56, 189, 248, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#0a1120',
          borderBottom: '1px solid #1e293b',
          padding: '0.9rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid #38bdf8',
              borderRadius: '6px',
              padding: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserCheck size={18} color="#38bdf8" />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.04em' }}>
                INVESTIGATION FEEDBACK LOOP
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                Vessel Physical / Aerial Verification
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.2rem' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {/* Vessel Profile Card */}
          <div style={{
            backgroundColor: '#070b14',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f1f5f9' }}>
                {vessel.vessel_name}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                {vessel.vessel_type} • MMSI: <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{vessel.mmsi}</span> • Flag: {vessel.flag}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                Current Score
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace' }}>
                {vessel.scores?.total_score || 87} / 100
              </div>
            </div>
          </div>

          {/* Outcome Selectors */}
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Select Inspection / Surveillance Outcome:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {/* Option 1: LEAK NOT DETECTED */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                backgroundColor: selectedOutcome === 'not_detected' ? 'rgba(239, 68, 68, 0.12)' : '#070b14',
                border: `1px solid ${selectedOutcome === 'not_detected' ? '#ef4444' : '#1e293b'}`,
                borderRadius: '6px',
                padding: '0.65rem 0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}>
                <input
                  type="radio"
                  name="verificationOutcome"
                  value="not_detected"
                  checked={selectedOutcome === 'not_detected'}
                  onChange={() => setSelectedOutcome('not_detected')}
                  style={{ marginTop: '0.2rem', accentColor: '#ef4444' }}
                />
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f87171' }}>
                    LEAK NOT DETECTED (Clean Inspection)
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.15rem', lineHeight: 1.35 }}>
                    Physical port inspection or aerial flyover found clean tanks/bilges and no active discharge.
                    <strong> Penalizes score by 60% (~35/100) and demotes candidate.</strong>
                  </div>
                </div>
              </label>

              {/* Option 2: CONFIRMED DISCHARGE / LEAK CONFIRMED */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                backgroundColor: selectedOutcome === 'confirmed' ? 'rgba(239, 68, 68, 0.18)' : '#070b14',
                border: `1.5px solid ${selectedOutcome === 'confirmed' ? '#ef4444' : '#1e293b'}`,
                borderRadius: '6px',
                padding: '0.75rem 0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}>
                <input
                  type="radio"
                  name="verificationOutcome"
                  value="confirmed"
                  checked={selectedOutcome === 'confirmed'}
                  onChange={() => setSelectedOutcome('confirmed')}
                  style={{ marginTop: '0.2rem', accentColor: '#ef4444' }}
                />
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>🚨 CONFIRM LEAK (Automatic Response Chain)</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    Physical inspection or aerial FLIR confirmed active discharge matching SAR anomaly.
                    <strong style={{ color: '#fca5a5' }}> Immediately and automatically executes the downstream response workflow: marks vessel as VERIFIED LEAK (Rank #1, 96/100), sets investigation to SOURCE VERIFIED — DEMO, calculates forward drift (+12h), creates 220 km² exclusion zone, flags 8 route vessels, broadcasts navigational warning, initiates response team deployment, and updates timeline. NO ADDITIONAL CLICKS REQUIRED!</strong>
                  </div>
                </div>
              </label>

              {/* Option 3: UNVERIFIED / RESET */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                backgroundColor: selectedOutcome === 'unverified' ? 'rgba(56, 189, 248, 0.12)' : '#070b14',
                border: `1px solid ${selectedOutcome === 'unverified' ? '#38bdf8' : '#1e293b'}`,
                borderRadius: '6px',
                padding: '0.65rem 0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}>
                <input
                  type="radio"
                  name="verificationOutcome"
                  value="unverified"
                  checked={selectedOutcome === 'unverified'}
                  onChange={() => setSelectedOutcome('unverified')}
                  style={{ marginTop: '0.2rem', accentColor: '#38bdf8' }}
                />
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8' }}>
                    RESET TO UNVERIFIED (Baseline Score)
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.15rem', lineHeight: 1.35 }}>
                    Restores original algorithmic score calculated from spatiotemporal and hydrodynamic features.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Inspector Notes */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>
              Inspector Notes (Optional):
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Boarded at JNPT Anchorage; ballast tanks sampled, oil-water separator log audited..."
              rows={2}
              style={{
                width: '100%',
                backgroundColor: '#070b14',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '0.5rem',
                fontSize: '0.75rem',
                color: '#f1f5f9',
                resize: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div style={{
          backgroundColor: '#0a1120',
          borderTop: '1px solid #1e293b',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            CANCEL
          </button>

          <button
            onClick={handleApply}
            disabled={isSubmitting}
            style={{
              backgroundColor: selectedOutcome === 'confirmed' ? '#dc2626' : (selectedOutcome === 'not_detected' ? '#0284c7' : '#0369a1'),
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.55rem 1.35rem',
              fontSize: '0.8rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: selectedOutcome === 'confirmed' ? '0 0 20px rgba(220, 38, 38, 0.55)' : '0 0 16px rgba(2, 132, 199, 0.4)'
            }}
          >
            <RefreshCw size={14} className={isSubmitting ? 'animate-spin' : ''} />
            <span>
              {isSubmitting 
                ? 'EXECUTING RESPONSE CASCADE...' 
                : (selectedOutcome === 'confirmed' 
                  ? '🚨 CONFIRM LEAK & RUN AUTOMATIC CHAIN' 
                  : (selectedOutcome === 'not_detected' ? 'APPLY PENALTY & RERANK' : 'RESET CANDIDATE'))}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
