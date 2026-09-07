"""
SpillTrace - REST API Endpoints
Implements all workflow and analysis routes for SIH Problem Statement 143.
"""

from typing import List, Optional, Dict, Any, Annotated
from fastapi import APIRouter, HTTPException, Query, Body, UploadFile, File
import os
import shutil

from backend.models.schemas import (
    SpillDetection,
    EnvironmentalConditions,
    ProbableOriginEstimate,
    AISRecord,
    CandidateVessel,
    AttributionResponse,
    CorrelationFilterRequest
)
from backend.services.satellite_service import satellite_service
from backend.services.drift_service import drift_service
from backend.services.ais_service import ais_service
from backend.services.attribution_service import attribution_service

router = APIRouter(prefix="/api")

@router.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "SpillTrace Maritime Decision Support System",
        "version": "1.0.0-poc",
        "mode": "Local SIH Demonstration"
    }

# -------------------------------------------------------------
# SATELLITE ANALYSIS ENDPOINTS
# -------------------------------------------------------------
@router.get("/satellite/list")
def list_satellite_images():
    """Lists available satellite SAR scenes in the local data directory."""
    return satellite_service.list_available_images()

@router.post("/satellite/analyze", response_model=SpillDetection)
def analyze_satellite_image(
    filename: Annotated[str, Query(description="Filename of SAR image in data/satellite")] = "demo_sar_oil.png"
):
    """Executes prototype oil spill segmentation model on satellite SAR demonstration image."""
    try:
        detection = satellite_service.analyze_satellite_image(filename)
        return detection
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Satellite analysis failed: {str(e)}")

# -------------------------------------------------------------
# ENVIRONMENT & DRIFT ENDPOINTS
# -------------------------------------------------------------
@router.get("/environment", response_model=EnvironmentalConditions)
def get_environment():
    """Fetches prevailing wind, ocean current, and surface parameters."""
    return drift_service.get_environmental_conditions()

@router.post("/drift/estimate", response_model=ProbableOriginEstimate)
def estimate_origin(
    spill: Optional[Dict[str, Any]] = Body(None),
    env: Optional[Dict[str, Any]] = Body(None),
    estimated_age_hours: Annotated[float, Query(ge=0.5, le=48.0, description="Estimated spill age in hours")] = 5.5,
    uncertainty_km: Annotated[float, Query(ge=0.5, le=20.0, description="Uncertainty radius in km")] = 3.5
):
    """Estimates the Probable Origin Region using backward leeway drift modeling."""
    try:
        if not spill or not isinstance(spill, dict) or "latitude" not in spill:
            spill_obj = satellite_service.analyze_satellite_image("demo_sar_oil.png")
        else:
            spill_obj = SpillDetection(**spill)

        if not env or not isinstance(env, dict) or "wind_speed" not in env:
            env_obj = drift_service.get_environmental_conditions()
        else:
            env_obj = EnvironmentalConditions(**env)

        origin = drift_service.estimate_probable_origin(
            spill=spill_obj,
            env=env_obj,
            estimated_age_hours=float(estimated_age_hours),
            uncertainty_km=float(uncertainty_km)
        )
        return origin
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Drift estimation failed: {str(e)}")

