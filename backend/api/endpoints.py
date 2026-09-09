"""
SpillTrace - REST API Endpoints
Implements all workflow and analysis routes for SIH Problem Statement 143.
"""

from typing import List, Optional, Dict, Any, Annotated
from fastapi import APIRouter, HTTPException, Query, Body, UploadFile, File
import os
import shutil
from datetime import datetime

from backend.models.schemas import (
    SpillDetection,
    EnvironmentalConditions,
    ProbableOriginEstimate,
    AISRecord,
    CandidateVessel,
    AttributionResponse,
    CorrelationFilterRequest,
    ForwardDriftPrediction,
    AtRiskVessel,
    CandidateVerificationRequest,
    CandidateVerificationResponse,
    InvestigationTimelineEvent,
    RecommendedActionItem
)
from backend.services.satellite_service import satellite_service
from backend.services.drift_service import drift_service
from backend.services.ais_service import ais_service
from backend.services.attribution_service import attribution_service
from backend.services.response_service import response_service

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

@router.get("/satellite/scenarios")
def list_test_scenarios():
    """Returns calibrated demonstration scenarios covering major to faint sheens and nearshore threats."""
    return [
        {
            "id": "scenario_large_obvious",
            "name": "Test 1 — Large Obvious Spill (Offshore Mumbai)",
            "area_km2": 14.85,
            "confidence": 0.942,
            "expected_workflow": "Quantitative Assessment / Active Investigation",
            "description": "Large slick meeting all quantitative thresholds; volume fully quantified."
        },
        {
            "id": "scenario_small_high_conf",
            "name": "Test 2 — Small High-Confidence Sheen",
            "area_km2": 0.45,
            "confidence": 0.880,
            "expected_workflow": "Appearance-Based Assessment (Rainbow Sheen)",
            "description": "Small area below threshold; volume not quantified to prevent false precision."
        },
        {
            "id": "scenario_small_low_conf",
            "name": "Test 3 — Small Low-Confidence Clutter Detection",
            "area_km2": 0.22,
            "confidence": 0.580,
            "expected_workflow": "Watchlist Monitoring (Recheck Next Pass)",
            "description": "Faint anomaly requiring recheck on next satellite pass."
        },
        {
            "id": "scenario_small_nearshore",
            "name": "Test 4 — Small Sheen Close to Shore (Colaba Coast)",
            "area_km2": 0.35,
            "confidence": 0.860,
            "expected_workflow": "Elevated Shoreline Threat Priority (High Coast Risk)",
            "description": "Small spill only 1.8 km from coast; elevated severity demonstrates distance-to-coast weighting."
        },
        {
            "id": "scenario_large_offshore",
            "name": "Test 5 — Large Deep Offshore Spill (65 km)",
            "area_km2": 8.50,
            "confidence": 0.920,
            "expected_workflow": "Balanced Contextual Risk (Pelagic Waters)",
            "description": "Large quantified spill far offshore; severity reflects low coastal proximity risk."
        }
    ]

