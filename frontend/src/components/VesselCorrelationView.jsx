import React, { useState } from 'react';
import { 
  Ship, 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  Info,
  ChevronRight
} from 'lucide-react';
import MaritimeMap from './MaritimeMap';

export default function VesselCorrelationView({
  aisData,
  candidateVessels,
  spillData,
  originData,
  selectedVessel,
  onSelectVessel,
  onCorrelateVessels,
  isCorrelating,
  onProceedToInvestigation
}) {
  const [inspectVessel, setInspectVessel] = useState(null);

  const candidates = candidateVessels || [];

  return (
    <div style={{ padding: '1.2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 'calc(100vh - 120px)' }}>
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
            <Ship size={22} color="#38bdf8" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9' }}>
              Vessel Correlation
            </h2>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Correlating AIS vessel tracks against estimated origin region and release timing
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <button
            onClick={() => onCorrelateVessels(35.0)}
            disabled={isCorrelating}
            className="btn-primary"
            style={{
              padding: '0.6rem 1.3rem',
              fontSize: '0.85rem',
              fontWeight: 800
            }}
          >
            {isCorrelating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>CORRELATING...</span>
              </>
            ) : (
              <>
                <Play size={16} fill="#ffffff" />
                <span>CORRELATE VESSELS</span>
              </>
            )}
          </button>

          {candidates.length > 0 && (
            <button
              onClick={onProceedToInvestigation}
              style={{
                padding: '0.6rem 1.1rem',
                backgroundColor: '#1e293b',
                color: '#ffffff',
                border: '1px solid #334155',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>Next: View Investigation</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Clean Vessel List / Right Map */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1rem', flex: 1 }}>
        {/* Left Column: Clean, Minimal Vessel List (Rank, Vessel, Type, Score) */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.7rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              Candidate Vessels ({candidates.length})
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Click to view track
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', overflowY: 'auto', flex: 1 }}>
            {candidates.map((vessel) => {
              const isSelected = selectedVessel && selectedVessel.mmsi === vessel.mmsi;
              const isRank1 = vessel.rank === 1;
              const score = vessel.scores?.total_score || 0;

              return (
                <div
                  key={vessel.mmsi}
                  onClick={() => {
                    onSelectVessel(vessel);
                    setInspectVessel(vessel);
                  }}
                  style={{
                    backgroundColor: isSelected ? '#162444' : '#070b14',
                    border: isSelected 
                      ? (isRank1 ? '1.5px solid #38bdf8' : '1.5px solid #f59e0b') 
                      : '1px solid #1e293b',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.15s ease'
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
                        {vessel.vessel_name.replace(' - DEMO', '')}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {vessel.vessel_type}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      color: isRank1 ? '#38bdf8' : (score >= 50 ? '#fbbf24' : '#94a3b8')
                    }}>
                      {score}<span style={{ fontSize: '0.72rem', fontWeight: 500 }}>/100</span>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                      Likelihood
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Optional Clicked Vessel Detail Card */}
          {inspectVessel && (
            <div style={{
              backgroundColor: '#070b14',
              border: '1px solid #1f345e',
              borderRadius: '6px',
              padding: '0.7rem',
              fontSize: '0.72rem',
              color: '#cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem'
            }}>
              <div style={{ fontWeight: 700, color: '#38bdf8' }}>
                {inspectVessel.vessel_name} Details:
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>CPA Distance:</span>
                <strong>{inspectVessel.cpa_distance_km} km</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>CPA Time:</span>
                <strong>{inspectVessel.cpa_time?.split('T')[1]?.slice(0, 5)} UTC</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Flag / Draught:</span>
                <span>{inspectVessel.flag} ({inspectVessel.draught}m)</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Large Interactive Map with Vessel Tracks */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          overflow: 'hidden',
          minHeight: '520px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <MaritimeMap
            spillData={spillData}
            originData={originData}
            candidateVessels={candidates}
            selectedVessel={selectedVessel}
            onSelectVessel={onSelectVessel}
            height="100%"
            autoFit={true}
          />
        </div>
      </div>
    </div>
  );
}
