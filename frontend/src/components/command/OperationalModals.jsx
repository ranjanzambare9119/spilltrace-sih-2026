import React from 'react';
import { 
  X, 
  LifeBuoy, 
  Send, 
  AlertTriangle, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  FileText,
  Info 
} from 'lucide-react';

export function DeployResponseModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2500,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#0e172a',
        border: '1px solid #dc2626',
        borderRadius: '10px',
        width: '100%',
        maxWidth: '540px',
        boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#0a1120',
          borderBottom: '1px solid #1e293b',
          padding: '1rem 1.4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              padding: '0.35rem',
              borderRadius: '6px'
            }}>
              <LifeBuoy size={20} color="#ef4444" />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                DEPLOY RESPONSE TEAM
              </div>
              <div style={{ fontSize: '0.68rem', color: '#fbbf24', fontWeight: 700 }}>
                DEMO RESPONSE WORKFLOW
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.2rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            backgroundColor: '#070b14',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '0.9rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            fontSize: '0.78rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Incident ID:</span>
              <strong style={{ color: '#f1f5f9', fontFamily: 'monospace' }}>ST-2026-DEMO-001</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Location:</span>
              <strong style={{ color: '#f1f5f9' }}>Arabian Sea — Demo Scenario</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Coordinates:</span>
              <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>18.95° N, 72.40° E</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Priority:</span>
              <span style={{ color: '#ef4444', fontWeight: 800 }}>HIGH</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Estimated Slick Area:</span>
              <span style={{ color: '#fbbf24', fontWeight: 700 }}>14.85 km² (94.2% Conf)</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              Recommended Operational Action:
            </div>
            <div style={{
              backgroundColor: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '6px',
              padding: '0.75rem',
              fontSize: '0.76rem',
              color: '#cbd5e1',
              lineHeight: 1.45
            }}>
              Prepare response deployment package for investigator review. Generate operational containment perimeter based on estimated backward and forward leeway drift vectors.
            </div>
          </div>

          <div style={{
            fontSize: '0.68rem',
            color: '#94a3b8',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '4px',
            padding: '0.5rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <Info size={14} color="#fbbf24" style={{ flexShrink: 0 }} />
            <span>This is an internal decision support demonstration. No real physical team will be deployed.</span>
          </div>
        </div>

        {/* Footer Buttons */}
        <div style={{
          backgroundColor: '#0a1120',
          borderTop: '1px solid #1e293b',
          padding: '0.85rem 1.4rem',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem'
        }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '0.45rem 1rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: '#ffffff',
              border: '1px solid #ef4444',
              borderRadius: '6px',
              padding: '0.45rem 1.2rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(239, 68, 68, 0.4)'
            }}
          >
            CREATE RESPONSE REQUEST
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotifyAuthoritiesModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2500,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#0e172a',
        border: '1px solid #0284c7',
        borderRadius: '10px',
        width: '100%',
        maxWidth: '540px',
        boxShadow: '0 25px 50px -12px rgba(56, 189, 248, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#0a1120',
          borderBottom: '1px solid #1e293b',
          padding: '1rem 1.4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              backgroundColor: 'rgba(56, 189, 248, 0.2)',
              padding: '0.35rem',
              borderRadius: '6px'
            }}>
              <Send size={20} color="#38bdf8" />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                NOTIFY AUTHORITIES
              </div>
              <div style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 700 }}>
                DEMO NOTIFICATION WORKFLOW
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.2rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            backgroundColor: '#070b14',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '0.9rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            fontSize: '0.78rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Recipient:</span>
              <strong style={{ color: '#38bdf8' }}>AUTHORITY / AGENCY REVIEW</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Coordinating Agency:</span>
              <span style={{ color: '#f1f5f9' }}>MRCC Mumbai / Coast Guard Operations</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Incident ID:</span>
              <strong style={{ color: '#f1f5f9', fontFamily: 'monospace' }}>ST-2026-DEMO-001</strong>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              Notification Message:
            </div>
            <div style={{
              backgroundColor: '#070b14',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '0.75rem',
              fontSize: '0.76rem',
              color: '#e2e8f0',
              lineHeight: 1.5,
              fontFamily: 'monospace'
            }}>
              Possible oil spill detected. Satellite, drift and AIS analysis available for investigation. Source-likelihood candidate prioritization package attached for official verification.
            </div>
          </div>

          <div style={{
            fontSize: '0.68rem',
            color: '#94a3b8',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '4px',
            padding: '0.5rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <Info size={14} color="#fbbf24" style={{ flexShrink: 0 }} />
            <span>Prototype notification preparation. Real-world emergency dispatches are not triggered.</span>
          </div>
        </div>

        {/* Footer Buttons */}
        <div style={{
          backgroundColor: '#0a1120',
          borderTop: '1px solid #1e293b',
          padding: '0.85rem 1.4rem',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem'
        }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '0.45rem 1rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: '1px solid #38bdf8',
              borderRadius: '6px',
              padding: '0.45rem 1.2rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.35)'
            }}
          >
            PREPARE NOTIFICATION
          </button>
        </div>
      </div>
    </div>
  );
}

export function SecondaryIncidentModal({ incident, onClose }) {
  if (!incident) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2500,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#0e172a',
        border: '1px solid #334155',
        borderRadius: '10px',
        width: '100%',
        maxWidth: '520px',
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: '#0a1120',
          borderBottom: '1px solid #1e293b',
          padding: '0.9rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f1f5f9' }}>
              {incident.id}: {incident.location}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#fbbf24', fontWeight: 700 }}>
              DEMO SCENARIO PREVIEW
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.4rem' }}>
            <span style={{ color: '#94a3b8' }}>Severity:</span>
            <span style={{ color: incident.severityColor, fontWeight: 800 }}>{incident.severity}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.4rem' }}>
            <span style={{ color: '#94a3b8' }}>Detection Confidence:</span>
            <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{incident.detection}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.4rem' }}>
            <span style={{ color: '#94a3b8' }}>Status:</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{incident.status}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.4rem' }}>
            <span style={{ color: '#94a3b8' }}>Correlated Candidates:</span>
            <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{incident.candidates}</span>
          </div>

          <div style={{
            backgroundColor: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '6px',
            padding: '0.75rem',
            color: '#94a3b8',
            fontSize: '0.72rem',
            lineHeight: 1.4
          }}>
            This record represents a simulated secondary regional incident. The primary interactive scenario currently loaded into the radar and drift pipelines is <strong style={{ color: '#f1f5f9' }}>ST-2026-DEMO-001 (Arabian Sea)</strong>.
          </div>
        </div>

        <div style={{
          backgroundColor: '#0a1120',
          borderTop: '1px solid #1e293b',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '0.4rem 1rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
