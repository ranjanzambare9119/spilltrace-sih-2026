import React, { useState } from 'react';
import { 
  Compass, 
  Wind, 
  Waves, 
  MapPin, 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import MaritimeMap from './MaritimeMap';

export default function OriginAnalysisView({
  spillData,
  originData,
  envData,
  onEstimateOrigin,
  isEstimating,
  onProceedToVessels
}) {
  const [hasCalculated, setHasCalculated] = useState(!!originData);

  const handleEstimateClick = async () => {
    await onEstimateOrigin(5.5, 3.5);
    setHasCalculated(true);
  };

  return (
    <div style={{ padding: '1.2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 'calc(100vh - 120px)' }}>
      {/* Top Action Header */}
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
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '6px',
            padding: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Compass size={22} color="#f59e0b" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9' }}>
              Origin Analysis
            </h2>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Backward leeway drift simulation to determine probable origin region
            </p>
          </div>
        </div>

        {/* Primary Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <button
            onClick={handleEstimateClick}
            disabled={isEstimating}
            style={{
              background: isEstimating ? '#1e293b' : 'linear-gradient(135deg, #d97706, #b45309)',
              color: '#ffffff',
              border: '1px solid #fbbf24',
              borderRadius: '6px',
              padding: '0.6rem 1.4rem',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: isEstimating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: isEstimating ? 'none' : '0 0 16px rgba(245, 158, 11, 0.35)',
              transition: 'all 0.2s ease',
              letterSpacing: '0.03em'
            }}
          >
            {isEstimating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>ESTIMATING ORIGIN...</span>
              </>
            ) : (
              <>
                <Play size={16} fill="#ffffff" />
                <span>ESTIMATE ORIGIN</span>
              </>
            )}
          </button>

          {originData && (
            <button
              onClick={onProceedToVessels}
              className="btn-primary"
              style={{
                padding: '0.6rem 1.1rem',
                fontSize: '0.82rem'
              }}
            >
              <span>Next: Correlate Vessels</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Banner when Origin is Available */}
      {originData && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '6px',
          padding: '0.5rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: '#6ee7b7'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span>
              <strong>Estimated Origin Region Calculated:</strong> Reconstructed ~{originData.total_drift_distance_km} km backward drift path from detected slick.
            </span>
          </div>
          <span style={{ fontFamily: 'monospace', color: '#f1f5f9' }}>
            Release Window: {originData.release_window_start?.split('T')[1]?.slice(0, 5)} - {originData.release_window_end?.split('T')[1]?.slice(0, 5)} UTC
          </span>
        </div>
      )}

      {/* Large Map Focus (65-70% height) */}
      <div style={{
        flex: 1,
        minHeight: '500px',
        backgroundColor: '#0e172a',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <MaritimeMap 
          spillData={spillData}
          originData={originData}
          candidateVessels={[]}
          showVessels={false}
          showDrift={true}
          height="100%"
          autoFit={true}
        />
      </div>

      {/* Summary Markers & 3 Small Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.8rem'
      }}>
        {/* Status 1: 🛢️ Possible Spill */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderLeft: '4px solid #ef4444',
          borderRadius: '6px',
          padding: '0.75rem 0.9rem'
        }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            🛢️ Possible Spill
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f1f5f9', marginTop: '0.2rem', fontFamily: 'monospace' }}>
            {spillData ? `${spillData.latitude}° N, ${spillData.longitude}° E` : '18.95° N, 72.40° E'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem' }}>
            Area: {spillData ? spillData.area_km2 : 14.8} km² • Conf: {spillData ? (spillData.confidence * 100).toFixed(0) : 94}%
          </div>
        </div>

        {/* Status 2: 🟠 Probable Origin */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderLeft: '4px solid #f59e0b',
          borderRadius: '6px',
          padding: '0.75rem 0.9rem'
        }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            🟠 Estimated Origin Region
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.2rem', fontFamily: 'monospace' }}>
            {originData 
              ? `${originData.probable_origin_latitude}° N, ${originData.probable_origin_longitude}° E` 
              : 'Click "Estimate Origin"'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem' }}>
            {originData ? `Dispersion buffer: ±${originData.origin_uncertainty_km} km` : 'Origin envelope awaiting run'}
          </div>
        </div>

        {/* Status 3: ➡️ Drift Direction */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderLeft: '4px solid #00f0ff',
          borderRadius: '6px',
          padding: '0.75rem 0.9rem'
        }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            ➡️ Drift Direction
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#00f0ff', marginTop: '0.2rem' }}>
            {originData ? `${originData.net_drift_direction_deg}° (${originData.net_drift_speed_kts} kts)` : '54.3° (1.7 kts)'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem' }}>
            Net surface leeway displacement
          </div>
        </div>

        {/* Card 1: Wind */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          padding: '0.75rem 0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <Wind size={20} color="#38bdf8" />
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Surface Wind</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>
              {envData ? envData.wind_speed : 14} kts @ {envData ? envData.wind_direction : 65}°
            </div>
          </div>
        </div>

        {/* Card 2: Current */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          padding: '0.75rem 0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <Waves size={20} color="#34d399" />
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Surface Current</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>
              {envData ? envData.current_speed : 1.2} kts @ {envData ? envData.current_direction : 50}°
            </div>
          </div>
        </div>

        {/* Card 3: Uncertainty */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          padding: '0.75rem 0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <Compass size={20} color="#fbbf24" />
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Uncertainty Radius</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fbbf24' }}>
              ±{originData ? originData.origin_uncertainty_km : 3.5} km
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
