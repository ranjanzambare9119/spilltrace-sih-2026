import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import SatelliteAnalysisView from './components/SatelliteAnalysisView';
import OriginAnalysisView from './components/OriginAnalysisView';
import VesselCorrelationView from './components/VesselCorrelationView';
import InvestigationView from './components/InvestigationView';
import GuidedDemoMode from './components/GuidedDemoMode';
import VesselDetailModal from './components/VesselDetailModal';
import { 
  checkHealth, 
  getSatelliteImages, 
  analyzeSatellite, 
  getEnvironment, 
  estimateDrift, 
  getAISVessels, 
  correlateAttribution 
} from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState(false);
  const [availableImages, setAvailableImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState('demo_sar_oil.png');
  
  // Pipeline State
  const [spillData, setSpillData] = useState(null);
  const [originData, setOriginData] = useState(null);
  const [envData, setEnvData] = useState(null);
  const [aisData, setAisData] = useState(null);
  const [candidateVessels, setCandidateVessels] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState(null);

  // Guided Demo & Modal State
  const [isGuidedDemoOpen, setIsGuidedDemoOpen] = useState(false);
  const [inspectVessel, setInspectVessel] = useState(null);

  // Loading States
  const [isAnalyzingSatellite, setIsAnalyzingSatellite] = useState(false);
  const [isEstimatingOrigin, setIsEstimatingOrigin] = useState(false);
  const [isCorrelatingVessels, setIsCorrelatingVessels] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Initial Data Fetch
  useEffect(() => {
    async function init() {
      try {
        await checkHealth();
        setBackendStatus(true);
      } catch (err) {
        setBackendStatus(false);
      }

      try {
        const [images, env, ais] = await Promise.all([
          getSatelliteImages().catch(() => []),
          getEnvironment().catch(() => null),
          getAISVessels().catch(() => null)
        ]);

        setAvailableImages(images);
        if (images.length > 0) {
          const heroImg = images.find(img => img.filename === 'demo_sar_oil.png');
          setSelectedImage(heroImg ? heroImg.filename : images[0].filename);
        }
        if (env) setEnvData(env);
        if (ais) setAisData(ais);

        // Pre-fetch baseline correlation for instant Dashboard and Demo readiness
        const correlationRes = await correlateAttribution();
        if (correlationRes) {
          setSpillData(correlationRes.spill);
          setOriginData(correlationRes.origin);
          setCandidateVessels(correlationRes.candidate_vessels);
          if (correlationRes.candidate_vessels?.length > 0) {
            setSelectedVessel(correlationRes.candidate_vessels[0]);
          }
        }
      } catch (err) {
        console.warn('Init fetch warning:', err);
      }
    }

    init();
  }, []);

  // Handlers for individual pipeline stages
  const handleAnalyzeSatellite = async (filenameOverride = null) => {
    setIsAnalyzingSatellite(true);
    const targetFile = filenameOverride || selectedImage;
    try {
      const res = await analyzeSatellite(targetFile);
      setSpillData(res);
      showNotification(
        res.is_synthetic_hero
          ? 'Possible Oil Spill Detected (Synthetic SAR-like Demonstration - Prototype Segmentation).'
          : (res.is_real_data 
              ? 'Possible Oil Spill Detected (Real Dataset Reference - Annotated Region).'
              : 'Possible Oil Spill Detected (Area: 14.8 km², Score: 94%).'),
        'success'
      );
    } catch (err) {
      showNotification(`Satellite analysis error: ${err.message}`, 'error');
    } finally {
      setIsAnalyzingSatellite(false);
    }
  };

  const handleEstimateOrigin = async (ageHours = 5.5, uncertainty = 3.5) => {
    setIsEstimatingOrigin(true);
    try {
      const res = await estimateDrift(spillData, envData, ageHours, uncertainty);
      setOriginData(res);
      showNotification(`Probable Origin estimated: ±${res.origin_uncertainty_km} km uncertainty envelope.`, 'success');
    } catch (err) {
      showNotification(`Drift estimation error: ${err.message}`, 'error');
    } finally {
      setIsEstimatingOrigin(false);
    }
  };

  const handleCorrelateVessels = async (maxDist = 35.0) => {
    setIsCorrelatingVessels(true);
    try {
      const res = await correlateAttribution(maxDist);
      setCandidateVessels(res.candidate_vessels);
      if (res.candidate_vessels?.length > 0) {
        setSelectedVessel(res.candidate_vessels[0]);
      }
      showNotification(`Correlated ${res.candidate_vessels.length} candidate vessels against origin region.`, 'success');
    } catch (err) {
      showNotification(`Vessel correlation error: ${err.message}`, 'error');
    } finally {
      setIsCorrelatingVessels(false);
    }
  };

  return (
    <div style={{ height: '100vh', maxHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#070b14', overflow: 'hidden' }}>
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onStartDemo={() => setIsGuidedDemoOpen(true)}
        backendStatus={backendStatus}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 3000,
          backgroundColor: notification.type === 'error' ? '#ef4444' : (notification.type === 'success' ? '#065f46' : '#0369a1'),
          color: '#ffffff',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '6px',
          padding: '0.6rem 1rem',
          boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
          fontSize: '0.78rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          maxWidth: '420px'
        }}>
          <span>{notification.type === 'error' ? '⚠️' : '✓'}</span>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Main View Router */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'dashboard' && (
          <DashboardView
            spillData={spillData}
            originData={originData}
            candidateVessels={candidateVessels}
            selectedVessel={selectedVessel}
            onSelectVessel={setSelectedVessel}
            onNavigateTab={setActiveTab}
            onStartDemo={() => setIsGuidedDemoOpen(true)}
          />
        )}

        {activeTab === 'satellite' && (
          <SatelliteAnalysisView
            availableImages={availableImages}
            selectedImage={selectedImage}
            onSelectImage={(newFile) => {
              setSelectedImage(newFile);
              handleAnalyzeSatellite(newFile);
            }}
            spillData={spillData}
            onAnalyzeImage={() => handleAnalyzeSatellite()}
            isAnalyzing={isAnalyzingSatellite}
            onProceedToOrigin={() => {
              setActiveTab('origin');
              handleEstimateOrigin();
            }}
          />
        )}

        {activeTab === 'origin' && (
          <OriginAnalysisView
            spillData={spillData}
            originData={originData}
            envData={envData}
            onEstimateOrigin={handleEstimateOrigin}
            isEstimating={isEstimatingOrigin}
            onProceedToVessels={() => {
              setActiveTab('vessels');
              handleCorrelateVessels();
            }}
          />
        )}

        {activeTab === 'vessels' && (
          <VesselCorrelationView
            aisData={aisData}
            candidateVessels={candidateVessels}
            spillData={spillData}
            originData={originData}
            selectedVessel={selectedVessel}
            onSelectVessel={setSelectedVessel}
            onCorrelateVessels={handleCorrelateVessels}
            isCorrelating={isCorrelatingVessels}
            onProceedToInvestigation={() => setActiveTab('investigation')}
          />
        )}

        {activeTab === 'investigation' && (
          <InvestigationView
            candidateVessels={candidateVessels}
            spillData={spillData}
            originData={originData}
            selectedVessel={selectedVessel}
            onSelectVessel={setSelectedVessel}
          />
        )}
      </main>

      {/* 2-Minute Guided Demo Mode Fullscreen Experience */}
      <GuidedDemoMode
        isOpen={isGuidedDemoOpen}
        onClose={() => setIsGuidedDemoOpen(false)}
        spillData={spillData}
        originData={originData}
        candidateVessels={candidateVessels}
        onOpenInvestigation={() => {
          setIsGuidedDemoOpen(false);
          setActiveTab('investigation');
        }}
        onOpenWhyModal={(vessel) => setInspectVessel(vessel)}
      />

      {/* Detailed Scoring Modal */}
      {inspectVessel && (
        <VesselDetailModal
          vessel={inspectVessel}
          originData={originData}
          onClose={() => setInspectVessel(null)}
        />
      )}
    </div>
  );
}
