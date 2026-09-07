import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Droplets, 
  Compass, 
  Ship, 
  Award, 
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import MaritimeMap from './MaritimeMap';
import { getStaticUrl } from '../api/client';

export default function GuidedDemoMode({
  isOpen,
  onClose,
  spillData,
  originData,
  candidateVessels,
  onOpenInvestigation,
  onOpenWhyModal
}) {
  // 5-Step Guided Demo:
  // Step 1: Show synthetic SAR-like image (demo_sar_oil.png raw)
  // Step 2: Highlight slick (POSSIBLE OIL SPILL, Prototype Detection)
  // Step 3: Move to map (PROBABLE ORIGIN)
  // Step 4: Show vessel trajectories (AIS tracks)
  // Step 5: Show Top Candidate (MT Ocean Pioneer — DEMO, 87/100, 3 evidence points)
  const [step, setStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [vesselRevealCount, setVesselRevealCount] = useState(0);

  const topCandidate = candidateVessels && candidateVessels.length > 0 ? candidateVessels[0] : null;

  // Step Durations in milliseconds
  const stepDurations = {
    1: 8000,   // Step 1: Synthetic SAR-like image
    2: 10000,  // Step 2: Highlight slick
    3: 12000,  // Step 3: Move to map (Probable Origin)
    4: 12000,  // Step 4: Vessel trajectories
    5: 60000   // Step 5: Top Candidate & Results
  };

  // Reset when demo opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsPlaying(true);
      setVesselRevealCount(0);
    }
  }, [isOpen]);

  // Step 4: Animate vessels appearing sequentially
  useEffect(() => {
    if (step === 4 && isPlaying) {
      setVesselRevealCount(1);
      const t1 = setTimeout(() => setVesselRevealCount(2), 3000);
      const t2 = setTimeout(() => setVesselRevealCount(3), 6000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else if (step >= 5) {
      setVesselRevealCount(3);
    } else {
      setVesselRevealCount(0);
    }
  }, [step, isPlaying]);

  // Main Automated Timer
  useEffect(() => {
    if (!isOpen || !isPlaying || step >= 5) return;

    const timer = setTimeout(() => {
      setStep(prev => Math.min(prev + 1, 5));
    }, stepDurations[step]);

    return () => clearTimeout(timer);
  }, [isOpen, isPlaying, step]);

  if (!isOpen) return null;

  const stepLabels = [
    { num: 1, label: 'IMAGE' },
    { num: 2, label: 'DETECT' },
    { num: 3, label: 'ORIGIN' },
    { num: 4, label: 'VESSELS' },
    { num: 5, label: 'RESULT' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2500,
      backgroundColor: '#070b14',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Top Banner: Progress Indicator & Controls */}
      <div style={{
        height: '56px',
        backgroundColor: '#0a1120',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        flexShrink: 0
      }}>
        {/* Brand & Demo Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            padding: '0.35rem 0.6rem',
            borderRadius: '6px',
            fontWeight: 800,
            fontSize: '0.85rem',
            color: '#ffffff',
            letterSpacing: '0.04em'
          }}>
            SPILLTRACE
          </div>
          <span className="badge-demo">
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }}></span>
            2-MIN GUIDED DEMO
          </span>
        </div>

        {/* 5-Step Visual Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {stepLabels.map((item, idx) => {
            const isActive = step === item.num;
            const isCompleted = step > item.num;

            return (
              <React.Fragment key={item.num}>
                <div 
                  onClick={() => setStep(item.num)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                    opacity: isActive ? 1 : (isCompleted ? 0.8 : 0.4),
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? '#38bdf8' : (isCompleted ? '#10b981' : '#1e293b'),
                    color: isActive || isCompleted ? '#070b14' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    boxShadow: isActive ? '0 0 10px #38bdf8' : 'none'
                  }}>
                    {isCompleted ? '✓' : item.num}
                  </span>
                  <span style={{
                    fontSize: '0.76rem',
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? '#38bdf8' : (isCompleted ? '#cbd5e1' : '#64748b'),
                    letterSpacing: '0.04em'
                  }}>
                    {item.label}
                  </span>
                </div>
                {idx < stepLabels.length - 1 && (
                  <span style={{ color: '#334155', fontSize: '0.75rem' }}>➔</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Presenter Controls (Play/Pause, Step navigation, Close) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            disabled={step === 1}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              color: step === 1 ? '#475569' : '#cbd5e1',
              borderRadius: '4px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: step === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            ‹ Prev
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              background: isPlaying ? '#0f2942' : '#0284c7',
              border: isPlaying ? '1px solid #38bdf8' : '1px solid #0284c7',
              color: '#ffffff',
              borderRadius: '4px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            {isPlaying ? (
              <>
                <Pause size={12} fill="#ffffff" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={12} fill="#ffffff" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            onClick={() => setStep(prev => Math.min(5, prev + 1))}
            disabled={step === 5}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              color: step === 5 ? '#475569' : '#cbd5e1',
              borderRadius: '4px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: step === 5 ? 'not-allowed' : 'pointer'
            }}
          >
            Next ›
          </button>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '0',
              color: '#94a3b8',
              padding: '0.35rem',
              cursor: 'pointer',
              marginLeft: '0.5rem'
            }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage Container */}
      <div style={{
        flex: 1,
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 56px)',
        overflow: 'hidden'
      }}>
        {/* STEP 1: SHOW SYNTHETIC SAR-LIKE IMAGE (RAW) */}
        {step === 1 && (
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#070b14',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <div style={{ position: 'relative', width: '520px', height: '520px', maxWidth: '85vw', maxHeight: '75vh' }}>
              <img
                src={getStaticUrl('/static/satellite/demo_sar_oil.png')}
                alt="Synthetic SAR-like Scene"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  border: '1px solid #1e293b',
                  boxShadow: '0 10px 35px rgba(0,0,0,0.85)'
                }}
              />
            </div>

            {/* Floating Info Card: STEP 1 */}
            <div style={{
              position: 'absolute',
              bottom: '36px',
              left: '40px',
              zIndex: 500,
              backgroundColor: 'rgba(10, 17, 32, 0.94)',
              backdropFilter: 'blur(8px)',
              border: '1px solid #1e293b',
              borderLeft: '5px solid #38bdf8',
              borderRadius: '8px',
              padding: '1.2rem 1.6rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
              minWidth: '300px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  STEP 1 — SAR SCENE INGESTION
                </span>
                <span style={{
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid #38bdf8',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: '3px'
                }}>
                  SYNTHETIC SAR-LIKE DEMONSTRATION
                </span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f1f5f9' }}>
                SAR BACKSCATTER SCENE
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem', lineHeight: 1.4 }}>
                Ingesting high-contrast demonstration scene. Dark patches indicate surface roughness damping characteristic of oil slicks.
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: HIGHLIGHT SLICK (POSSIBLE OIL SPILL + PROTOTYPE DETECTION) */}
        {step === 2 && (
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#070b14',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <div style={{ position: 'relative', width: '520px', height: '520px', maxWidth: '85vw', maxHeight: '75vh' }}>
              <img
                src={getStaticUrl('/static/satellite/demo_sar_oil.png')}
                alt="Synthetic SAR Scene"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  border: '1px solid #1e293b'
                }}
              />

              {/* Glowing Mask Overlay */}
              <img
                src={getStaticUrl('/static/masks/demo_sar_oil_mask.png')}
                alt="Slick Mask"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  opacity: 0.75,
                  mixBlendMode: 'screen',
                  filter: 'invert(1) drop-shadow(0 0 16px #00f0ff) drop-shadow(0 0 6px #0284c7)'
                }}
              />

              {/* Highlighted Boundary Outline */}
              <img
                src={getStaticUrl('/static/masks/demo_sar_oil_boundary.png')}
                alt="Slick Boundary"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  opacity: 0.95,
                  mixBlendMode: 'screen',
                  filter: 'invert(1) drop-shadow(0 0 8px #38bdf8)'
                }}
              />
            </div>

            {/* Floating Info Card: STEP 2 DETECT */}
            <div style={{
              position: 'absolute',
              bottom: '36px',
              left: '40px',
              zIndex: 500,
              backgroundColor: 'rgba(10, 17, 32, 0.94)',
              backdropFilter: 'blur(8px)',
              border: '1px solid #1e293b',
              borderLeft: '5px solid #00f0ff',
              borderRadius: '8px',
              padding: '1.2rem 1.6rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
              minWidth: '310px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#00f0ff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  STEP 2 — HIGHLIGHT SLICK
                </span>
                <span style={{
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid #38bdf8',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: '3px'
                }}>
                  SYNTHETIC SAR-LIKE DEMONSTRATION
                </span>
              </div>

              {/* Requirement 7: Display POSSIBLE OIL SPILL & Prototype Detection */}
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                POSSIBLE OIL SPILL
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', marginTop: '0.1rem' }}>
                Prototype Detection
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.4rem', marginTop: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Estimated Area</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>
                    14.8 <span style={{ fontSize: '0.85rem' }}>km²</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Detection Score</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', fontFamily: 'monospace' }}>
                    94%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEPS 3, 4, 5: INTERACTIVE MAP */}
        {step >= 3 && (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <MaritimeMap 
              spillData={spillData}
              originData={originData}
              candidateVessels={candidateVessels.slice(0, step === 3 ? 0 : vesselRevealCount)}
              selectedVessel={step === 5 ? topCandidate : null}
              showSpill={true}
              showOrigin={step >= 3}
              showDrift={step >= 3}
              showVessels={step >= 4}
              interactiveLegend={false}
              height="100%"
              autoFit={step === 3 || step === 5}
            />

            {/* STEP 3: PROBABLE ORIGIN */}
            {step === 3 && (
              <div style={{
                position: 'absolute',
                bottom: '36px',
                left: '40px',
                zIndex: 500,
                backgroundColor: 'rgba(10, 17, 32, 0.94)',
                backdropFilter: 'blur(8px)',
                border: '1px solid #1e293b',
                borderLeft: '5px solid #f59e0b',
                borderRadius: '8px',
                padding: '1.2rem 1.6rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                minWidth: '320px'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  STEP 3 — REVERSE DRIFT MODELING
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f1f5f9' }}>
                  PROBABLE ORIGIN
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                  ±3.5 km uncertainty envelope
                </div>
                <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: '0.5rem', lineHeight: 1.4 }}>
                  Backward leeway drift reversed 5.5 hours using surface currents (1.2 kts) and wind drag (14 kts).
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.4rem', fontFamily: 'monospace' }}>
                  Discharge Window: ~00:30 UTC (±45 mins)
                </div>
              </div>
            )}

            {/* STEP 4: VESSEL TRAJECTORIES */}
            {step === 4 && (
              <div style={{
                position: 'absolute',
                bottom: '36px',
                left: '40px',
                zIndex: 500,
                backgroundColor: 'rgba(10, 17, 32, 0.94)',
                backdropFilter: 'blur(8px)',
                border: '1px solid #1e293b',
                borderLeft: '5px solid #38bdf8',
                borderRadius: '8px',
                padding: '1.2rem 1.6rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                minWidth: '320px'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  STEP 4 — AIS TRAJECTORIES
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f1f5f9' }}>
                  VESSEL TRAJECTORIES
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>
                  {vesselRevealCount} candidate vessels correlated
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                  Filtering shipping corridor tracks intersecting origin spatial-temporal release window.
                </div>
              </div>
            )}

            {/* STEP 5: TOP CANDIDATE & RESULT */}
            {step === 5 && topCandidate && (
              <div style={{
                position: 'absolute',
                top: '24px',
                left: '36px',
                zIndex: 500,
                backgroundColor: 'rgba(10, 17, 32, 0.96)',
                backdropFilter: 'blur(10px)',
                border: '2px solid #38bdf8',
                borderRadius: '10px',
                padding: '1.4rem 1.6rem',
                boxShadow: '0 12px 35px rgba(56, 189, 248, 0.25)',
                maxWidth: '440px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase'
                  }}>
                    TOP CANDIDATE
                  </span>
                  <span style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px'
                  }}>
                    STRONG CANDIDATE
                  </span>
                </div>

                {/* Requirement 7: TOP CANDIDATE MT Ocean Pioneer — DEMO */}
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', marginTop: '0.5rem' }}>
                  🚢 MT Ocean Pioneer — DEMO
                </div>

                {/* Requirement 7: SOURCE-LIKELIHOOD SCORE 87 / 100 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.6rem',
                  marginTop: '0.5rem',
                  padding: '0.45rem 0.8rem',
                  backgroundColor: '#070b14',
                  borderRadius: '6px',
                  border: '1px solid #1f345e'
                }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                    SOURCE-LIKELIHOOD SCORE:
                  </span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace' }}>
                    87
                  </span>
                  <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ 100</span>
                </div>

                {/* Requirement 7: 3 Evidence Points */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.8rem', fontSize: '0.8rem', color: '#e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>📍</span>
                    <span><strong>Near probable origin:</strong> 0.24 km closest approach</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>🕐</span>
                    <span><strong>Strong time match:</strong> 00:30 UTC release window</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>🧭</span>
                    <span><strong>Drift aligned:</strong> Course trajectory aligns with leeway corridor</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.1rem' }}>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenInvestigation();
                    }}
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                      border: '1px solid #38bdf8',
                      color: '#ffffff',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                      boxShadow: '0 0 12px rgba(56, 189, 248, 0.3)'
                    }}
                  >
                    <span>View Investigation Dossier &rarr;</span>
                  </button>

                  <button
                    onClick={() => setStep(1)}
                    style={{
                      padding: '0.6rem 0.8rem',
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      color: '#cbd5e1',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <RotateCcw size={13} />
                    <span>Replay</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
