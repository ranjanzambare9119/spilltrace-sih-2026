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
  correlateAttribution,
  predictForwardDrift,
  getAtRiskVessels,
  verifyCandidate,
  getTimeline,
  recordTimelineEvent,
  getRecommendedActions
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

  // Forward Drift, Exclusion Zone & Risk Intelligence
  const [forwardDrift, setForwardDrift] = useState(null);
  const [atRiskVessels, setAtRiskVessels] = useState([]);
  const [recommendedActions, setRecommendedActions] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);

  // Leak Confirmation Escalation State
  const [isLeakConfirmed, setIsLeakConfirmed] = useState(false);
  const [confirmedSource, setConfirmedSource] = useState(null);
  const [incidentSeverity, setIncidentSeverity] = useState('ACTIVE RESPONSE (CRITICAL)');
  const [investigationState, setInvestigationState] = useState('CANDIDATE');
  const [cascadeState, setCascadeState] = useState(null);
  const [responseDeployment, setResponseDeployment] = useState(null);
  const [navigationalWarning, setNavigationalWarning] = useState(null);

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
          if (correlationRes.forward_drift) setForwardDrift(correlationRes.forward_drift);
          if (correlationRes.at_risk_vessels) setAtRiskVessels(correlationRes.at_risk_vessels);
          if (correlationRes.recommended_actions) setRecommendedActions(correlationRes.recommended_actions);
          if (correlationRes.timeline_events) setTimelineEvents(correlationRes.timeline_events);
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
  const handleAnalyzeSatellite = async (filenameOverride = null, scenarioOverride = null) => {
    setIsAnalyzingSatellite(true);
    const targetFile = filenameOverride || selectedImage;
    try {
      const res = await analyzeSatellite(targetFile, scenarioOverride);
      setSpillData(res);

      // Re-fetch forward drift & actions for the updated scenario
      try {
        const fwd = await predictForwardDrift(6.0, targetFile);
        setForwardDrift(fwd);
        const atRisk = await getAtRiskVessels(6.0);
        setAtRiskVessels(atRisk);
      } catch (e) {
        // silent fallback
      }

      try {
        const acts = await getRecommendedActions();
        setRecommendedActions(acts);
        const tEvents = await getTimeline();
        setTimelineEvents(tEvents);
      } catch (e) {
        // silent fallback
      }

      const isMinor = res.spill_size_class === 'minor' || (res.area_km2 && res.area_km2 < 2.0);
      const sevClass = res.severity_class || 'CRITICAL';
      showNotification(
        isMinor
          ? `Small Spill Assessment: ${res.appearance_class} (${res.area_km2} km²). Severity: ${sevClass}. Volume unquantified (false-precision suppressed).`
          : `Major Spill Assessment: ${res.area_km2} km² (~${Math.round(res.volume_estimate || 17820).toLocaleString()} m³). Severity: ${sevClass}.`,
        res.confidence_class === 'LOW' ? 'info' : 'success'
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
      if (res.forward_drift) setForwardDrift(res.forward_drift);
      if (res.at_risk_vessels) setAtRiskVessels(res.at_risk_vessels);
      if (res.recommended_actions) setRecommendedActions(res.recommended_actions);
      if (res.timeline_events) setTimelineEvents(res.timeline_events);
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

  // Human-in-the-Loop Simulated Action Trigger
  const handleTriggerAction = async (action) => {
    try {
      await recordTimelineEvent(
        action.action_type || 'simulated_action',
        `Simulated: ${action.title}`,
        action.rationale || `Human-in-the-loop simulated operational execution: ${action.title}. Transmitted to simulated maritime responders.`,
        'Investigator (Human-in-the-Loop)',
        action.priority === 'CRITICAL' ? 'red' : 'green'
      );

      // If action is notifying a specific vessel
      if (action.vessel_mmsi) {
        setAtRiskVessels(prev => prev.map(v => v.mmsi === action.vessel_mmsi ? { ...v, notification_sent: true } : v));
      }

      // Mark action as executed in recommendations
      setRecommendedActions(prev => prev.map(a => a.action_id === action.action_id ? { ...a, status: 'EXECUTED (SIMULATED)' } : a));

      const updatedTimeline = await getTimeline();
      setTimelineEvents(updatedTimeline);
      showNotification(`Simulated Action Executed: ${action.title}`, 'success');
    } catch (err) {
      showNotification(`Action simulation error: ${err.message}`, 'error');
    }
  };

  // Candidate Verification Feedback Loop (Dynamic Reranking & Automatic Leak Confirmation Cascade)
  const handleVerifyCandidate = async (mmsi, outcome, notes) => {
    try {
      if (outcome === 'confirmed') {
        // Section 16: Immediate visual cascade feedback during SIH demo
        setCascadeState({ step: 1 });
        const stepTimer = setInterval(() => {
          setCascadeState(prev => {
            if (!prev) return null;
            if (prev.step >= 6) {
              clearInterval(stepTimer);
              setTimeout(() => setCascadeState(null), 1200);
              return { step: 6 };
            }
            return { step: prev.step + 1 };
          });
        }, 260);
      }

      const res = await verifyCandidate(mmsi, outcome, notes);
      const candidateList = Array.isArray(res) ? res : (res?.candidate_vessels || []);
      setCandidateVessels(candidateList);
      if (candidateList.length > 0) {
        setSelectedVessel(candidateList[0]);
      }

      if (res && res.is_leak_confirmed) {
        setIsLeakConfirmed(true);
        setInvestigationState('SOURCE VERIFIED — DEMO');
        setConfirmedSource({
          mmsi: res.confirmed_source_mmsi,
          name: res.confirmed_source_name
        });
        if (res.incident_severity) setIncidentSeverity(res.incident_severity);
        if (res.response_deployment) setResponseDeployment(res.response_deployment);
        if (res.navigational_warning) setNavigationalWarning(res.navigational_warning);
        if (res.at_risk_vessels && res.at_risk_vessels.length > 0) {
          setAtRiskVessels(res.at_risk_vessels);
        }
        if (res.forward_drift) setForwardDrift(res.forward_drift);
        if (res.timeline_events && res.timeline_events.length > 0) {
          setTimelineEvents(res.timeline_events);
        }
        if (res.recommended_actions && res.recommended_actions.length > 0) {
          setRecommendedActions(res.recommended_actions);
        } else {
          try {
            const acts = await getRecommendedActions();
            setRecommendedActions(acts);
          } catch (e) {}
        }

        showNotification(
          `🚨 AUTOMATIC RESPONSE CHAIN EXECUTED: ${res.confirmed_source_name || 'MT Ocean Pioneer'} marked as VERIFIED LEAK. Tier-2 Response Active. ${res.at_risk_vessels?.filter(v => v.risk_state !== 'OUTSIDE RISK')?.length || 8} vessels notified on affected route.`,
          'error'
        );
      } else {
        if (outcome === 'unverified') {
          setIsLeakConfirmed(false);
          setInvestigationState('CANDIDATE');
          setConfirmedSource(null);
          setResponseDeployment(null);
          setNavigationalWarning(null);
        }
        const updatedTimeline = await getTimeline();
        setTimelineEvents(updatedTimeline);
        showNotification(
          outcome === 'not_detected'
            ? `Verification Logged: LEAK NOT DETECTED. Score penalized by 60%. Fleet dynamically reranked.`
            : `Verification Logged: ${outcome.toUpperCase()}. Fleet updated.`,
          'success'
        );
      }
    } catch (err) {
      setCascadeState(null);
      showNotification(`Verification error: ${err.message}`, 'error');
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
        isLeakConfirmed={isLeakConfirmed}
        investigationState={investigationState}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 5000,
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
          maxWidth: '440px'
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
            forwardDrift={forwardDrift}
            atRiskVessels={atRiskVessels}
            recommendedActions={recommendedActions}
            timelineEvents={timelineEvents}
            candidateVessels={candidateVessels}
            selectedVessel={selectedVessel}
            onSelectVessel={setSelectedVessel}
            onNavigateTab={setActiveTab}
            onStartDemo={() => setIsGuidedDemoOpen(true)}
            onCorrelateVessels={handleCorrelateVessels}
            isCorrelating={isCorrelatingVessels}
            showNotification={showNotification}
            onSelectScenario={(scen) => handleAnalyzeSatellite(selectedImage, scen)}
            onTriggerAction={handleTriggerAction}
            onVerifyCandidate={handleVerifyCandidate}
            isLeakConfirmed={isLeakConfirmed}
            investigationState={investigationState}
            confirmedSource={confirmedSource}
            incidentSeverity={incidentSeverity}
            responseDeployment={responseDeployment}
            navigationalWarning={navigationalWarning}
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
            onSelectScenario={(scen) => handleAnalyzeSatellite(selectedImage, scen)}
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
            onVerifyCandidate={handleVerifyCandidate}
            isLeakConfirmed={isLeakConfirmed}
            investigationState={investigationState}
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

      {/* Visual Feedback Animation: Response Cascade Overlay */}
      {cascadeState && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            backgroundColor: '#0a1120',
            border: '2px solid #ef4444',
            borderRadius: '12px',
            padding: '1.8rem 2.2rem',
            maxWidth: '580px',
            width: '92%',
            boxShadow: '0 0 45px rgba(239, 68, 68, 0.45)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                borderRadius: '50%',
                padding: '0.55rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(239, 68, 68, 0.5)'
              }}>
                <span style={{ fontSize: '1.4rem' }}>🚨</span>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  AUTOMATIC POST-VERIFICATION RESPONSE CHAIN
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc' }}>
                  RESPONSE CASCADE INITIATED
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginTop: '0.2rem' }}>
              {[
                { num: 1, text: 'Mark candidate vessel as VERIFIED LEAK (MT Ocean Pioneer)' },
                { num: 2, text: 'Update investigation state: SOURCE VERIFIED — DEMO' },
                { num: 3, text: 'Recalculate severity: CRITICAL (TIER-2 ESCALATION)' },
                { num: 4, text: 'Compute forward drift & +12h exclusion zone (~220 km²)' },
                { num: 5, text: 'Identify & notify 8 affected vessels on route (Simulated)' },
                { num: 6, text: 'Broadcast NAVAREA VIII warning & initiate flotilla deployment' }
              ].map((item) => {
                const isDone = cascadeState.step >= item.num;
                const isCurrent = cascadeState.step === item.num;
                return (
                  <div key={item.num} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    backgroundColor: isDone ? 'rgba(16, 185, 129, 0.12)' : 'rgba(15, 23, 42, 0.5)',
                    border: `1px solid ${isDone ? 'rgba(16, 185, 129, 0.4)' : 'rgba(30, 41, 59, 0.5)'}`,
                    borderRadius: '6px',
                    padding: '0.5rem 0.85rem',
                    transition: 'all 0.2s ease'
                  }}>
                    <span style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: isDone ? '#10b981' : (isCurrent ? '#ef4444' : '#334155'),
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isDone ? '✓' : item.num}
                    </span>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: isDone ? 700 : 500,
                      color: isDone ? '#34d399' : (isCurrent ? '#fca5a5' : '#64748b')
                    }}>
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>

            {cascadeState.step >= 6 && (
              <div style={{
                textAlign: 'center',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#10b981',
                letterSpacing: '0.04em',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '0.4rem',
                borderRadius: '6px'
              }}>
                ✓ ALL 15 DOWNSTREAM ACTIONS AUTOMATICALLY EXECUTED
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
