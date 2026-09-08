import React, { useState, useRef } from 'react';
import { 
  Play, 
  Droplets, 
  ShieldCheck, 
  MapPin, 
  Award, 
  ArrowRight,
  Compass,
  Ship,
  Satellite,
  Search,
  ExternalLink,
  Layers,
  FileText,
  Download,
  Printer,
  Sparkles,
  Bot
} from 'lucide-react';

import MaritimeMap from './MaritimeMap';
import IncidentBanner from './command/IncidentBanner';
import OperationalActionsBar from './command/OperationalActionsBar';
import CommandKPIGrid from './command/CommandKPIGrid';
import { 
  ActiveSpillCard, 
  ResponseActionsCard, 
  VesselRankingCard, 
  ScoringBreakdownCard, 
  InvestigationTimeline, 
  AiAssistantCard 
} from './command/AttributionExplainer';
import MaritimeAnalytics from './command/MaritimeAnalytics';
import { 
  DeployResponseModal, 
  NotifyAuthoritiesModal, 
  SecondaryIncidentModal 
} from './command/OperationalModals';
import InvestigationReportModal from './InvestigationReportModal';

export default function DashboardView({
  spillData,
  originData,
  candidateVessels,
  selectedVessel,
  onSelectVessel,
  onNavigateTab,
  onStartDemo,
  onCorrelateVessels,
  isCorrelating,
  showNotification
}) {
  // Operational workflow state
  const [responseRequested, setResponseRequested] = useState(false);
  const [notificationPrepared, setNotificationPrepared] = useState(false);

  // Modals state
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [previewIncident, setPreviewIncident] = useState(null);

  // Map layer toggles on the dashboard
  const [mapLayers, setMapLayers] = useState({
    spill: true,
    origin: true,
    drift: true,
    vessels: true
  });

  const mapRef = useRef(null);

  const topCandidate = candidateVessels && candidateVessels.length > 0 ? candidateVessels[0] : null;

  // Handlers
  const handleDeployConfirm = () => {
    setResponseRequested(true);
    setIsDeployModalOpen(false);
    if (showNotification) {
      showNotification('Response request prepared successfully. Status: READY FOR REVIEW', 'success');
    }
  };

  const handleNotifyConfirm = () => {
    setNotificationPrepared(true);
    setIsNotifyModalOpen(false);
    if (showNotification) {
      showNotification('Notification package prepared. Status: READY FOR REVIEW', 'success');
    }
  };

  const handleExportJson = () => {
    const report = {
      incident_id: 'ST-2026-DEMO-001',
      scenario: 'Arabian Sea — Mumbai Approaches (Demo Scenario)',
      classification: 'Possible Oil Spill (Prototype Detection)',
      timestamp: new Date().toISOString(),
      detection_confidence: spillData?.confidence || 0.942,
      spill_area_km2: spillData?.area_km2 || 14.85,
      probable_origin: originData ? {
        latitude: originData.probable_origin_latitude,
        longitude: originData.probable_origin_longitude,
        uncertainty_km: originData.origin_uncertainty_km,
        estimated_release: originData.estimated_release_time,
        drift_direction_deg: originData.net_drift_direction_deg,
        drift_speed_kts: originData.net_drift_speed_kts,
        drift_distance_km: originData.total_drift_distance_km
      } : 'Awaiting Calculation',
      candidate_vessels: candidateVessels || [],
      scoring_model: {
        distance_weight: '30%',
        time_weight: '25%',
        drift_weight: '20%',
        heading_weight: '15%',
        carriage_class_weight: '10%'
      },
      status: {
        analysis: 'ACTIVE',
        response_request: responseRequested ? 'READY FOR REVIEW' : 'STANDBY',
        notification_package: notificationPrepared ? 'READY FOR REVIEW' : 'NOT PREPARED'
      },
      legal_disclaimer: 'AI-assisted decision support prototype. Does not claim legal culpability.'
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SpillTrace_Incident_ST-2026-DEMO-001.json';
    a.click();
    URL.revokeObjectURL(url);
    if (showNotification) {
      showNotification('Emergency report JSON downloaded successfully.', 'info');
    }
  };

  const scrollToMap = () => {
    const el = document.getElementById('spatial-intelligence-map');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      padding: '1rem 1.4rem',
      backgroundColor: '#070b14',
      minHeight: 'calc(100vh - 65px)',
      boxSizing: 'border-box'
    }}>
      {/* 1. Top Incident Alert Banner */}
      <IncidentBanner 
        spillData={spillData}
        originData={originData}
        candidateVessels={candidateVessels}
        onOpenInvestigation={() => onNavigateTab('investigation')}
      />

      {/* 2. Operational Response Toolbar & Command Status Strip */}
      <OperationalActionsBar
        responseRequested={responseRequested}
        notificationPrepared={notificationPrepared}
        onDeployResponse={() => setIsDeployModalOpen(true)}
        onViewSpread={() => {
          onNavigateTab('origin');
          if (showNotification) {
            showNotification('Navigated to Simplified Drift Estimation.', 'info');
          }
        }}
        onNotifyAuthorities={() => setIsNotifyModalOpen(true)}
        onEmergencyReport={() => setIsReportModalOpen(true)}
        onStartDemo={onStartDemo}
      />

      {/* 3. 5 Large Operational KPI Cards */}
      <CommandKPIGrid
        spillData={spillData}
        originData={originData}
        candidateVessels={candidateVessels}
        onOpenInvestigation={() => onNavigateTab('investigation')}
        onOpenOrigin={() => onNavigateTab('origin')}
      />

      {/* 4. Main Command Center Grid: 3 Columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 320px) 1fr minmax(300px, 340px)',
        gap: '1rem',
        alignItems: 'start'
      }} className="command-grid-layout">
        
        {/* Left Column: Active Oil Spill + Response Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <ActiveSpillCard 
            spillData={spillData}
            originData={originData}
            onOpenInvestigation={() => onNavigateTab('investigation')}
            onViewMap={scrollToMap}
            onRunCorrelation={() => {
              if (onCorrelateVessels) {
                onCorrelateVessels();
              } else {
                onNavigateTab('vessels');
              }
            }}
            isCorrelating={isCorrelating}
          />

          <ResponseActionsCard 
            responseRequested={responseRequested}
            notificationPrepared={notificationPrepared}
            onDeployResponse={() => setIsDeployModalOpen(true)}
            onNotifyAuthorities={() => setIsNotifyModalOpen(true)}
            onViewSpread={() => onNavigateTab('origin')}
            onEmergencyReport={() => setIsReportModalOpen(true)}
          />
        </div>

        {/* Center Column: SPATIAL INTELLIGENCE MAP */}
        <div 
          id="spatial-intelligence-map"
          style={{
            backgroundColor: '#0c1322',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)'
          }}
        >
          {/* Map Header */}
          <div style={{
            padding: '0.75rem 1.1rem',
            backgroundColor: '#0a1120',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.6rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                padding: '0.3rem',
                borderRadius: '5px'
              }}>
                <MapPin size={16} color="#38bdf8" />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>
                  SPATIAL INTELLIGENCE
                </div>
                <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                  Satellite Slick, Backward Leeway Drift &amp; AIS Trajectories
                </div>
              </div>
            </div>

            {/* Map Layer Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.7rem',
              backgroundColor: '#070b14',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              padding: '0.25rem 0.6rem'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={mapLayers.spill} 
                  onChange={e => setMapLayers(prev => ({ ...prev, spill: e.target.checked }))} 
                />
                <span style={{ color: '#ef4444', fontWeight: 700 }}>● Spill</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={mapLayers.origin} 
                  onChange={e => setMapLayers(prev => ({ ...prev, origin: e.target.checked }))} 
                />
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>● Origin</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={mapLayers.drift} 
                  onChange={e => setMapLayers(prev => ({ ...prev, drift: e.target.checked }))} 
                />
                <span style={{ color: '#00f0ff', fontWeight: 700 }}>➔ Drift</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={mapLayers.vessels} 
                  onChange={e => setMapLayers(prev => ({ ...prev, vessels: e.target.checked }))} 
                />
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>🚢 AIS</span>
              </label>
            </div>
          </div>

          {/* Leaflet Map Body */}
          <div style={{
            height: '540px',
            minHeight: '520px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <MaritimeMap 
              spillData={spillData}
              originData={originData}
              candidateVessels={candidateVessels}
              selectedVessel={selectedVessel}
              onSelectVessel={onSelectVessel}
              showSpill={mapLayers.spill}
              showOrigin={mapLayers.origin}
              showDrift={mapLayers.drift}
              showVessels={mapLayers.vessels}
              height="100%"
              minHeight="520px"
              autoFit={true}
            />
          </div>
        </div>

        {/* Right Column: Source-Likelihood Ranking & 5-Factor Scoring */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <VesselRankingCard 
            candidateVessels={candidateVessels}
            onSelectVessel={(vessel) => {
              onSelectVessel(vessel);
              onNavigateTab('investigation');
            }}
          />

          <ScoringBreakdownCard 
            topCandidate={topCandidate}
          />
        </div>
      </div>

      {/* 5. AI Investigation Assistant & Investigation Timeline */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '1rem'
      }}>
        <AiAssistantCard topCandidate={topCandidate} />
        <InvestigationTimeline />
      </div>

      {/* 6. Maritime Incident Analytics (Severity Donut, SAR Trend, Incident Registry) */}
      <MaritimeAnalytics 
        spillData={spillData}
        originData={originData}
        candidateVessels={candidateVessels}
        onSelectVessel={onSelectVessel}
        onOpenSecondaryIncident={(inc) => setPreviewIncident(inc)}
      />

      {/* 7. Bottom Quick Actions Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.6rem',
        backgroundColor: '#0c1322',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '0.65rem 1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem', color: '#94a3b8' }}>
          <span style={{ fontWeight: 800, color: '#f1f5f9' }}>QUICK ACTIONS:</span>
          <span>Fast access to individual decision pipeline modules</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button
            onClick={() => onNavigateTab('satellite')}
            style={{
              backgroundColor: '#1e293b',
              color: '#38bdf8',
              border: '1px solid #0284c7',
              borderRadius: '5px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ANALYZE SPILL
          </button>

          <button
            onClick={() => onNavigateTab('origin')}
            style={{
              backgroundColor: '#1e293b',
              color: '#fbbf24',
              border: '1px solid #d97706',
              borderRadius: '5px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ORIGIN ANALYSIS
          </button>

          <button
            onClick={() => onNavigateTab('vessels')}
            style={{
              backgroundColor: '#1e293b',
              color: '#6ee7b7',
              border: '1px solid #059669',
              borderRadius: '5px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            VESSEL CORRELATION
          </button>

          <button
            onClick={() => onNavigateTab('investigation')}
            style={{
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #475569',
              borderRadius: '5px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            INVESTIGATION
          </button>

          <button
            onClick={handleExportJson}
            style={{
              backgroundColor: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              borderRadius: '5px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Download size={12} color="#38bdf8" />
            <span>EXPORT JSON</span>
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: '1px solid #38bdf8',
              borderRadius: '5px',
              padding: '0.35rem 0.85rem',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <FileText size={12} />
            <span>EXPORT REPORT</span>
          </button>
        </div>
      </div>

      {/* Working Operational Modals */}
      <DeployResponseModal 
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        onConfirm={handleDeployConfirm}
      />

      <NotifyAuthoritiesModal 
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        onConfirm={handleNotifyConfirm}
      />

      <SecondaryIncidentModal 
        incident={previewIncident}
        onClose={() => setPreviewIncident(null)}
      />

      {isReportModalOpen && (
        <InvestigationReportModal 
          spillData={spillData}
          originData={originData}
          candidateVessels={candidateVessels}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}
    </div>
  );
}
