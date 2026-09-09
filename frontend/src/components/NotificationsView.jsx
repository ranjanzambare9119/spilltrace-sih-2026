import React, { useState } from 'react';
import { 
  Bell, 
  Radio, 
  Ship, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Send, 
  Copy, 
  ChevronRight, 
  Info,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';

export default function NotificationsView({
  atRiskVessels = [],
  navigationalWarning = null,
  forwardDrift = null,
  isLeakConfirmed = false,
  confirmedSource = null,
  incidentSeverity = 'ACTIVE RESPONSE (CRITICAL)',
  onNavigateTab = () => {},
  onUnverify = null
}) {
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'WARNING' | 'SAFETY'
  const [copiedWarning, setCopiedWarning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Extract flagged route vessels that received notifications
  const flaggedVessels = (atRiskVessels || []).filter(
    v => (isLeakConfirmed && v.risk_state !== 'OUTSIDE RISK') || v.notification_sent
  );

  // Requirement 7 & 10: Derive exact notifications from incident workflow
  const notificationRecords = flaggedVessels.map((v, index) => {
    const isHighRisk = v.risk_state === 'INSIDE ZONE' || v.risk_state === 'APPROACHING';
    const notificationType = isHighRisk ? 'NAVIGATIONAL WARNING' : 'VESSEL SAFETY NOTIFICATION';
    
    let reason = 'Predicted exclusion zone';
    if (v.risk_state === 'INSIDE ZONE') {
      reason = 'Inside predicted exclusion zone';
    } else if (v.risk_state === 'APPROACHING') {
      reason = `Approaching hazard perimeter (${v.distance_to_zone_km?.toFixed(1)} km, ETA ~${Math.round(v.eta_minutes || 20)}m)`;
    } else if (v.risk_state === 'ON ROUTE') {
      reason = 'Affected fairway / route corridor';
    }

    // Format MMSI with DEMO prefix per requirement 4
    const rawMmsi = String(v.mmsi || '');
    const formattedMmsi = rawMmsi.startsWith('DEMO') ? rawMmsi : `DEMO-${rawMmsi}`;

    const timestamp = v.notification_time || '12:42 UTC';

    return {
      id: `NOTIF-${String(index + 1).padStart(3, '0')}`,
      vesselName: v.vessel_name,
      vesselType: v.vessel_type,
      mmsi: formattedMmsi,
      rawMmsi: v.mmsi,
      notificationType,
      riskStatus: v.risk_state,
      reason,
      time: timestamp,
      status: 'SENT — SIMULATED',
      distanceKm: v.distance_to_zone_km,
      speedKts: v.speed,
      etaMinutes: v.eta_minutes
    };
  });

  // Filter records by category and search
  const filteredRecords = notificationRecords.filter(item => {
    if (filterType === 'WARNING' && item.notificationType !== 'NAVIGATIONAL WARNING') return false;
    if (filterType === 'SAFETY' && item.notificationType !== 'VESSEL SAFETY NOTIFICATION') return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        item.vesselName.toLowerCase().includes(q) ||
        item.mmsi.toLowerCase().includes(q) ||
        item.reason.toLowerCase().includes(q) ||
        item.riskStatus.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalNotifications = notificationRecords.length;
  const totalVesselsNotified = notificationRecords.length;
  const warningBroadcastStatus = (isLeakConfirmed || navigationalWarning) ? 'BROADCAST' : 'PENDING';
  const overallStatus = 'SIMULATED';

  // Copy broadcast draft message
  const handleCopyWarning = () => {
    const text = navigationalWarning?.message_text || '';
    if (navigator?.clipboard && text) {
      navigator.clipboard.writeText(text);
      setCopiedWarning(true);
      setTimeout(() => setCopiedWarning(false), 2500);
    }
  };

  // ============================================================================
  // REQUIREMENT 10: EMPTY STATE
  // ============================================================================
  if (totalNotifications === 0 && !isLeakConfirmed) {
    return (
      <div style={{
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
        backgroundColor: '#070b14',
        boxSizing: 'border-box'
      }}>
        {/* Incident Context Ribbon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          padding: '0.45rem 1rem',
          marginBottom: '2.5rem',
          fontSize: '0.74rem'
        }}>
          <span style={{ color: '#94a3b8' }}>Incident:</span>
          <strong style={{ color: '#f1f5f9', fontWeight: 800 }}>ST-2026-DEMO-001</strong>
          <span style={{ color: '#475569' }}>•</span>
          <span style={{ color: '#94a3b8' }}>Scenario:</span>
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>Arabian Sea — DEMO</span>
        </div>

        {/* Empty State Box */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderRadius: '12px',
          padding: '3rem 2.5rem',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.2rem'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.15)'
          }}>
            <Bell size={28} color="#38bdf8" />
          </div>

          <div>
            <h2 style={{
              fontSize: '1.4rem',
              fontWeight: 900,
              color: '#f8fafc',
              margin: '0 0 0.4rem 0',
              letterSpacing: '-0.01em'
            }}>
              NOTIFICATIONS
            </h2>
            <p style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              color: '#cbd5e1',
              margin: '0 0 0.5rem 0'
            }}>
              No notifications generated yet.
            </p>
            <p style={{
              fontSize: '0.78rem',
              color: '#94a3b8',
              margin: 0,
              lineHeight: 1.5
            }}>
              Start an investigation and confirm a vessel to generate notification events.
            </p>
          </div>

          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '0.75rem 1rem',
            fontSize: '0.72rem',
            color: '#64748b',
            textAlign: 'left',
            lineHeight: 1.4,
            width: '100%'
          }}>
            <strong style={{ color: '#94a3b8' }}>Workflow Tip:</strong> Navigate to <span style={{ color: '#38bdf8' }}>5. Investigation</span>, inspect candidate vessel <span style={{ color: '#f1f5f9' }}>MT Ocean Pioneer</span>, and click <span style={{ color: '#ef4444', fontWeight: 800 }}>CONFIRM LEAK</span>. The system will automatically execute the post-verification response chain and route you directly back to this page with the generated records.
          </div>

          <button
            onClick={() => onNavigateTab('investigation')}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: '1px solid #38bdf8',
              borderRadius: '6px',
              padding: '0.65rem 1.6rem',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.35)',
              letterSpacing: '0.03em',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Go to Investigation</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ACTIVE STATE: NOTIFICATIONS GENERATED
  // ============================================================================
  return (
    <div style={{
      padding: '1.2rem 1.5rem 2.5rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.2rem',
      minHeight: 'calc(100vh - 120px)',
      backgroundColor: '#070b14',
      boxSizing: 'border-box'
    }}>
      {/* 1. Header Bar with Incident Reference (Requirement 3 & 8) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0e172a',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '0.9rem 1.25rem',
        flexWrap: 'wrap',
        gap: '0.8rem'
      }}>
        {/* Title & Subtitle */}
        <div>
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
              <Bell size={20} color="#38bdf8" />
            </div>
            <div>
              <h1 style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#f8fafc',
                margin: 0,
                letterSpacing: '-0.01em'
              }}>
                NOTIFICATIONS
              </h1>
              <p style={{
                fontSize: '0.74rem',
                color: '#94a3b8',
                margin: 0,
                fontWeight: 600
              }}>
                Maritime Safety &amp; Incident Alerts
              </p>
            </div>
          </div>
        </div>

        {/* Compact Incident Reference & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Incident Reference Pill (Requirement 8) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            backgroundColor: '#070b14',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '0.4rem 0.85rem',
            fontSize: '0.74rem'
          }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700, marginRight: '0.35rem' }}>Incident:</span>
              <strong style={{ color: '#f1f5f9', fontWeight: 800 }}>ST-2026-DEMO-001</strong>
            </div>
            <span style={{ color: '#334155' }}>|</span>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700, marginRight: '0.35rem' }}>Scenario:</span>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>Arabian Sea — DEMO</span>
            </div>
          </div>

          {/* Confirmed Source Badge */}
          {confirmedSource && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.3)'
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                boxShadow: '0 0 6px #ef4444'
              }}></span>
              SOURCE: {confirmedSource.name || 'MT Ocean Pioneer'} (VERIFIED LEAK)
            </div>
          )}

          {/* Optional Unverify / Reset Action for Testing */}
          {onUnverify && isLeakConfirmed && (
            <button
              onClick={onUnverify}
              style={{
                backgroundColor: '#1e293b',
                color: '#cbd5e1',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '0.38rem 0.75rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Reset verification state to test empty state"
            >
              Reset Demo
            </button>
          )}
        </div>
      </div>

      {/* 2. Compact Summary Cards (Requirement 3) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem'
      }}>
        {/* Card 1: TOTAL NOTIFICATIONS */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '1rem 1.2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em' }}>
              TOTAL NOTIFICATIONS
            </span>
            <div style={{
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              borderRadius: '4px',
              padding: '0.25rem',
              display: 'flex'
            }}>
              <Bell size={15} color="#38bdf8" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f8fafc', lineHeight: 1.1 }}>
            {totalNotifications}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 700 }}>
            Active corridor broadcast items
          </div>
        </div>

        {/* Card 2: VESSELS NOTIFIED */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '1rem 1.2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em' }}>
              VESSELS NOTIFIED
            </span>
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '4px',
              padding: '0.25rem',
              display: 'flex'
            }}>
              <Ship size={15} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', lineHeight: 1.1 }}>
            {totalVesselsNotified}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#6ee7b7', fontWeight: 700 }}>
            Fleet traffic on affected route
          </div>
        </div>

        {/* Card 3: NAVIGATIONAL WARNING */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '1rem 1.2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em' }}>
              NAVIGATIONAL WARNING
            </span>
            <div style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              borderRadius: '4px',
              padding: '0.25rem',
              display: 'flex'
            }}>
              <Radio size={15} color="#f59e0b" />
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fbbf24', lineHeight: 1.2, letterSpacing: '0.02em' }}>
            {warningBroadcastStatus}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>
            NAVAREA VIII 142/2026 (NAVTEX)
          </div>
        </div>

        {/* Card 4: STATUS */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '1rem 1.2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em' }}>
              STATUS
            </span>
            <div style={{
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              borderRadius: '4px',
              padding: '0.25rem',
              display: 'flex'
            }}>
              <ShieldCheck size={15} color="#38bdf8" />
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#38bdf8', lineHeight: 1.2, letterSpacing: '0.02em' }}>
            {overallStatus}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>
            Demo exercise transmission
          </div>
        </div>
      </div>

      {/* 3. Main Split View: Notification Table (Left/Center) + Broadcast Summary (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.75fr 1.05fr',
        gap: '1.2rem',
        alignItems: 'start'
      }}>
        {/* LEFT COLUMN: Clean Table / List of Notifications (Requirements 4 & 5) */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
        }}>
          {/* Table Header Controls */}
          <div style={{
            padding: '0.9rem 1.2rem',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0a1120',
            flexWrap: 'wrap',
            gap: '0.7rem'
          }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f1f5f9' }}>
                Affected Vessel Alert Manifest
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                Showing {filteredRecords.length} of {totalNotifications} automated simulated safety dispatches
              </div>
            </div>

            {/* Filter Tabs & Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                display: 'flex',
                backgroundColor: '#070b14',
                border: '1px solid #1e293b',
                borderRadius: '6px',
                padding: '0.15rem'
              }}>
                <button
                  onClick={() => setFilterType('ALL')}
                  style={{
                    backgroundColor: filterType === 'ALL' ? '#1e293b' : 'transparent',
                    color: filterType === 'ALL' ? '#38bdf8' : '#64748b',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  All ({totalNotifications})
                </button>
                <button
                  onClick={() => setFilterType('WARNING')}
                  style={{
                    backgroundColor: filterType === 'WARNING' ? '#1e293b' : 'transparent',
                    color: filterType === 'WARNING' ? '#f59e0b' : '#64748b',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Warnings
                </button>
                <button
                  onClick={() => setFilterType('SAFETY')}
                  style={{
                    backgroundColor: filterType === 'SAFETY' ? '#1e293b' : 'transparent',
                    color: filterType === 'SAFETY' ? '#38bdf8' : '#64748b',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Route Safety
                </button>
              </div>

              {/* Search Box */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#070b14',
                border: '1px solid #1e293b',
                borderRadius: '6px',
                padding: '0.25rem 0.5rem',
                gap: '0.35rem'
              }}>
                <Search size={12} color="#64748b" />
                <input
                  type="text"
                  placeholder="Filter vessel or MMSI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#f1f5f9',
                    fontSize: '0.7rem',
                    outline: 'none',
                    width: '120px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Table (Requirement 4) */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.76rem'
            }}>
              <thead>
                <tr style={{
                  backgroundColor: '#070b14',
                  borderBottom: '1px solid #1e293b',
                  color: '#64748b',
                  fontSize: '0.68rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Vessel</th>
                  <th style={{ padding: '0.75rem 0.8rem' }}>MMSI</th>
                  <th style={{ padding: '0.75rem 0.8rem' }}>Notification Type</th>
                  <th style={{ padding: '0.75rem 0.8rem' }}>Risk Status</th>
                  <th style={{ padding: '0.75rem 0.8rem' }}>Reason</th>
                  <th style={{ padding: '0.75rem 0.8rem' }}>Time</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((item, idx) => {
                  const isWarning = item.notificationType === 'NAVIGATIONAL WARNING';
                  const isInside = item.riskStatus === 'INSIDE ZONE';
                  const isApproaching = item.riskStatus === 'APPROACHING';

                  return (
                    <tr
                      key={item.id || idx}
                      style={{
                        borderBottom: '1px solid #14223f',
                        backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(15, 23, 42, 0.4)',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'transparent' : 'rgba(15, 23, 42, 0.4)'}
                    >
                      {/* Column 1: Vessel */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 800, color: '#f1f5f9' }}>
                          {item.vesselName}
                        </div>
                        <div style={{ fontSize: '0.67rem', color: '#64748b' }}>
                          {item.vesselType}
                        </div>
                      </td>

                      {/* Column 2: MMSI */}
                      <td style={{ padding: '0.75rem 0.8rem', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '0.72rem',
                          color: '#cbd5e1',
                          backgroundColor: '#070b14',
                          border: '1px solid #1e293b',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px'
                        }}>
                          {item.mmsi}
                        </span>
                      </td>

                      {/* Column 3: Notification Type */}
                      <td style={{ padding: '0.75rem 0.8rem', whiteSpace: 'nowrap' }}>
                        <span style={{
                          backgroundColor: isWarning ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                          border: `1px solid ${isWarning ? '#f59e0b' : '#38bdf8'}`,
                          color: isWarning ? '#fbbf24' : '#7dd3fc',
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}>
                          {isWarning ? <AlertTriangle size={11} /> : <Radio size={11} />}
                          {item.notificationType}
                        </span>
                      </td>

                      {/* Column 4: Risk Status */}
                      <td style={{ padding: '0.75rem 0.8rem', whiteSpace: 'nowrap' }}>
                        <span style={{
                          backgroundColor: isInside 
                            ? 'rgba(239, 68, 68, 0.2)' 
                            : (isApproaching ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.15)'),
                          border: `1px solid ${isInside ? '#ef4444' : (isApproaching ? '#f59e0b' : '#38bdf8')}`,
                          color: isInside ? '#fca5a5' : (isApproaching ? '#fcd34d' : '#38bdf8'),
                          fontSize: '0.67rem',
                          fontWeight: 800,
                          padding: '0.18rem 0.5rem',
                          borderRadius: '4px',
                          display: 'inline-block'
                        }}>
                          {item.riskStatus}
                        </span>
                      </td>

                      {/* Column 5: Reason */}
                      <td style={{ padding: '0.75rem 0.8rem', color: '#94a3b8', fontSize: '0.72rem' }}>
                        {item.reason}
                      </td>

                      {/* Column 6: Time */}
                      <td style={{ padding: '0.75rem 0.8rem', color: '#cbd5e1', fontFamily: 'monospace', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={11} color="#64748b" />
                          <span>{item.time}</span>
                        </div>
                      </td>

                      {/* Column 7: Status */}
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid #10b981',
                          color: '#34d399',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}>
                          <span style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            backgroundColor: '#10b981',
                            boxShadow: '0 0 5px #10b981'
                          }}></span>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div style={{
            padding: '0.65rem 1rem',
            backgroundColor: '#070b14',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.7rem',
            color: '#64748b'
          }}>
            <span>MMSI numbers prefixed with DEMO denote synthetic evaluation vessels per SIH PS-143 specifications.</span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>✓ All dispatches logged to investigation audit trail</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Broadcast Summary & Official Telegraph (Requirement 6) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {/* Card 1: Broadcast Summary Box */}
          <div style={{
            backgroundColor: '#0e172a',
            border: '2px solid #f59e0b',
            borderRadius: '10px',
            padding: '1.2rem',
            boxShadow: '0 0 25px rgba(245, 158, 11, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.9rem'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #1e293b',
              paddingBottom: '0.7rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Radio size={18} color="#f59e0b" />
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#f8fafc' }}>
                    NAVIGATIONAL WARNING
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#fbbf24', fontWeight: 800 }}>
                    {navigationalWarning?.navarea_number || 'NAVAREA VIII 142/2026'}
                  </div>
                </div>
              </div>

              <span style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                color: '#34d399',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <span style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981'
                }}></span>
                BROADCAST — SIMULATED
              </span>
            </div>

            {/* Broadcast Details Grid (Requirement 6) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.76rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingBottom: '0.4rem',
                borderBottom: '1px solid #14223f'
              }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>Affected Route:</span>
                <span style={{ color: '#f1f5f9', fontWeight: 700, textAlign: 'right' }}>
                  Mumbai Approaches — Fairway Corridor
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingBottom: '0.4rem',
                borderBottom: '1px solid #14223f'
              }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>Affected Zone:</span>
                <span style={{ color: '#f87171', fontWeight: 700, textAlign: 'right' }}>
                  {forwardDrift?.hazard_area_km2 ? `${Math.round(forwardDrift.hazard_area_km2)} km²` : '220 km²'} Predicted Exclusion Zone (Radius 4.5 NM)
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingBottom: '0.4rem',
                borderBottom: '1px solid #14223f'
              }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>Recipients:</span>
                <span style={{ color: '#38bdf8', fontWeight: 800 }}>
                  {totalVesselsNotified} vessels
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingBottom: '0.4rem',
                borderBottom: '1px solid #14223f'
              }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>Status:</span>
                <strong style={{ color: '#10b981', fontWeight: 800 }}>
                  BROADCAST — SIMULATED
                </strong>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingBottom: '0.4rem',
                borderBottom: '1px solid #14223f'
              }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>Station / Issuer:</span>
                <span style={{ color: '#cbd5e1', fontWeight: 600 }}>
                  {navigationalWarning?.station || 'MUMBAI VTMS / COAST RADIO (VWX)'}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>Channels:</span>
                <span style={{ color: '#cbd5e1', fontWeight: 600, textAlign: 'right' }}>
                  NAVTEX 518 kHz • VHF CH 16/12 • Inmarsat SafetyNET
                </span>
              </div>
            </div>

            {/* Official IMO/IHO NAVAREA VIII Message Text Preview */}
            <div style={{ marginTop: '0.2rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.35rem'
              }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase' }}>
                  Broadcast Message Draft:
                </span>
                <button
                  onClick={handleCopyWarning}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: copiedWarning ? '#34d399' : '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.67rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px'
                  }}
                >
                  <Copy size={11} />
                  <span>{copiedWarning ? 'Copied!' : 'Copy Draft'}</span>
                </button>
              </div>

              <div style={{
                backgroundColor: '#070b14',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '0.65rem 0.8rem',
                fontFamily: 'monospace',
                fontSize: '0.68rem',
                color: '#e2e8f0',
                lineHeight: 1.45,
                maxHeight: '160px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                {navigationalWarning?.message_text || (
                  `Potential oil-spill risk detected along the affected route. Avoid the predicted exclusion zone until further notice.\nNAVAREA VIII 142/2026. ARABIAN SEA - MUMBAI APPROACHES.\n1. POLLUTION HAZARD: CONFIRMED CONTINUOUS HYDROCARBON DISCHARGE OBSERVED IN VICINITY 18°54.6'N 072°20.4'E.\n2. SUSPECT / SOURCE IDENTIFIED: MT OCEAN PIONEER (MMSI: 419001234).\n3. HYDRODYNAMIC DRIFT: SLICK DRIFTING 054 DEGREES AT 1.7 KNOTS TOWARDS FAIRWAY.\n4. ACTIVE EXCLUSION ZONE: 220 SQ KM EXTENDING 12 NM NORTHEAST. RADIUS 4.5 NM FROM AXIS.\n5. DIRECTIVE: ALL VESSELS IN VICINITY AND ON AFFECTED ROUTES MAINTAIN MINIMUM 3 NM CLOSEST POINT OF APPROACH (CPA), POST EXTRA LOOKOUTS, RESTRICT ENGINE RAW WATER INTAKE, AND COMPLY WITH MUMBAI VTMS DIRECTIVES ON VHF CH 16/12.\n6. RESPONSE FLOTILLA ON SCENE. CANCEL AT 081200 UTC.`
                )}
              </div>
            </div>

            {/* Disclaimer per requirement 6 */}
            <div style={{
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '6px',
              padding: '0.55rem 0.75rem',
              fontSize: '0.68rem',
              color: '#fcd34d',
              lineHeight: 1.35
            }}>
              <strong>Operational Simulation Notice:</strong> Demonstrates automated maritime safety information (MSI) transmission workflow under SIH PS-143. No physical RF signals were emitted.
            </div>
          </div>

          {/* Quick Return to Dashboard / Investigation Navigation Links */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem'
          }}>
            <button
              onClick={() => onNavigateTab('investigation')}
              style={{
                backgroundColor: '#0e172a',
                border: '1px solid #1e293b',
                color: '#cbd5e1',
                borderRadius: '6px',
                padding: '0.6rem 0.8rem',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#38bdf8'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e293b'}
            >
              <span>← Back to Investigation</span>
            </button>

            <button
              onClick={() => onNavigateTab('dashboard')}
              style={{
                backgroundColor: '#0e172a',
                border: '1px solid #1e293b',
                color: '#38bdf8',
                borderRadius: '6px',
                padding: '0.6rem 0.8rem',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#38bdf8'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e293b'}
            >
              <span>View Response Dashboard →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
