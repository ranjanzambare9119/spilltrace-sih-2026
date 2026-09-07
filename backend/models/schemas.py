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
    slick_thickness_estimate_um: float = 1.2
    estimated_volume_m3: float = 17800.0
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
    disclaimer: str = (
        "AI-Assisted Decision Support Notice: The Source-Likelihood Score is an empirical, "
        "probabilistic correlation based on spatial-temporal tracking and hydrodynamic drift modeling. "
        "This tool provides investigatory prioritization and does NOT constitute legal proof of culpability."
    )
