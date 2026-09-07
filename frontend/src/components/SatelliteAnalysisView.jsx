import React, { useState } from 'react';
import { 
  Play, 
  ArrowRight, 
  Sliders, 
  CheckCircle2, 
  Droplets,
  Layers,
  Loader2,
  ZoomIn,
  ShieldAlert,
  Info
} from 'lucide-react';
import { getStaticUrl } from '../api/client';

export default function SatelliteAnalysisView({
  availableImages = [],
  selectedImage = 'demo_sar_oil.png',
  onSelectImage,
  spillData,
  onAnalyzeImage,
  isAnalyzing,
  onProceedToOrigin
}) {
  const [maskOpacity, setMaskOpacity] = useState(0.70);
  const [viewMode, setViewMode] = useState('annotated'); // 'annotated' | 'raw' | 'mask'
  const [showLoupe, setShowLoupe] = useState(true);

  // Determine scenario type
  const isHero = selectedImage === 'demo_sar_oil.png' || spillData?.is_synthetic_hero || (!spillData?.is_real_data && selectedImage?.includes('demo_sar_oil'));
  const isReal = (selectedImage === 'real_spill.jpg' || spillData?.is_real_data) && !isHero;

  // Coordinates & bounding geometry
  const bbox = spillData?.bbox || (isHero ? { xmin: 484, ymin: 248, xmax: 1019, ymax: 806 } : { xmin: 345, ymin: 297, xmax: 368, ymax: 343 });
  const imgW = spillData?.image_dimensions?.width || (isHero ? 1254 : 640);
  const imgH = spillData?.image_dimensions?.height || (isHero ? 1254 : 640);

  const relLeft = (bbox.xmin / imgW) * 100;
  const relTop = (bbox.ymin / imgH) * 100;
  const relWidth = ((bbox.xmax - bbox.xmin) / imgW) * 100;
  const relHeight = ((bbox.ymax - bbox.ymin) / imgH) * 100;

  return (
    <div style={{
      padding: '1.2rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      minHeight: 'calc(100vh - 120px)'
    }}>
      {/* Top Bar: Title, Badges, Scene Selector, and Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0e172a',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '0.8rem 1.2rem',
        flexWrap: 'wrap',
        gap: '0.8rem'
      }}>
        {/* Left: Icon, Title, and Verification Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{
            background: isHero ? 'rgba(56, 189, 248, 0.15)' : (isReal ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)'),
            border: isHero ? '1px solid rgba(56, 189, 248, 0.4)' : (isReal ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(148, 163, 184, 0.4)'),
            borderRadius: '6px',
            padding: '0.45rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Droplets size={22} color={isHero ? '#38bdf8' : (isReal ? '#10b981' : '#cbd5e1')} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9' }}>
                Satellite Analysis
              </h2>

              {/* Requirement 3: Badge "SYNTHETIC SAR-LIKE DEMONSTRATION" */}
              {isHero ? (
                <span style={{
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid #38bdf8',
                  color: '#38bdf8',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#38bdf8', boxShadow: '0 0 6px #38bdf8' }}></span>
                  SYNTHETIC SAR-LIKE DEMONSTRATION
                </span>
              ) : isReal ? (
                <span style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10b981',
                  color: '#6ee7b7',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                  REAL DATASET REFERENCE
                </span>
              ) : (
                <span className="badge-tag badge-cyan">
                  SYNTHETIC BENCHMARK SCENARIO (FALLBACK)
                </span>
              )}

              {/* Requirement 2: Label "Prototype Segmentation" */}
              <span style={{
                backgroundColor: '#1e293b',
                color: '#cbd5e1',
                border: '1px solid #334155',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: '4px'
              }}>
                {isReal ? 'Prototype Detection / Annotated Region' : 'Prototype Segmentation'}
              </span>
            </div>

            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.15rem' }}>
              {isHero 
                ? 'Synthetic SAR-like demonstration scene • Simulated radar backscatter' 
                : (isReal ? 'ESA Sentinel-1 IW C-SAR Scene (Mumbai Approach)' : 'Calibrated Benchmark SAR Scene')}
            </div>
          </div>
        </div>

        {/* Center/Right: Dataset Selector & Primary Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {/* Dataset Selector (Priority Order: demo_sar_oil.png -> real_spill.jpg -> sample_spill.png) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Scene:</span>
            <select
              value={selectedImage}
              onChange={(e) => {
                const newFile = e.target.value;
                onSelectImage(newFile);
              }}
              style={{
                backgroundColor: '#070b14',
                color: '#f1f5f9',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '0.4rem 0.7rem',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <option value="demo_sar_oil.png">
                ✨ Synthetic SAR-like Demonstration (Hero Visual)
              </option>
              <option value="real_spill.jpg">
                🛰️ Real Dataset Reference (Sentinel-1 SAR)
              </option>
              <option value="sample_spill.png">
                🧪 Synthetic Benchmark Scenario (Fallback)
              </option>
            </select>
          </div>

          <button
            onClick={() => onAnalyzeImage()}
            disabled={isAnalyzing}
            className="btn-primary"
            style={{
              padding: '0.55rem 1.2rem',
              fontSize: '0.82rem',
              fontWeight: 800,
              background: isHero ? 'linear-gradient(135deg, #0284c7, #0369a1)' : (isReal ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #0284c7, #0369a1)'),
              borderColor: isHero ? '#38bdf8' : (isReal ? '#10b981' : '#38bdf8')
            }}
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>ANALYZING...</span>
              </>
            ) : (
              <>
                <Play size={15} fill="#ffffff" />
                <span>ANALYZE SPILL</span>
              </>
            )}
          </button>

          {spillData && (
            <button
              onClick={onProceedToOrigin}
              style={{
                padding: '0.55rem 1rem',
                backgroundColor: '#1e293b',
                color: '#ffffff',
                border: '1px solid #334155',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>Next: Origin Analysis</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Main Result: "POSSIBLE OIL SPILL" Notification Bar */}
      {spillData && (
        <div style={{
          backgroundColor: isHero ? 'rgba(56, 189, 248, 0.08)' : 'rgba(16, 185, 129, 0.08)',
          border: isHero ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '6px',
          padding: '0.55rem 1.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: '#f1f5f9',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color={isHero ? '#38bdf8' : '#10b981'} />
            <span>
              <strong style={{ color: isHero ? '#38bdf8' : '#10b981' }}>POSSIBLE OIL SPILL</strong>
              {isHero 
                ? ' — Prototype Segmentation: Prominent dark elongated slick detected against sea texture.' 
                : (isReal 
                    ? ' — Real Dataset Reference: Verified against Sentinel-1 Pascal VOC annotation.' 
                    : ' — Prototype AI segmentation confidence: 94%.')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.74rem' }}>
            <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>
              BndBox: [{bbox.xmin}, {bbox.ymin}, {bbox.xmax}, {bbox.ymax}] px ({imgW}×{imgH})
            </span>
            <span style={{ color: '#94a3b8' }}>
              Area: <strong style={{ color: '#f1f5f9' }}>{spillData.area_km2} km²</strong>
            </span>
          </div>
        </div>
      )}

      {/* Main Focus: Large SAR Image Viewer with Attractive Visual Overlay */}
      <div style={{
        flex: 1,
        minHeight: '480px',
        backgroundColor: '#0e172a',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Controls Header Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#0a1120',
          padding: '0.5rem 1rem',
          borderBottom: '1px solid #1e293b'
        }}>
          {/* View Toggles */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setViewMode('annotated')}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '4px',
                border: '0',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: viewMode === 'annotated' ? '#0284c7' : '#1e293b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <span>{isHero ? 'Slick Highlight & Overlay' : (isReal ? 'Annotated Box & Highlight' : 'Spill Overlay')}</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '4px',
                border: '0',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: viewMode === 'raw' ? '#0284c7' : '#1e293b',
                color: '#ffffff'
              }}
            >
              Raw SAR Image
            </button>
            <button
              onClick={() => setViewMode('mask')}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '4px',
                border: '0',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: viewMode === 'mask' ? '#0284c7' : '#1e293b',
                color: '#ffffff'
              }}
            >
              Extracted Mask
            </button>
          </div>

          {/* Right Controls: Loupe toggle and opacity slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {viewMode === 'annotated' && (
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.72rem',
                color: '#cbd5e1',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={showLoupe}
                  onChange={(e) => setShowLoupe(e.target.checked)}
                />
                <span>3x Detail Loupe</span>
              </label>
            )}

            {viewMode === 'annotated' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sliders size={14} color="#94a3b8" />
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Overlay:</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={maskOpacity}
                  onChange={e => setMaskOpacity(parseFloat(e.target.value))}
                  style={{ width: '80px', accentColor: '#38bdf8' }}
                />
                <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>
                  {Math.round(maskOpacity * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Large Visual Image Canvas */}
        <div style={{
          flex: 1,
          minHeight: '440px',
          backgroundColor: '#070b14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '1rem',
          overflow: 'hidden'
        }}>
          {/* Main Visual Frame (Fixed Aspect Ratio 1:1) */}
          <div style={{
            position: 'relative',
            width: '540px',
            height: '540px',
            maxWidth: '92vw',
            maxHeight: '66vh',
            borderRadius: '6px',
            overflow: 'hidden',
            border: '1px solid #1e293b',
            boxShadow: '0 8px 30px rgba(0,0,0,0.85)'
          }}>
            {/* 1. Base Grayscale SAR Image (Always Visible) */}
            <img
              src={getStaticUrl(`/static/satellite/${selectedImage}`)}
              alt="SAR Demonstration Scene"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />

            {/* 2. HERO IMAGE OVERLAYS: Semi-Transparent Mask + Boundary Outline + Reticle Box */}
            {isHero && viewMode === 'annotated' && (
              <>
                {/* Semi-transparent highlighted mask overlay */}
                <img
                  src={getStaticUrl('/static/masks/demo_sar_oil_mask.png')}
                  alt="Prototype Segmentation Mask"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: maskOpacity,
                    mixBlendMode: 'screen',
                    filter: 'invert(1) drop-shadow(0 0 16px #00f0ff) drop-shadow(0 0 6px #0284c7)',
                    pointerEvents: 'none',
                    zIndex: 15
                  }}
                />

                {/* Clearly highlighted slick boundary outline */}
                <img
                  src={getStaticUrl('/static/masks/demo_sar_oil_boundary.png')}
                  alt="Slick Boundary"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.95,
                    mixBlendMode: 'screen',
                    filter: 'invert(1) drop-shadow(0 0 6px #38bdf8) drop-shadow(0 0 12px #00f0ff)',
                    pointerEvents: 'none',
                    zIndex: 18
                  }}
                />

                {/* High-visibility Slick Region Frame with Corner Reticles */}
                <div style={{
                  position: 'absolute',
                  left: `${relLeft}%`,
                  top: `${relTop}%`,
                  width: `${relWidth}%`,
                  height: `${relHeight}%`,
                  border: '2px dashed rgba(0, 240, 255, 0.75)',
                  boxShadow: '0 0 25px rgba(0, 240, 255, 0.35)',
                  borderRadius: '3px',
                  pointerEvents: 'none',
                  zIndex: 20
                }}>
                  {/* Subtle Corner Reticle Accents */}
                  <span style={{ position: 'absolute', top: '-4px', left: '-4px', width: '9px', height: '9px', borderTop: '2.5px solid #00f0ff', borderLeft: '2.5px solid #00f0ff' }}></span>
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '9px', height: '9px', borderTop: '2.5px solid #00f0ff', borderRight: '2.5px solid #00f0ff' }}></span>
                  <span style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: '9px', height: '9px', borderBottom: '2.5px solid #00f0ff', borderLeft: '2.5px solid #00f0ff' }}></span>
                  <span style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '9px', height: '9px', borderBottom: '2.5px solid #00f0ff', borderRight: '2.5px solid #00f0ff' }}></span>

                  {/* Top Floating Badge */}
                  <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: '6px',
                    backgroundColor: 'rgba(10, 17, 32, 0.94)',
                    border: '1px solid #00f0ff',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '10px',
                    fontWeight: 800,
                    color: '#00f0ff',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>🛢️</span>
                    <span>PROBABLE SLICK REGION [Prototype Segmentation]</span>
                  </div>
                </div>
              </>
            )}

            {/* 3. REAL DATASET OVERLAYS (Reference Mode) */}
            {isReal && viewMode === 'annotated' && (
              <>
                <div style={{
                  position: 'absolute',
                  left: `${relLeft}%`,
                  top: `${relTop}%`,
                  width: `${relWidth}%`,
                  height: `${relHeight}%`,
                  backgroundColor: 'rgba(0, 240, 255, 0.30)',
                  boxShadow: '0 0 25px rgba(0, 240, 255, 0.9), inset 0 0 8px rgba(0, 240, 255, 0.5)',
                  border: '2px solid #00f0ff',
                  borderRadius: '2px',
                  pointerEvents: 'none',
                  zIndex: 20
                }}>
                  <span style={{ position: 'absolute', top: '-4px', left: '-4px', width: '8px', height: '8px', borderTop: '2px solid #ffffff', borderLeft: '2px solid #ffffff' }}></span>
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', borderTop: '2px solid #ffffff', borderRight: '2px solid #ffffff' }}></span>
                  <span style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: '8px', height: '8px', borderBottom: '2px solid #ffffff', borderLeft: '2px solid #ffffff' }}></span>
                  <span style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '8px', height: '8px', borderBottom: '2px solid #ffffff', borderRight: '2px solid #ffffff' }}></span>

                  <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: '6px',
                    backgroundColor: 'rgba(10, 17, 32, 0.95)',
                    border: '1px solid #00f0ff',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '10px',
                    fontWeight: 800,
                    color: '#00f0ff',
                    whiteSpace: 'nowrap'
                  }}>
                    OIL BNDBOX [{bbox.xmin}, {bbox.ymin}, {bbox.xmax}, {bbox.ymax}]
                  </div>
                </div>
              </>
            )}

            {/* 4. Extracted Mask View Mode */}
            {viewMode === 'mask' && (
              <img
                src={getStaticUrl(isHero ? '/static/masks/demo_sar_oil_mask.png' : (isReal ? '/static/masks/real_spill_mask.png' : '/static/masks/sample_spill_mask.png'))}
                alt="Segmentation Mask"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'invert(1) drop-shadow(0 0 12px #38bdf8)',
                  mixBlendMode: 'screen',
                  opacity: 0.95
                }}
              />
            )}

            {/* 5. Synthetic Overlay Mode (Fallback) */}
            {!isHero && !isReal && viewMode === 'annotated' && (
              <img
                src={getStaticUrl('/static/masks/sample_spill_mask.png')}
                alt="Synthetic Spill Mask Overlay"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: maskOpacity,
                  mixBlendMode: 'screen',
                  filter: 'invert(1) drop-shadow(0 0 12px #ef4444)'
                }}
              />
            )}

            {/* Scale & Sensor Watermark Overlay (Bottom Left) */}
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              backgroundColor: 'rgba(10, 17, 32, 0.88)',
              border: '1px solid #1e293b',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '10px',
              color: '#94a3b8',
              fontFamily: 'monospace',
              zIndex: 30
            }}>
              {isHero 
                ? 'Synthetic SAR-like Demonstration (1254×1254 px)' 
                : (isReal ? 'ESA Sentinel-1 IW C-SAR (640×640 px)' : 'Synthetic SAR Benchmark Scene (512×512 px)')}
            </div>
          </div>

          {/* 3x Magnified Detail Inspection Loupe */}
          {showLoupe && viewMode === 'annotated' && (
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '145px',
              height: '145px',
              backgroundColor: '#0a1120',
              border: '2px solid #00f0ff',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0, 240, 255, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 40
            }}>
              <div style={{
                backgroundColor: 'rgba(0, 240, 255, 0.15)',
                padding: '3px 6px',
                fontSize: '9px',
                fontWeight: 800,
                color: '#00f0ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(0, 240, 255, 0.3)'
              }}>
                <span>3× DETAIL LOUPE</span>
                <span>({bbox.xmin}, {bbox.ymin})</span>
              </div>

              <div style={{
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#000000'
              }}>
                <img
                  src={getStaticUrl(`/static/satellite/${selectedImage}`)}
                  alt="Zoomed Crop"
                  style={{
                    position: 'absolute',
                    width: `${imgW}px`,
                    height: `${imgH}px`,
                    left: `-${((bbox.xmin + bbox.xmax) / 2) * (145 / imgW) * 3 - 72}px`,
                    top: `-${((bbox.ymin + bbox.ymax) / 2) * (145 / imgH) * 3 - 72}px`,
                    transform: 'scale(2.2)',
                    transformOrigin: '0 0',
                    imageRendering: 'pixelated'
                  }}
                />

                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '28px',
                  height: '28px',
                  transform: 'translate(-50%, -50%)',
                  border: '1.5px solid #00f0ff',
                  borderRadius: '2px',
                  boxShadow: '0 0 6px rgba(0, 240, 255, 0.8)'
                }}></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Requirement 3: Clean 3-Metric Summary (Estimated Area, Detection Score, Location / Demo Scenario) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.8rem'
      }}>
        {/* Estimated Area */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          padding: '0.75rem 1rem'
        }}>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Estimated Area
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.15rem' }}>
            {spillData ? spillData.area_km2 : '14.85'} <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>km²</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.1rem' }}>
            {isHero ? 'Equivalent Slick Footprint' : (isReal ? 'SAR BndBox Footprint' : 'Segmented Polygon')}
          </div>
        </div>

        {/* Detection Score */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          padding: '0.75rem 1rem'
        }}>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Detection Score
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981', marginTop: '0.15rem' }}>
            {spillData ? (spillData.confidence * 100).toFixed(1) : '94.2'}%
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.1rem' }}>
            {isHero ? 'Slick Contrast Index' : (isReal ? 'Pascal VOC Confidence' : 'AI UNet Confidence')}
          </div>
        </div>

        {/* Location / Demo Scenario (Requirement 5: Labeled "Prototype Scenario Coordinates") */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          padding: '0.75rem 1rem'
        }}>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Location / Demo Scenario
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9', marginTop: '0.2rem', fontFamily: 'monospace' }}>
            {spillData ? `${spillData.latitude}° N, ${spillData.longitude}° E` : '18.95° N, 72.40° E'}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#38bdf8', marginTop: '0.1rem', fontWeight: 600 }}>
            Prototype Scenario Coordinates
          </div>
        </div>

        {/* Detection Mode */}
        <div style={{
          backgroundColor: '#0e172a',
          border: '1px solid #334155',
          borderRadius: '6px',
          padding: '0.75rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#38bdf8', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Info size={13} />
            <span>Detection Mode</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 600, marginTop: '0.2rem' }}>
            {isHero ? 'Prototype Segmentation' : (isReal ? 'Prototype Detection / Annotated Region' : 'Prototype Segmentation')}
          </div>
          <div style={{ fontSize: '0.66rem', color: '#94a3b8', marginTop: '0.15rem', lineHeight: 1.3 }}>
            {isHero 
              ? 'Modular detector interface (AI U-Net / PyTorch ready).' 
              : (isReal 
                  ? 'Real Sentinel-1 C-SAR ground-truth box. Not claimed as pixel-perfect segmentation.' 
                  : 'Benchmark synthetic scene for reproducible pipeline testing.')}
          </div>
        </div>
      </div>
    </div>
  );
}
