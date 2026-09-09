"""
SpillTrace - Data Schemas (Pydantic Models)
SIH 2026 Problem Statement 143
Strictly enforces required decision-support terminology:
- Possible Oil Spill
- Probable Origin Region
- Candidate Vessel
- Source-Likelihood Score
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class SpillDetection(BaseModel):
    spill_id: str = "SP-20260906-001"
    classification: str = "Possible Oil Spill"
    satellite_mission: str = "Sentinel-1B C-SAR"
    detection_time: str = "2026-09-06T06:00:00Z"
    latitude: float = 18.9500
    longitude: float = 72.4000
    area_km2: float = 14.85
    perimeter_km: float = 21.4
    confidence: float = 0.942
    slick_thickness_estimate_um: Optional[float] = 1.2

    # Dual-Pathway Classification & Volume Status
    is_quantitative: bool = True
    spill_size_class: str = "major"  # "major" | "medium" | "minor"
    volume_status: str = "quantified"  # "quantified" | "low_confidence" | "not_quantified"
    volume_estimate: Optional[float] = 17800.0  # Null when below quantitative threshold
    estimated_volume_m3: Optional[float] = 17800.0  # Preserved for backward compatibility
    appearance_class: Optional[str] = "Thick/dark appearance"
    
    # Dynamic Confidence Classification
    detection_confidence: float = 0.942
    confidence_class: str = "HIGH"  # "HIGH" | "MEDIUM" | "LOW"

    # Coastline Proximity & Environmental Sensitivity
    distance_to_coast_km: float = 44.2
    nearest_coast_name: Optional[str] = "Colaba Point / Prongs Reef (Mumbai)"
    coast_risk_score: float = 0.03
    environmental_risk_score: float = 0.40

    # Multi-Factor Severity Model & Incident Workflow
    severity_score: float = 82.5
    severity_class: str = "CRITICAL"  # "CRITICAL" | "HIGH" | "MEDIUM" | "WATCHLIST"
    incident_workflow: str = "investigation_response"  # "investigation_response" | "watchlist_monitoring"
    watchlist_status: Optional[str] = None
    recommended_action: str = "IMMEDIATE INVESTIGATION & PSC INSPECTION"
    classification_reasons: List[str] = []

    polygon_coordinates: List[List[float]] = []
    sensor: str = "Sentinel-1 C-SAR"
    model_architecture: str = "ResNet34-UNet-SAR-v1.4"
    is_real_data: Optional[bool] = False
    is_synthetic_hero: Optional[bool] = True
    scenario_location_label: Optional[str] = "Prototype Scenario Coordinates"
    data_source_label: Optional[str] = "SYNTHETIC SAR-LIKE DEMONSTRATION"
    detection_label: Optional[str] = "Prototype Segmentation"
    bbox: Optional[Dict[str, int]] = None
    rel_bbox: Optional[Dict[str, float]] = None
    image_dimensions: Optional[Dict[str, int]] = None
    filename: Optional[str] = "demo_sar_oil.png"


class EnvironmentalConditions(BaseModel):
    scenario_name: str = "Arabian Sea - Mumbai Approaches"
    timestamp: str = "2026-09-06T06:00:00Z"
    wind_speed: float = Field(default=14.0, description="Wind speed in knots")
    wind_direction: float = Field(default=65.0, description="Wind direction in degrees (towards)")
    current_speed: float = Field(default=1.2, description="Current speed in knots")
    current_direction: float = Field(default=50.0, description="Current direction in degrees (towards)")
    leeway_factor: float = Field(default=0.035, description="Empirical leeway wind drag factor")
    sea_surface_temp_c: Optional[float] = 28.4
    salinity_psu: Optional[float] = 35.2


class ProbableOriginEstimate(BaseModel):
    spill_id: str
    detected_latitude: float
    detected_longitude: float
    net_drift_speed_kts: float
    net_drift_direction_deg: float
    estimated_drift_hours: float
    total_drift_distance_km: float
    probable_origin_latitude: float
    probable_origin_longitude: float
    origin_uncertainty_km: float
    estimated_release_time: str
    release_window_start: str
    release_window_end: str
    backward_drift_path: List[List[float]] = []


class AISRecord(BaseModel):
    mmsi: str
    vessel_name: str
    timestamp: str
    latitude: float
    longitude: float
    speed: float
    heading: float
    vessel_type: str
    flag: Optional[str] = "Unknown"
    draught: Optional[float] = 0.0
    destination: Optional[str] = "N/A"


class ComponentScores(BaseModel):
    distance_score: float = Field(..., description="Proximity to probable origin (max 30 pts)")
    distance_raw_km: float
    time_score: float = Field(..., description="Temporal match with release window (max 25 pts)")
    time_delta_hours: float
    drift_score: float = Field(..., description="Plume corridor intersection (max 20 pts)")
    drift_cross_track_km: float
    heading_score: float = Field(..., description="Route/drift alignment (max 15 pts)")
    heading_alignment_deg: float
    vessel_type_score: float = Field(..., description="Vessel class risk factor (max 10 pts)")
    vessel_type_label: str
    total_score: float = Field(..., description="Source-Likelihood Score (0-100 pts)")


class CandidateVessel(BaseModel):
    rank: int
    mmsi: str
    vessel_name: str
    vessel_type: str
    flag: str
    draught: float
    destination: str
    cpa_distance_km: float
    cpa_time: str
    scores: ComponentScores
    why_reasons: List[str] = []
    trajectory: List[AISRecord] = []
    verification_status: str = "unverified"  # "unverified" | "confirmed" | "suspected" | "not_detected"
    ais_anomaly_detected: bool = False
    ais_anomaly_detail: Optional[str] = None
    original_score: Optional[float] = None


class ForwardDriftPrediction(BaseModel):
    spill_id: str
    detected_latitude: float
    detected_longitude: float
    net_drift_speed_kts: float
    net_drift_direction_deg: float
    forecast_hours: float = 6.0
    predicted_latitude: float
    predicted_longitude: float
    total_forward_distance_km: float
    forward_drift_path: List[List[float]] = []  # [[lat, lon, t_hours, radius_km], ...]
    exclusion_zone_polygon: List[List[float]] = []  # [[lat, lon], ...]
    uncertainty_radius_km: float = 4.5
    hazard_area_km2: float = 24.8
    prediction_label: str = "FORWARD DRIFT PREDICTION (SIMPLIFIED / PROTOTYPE PREDICTION)"


class AtRiskVessel(BaseModel):
    mmsi: str
    vessel_name: str
    vessel_type: str
    latitude: float
    longitude: float
    speed: float
    heading: float
    distance_to_zone_km: float
    risk_state: str = "OUTSIDE RISK"  # "INSIDE ZONE" | "APPROACHING" | "OUTSIDE RISK"
    eta_minutes: Optional[float] = None
    notification_sent: bool = False
    notification_status: Optional[str] = None
    notification_time: Optional[str] = None
    last_updated: str = ""


class CandidateVerificationRequest(BaseModel):
    mmsi: str
    verification_outcome: str  # "confirmed" | "suspected" | "not_detected" | "unverified"
    inspector_notes: Optional[str] = None


class InvestigationTimelineEvent(BaseModel):
    event_id: str
    timestamp: str
    event_type: str
    title: str
    description: str
    actor: str = "SpillTrace Decision Support System"
    badge_color: str = "blue"


class RecommendedActionItem(BaseModel):
    action_id: str
    title: str
    category: str  # "containment" | "maritime_safety" | "surveillance" | "legal_audit"
    priority: str  # "CRITICAL" | "HIGH" | "MEDIUM" | "WATCHLIST"
    rationale: str
    action_type: Optional[str] = None  # "deploy_response" | "notify_authorities" | "broadcast_warning" | "notify_vessel" | "recheck"
    status: str = "RECOMMENDED"


class NavigationalWarning(BaseModel):
    warning_id: str
    navarea_number: str = "NAVAREA VIII 142/2026"
    station: str = "MUMBAI VTMS / COAST RADIO (VWX)"
    coordinates_text: str = "18°54.6'N 072°20.4'E"
    hazard_type: str = "CONFIRMED CONTINUOUS HYDROCARBON DISCHARGE"
    drift_velocity_text: str = "Drifting 054° at 1.7 knots towards Mumbai approaches"
    exclusion_radius_nm: float = 4.5
    message_text: str
    broadcast_channels: List[str] = ["NAVTEX 518 kHz", "VHF CH 16 / 12", "SafetyNET Inmarsat-C"]
    status: str = "DRAFT_PREPARED"  # "DRAFT_PREPARED" | "BROADCAST_TRANSMITTED (SIMULATED)"
    issued_at: str = ""


class ResponseDeploymentPackage(BaseModel):
    package_id: str
    tier: str = "TIER-2 OFFSHORE REGIONAL"
    target_location_lat: float
    target_location_lon: float
    containment_boom_meters: int = 1200
    skimming_vessels_count: int = 2
    deflection_boom_meters: int = 800
    staging_base: str = "JNPT Anchorage / Mumbai Port Trust (MbPT)"
    primary_assets: List[str] = [
        "ICG Samudra Prahari (Pollution Control Vessel)",
        "OSRV-1 Offshore Skimmer & Storage Tug",
        "Fast Response Boom Tender-04"
    ]
    status: str = "PREPARED & READY"  # "PREPARED & READY" | "DISPATCHED (SIMULATED)"
    estimated_on_scene_minutes: int = 45


class CorrelationFilterRequest(BaseModel):
    max_distance_km: float = 30.0
    time_window_hours: float = 12.0
    vessel_type_filter: Optional[str] = "ALL"


class AttributionResponse(BaseModel):
    spill: SpillDetection
    origin: ProbableOriginEstimate
    environment: EnvironmentalConditions
    candidate_vessels: List[CandidateVessel]
    total_screened_vessels: int
    top_candidate_name: Optional[str] = None
    top_candidate_score: Optional[float] = None
    forward_drift: Optional[ForwardDriftPrediction] = None
    at_risk_vessels: List[AtRiskVessel] = []
    recommended_actions: List[RecommendedActionItem] = []
    timeline_events: List[InvestigationTimelineEvent] = []
    is_leak_confirmed: bool = False
    confirmed_source_mmsi: Optional[str] = None
    confirmed_source_name: Optional[str] = None
    incident_severity_label: str = "ACTIVE RESPONSE (CRITICAL)"
    response_deployment: Optional[ResponseDeploymentPackage] = None
    navigational_warning: Optional[NavigationalWarning] = None
    disclaimer: str = (
        "AI-Assisted Decision Support Notice: The Source-Likelihood Score is an empirical, "
        "probabilistic correlation based on spatial-temporal tracking and hydrodynamic drift modeling. "
        "This tool provides investigatory prioritization and does NOT constitute legal proof of culpability."
    )


class CandidateVerificationResponse(BaseModel):
    candidate_vessels: List[CandidateVessel]
    is_leak_confirmed: bool = False
    confirmed_source_mmsi: Optional[str] = None
    confirmed_source_name: Optional[str] = None
    investigation_state: str = "SOURCE VERIFIED — DEMO"
    incident_severity: str = "CRITICAL — TIER-2 ESCALATION (CONFIRMED SOURCE)"
    response_deployment: Optional[ResponseDeploymentPackage] = None
    navigational_warning: Optional[NavigationalWarning] = None
    at_risk_vessels: List[AtRiskVessel] = []
    forward_drift: Optional[ForwardDriftPrediction] = None
    recommended_actions: List[RecommendedActionItem] = []
    timeline_events: List[InvestigationTimelineEvent] = []

