import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, X, Send, Radio, UserCheck } from 'lucide-react';

export default function HumanConfirmationModal({
  isOpen,
  actionType = 'notify_authorities',
  targetEntity = 'Indian Coast Guard & DG Shipping',
  incidentId = 'ST-2026-DEMO-001',
  reason = 'Active maritime hydrocarbon anomaly detected with high vessel correlation.',
  messagePreview = 'Please maintain caution and avoid the predicted hazard area.',
  onConfirm,
  onClose
}) {
  if (!isOpen) return null;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const getActionDetails = () => {
    switch (actionType) {
      case 'notify_vessel':
        return {
          title: 'VESSEL SAFETY NOTIFICATION',
          icon: Radio,
          badge: 'SIMULATED DIRECT AIS / VHF ADVISORY',
          color: '#38bdf8',
          confirmLabel: 'CONFIRM VESSEL NOTIFICATION'
        };
      case 'broadcast_warning':
        return {
          title: 'BROADCAST NAVIGATIONAL WARNING',
          icon: Radio,
          badge: 'SIMULATED NAVTEX / SAFETYNET TRANSMISSION',
          color: '#f59e0b',
          confirmLabel: 'CONFIRM BROADCAST WARNING'
        };
      case 'deploy_response':
        return {
          title: 'DEPLOY RESPONSE TEAM',
          icon: ShieldAlert,
          badge: 'SIMULATED MARITIME DISPATCH',
          color: '#ef4444',
          confirmLabel: 'CONFIRM RESPONSE DISPATCH'
        };
      case 'notify_authorities':
      default:
        return {
          title: 'NOTIFY MARITIME AUTHORITIES',
          icon: UserCheck,
          badge: 'SIMULATED COAST GUARD / PSC BRIEFING',
          color: '#10b981',
          confirmLabel: 'CONFIRM AUTHORITY NOTIFICATION'
        };
    }
  };

  const details = getActionDetails();
  const Icon = details.icon;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
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
        border: `1px solid ${details.color}`,
        borderRadius: '10px',
        width: '560px',
        maxWidth: '95vw',
        boxShadow: `0 12px 36px rgba(0, 0, 0, 0.9), 0 0 20px ${details.color}33`,
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
              backgroundColor: `${details.color}22`,
              border: `1px solid ${details.color}`,
              borderRadius: '6px',
              padding: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon size={18} color={details.color} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: details.color, letterSpacing: '0.04em' }}>
                ACTION REQUIRES HUMAN CONFIRMATION
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                {details.title}
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
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Metadata Block */}
          <div style={{
            backgroundColor: '#070b14',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '0.75rem 1rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.6rem',
            fontSize: '0.75rem'
          }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700 }}>Incident ID:</span>
              <div style={{ color: '#f1f5f9', fontWeight: 700, fontFamily: 'monospace' }}>{incidentId}</div>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700 }}>Target Entity:</span>
              <div style={{ color: '#38bdf8', fontWeight: 700 }}>{targetEntity}</div>
            </div>
          </div>

          {/* Calculated Reason */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>
              Calculated Pipeline Rationale:
            </div>
            <div style={{
              backgroundColor: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '6px',
              padding: '0.6rem 0.85rem',
              fontSize: '0.75rem',
              color: '#cbd5e1',
              lineHeight: 1.4
            }}>
              {reason}
            </div>
          </div>

          {/* Message Advisory Preview */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>
              Advisory Transmission Draft:
            </div>
            <div style={{
              backgroundColor: '#070b14',
              border: '1px dashed #334155',
              borderRadius: '6px',
              padding: '0.65rem 0.85rem',
              fontSize: '0.72rem',
              fontFamily: 'monospace',
              color: '#93c5fd',
              lineHeight: 1.45
            }}>
              {messagePreview}
            </div>
          </div>

          {/* Data Honesty Disclaimer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '6px',
            padding: '0.5rem 0.75rem',
            fontSize: '0.68rem',
            color: '#fbbf24',
            lineHeight: 1.35
          }}>
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            <span>
              <strong>Simulation Checkpoint:</strong> This is a prototype decision-support action. Confirming will log a simulated event to the investigation timeline without real-world radio transmission.
            </span>
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
            onClick={handleConfirm}
            disabled={isSubmitting}
            style={{
              backgroundColor: details.color,
              color: '#070b14',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1.25rem',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: `0 0 16px ${details.color}66`
            }}
          >
            <Send size={14} />
            <span>{isSubmitting ? 'TRANSMITTING...' : details.confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