@router.post("/satellite/analyze", response_model=SpillDetection)
def analyze_satellite_image(
    filename: Annotated[str, Query(description="Filename of SAR image in data/satellite")] = "demo_sar_oil.png",
    scenario: Annotated[Optional[str], Query(description="Optional scenario archetype ID")] = None
):
    """Executes confidence-aware and size-aware segmentation model on satellite SAR demonstration image."""
    try:
        detection = satellite_service.analyze_satellite_image(filename=filename, scenario_override=scenario)
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
    4. Computes explainable 5-factor Source-Likelihood Scores with AIS anomaly detection
    5. Predicts forward drift spread and generates dynamic exclusion zone
    6. Identifies at-risk vessels entering or approaching exclusion corridor
    7. Generates conditional recommended response actions and investigation timeline
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

        # Predict forward leeway drift corridor & exclusion zone
        forward_drift = drift_service.predict_forward_drift(
            spill=spill,
            env=env,
            forecast_hours=6.0
        )

        # Identify vessels at risk of entering or approaching exclusion zone
        at_risk = ais_service.identify_at_risk_vessels(records, forward_drift)

        # Generate conditional response actions
        rec_actions = response_service.generate_recommended_actions(
            spill=spill,
            origin=origin,
            candidates=candidates,
            at_risk_vessels=at_risk,
            forward_drift=forward_drift
        )

        timeline = response_service.get_timeline()

        return AttributionResponse(
            spill=spill,
            origin=origin,
            environment=env,
            candidate_vessels=candidates,
            total_screened_vessels=len(ais_service.group_by_vessel(records)),
            top_candidate_name=top_cand_name,
            top_candidate_score=top_cand_score,
            forward_drift=forward_drift,
            at_risk_vessels=at_risk,
            recommended_actions=rec_actions,
            timeline_events=timeline
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Correlation pipeline failed: {str(e)}")

@router.post("/drift/forward", response_model=ForwardDriftPrediction)
def predict_forward_drift_route(
    forecast_hours: Annotated[float, Query(ge=1.0, le=48.0)] = 6.0,
    filename: Annotated[str, Query()] = "demo_sar_oil.png"
):
    """Predicts forward hydrodynamic leeway trajectory and exclusion zone."""
    try:
        spill = satellite_service.analyze_satellite_image(filename)
        env = drift_service.get_environmental_conditions()
        return drift_service.predict_forward_drift(spill, env, forecast_hours=forecast_hours)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forward drift prediction failed: {str(e)}")

@router.get("/vessels/at-risk", response_model=List[AtRiskVessel])
def get_at_risk_vessels_route(
    forecast_hours: Annotated[float, Query(ge=1.0, le=48.0)] = 6.0
):
    """Screens candidate AIS fleet against the forward drift corridor and exclusion zone."""
    try:
        spill = satellite_service.analyze_satellite_image("demo_sar_oil.png")
        env = drift_service.get_environmental_conditions()
        fwd = drift_service.predict_forward_drift(spill, env, forecast_hours=forecast_hours)
        records = ais_service.load_ais_data()
        return ais_service.identify_at_risk_vessels(records, fwd)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to identify at-risk vessels: {str(e)}")

@router.post("/investigation/verify-candidate", response_model=CandidateVerificationResponse)
def verify_candidate_vessel_route(req: CandidateVerificationRequest):
    """
    Interactive Candidate Verification Feedback Loop:
    Updates inspection outcome ('confirmed', 'suspected', 'not_detected'),
    recalculates Source-Likelihood Scores, dynamically reranks candidates, and logs to timeline.
    When outcome is 'confirmed' or 'confirmed_source':
    Executes full operational escalation workflow:
    1. Vessel marked as CONFIRMED SOURCE CANDIDATE (Rank #1 locked, score 96-98)
    2. Incident severity recalculated to CRITICAL — TIER-2 ESCALATION
    3. Cleaning / response team deployment prepared
    4. Ships on affected route identified (>5 nearby/route vessels flagged)
    5. Navigational warning generated (NAVAREA VIII 142/2026 draft)
    6. Notifications prepared for those vessels
    7. Forward drift / exclusion zone updated (220 km² active corridor)
    8. Investigation timeline updated with full chronological escalation audit log
    """
    try:
        spill = satellite_service.analyze_satellite_image("demo_sar_oil.png")
        env = drift_service.get_environmental_conditions()
        origin = drift_service.estimate_probable_origin(spill=spill, env=env)
        records = ais_service.load_ais_data()
        candidates = attribution_service.correlate_and_rank(spill=spill, origin=origin, env=env, records=records)

        reranked = attribution_service.apply_verification_outcome(
            candidates=candidates,
            target_mmsi=req.mmsi,
            outcome=req.verification_outcome,
            notes=req.inspector_notes
        )

        is_confirmed = req.verification_outcome.lower() in ("confirmed", "confirmed_source")
        target_cand = next((c for c in reranked if c.mmsi == req.mmsi), reranked[0] if reranked else None)

        if is_confirmed:
            # Update forward drift with expanded 12h corridor
            fwd = drift_service.predict_forward_drift(spill, env, is_confirmed=True)
            # Identify route traffic (8 flagged vessels)
            at_risk = ais_service.identify_at_risk_vessels(records, fwd, is_confirmed=True)
            now_utc = datetime.utcnow().strftime("%H:%M UTC")
            for v in at_risk:
                if v.risk_state != "OUTSIDE RISK":
                    v.notification_sent = True
                    v.notification_status = "NOTIFIED — SIMULATED"
                    v.notification_time = now_utc

            # Generate Navigational Warning (NAVAREA VIII draft & simulated broadcast)
            nav_warning = response_service.generate_navigational_warning(spill, fwd, target_cand)
            nav_warning.status = "BROADCAST — SIMULATED"

            # Prepare Tier-2 Response Flotilla deployment
            dep_pkg = response_service.prepare_response_deployment(spill, fwd, target_cand)
            dep_pkg.status = "RESPONSE TEAM DEPLOYMENT INITIATED — SIMULATED"

            # Generate recommended response actions
            rec_actions = response_service.generate_recommended_actions(
                spill=spill,
                origin=origin,
                candidates=reranked,
                at_risk_vessels=at_risk,
                forward_drift=fwd,
                is_confirmed=True
            )

            # Add complete chronological escalation audit trail to timeline
            flagged_count = len([v for v in at_risk if v.risk_state != "OUTSIDE RISK"])
            response_service.add_leak_confirmed_escalation_events(
                candidate=target_cand,
                at_risk_count=flagged_count,
                hazard_area_km2=fwd.hazard_area_km2
            )

            return CandidateVerificationResponse(
                candidate_vessels=reranked,
                is_leak_confirmed=True,
                confirmed_source_mmsi=req.mmsi,
                confirmed_source_name=target_cand.vessel_name if target_cand else req.mmsi,
                investigation_state="SOURCE VERIFIED — DEMO",
                incident_severity="CRITICAL — TIER-2 ESCALATION (CONFIRMED SOURCE)",
                response_deployment=dep_pkg,
                navigational_warning=nav_warning,
                at_risk_vessels=at_risk,
                forward_drift=fwd,
                recommended_actions=rec_actions,
                timeline_events=response_service.get_timeline()
            )
        else:
            outcome_label = req.verification_outcome.upper().replace("_", " ")
            v_name = target_cand.vessel_name if target_cand else req.mmsi
            response_service.add_timeline_event(
                event_type="verification_recorded",
                title=f"Verification Recorded: {v_name}",
                description=f"Physical/Aerial Inspection recorded outcome: {outcome_label}. Scores recalculated and fleet dynamically reranked.",
                actor="Maritime Inspector (Human-in-the-Loop)",
                badge_color="amber" if req.verification_outcome == "not_detected" else "green"
            )

            return CandidateVerificationResponse(
                candidate_vessels=reranked,
                is_leak_confirmed=False,
                confirmed_source_mmsi=None,
                confirmed_source_name=None,
                incident_severity="ACTIVE INVESTIGATION",
                response_deployment=None,
                navigational_warning=None,
                at_risk_vessels=[],
                forward_drift=None,
                timeline_events=response_service.get_timeline()
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Candidate verification failed: {str(e)}")

@router.get("/investigation/timeline", response_model=List[InvestigationTimelineEvent])
def get_investigation_timeline_route():
    """Returns chronological investigation audit log."""
    return response_service.get_timeline()

@router.post("/investigation/timeline/event", response_model=InvestigationTimelineEvent)
def record_timeline_event_route(
    event_type: str = Body(...),
    title: str = Body(...),
    description: str = Body(...),
    actor: str = Body("Investigator (Human-in-the-Loop)"),
    badge_color: str = Body("blue")
):
    """Logs simulated human-in-the-loop action to timeline."""
    return response_service.add_timeline_event(event_type, title, description, actor, badge_color)

@router.get("/response/recommended-actions", response_model=List[RecommendedActionItem])
def get_recommended_actions_route():
    """Returns conditional response actions driven by spill state, drift, and candidates."""
    try:
        spill = satellite_service.analyze_satellite_image("demo_sar_oil.png")
        env = drift_service.get_environmental_conditions()
        origin = drift_service.estimate_probable_origin(spill=spill, env=env)
        fwd = drift_service.predict_forward_drift(spill=spill, env=env)
        records = ais_service.load_ais_data()
        candidates = attribution_service.correlate_and_rank(spill=spill, origin=origin, env=env, records=records)
        at_risk = ais_service.identify_at_risk_vessels(records, fwd)
        return response_service.generate_recommended_actions(spill, origin, candidates, at_risk, fwd)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate actions: {str(e)}")

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
                "is_quantitative": spill.is_quantitative,
                "spill_size_class": spill.spill_size_class,
                "volume_status": spill.volume_status,
                "estimated_volume_m3": spill.estimated_volume_m3 if spill.is_quantitative else "LOW CONFIDENCE — NOT QUANTIFIED",
                "appearance_class": spill.appearance_class,
                "confidence_score": f"{spill.confidence * 100:.1f}%",
                "confidence_class": spill.confidence_class,
                "distance_to_coast_km": f"{spill.distance_to_coast_km} km ({spill.nearest_coast_name})",
                "coast_risk_score": spill.coast_risk_score,
                "severity_class": spill.severity_class,
                "incident_workflow": spill.incident_workflow,
                "recommended_action": spill.recommended_action,
                "classification_evidence": spill.classification_reasons
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
