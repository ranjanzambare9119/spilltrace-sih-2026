import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

export default function MaritimeMap({
  spillData,
  originData,
  candidateVessels = [],
  selectedVessel,
  onSelectVessel,
  showSpill = true,
  showOrigin = true,
  showDrift = true,
  showVessels = true,
  interactiveLegend = true,
  height = '100%',
  minHeight = '500px',
  autoFit = true
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const [tileError, setTileError] = useState(false);

  // Layer visibility toggles
  const [layers, setLayers] = useState({
    spill: showSpill,
    origin: showOrigin,
    drift: showDrift,
    vessels: showVessels
  });

  // Sync prop changes to internal layer state
  useEffect(() => {
    setLayers({
      spill: showSpill,
      origin: showOrigin,
      drift: showDrift,
      vessels: showVessels
    });
  }, [showSpill, showOrigin, showDrift, showVessels]);

  // 1. Initialize Map with standard OpenStreetMap (100% Free, NO API KEY)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [18.91, 72.34],
        zoom: 11,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Standard OpenStreetMap tiles (Clean, free, no watermark)
      const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors | SpillTrace Decision Support',
        maxZoom: 19
      }).addTo(map);

      tileLayer.on('tileerror', () => {
        setTileError(true);
      });

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    // Observe container resizes and force Leaflet to recalculate dimensions
    const ro = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    ro.observe(mapContainerRef.current);

    // Staggered invalidations for tab changes and layout transitions
    const t1 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 50);
    const t2 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 200);
    const t3 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 500);

    return () => {
      ro.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Update Layers on data or layer toggle changes
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // 1. SPILL LAYER
    if (layers.spill && spillData) {
      if (spillData.polygon_coordinates && spillData.polygon_coordinates.length > 0) {
        L.polygon(spillData.polygon_coordinates, {
          color: '#ef4444',
          weight: 2.5,
          fillColor: '#ef4444',
          fillOpacity: 0.4,
          dashArray: '5, 5'
        }).addTo(layerGroup).bindPopup(`
          <div style="font-size: 0.8rem; line-height: 1.4;">
            <div style="color: #f87171; font-weight: 700; font-size: 0.85rem; margin-bottom: 0.2rem;">
              🛢️ ${spillData.classification || 'Possible Oil Spill'}
            </div>
            <div><strong>Area:</strong> ${spillData.area_km2} km²</div>
            <div><strong>Score:</strong> ${(spillData.confidence * 100).toFixed(0)}%</div>
            <div><strong>Location:</strong> ${spillData.latitude}° N, ${spillData.longitude}° E</div>
            <div><strong>Detected:</strong> ${spillData.detection_time?.split('T')[1]?.slice(0, 5)} UTC</div>
          </div>
        `);
      }

      // Pulsing spill centroid
      const spillIcon = L.divIcon({
        className: 'custom-spill-icon',
        html: `
          <div style="
            width: 18px; 
            height: 18px; 
            background: #ef4444; 
            border: 2px solid #ffffff; 
            border-radius: 50%;
            box-shadow: 0 0 12px #ef4444;
          " class="pulsing-spill-marker"></div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      L.marker([spillData.latitude, spillData.longitude], { icon: spillIcon })
        .addTo(layerGroup)
        .bindPopup(`<strong>Possible Spill Centroid</strong><br/>${spillData.latitude}° N, ${spillData.longitude}° E`);
    }

    // 2. PROBABLE ORIGIN LAYER
    if (layers.origin && originData) {
      const originLat = originData.probable_origin_latitude;
      const originLon = originData.probable_origin_longitude;
      const uncertaintyMeters = (originData.origin_uncertainty_km || 3.5) * 1000;

      // Circular uncertainty envelope
      L.circle([originLat, originLon], {
        radius: uncertaintyMeters,
        color: '#f59e0b',
        weight: 2,
        fillColor: '#f59e0b',
        fillOpacity: 0.2,
        dashArray: '6, 6'
      }).addTo(layerGroup).bindPopup(`
        <div style="font-size: 0.8rem; line-height: 1.4;">
          <div style="color: #fbbf24; font-weight: 700; font-size: 0.85rem;">
            🟠 Estimated Origin Region
          </div>
          <div><strong>Uncertainty Radius:</strong> ±${originData.origin_uncertainty_km} km</div>
          <div><strong>Location:</strong> ${originLat}° N, ${originLon}° E</div>
          <div><strong>Estimated Release:</strong> ~${originData.estimated_release_time?.split('T')[1]?.slice(0, 5)} UTC</div>
          <div style="color: #94a3b8; font-size: 0.72rem; margin-top: 0.2rem;">
            Window: ${originData.release_window_start?.split('T')[1]?.slice(0, 5)} - ${originData.release_window_end?.split('T')[1]?.slice(0, 5)} UTC
          </div>
        </div>
      `);

      // Glowing origin marker
      const originIcon = L.divIcon({
        className: 'custom-origin-icon',
        html: `
          <div style="
            width: 20px; 
            height: 20px; 
            background: #f59e0b; 
            border: 2px solid #ffffff; 
            border-radius: 50%;
            box-shadow: 0 0 16px #f59e0b;
          " class="pulsing-origin-marker"></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker([originLat, originLon], { icon: originIcon })
        .addTo(layerGroup)
        .bindPopup(`<strong>Estimated Origin Center</strong><br/>${originLat}° N, ${originLon}° E`);
    }

    // 3. SIMPLE DRIFT ARROW & VECTOR LAYER
    if (layers.drift && originData) {
      if (originData.backward_drift_path && originData.backward_drift_path.length > 0) {
        // Drift track line
        L.polyline(originData.backward_drift_path, {
          color: '#00f0ff',
          weight: 3,
          dashArray: '8, 6',
          opacity: 0.9
        }).addTo(layerGroup).bindPopup(`
          <div style="font-size: 0.8rem;">
            <strong style="color: #38bdf8;">Ocean Surface Drift Path</strong><br/>
            Direction: <strong>${originData.net_drift_direction_deg}°</strong> (${originData.net_drift_speed_kts} kts)<br/>
            Drift Distance: <strong>${originData.total_drift_distance_km} km</strong>
          </div>
        `);

        // Prominent simple drift arrow in the middle
        const pSpill = originData.backward_drift_path[0];
        const pOrig = originData.backward_drift_path[originData.backward_drift_path.length - 1];
        const midLat = (pSpill[0] + pOrig[0]) / 2;
        const midLon = (pSpill[1] + pOrig[1]) / 2;
        const driftAngle = originData.net_drift_direction_deg || 54.3;

        const arrowIcon = L.divIcon({
          className: 'drift-arrow-badge',
          html: `
            <div style="
              display: inline-flex;
              align-items: center;
              gap: 5px;
              background: rgba(10, 17, 32, 0.9);
              border: 1px solid #00f0ff;
              border-radius: 20px;
              padding: 2px 8px;
              box-shadow: 0 0 12px rgba(0, 240, 255, 0.4);
              white-space: nowrap;
            ">
              <span style="
                transform: rotate(${driftAngle - 90}deg);
                display: inline-block;
                color: #00f0ff;
                font-size: 15px;
                font-weight: 800;
              ">➔</span>
              <span style="font-size: 11px; font-weight: 700; color: #00f0ff; font-family: monospace;">
                DRIFT ${originData.net_drift_speed_kts} kts
              </span>
            </div>
          `,
          iconSize: [110, 24],
          iconAnchor: [55, 12]
        });

        L.marker([midLat, midLon], { icon: arrowIcon }).addTo(layerGroup);
      }
    }

    // 4. AIS CANDIDATE VESSELS LAYER
    if (layers.vessels && candidateVessels && candidateVessels.length > 0) {
      candidateVessels.forEach((vessel) => {
        const isRank1 = vessel.rank === 1;
        const isSelected = selectedVessel && selectedVessel.mmsi === vessel.mmsi;
        const score = vessel.scores?.total_score || 0;

        let trackColor = '#64748b';
        let trackWeight = 2;
        let trackOpacity = 0.55;

        if (isRank1) {
          trackColor = '#38bdf8';
          trackWeight = 3.5;
          trackOpacity = 0.95;
        } else if (score >= 50) {
          trackColor = '#f59e0b';
          trackWeight = 2.5;
          trackOpacity = 0.75;
        }

        // Draw trajectory
        if (vessel.trajectory && vessel.trajectory.length > 0) {
          const latLngs = vessel.trajectory.map(r => [r.latitude, r.longitude]);
          const line = L.polyline(latLngs, {
            color: trackColor,
            weight: isSelected ? trackWeight + 2 : trackWeight,
            opacity: trackOpacity,
            dashArray: isRank1 ? null : '5, 5'
          }).addTo(layerGroup);

          line.on('click', () => {
            if (onSelectVessel) onSelectVessel(vessel);
          });
        }

        // Vessel Label Marker
        const cpaRec = vessel.trajectory ? vessel.trajectory[Math.floor(vessel.trajectory.length / 2)] : null;
        const markerLat = cpaRec ? cpaRec.latitude : 18.9;
        const markerLon = cpaRec ? cpaRec.longitude : 72.3;

        const labelHtml = `
          <div style="
            background: ${isRank1 ? '#0284c7' : (score >= 50 ? '#b45309' : '#1e293b')};
            color: #ffffff;
            border: 1px solid ${isSelected ? '#ffffff' : (isRank1 ? '#38bdf8' : '#64748b')};
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
          ">
            <span>🚢</span>
            <span>#${vessel.rank} ${vessel.vessel_name.replace(' - DEMO', '')}</span>
            <span style="
              background: rgba(0,0,0,0.4); 
              padding: 1px 4px; 
              border-radius: 3px; 
              font-family: monospace;
              color: ${isRank1 ? '#7dd3fc' : '#fde68a'};
            ">${score}</span>
          </div>
        `;

        const shipMarker = L.marker([markerLat, markerLon], {
          icon: L.divIcon({
            className: 'vessel-label-icon',
            html: labelHtml,
            iconSize: [120, 22],
            iconAnchor: [60, 11]
          })
        }).addTo(layerGroup);

        shipMarker.on('click', () => {
          if (onSelectVessel) onSelectVessel(vessel);
        });

        shipMarker.bindPopup(`
          <div style="font-size: 0.8rem; line-height: 1.4;">
            <div style="color: #38bdf8; font-weight: 700; font-size: 0.85rem;">${vessel.vessel_name}</div>
            <div style="color: #94a3b8; font-size: 0.72rem;">${vessel.vessel_type}</div>
            <hr style="border: 0; border-top: 1px solid #334155; margin: 0.3rem 0;" />
            <div><strong>Rank:</strong> #${vessel.rank}</div>
            <div><strong>Source-Likelihood Score:</strong> <span style="color: #38bdf8; font-weight: 800;">${score}/100</span></div>
            <div><strong>CPA Distance:</strong> ${vessel.cpa_distance_km} km</div>
            <div><strong>CPA Time:</strong> ${vessel.cpa_time?.split('T')[1]?.slice(0, 5)} UTC</div>
          </div>
        `);
      });
    }

    // 5. Automatic Zoom / FitBounds when spill and origin are available
    if (autoFit && spillData && originData) {
      try {
        const bounds = L.latLngBounds([
          [spillData.latitude, spillData.longitude],
          [originData.probable_origin_latitude, originData.probable_origin_longitude]
        ]);
        map.fitBounds(bounds.pad(0.35), { maxZoom: 13, animate: false });
      } catch (e) {
        // silent
      }
    }

    map.invalidateSize();

  }, [spillData, originData, candidateVessels, selectedVessel, layers, autoFit]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: height || '100%',
      minHeight: minHeight || '500px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: minHeight || '500px',
          flex: 1,
          backgroundColor: '#07101e'
        }}
      />

      {/* Graceful Basemap Fallback Banner */}
      {tileError && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 600,
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          border: '1px solid #334155',
          borderRadius: '6px',
          padding: '0.4rem 0.9rem',
          fontSize: '0.74rem',
          color: '#cbd5e1',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          pointerEvents: 'none'
        }}>
          <span style={{ color: '#38bdf8' }}>ℹ️</span>
          <span>Basemap unavailable — analysis overlays remain available.</span>
        </div>
      )}

      {/* Layer Controls Floating Pill */}
      {interactiveLegend && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 500,
          backgroundColor: 'rgba(10, 17, 32, 0.88)',
          backdropFilter: 'blur(6px)',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          padding: '0.45rem 0.7rem',
          fontSize: '0.72rem',
          display: 'flex',
          gap: '0.8rem',
          color: '#cbd5e1'
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={layers.spill} 
              onChange={e => setLayers(prev => ({ ...prev, spill: e.target.checked }))} 
            />
            <span style={{ color: '#ef4444', fontWeight: 600 }}>● Spill</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={layers.origin} 
              onChange={e => setLayers(prev => ({ ...prev, origin: e.target.checked }))} 
            />
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>● Origin</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={layers.drift} 
              onChange={e => setLayers(prev => ({ ...prev, drift: e.target.checked }))} 
            />
            <span style={{ color: '#00f0ff', fontWeight: 600 }}>➔ Drift</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={layers.vessels} 
              onChange={e => setLayers(prev => ({ ...prev, vessels: e.target.checked }))} 
            />
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>🚢 Vessels</span>
          </label>
        </div>
      )}

      {/* Floating Tactical Legend */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        zIndex: 500,
        backgroundColor: 'rgba(10, 17, 32, 0.88)',
        backdropFilter: 'blur(6px)',
        border: '1px solid #1e293b',
        borderRadius: '6px',
        padding: '0.4rem 0.75rem',
        fontSize: '0.72rem',
        color: '#cbd5e1',
        display: 'flex',
        alignItems: 'center',
        gap: '0.9rem'
      }}>
        <div><span style={{ color: '#ef4444' }}>■</span> Possible Spill</div>
        <div><span style={{ color: '#f59e0b' }}>◌</span> Probable Origin (±3.5km)</div>
        <div><span style={{ color: '#00f0ff' }}>➔</span> Drift Vector</div>
        <div><span style={{ color: '#38bdf8' }}>━━</span> Candidate Tracks</div>
      </div>
    </div>
  );
}