# -------------------------------------------------------------
# AIS TRAJECTORIES ENDPOINTS
# -------------------------------------------------------------
@router.get("/ais/vessels")
def get_ais_records():
    """Returns parsed AIS vessel trajectories."""
    try:
        records = ais_service.load_ais_data()
        grouped = ais_service.group_by_vessel(records)
        vessel_summaries = []
        for mmsi, traj in grouped.items():
            first = traj[0]
            last = traj[-1]
            vessel_summaries.append({
                "mmsi": mmsi,
                "vessel_name": first.vessel_name,
                "vessel_type": first.vessel_type,
                "flag": first.flag,
                "record_count": len(traj),
                "start_time": first.timestamp,
                "end_time": last.timestamp,
                "avg_speed": round(sum(r.speed for r in traj) / len(traj), 1),
                "trajectory": [r.dict() for r in traj]
            })
        return {
            "total_records": len(records),
            "total_vessels": len(grouped),
            "vessels": vessel_summaries
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load AIS data: {str(e)}")

# -------------------------------------------------------------
# ATTRIBUTION & CORRELATION ENDPOINTS
# -------------------------------------------------------------
@router.post("/attribution/correlate", response_model=AttributionResponse)
def correlate_and_attribute(
    max_distance_km: Annotated[float, Query(ge=1.0, le=100.0)] = 35.0,
    estimated_age_hours: Annotated[float, Query(ge=0.5, le=48.0)] = 5.5
):
    """
    Executes end-to-end attribution pipeline:
    1. Detects possible oil spill from satellite imagery
    2. Models backward leeway hydrodynamic drift to estimate Probable Origin
    3. Correlates AIS candidate vessels against spatial & temporal parameters
    4. Computes explainable 5-factor Source-Likelihood Scores
    5. Ranks candidate vessels with transparent justifications
    """
    try:
        spill = satellite_service.analyze_satellite_image("demo_sar_oil.png")
        env = drift_service.get_environmental_conditions()
        origin = drift_service.estimate_probable_origin(
            spill=spill,
            env=env,
            estimated_age_hours=float(estimated_age_hours),
            uncertainty_km=3.5
        )
        records = ais_service.load_ais_data()
        candidates = attribution_service.correlate_and_rank(
            spill=spill,
            origin=origin,
            env=env,
            records=records,
            max_dist_km=max_distance_km
        )

        top_cand_name = candidates[0].vessel_name if candidates else None
        top_cand_score = candidates[0].scores.total_score if candidates else None

        return AttributionResponse(
            spill=spill,
            origin=origin,
            environment=env,
            candidate_vessels=candidates,
            total_screened_vessels=len(ais_service.group_by_vessel(records)),
            top_candidate_name=top_cand_name,
            top_candidate_score=top_cand_score
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Correlation pipeline failed: {str(e)}")

# -------------------------------------------------------------
# INVESTIGATION SUMMARY REPORT EXPORT
# -------------------------------------------------------------
@router.get("/investigation/summary")
def get_investigation_summary():
    """Generates structured formal maritime incident investigation briefing."""
    try:
        spill = satellite_service.analyze_satellite_image("real_spill.jpg")
        env = drift_service.get_environmental_conditions()
        origin = drift_service.estimate_probable_origin(spill=spill, env=env)
        records = ais_service.load_ais_data()
        candidates = attribution_service.correlate_and_rank(
            spill=spill, origin=origin, env=env, records=records
        )

        return {
            "report_id": f"REP-{spill.spill_id}-ATTR",
            "title": "Maritime Oil Spill Source Attribution Incident Briefing",
            "classification_notice": "AI-ASSISTED DECISION SUPPORT / SENSITIVE / PROVISIONAL",
            "legal_disclaimer": (
                "This document summarizes algorithmic correlations between Earth observation radar "
                "imagery and Automatic Identification System (AIS) trajectories using hydrodynamic leeway models. "
                "Source-Likelihood Scores represent empirical spatial-temporal proximity and operational risk indicators. "
                "This report does NOT constitute formal legal culpability or conclusive proof of discharge."
            ),
            "incident": {
                "spill_id": spill.spill_id,
                "classification": spill.classification,
                "satellite_sensor": spill.sensor,
                "detection_timestamp": spill.detection_time,
                "detected_coordinates": f"{spill.latitude} deg N, {spill.longitude} deg E",
                "estimated_area_km2": spill.area_km2,
                "estimated_volume_m3": spill.estimated_volume_m3,
                "confidence_score": f"{spill.confidence * 100:.1f}%"
            },
            "oceanographic_drift_analysis": {
                "wind_condition": f"{env.wind_speed} kts @ {env.wind_direction} deg",
                "current_condition": f"{env.current_speed} kts @ {env.current_direction} deg",
                "net_drift_vector": f"{origin.net_drift_speed_kts} kts towards {origin.net_drift_direction_deg} deg",
                "estimated_age_hours": origin.estimated_drift_hours,
                "total_drift_displacement_km": origin.total_drift_distance_km,
                "probable_origin_coordinates": f"{origin.probable_origin_latitude} deg N, {origin.probable_origin_longitude} deg E",
                "uncertainty_radius_km": f"+/- {origin.origin_uncertainty_km} km",
                "estimated_discharge_window": f"{origin.release_window_start} to {origin.release_window_end}"
            },
            "ranked_candidates": [
                {
                    "rank": c.rank,
                    "vessel_name": c.vessel_name,
                    "mmsi": c.mmsi,
                    "vessel_type": c.vessel_type,
                    "flag": c.flag,
                    "source_likelihood_score": f"{c.scores.total_score}/100",
                    "cpa_distance_km": f"{c.cpa_distance_km} km",
                    "cpa_timestamp": c.cpa_time,
                    "component_scores": {
                        "distance_score": f"{c.scores.distance_score}/30",
                        "time_match_score": f"{c.scores.time_score}/25",
                        "drift_consistency_score": f"{c.scores.drift_score}/20",
                        "heading_alignment_score": f"{c.scores.heading_score}/15",
                        "vessel_type_risk_score": f"{c.scores.vessel_type_score}/10"
                    },
                    "key_explainability_factors": c.why_reasons
                }
                for c in candidates
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")
