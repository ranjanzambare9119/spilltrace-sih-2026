import React from 'react';
import { X, Printer, Download, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function InvestigationReportModal({ spillData, originData, candidateVessels, onClose }) {
  const topVessel = candidateVessels && candidateVessels.length > 0 ? candidateVessels[0] : null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const report = {
      report_id: `REP-${spillData?.spill_id || 'SP-20260906-001'}-ATTR`,
      title: 'SpillTrace Maritime Oil Spill Source Attribution Incident Briefing',
      classification: 'AI-ASSISTED DECISION SUPPORT / PROVISIONAL',
      timestamp: new Date().toISOString(),
      incident: spillData,
      drift_analysis: originData,
      ranked_candidates: candidateVessels
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SpillTrace_Investigation_${spillData?.spill_id || 'SP001'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
      zIndex: 2000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#0e172a',
        border: '1px solid #334155',
        borderRadius: '10px',
        width: '100%',
        maxWidth: '820px',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.9)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.4rem',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#0a1120'
        }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f1f5f9' }}>
              Maritime Incident Attribution Briefing (Dossier)
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Reference: REP-{spillData?.spill_id || 'SP-20260906-001'}-ATTR • SIH 2026 PS-143
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={handlePrint}
              style={{
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '0.35rem 0.7rem',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <Printer size={14} />
              Print
            </button>
            <button
              onClick={handleDownloadJSON}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: '1px solid #38bdf8',
                borderRadius: '6px',
                padding: '0.35rem 0.7rem',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <Download size={14} />
              Export JSON
            </button>
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
        </div>

        {/* Printable Document Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', color: '#cbd5e1' }}>
          {/* Official Document Banner */}
          <div style={{
            border: '1px solid #38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.06)',
            borderRadius: '6px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9' }}>
              SPILLTRACE MARITIME INCIDENT ATTRIBUTION REPORT
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              AI-ASSISTED SATELLITE DETECTION &amp; AIS SPATIO-TEMPORAL CORRELATION
            </p>
          </div>

          {/* Section 1: Incident Overview */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9', borderBottom: '1px solid #1e293b', paddingBottom: '0.4rem', marginBottom: '0.6rem' }}>
              1. SATELLITE SPILL DETECTION SUMMARY
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.78rem' }}>
              <div>Spill Identifier: <strong className="font-mono">{spillData?.spill_id}</strong></div>
              <div>Classification: <strong style={{ color: '#ef4444' }}>{spillData?.classification}</strong></div>
              <div>Sensor: <strong>{spillData?.sensor}</strong></div>
              <div>Acquisition Timestamp: <strong>{spillData?.detection_time}</strong></div>
              <div>Centroid Coordinates: <strong className="font-mono">{spillData?.latitude}° N, {spillData?.longitude}° E</strong></div>
              <div>Estimated Surface Area: <strong style={{ color: '#38bdf8' }}>{spillData?.area_km2} km²</strong></div>
              <div>Detection Confidence: <strong style={{ color: '#10b981' }}>{(spillData?.confidence * 100).toFixed(1)}%</strong></div>
              <div>Estimated Volume: <strong>~{spillData?.estimated_volume_m3?.toLocaleString()} m³</strong></div>
            </div>
          </div>

          {/* Section 2: Oceanographic Leeway Drift Modeling */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9', borderBottom: '1px solid #1e293b', paddingBottom: '0.4rem', marginBottom: '0.6rem' }}>
              2. HYDRODYNAMIC BACKWARD DRIFT &amp; PROBABLE ORIGIN
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.78rem' }}>
              <div>Surface Current: <strong>1.2 kts @ 50.0°</strong></div>
              <div>Surface Wind: <strong>14.0 kts @ 65.0°</strong></div>
              <div>Net Surface Drift: <strong>{originData?.net_drift_speed_kts} kts @ {originData?.net_drift_direction_deg}°</strong></div>
              <div>Estimated Spill Age: <strong>{originData?.estimated_drift_hours} hours</strong></div>
              <div>Probable Origin Centroid: <strong className="font-mono">{originData?.probable_origin_latitude}° N, {originData?.probable_origin_longitude}° E</strong></div>
              <div>Uncertainty Envelope: <strong style={{ color: '#fbbf24' }}>±{originData?.origin_uncertainty_km} km radius</strong></div>
              <div>Estimated Discharge Time: <strong>{originData?.estimated_release_time}</strong></div>
              <div>Discharge Window: <strong>{originData?.release_window_start?.split('T')[1]?.slice(0, 5)} - {originData?.release_window_end?.split('T')[1]?.slice(0, 5)} UTC</strong></div>
            </div>
          </div>

          {/* Section 3: Ranked Candidate Vessels */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9', borderBottom: '1px solid #1e293b', paddingBottom: '0.4rem', marginBottom: '0.6rem' }}>
              3. CANDIDATE VESSEL ATTRIBUTION RANKING
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#070b14', color: '#94a3b8', borderBottom: '1px solid #1e293b' }}>
                  <th style={{ padding: '0.5rem' }}>Rank</th>
                  <th style={{ padding: '0.5rem' }}>Vessel Name</th>
                  <th style={{ padding: '0.5rem' }}>MMSI</th>
                  <th style={{ padding: '0.5rem' }}>Type</th>
                  <th style={{ padding: '0.5rem' }}>CPA Distance</th>
                  <th style={{ padding: '0.5rem' }}>CPA Time</th>
                  <th style={{ padding: '0.5rem' }}>Score (/100)</th>
                </tr>
              </thead>
              <tbody>
                {candidateVessels?.map(c => (
                  <tr key={c.mmsi} style={{ borderBottom: '1px solid #14223f' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700 }}>#{c.rank}</td>
                    <td style={{ padding: '0.5rem', fontWeight: 600, color: c.rank === 1 ? '#38bdf8' : '#e2e8f0' }}>{c.vessel_name}</td>
                    <td style={{ padding: '0.5rem', fontFamily: 'monospace' }}>{c.mmsi}</td>
                    <td style={{ padding: '0.5rem' }}>{c.vessel_type}</td>
                    <td style={{ padding: '0.5rem' }}>{c.cpa_distance_km} km</td>
                    <td style={{ padding: '0.5rem' }}>{c.cpa_time?.split('T')[1]?.slice(0, 5)} UTC</td>
                    <td style={{ padding: '0.5rem', fontWeight: 800, color: c.rank === 1 ? '#38bdf8' : '#fbbf24' }}>
                      {c.scores?.total_score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: Lead Candidate Justification */}
          {topVessel && (
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9', borderBottom: '1px solid #1e293b', paddingBottom: '0.4rem', marginBottom: '0.6rem' }}>
                4. PRIMARY CANDIDATE EXPLAINABILITY: {topVessel.vessel_name}
              </h4>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.78rem', lineHeight: 1.5, color: '#cbd5e1' }}>
                {topVessel.why_reasons?.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Mandatory Legal Safeguard */}
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            padding: '0.8rem',
            fontSize: '0.72rem',
            color: '#fca5a5'
          }}>
            <strong>Decision Support Disclaimer:</strong> This briefing provides probabilistic decision-support analytics for Coast Guard and maritime administration screening. The Source-Likelihood Score correlates spatial trajectory, temporal coincidence, and hydrodynamic drift. It does NOT constitute formal legal culpability.
          </div>
        </div>
      </div>
    </div>
  );
}
