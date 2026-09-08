import React, { useState } from 'react';
import { 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  Layers, 
  Filter, 
  AlertCircle, 
  ExternalLink,
  ChevronRight 
} from 'lucide-react';

export default function MaritimeAnalytics({
  spillData,
  originData,
  candidateVessels = [],
  onSelectVessel,
  onOpenSecondaryIncident
}) {
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');

  // Calibrated Demo Incident Dataset
  const demoIncidents = [
    {
      id: 'ST-2026-DEMO-001',
      severity: 'CRITICAL',
      severityColor: '#ef4444',
      location: 'Arabian Sea — Mumbai Approaches',
      detection: '94.2% (Possible Spill)',
      status: 'Analysis Active',
      statusColor: '#10b981',
      time: '06:00 UTC (Today)',
      candidates: '5 Correlated',
      isPrimary: true
    },
    {
      id: 'ST-2026-DEMO-002',
      severity: 'HIGH',
      severityColor: '#f59e0b',
      location: 'Gulf of Kutch — Vadinar Channel',
      detection: '88.0% (Radar Anomaly)',
      status: 'Monitoring',
      statusColor: '#f59e0b',
      time: '18:30 UTC (Yesterday)',
      candidates: '3 Correlated',
      isPrimary: false
    },
    {
      id: 'ST-2026-DEMO-003',
      severity: 'HIGH',
      severityColor: '#f59e0b',
      location: 'Cochin Approaches — Offshore Corridor',
      detection: '84.5% (Probable Slick)',
      status: 'Drift Simulated',
      statusColor: '#38bdf8',
      time: '12:15 UTC (Yesterday)',
      candidates: '4 Correlated',
      isPrimary: false
    },
    {
      id: 'ST-2026-DEMO-004',
      severity: 'MEDIUM',
      severityColor: '#eab308',
      location: 'Bay of Bengal — Chennai Approaches',
      detection: '76.2% (Low Backscatter)',
      status: 'Standby',
      statusColor: '#94a3b8',
      time: '04:45 UTC (2 days ago)',
      candidates: '2 Correlated',
      isPrimary: false
    },
    {
      id: 'ST-2026-DEMO-005',
      severity: 'LOW',
      severityColor: '#38bdf8',
      location: 'Paradip Anchorage — Outer Roadstead',
      detection: '62.1% (Dispersed Sheen)',
      status: 'Archived',
      statusColor: '#64748b',
      time: '21:00 UTC (3 days ago)',
      candidates: '1 Correlated',
      isPrimary: false
    }
  ];

  const filteredIncidents = selectedSeverity === 'ALL'
    ? demoIncidents
    : demoIncidents.filter(inc => inc.severity === selectedSeverity);

  // Donut chart calculations: Total 5 incidents (1 Crit, 2 High, 1 Med, 1 Low)
  const severityCounts = {
    CRITICAL: 1,
    HIGH: 2,
    MEDIUM: 1,
    LOW: 1
  };

  // Trend data: 24h synthetic SAR backscatter damping anomaly
  const trendPoints = [
    { time: '00:00', value: 18 },
    { time: '02:00', value: 24 },
    { time: '04:00', value: 45 },
    { time: '06:00', value: 94 }, // Satellite overpass
    { time: '08:00', value: 88 },
    { time: '10:00', value: 82 },
    { time: '12:00', value: 76 },
    { time: '14:00', value: 71 },
    { time: '16:00', value: 65 },
    { time: '18:00', value: 58 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} id="maritime-analytics">
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0c1322',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '0.65rem 1.2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            padding: '0.35rem',
            borderRadius: '6px'
          }}>
            <BarChart3 size={18} color="#38bdf8" />
          </div>
          <div>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>
              MARITIME INCIDENT ANALYTICS
            </h2>
            <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0 }}>
              Incident Severity, Attribution Distribution &amp; Detection Anomaly History
            </p>
          </div>
        </div>

        <span style={{
          backgroundColor: 'rgba(245, 158, 11, 0.14)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          color: '#fbbf24',
          fontSize: '0.66rem',
          fontWeight: 700,
          padding: '0.15rem 0.55rem',
          borderRadius: '4px'
        }}>
          DEMO ANALYTICS
        </span>
      </div>

      {/* Grid: Donut Severity + Trend Chart */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '0.85rem'
      }}>
        {/* Card 1: Active Incidents by Severity (Donut Chart) */}
        <div style={{
          backgroundColor: '#0c1322',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '1rem 1.2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>
                ACTIVE INCIDENTS
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                Incidents classified by severity
              </div>
            </div>
            <span style={{
              fontSize: '0.62rem',
              color: '#fbbf24',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              DEMO INCIDENT DISTRIBUTION
            </span>
          </div>

          {/* Donut Chart Visual */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0.5rem 0'
          }}>
            {/* SVG Donut Chart */}
            <div style={{ position: 'relative', width: '130px', height: '130px' }}>
              <svg width="130" height="130" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#1e293b" strokeWidth="14" />
                
                {/* Critical Segment: 1/5 = 20% -> dash 47.7, gap 191 */}
                <circle 
                  cx="50" cy="50" r="38" fill="none" 
                  stroke="#ef4444" strokeWidth="14" 
                  strokeDasharray="47.7 238.8" strokeDashoffset="0"
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => setSelectedSeverity(selectedSeverity === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
                />
                
                {/* High Segment: 2/5 = 40% -> dash 95.5 */}
                <circle 
                  cx="50" cy="50" r="38" fill="none" 
                  stroke="#f59e0b" strokeWidth="14" 
                  strokeDasharray="95.5 238.8" strokeDashoffset="-47.7"
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => setSelectedSeverity(selectedSeverity === 'HIGH' ? 'ALL' : 'HIGH')}
                />

                {/* Medium Segment: 1/5 = 20% */}
                <circle 
                  cx="50" cy="50" r="38" fill="none" 
                  stroke="#eab308" strokeWidth="14" 
                  strokeDasharray="47.7 238.8" strokeDashoffset="-143.2"
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => setSelectedSeverity(selectedSeverity === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
                />

                {/* Low Segment: 1/5 = 20% */}
                <circle 
                  cx="50" cy="50" r="38" fill="none" 
                  stroke="#38bdf8" strokeWidth="14" 
                  strokeDasharray="47.7 238.8" strokeDashoffset="-190.9"
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => setSelectedSeverity(selectedSeverity === 'LOW' ? 'ALL' : 'LOW')}
                />
              </svg>

              {/* Center Donut Text */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                pointerEvents: 'none'
              }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f1f5f9', lineHeight: 1 }}>
                  5
                </span>
                <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  ACTIVE
                </span>
              </div>
            </div>

            {/* Severity Legend & Interactive Filter Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.74rem' }}>
              <button
                onClick={() => setSelectedSeverity(selectedSeverity === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
                style={{
                  background: selectedSeverity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                  border: 'none',
                  color: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}
              >
                <span style={{ width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '2px' }} />
                <span>Critical: <strong>1</strong></span>
              </button>

              <button
                onClick={() => setSelectedSeverity(selectedSeverity === 'HIGH' ? 'ALL' : 'HIGH')}
                style={{
                  background: selectedSeverity === 'HIGH' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                  border: 'none',
                  color: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}
              >
                <span style={{ width: '10px', height: '10px', backgroundColor: '#f59e0b', borderRadius: '2px' }} />
                <span>High: <strong>2</strong></span>
              </button>

              <button
                onClick={() => setSelectedSeverity(selectedSeverity === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
                style={{
                  background: selectedSeverity === 'MEDIUM' ? 'rgba(234, 179, 8, 0.2)' : 'transparent',
                  border: 'none',
                  color: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}
              >
                <span style={{ width: '10px', height: '10px', backgroundColor: '#eab308', borderRadius: '2px' }} />
                <span>Medium: <strong>1</strong></span>
              </button>

              <button
                onClick={() => setSelectedSeverity(selectedSeverity === 'LOW' ? 'ALL' : 'LOW')}
                style={{
                  background: selectedSeverity === 'LOW' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                  border: 'none',
                  color: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}
              >
                <span style={{ width: '10px', height: '10px', backgroundColor: '#38bdf8', borderRadius: '2px' }} />
                <span>Low: <strong>1</strong></span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: SAR Detection Anomaly Trend (Line Chart) */}
        <div style={{
          backgroundColor: '#0c1322',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '1rem 1.2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>
                SAR DETECTION TREND
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                C-SAR surface roughness damping signal (dB)
              </div>
            </div>
            <span style={{
              fontSize: '0.62rem',
              color: '#38bdf8',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              HISTORICAL TIMELINE
            </span>
          </div>

          {/* Line Chart SVG */}
          <div style={{ flex: 1, minHeight: '130px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <svg width="100%" height="110" viewBox="0 0 300 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="300" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="50" x2="300" y2="50" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="300" y2="80" stroke="#1e293b" strokeDasharray="3 3" />

              {/* Area Fill */}
              <polygon
                points="0,100 0,82 30,76 60,55 90,6 120,12 150,18 180,24 210,29 240,35 270,42 300,100"
                fill="url(#trendGrad)"
              />

              {/* Trend Line */}
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                points="0,82 30,76 60,55 90,6 120,12 150,18 180,24 210,29 240,35 270,42"
              />

              {/* Peak Point: 06:00 UTC (Satellite Acquisition) */}
              <circle cx="90" cy="6" r="4" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
            </svg>

            {/* X-axis labels */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.62rem',
              color: '#64748b',
              marginTop: '0.4rem',
              fontFamily: 'monospace'
            }}>
              <span>00:00</span>
              <span>03:00</span>
              <span style={{ color: '#ef4444', fontWeight: 700 }}>06:00 (Pass)</span>
              <span>12:00</span>
              <span>18:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Incident List Table */}
      <div style={{
        backgroundColor: '#0c1322',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '0.85rem 1.1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>
              INCIDENT REGISTRY
            </span>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              ({filteredIncidents.length} of {demoIncidents.length} shown)
            </span>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                style={{
                  backgroundColor: selectedSeverity === sev ? '#1e293b' : 'transparent',
                  color: selectedSeverity === sev ? '#38bdf8' : '#64748b',
                  border: `1px solid ${selectedSeverity === sev ? '#38bdf8' : '#1e293b'}`,
                  borderRadius: '4px',
                  padding: '0.18rem 0.5rem',
                  fontSize: '0.64rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.74rem',
            textAlign: 'left'
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '0.66rem' }}>
                <th style={{ padding: '0.45rem 0.5rem' }}>INCIDENT ID</th>
                <th style={{ padding: '0.45rem 0.5rem' }}>SEVERITY</th>
                <th style={{ padding: '0.45rem 0.5rem' }}>LOCATION</th>
                <th style={{ padding: '0.45rem 0.5rem' }}>DETECTION</th>
                <th style={{ padding: '0.45rem 0.5rem' }}>TIME</th>
                <th style={{ padding: '0.45rem 0.5rem' }}>CANDIDATES</th>
                <th style={{ padding: '0.45rem 0.5rem', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map(inc => (
                <tr
                  key={inc.id}
                  style={{
                    borderBottom: '1px solid #141c2e',
                    backgroundColor: inc.isPrimary ? 'rgba(56, 189, 248, 0.05)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '0.5rem', fontFamily: 'monospace', fontWeight: 800, color: inc.isPrimary ? '#38bdf8' : '#f1f5f9' }}>
                    {inc.id} {inc.isPrimary && <span style={{ color: '#ef4444', fontSize: '0.62rem' }}>● ACTIVE</span>}
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <span style={{
                      backgroundColor: `${inc.severityColor}22`,
                      color: inc.severityColor,
                      border: `1px solid ${inc.severityColor}55`,
                      padding: '1px 6px',
                      borderRadius: '3px',
                      fontSize: '0.64rem',
                      fontWeight: 800
                    }}>
                      {inc.severity}
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem', color: '#cbd5e1' }}>
                    {inc.location}
                  </td>
                  <td style={{ padding: '0.5rem', color: '#94a3b8' }}>
                    {inc.detection}
                  </td>
                  <td style={{ padding: '0.5rem', color: '#64748b' }}>
                    {inc.time}
                  </td>
                  <td style={{ padding: '0.5rem', color: '#38bdf8', fontWeight: 700 }}>
                    {inc.candidates}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                    {inc.isPrimary ? (
                      <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.68rem' }}>
                        LOADED
                      </span>
                    ) : (
                      <button
                        onClick={() => onOpenSecondaryIncident(inc)}
                        style={{
                          backgroundColor: '#1e293b',
                          color: '#cbd5e1',
                          border: '1px solid #334155',
                          borderRadius: '4px',
                          padding: '0.2rem 0.55rem',
                          fontSize: '0.66rem',
                          cursor: 'pointer'
                        }}
                      >
                        Inspect
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
