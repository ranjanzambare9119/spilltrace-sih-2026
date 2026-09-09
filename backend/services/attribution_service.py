"""
SpillTrace - Attribution Service
Implements transparent 5-factor Source-Likelihood Scoring and Explainable AI rationales.
Formula Weights:
- Distance from Probable Origin: 30%
- Time Match with Release Window: 25%
- Drift Corridor Consistency: 20%
- Heading Alignment: 15%
- Vessel Context / Risk Class: 10%
Total: 100 points
"""

import math
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional
from backend.models.schemas import (
    SpillDetection,
    ProbableOriginEstimate,
    AISRecord,
    CandidateVessel,
    ComponentScores,
    EnvironmentalConditions
)
from backend.services.ais_service import (
    ais_service,
    haversine_distance_km,
    cross_track_distance_km
)

class AttributionService:
    def __init__(self):
        # Vessel risk profile weights (max 10 points)
        self.vessel_risk_weights = {
            "crude oil tanker": 8.0,
            "oil tanker": 8.0,
            "chemical tanker": 7.0,
            "product tanker": 7.0,
            "bunkering vessel": 6.5,
            "bulk carrier": 5.0,
            "container ship": 4.0,
            "cargo vessel": 3.5,
            "general cargo": 3.5,
            "tug": 2.5,
            "fishing vessel": 1.5,
            "trawler": 1.5,
            "pleasure craft": 1.0,
            "passenger": 1.5
        }

    def compute_component_scores(
        self,
        cpa_dist_km: float,
        cpa_record: AISRecord,
        origin: ProbableOriginEstimate,
        env: EnvironmentalConditions,
        trajectory: List[AISRecord]
    ) -> ComponentScores:
        """Computes all 5 transparent scoring components calibrated for realistic maritime screening."""
        
        # 1. DISTANCE SCORE (Max 30 pts, practical cap 26.5 to reflect sensor uncertainty)
        sigma_d = max(2.5, origin.origin_uncertainty_km * 1.2)
        dist_score = 26.5 * math.exp(-0.5 * ((cpa_dist_km / sigma_d) ** 2))
        dist_score = max(0.0, min(30.0, round(dist_score, 1)))

        # 2. TIME MATCH SCORE (Max 25 pts, practical cap 22.0)
        try:
            cpa_dt = datetime.strptime(cpa_record.timestamp, "%Y-%m-%dT%H:%M:%SZ")
            est_rel_dt = datetime.strptime(origin.estimated_release_time, "%Y-%m-%dT%H:%M:%SZ")
            time_delta_sec = abs((cpa_dt - est_rel_dt).total_seconds())
            time_delta_hours = round(time_delta_sec / 3600.0, 2)
        except Exception:
            time_delta_hours = 6.0

        sigma_t = 1.75
        time_score = 22.0 * math.exp(-0.5 * ((time_delta_hours / sigma_t) ** 2))
        time_score = max(0.0, min(25.0, round(time_score, 1)))

        # 3. DRIFT CONSISTENCY (Max 20 pts, practical cap 17.5)
        min_corridor_dist_km = float("inf")
        for rec in trajectory:
            ct_dist = cross_track_distance_km(
                rec.latitude, rec.longitude,
                origin.detected_latitude, origin.detected_longitude,
                origin.probable_origin_latitude, origin.probable_origin_longitude
            )
            if ct_dist < min_corridor_dist_km:
                min_corridor_dist_km = ct_dist

        sigma_drift = 3.0
        drift_score = 17.5 * math.exp(-0.5 * ((min_corridor_dist_km / sigma_drift) ** 2))
        drift_score = max(0.0, min(20.0, round(drift_score, 1)))

        # 4. HEADING ALIGNMENT (Max 15 pts, practical cap 13.0)
        ang_diff = abs(cpa_record.heading - origin.net_drift_direction_deg) % 360
        if ang_diff > 180:
            ang_diff = 360 - ang_diff
        heading_alignment_deg = round(ang_diff, 1)

        hdg_factor = math.cos(math.radians(ang_diff / 2.0)) ** 2
        heading_score = 13.0 * hdg_factor
        heading_score = max(0.0, min(15.0, round(heading_score, 1)))

        # 5. VESSEL CONTEXT / TYPE (Max 10 pts, practical cap 8.0)
        v_type_clean = cpa_record.vessel_type.lower().strip()
        v_type_score = self.vessel_risk_weights.get(v_type_clean, 3.5)

        # Spatial gating: if a vessel never passed near probable origin (> 10 km),
        # discount temporal and directional correlation
        if cpa_dist_km > 10.0:
            discount = max(0.05, math.exp(-0.5 * (((cpa_dist_km - 10.0) / 4.0) ** 2)))
            time_score = round(time_score * discount, 1)
            heading_score = round(heading_score * discount, 1)

        total_score = round(dist_score + time_score + drift_score + heading_score + v_type_score, 0)
        total_score = max(0.0, min(100.0, total_score))

        return ComponentScores(
            distance_score=dist_score,
            distance_raw_km=round(cpa_dist_km, 2),
            time_score=time_score,
            time_delta_hours=time_delta_hours,
            drift_score=drift_score,
            drift_cross_track_km=round(min_corridor_dist_km, 2),
            heading_score=heading_score,
            heading_alignment_deg=heading_alignment_deg,
            vessel_type_score=v_type_score,
            vessel_type_label=cpa_record.vessel_type,
            total_score=total_score
        )

    def generate_explainability_reasons(
        self,
        scores: ComponentScores,
        cpa_record: AISRecord,
        origin: ProbableOriginEstimate
    ) -> List[str]:
        """Generates clear, data-driven explainability bullet points for decision support."""
        reasons = []

        # Distance reason
        if scores.distance_raw_km <= origin.origin_uncertainty_km:
            reasons.append(
                f"Trajectory intersected within {scores.distance_raw_km} km of the Probable Origin center "
                f"(inside the +/-{origin.origin_uncertainty_km} km uncertainty boundary)."
            )
        elif scores.distance_raw_km <= 8.0:
            reasons.append(
                f"Passed within proximate radius ({scores.distance_raw_km} km) of the Probable Origin Region."
            )
        else:
            reasons.append(
                f"Closest point of approach was distant ({scores.distance_raw_km} km) from the Probable Origin Region."
            )

        # Time reason
        if scores.time_delta_hours <= 0.75:
            reasons.append(
                f"Presence at CPA ({cpa_record.timestamp}) coincided directly with the estimated spill release window "
                f"({origin.release_window_start.split('T')[1][:5]} - {origin.release_window_end.split('T')[1][:5]} UTC, "
                f"delta: {int(scores.time_delta_hours * 60)} mins)."
            )
        elif scores.time_delta_hours <= 2.5:
            reasons.append(
                f"Transit occurred within {scores.time_delta_hours} hours of estimated release timing."
            )
        else:
            reasons.append(
                f"Temporal disparity: vessel transit was {scores.time_delta_hours} hours apart from estimated discharge window."
            )

        # Drift corridor reason
        if scores.drift_cross_track_km <= 2.0:
            reasons.append(
                f"Track crossed the hydrodynamic backward drift plume corridor (offset: {scores.drift_cross_track_km} km)."
            )
        else:
            reasons.append(
                f"Track lateral deviation from backward drift axis was {scores.drift_cross_track_km} km."
            )

        # Heading reason
        if scores.heading_alignment_deg <= 25.0:
            reasons.append(
                f"Course over ground ({cpa_record.heading} deg) was closely aligned with the surface drift vector "
                f"({origin.net_drift_direction_deg} deg, offset: {scores.heading_alignment_deg} deg)."
            )
        else:
            reasons.append(
                f"Vessel course ({cpa_record.heading} deg) diverged by {scores.heading_alignment_deg} deg from the drift corridor."
            )

        # Vessel type risk reason
        if scores.vessel_type_score >= 8.0:
            reasons.append(
                f"High-risk vessel class ({cpa_record.vessel_type}): operational carriage of heavy hydrocarbon/chemical cargo."
            )
        elif scores.vessel_type_score >= 5.0:
            reasons.append(
                f"Moderate-risk commercial vessel ({cpa_record.vessel_type}): heavy fuel oil / bunker and ballast risk."
            )
        else:
            reasons.append(
                f"Low-risk classification ({cpa_record.vessel_type}): limited bunker capacity."
            )

        return reasons

    def detect_ais_anomalies(
        self,
        trajectory: List[AISRecord],
        cpa_record: AISRecord,
        origin: ProbableOriginEstimate
    ) -> Tuple[bool, Optional[str]]:
        """
        Detects objective AIS behavioral signals (speed drops, transmission gaps, course shifts).
        These are investigative signals, NOT proof of wrongdoing.
        """
        if len(trajectory) < 2:
            return False, "Insufficient telemetry points for anomaly detection"

        speeds = [r.speed for r in trajectory if r.speed > 0]
        mean_speed = sum(speeds) / len(speeds) if speeds else 10.0

        # 1. Speed reduction near CPA (> 25% below mean speed)
        if cpa_record.speed < (mean_speed * 0.75) and mean_speed >= 8.0:
            return True, f"Speed reduction: slowed to {cpa_record.speed} kts (mean {round(mean_speed, 1)} kts) near release window"

        # 2. Sudden course change near CPA
        cpa_idx = trajectory.index(cpa_record) if cpa_record in trajectory else -1
        if 0 < cpa_idx < len(trajectory) - 1:
            prev_hdg = trajectory[cpa_idx - 1].heading
            curr_hdg = cpa_record.heading
            diff = abs(curr_hdg - prev_hdg) % 360
            if diff > 180:
                diff = 360 - diff
            if diff >= 25.0:
                return True, f"Course alteration: {round(diff, 1)}° heading shift recorded near release corridor"

        # 3. Transmission gap detection (> 45 min gap between consecutive reports)
        for i in range(len(trajectory) - 1):
            try:
                t1 = datetime.strptime(trajectory[i].timestamp, "%Y-%m-%dT%H:%M:%SZ")
                t2 = datetime.strptime(trajectory[i + 1].timestamp, "%Y-%m-%dT%H:%M:%SZ")
                gap_mins = (t2 - t1).total_seconds() / 60.0
                if gap_mins > 45.0:
                    return True, f"AIS transmission gap: {int(gap_mins)} min telemetry silence observed"
            except Exception:
                pass

        return False, "Nominal AIS transit profile — no telemetry anomalies detected"

    def correlate_and_rank(
        self,
        spill: SpillDetection,
        origin: ProbableOriginEstimate,
        env: EnvironmentalConditions,
        records: List[AISRecord],
        max_dist_km: float = 35.0
    ) -> List[CandidateVessel]:
        """Correlates all vessels against probable origin, scores them, and returns ranked candidate vessels."""
        grouped = ais_service.group_by_vessel(records)
        candidates: List[CandidateVessel] = []

        for mmsi, trajectory in grouped.items():
            cpa_dist, cpa_rec = ais_service.compute_vessel_cpa(
                trajectory,
                origin.probable_origin_latitude,
                origin.probable_origin_longitude
            )

            # Spatial filter
            if cpa_dist > max_dist_km:
                continue

            scores = self.compute_component_scores(
                cpa_dist, cpa_rec, origin, env, trajectory
            )

            reasons = self.generate_explainability_reasons(scores, cpa_rec, origin)
            has_anomaly, anomaly_detail = self.detect_ais_anomalies(trajectory, cpa_rec, origin)

            if has_anomaly:
                reasons.append(f"AIS Signal: {anomaly_detail}.")

            v_name = cpa_rec.vessel_name
            if not ("DEMO" in v_name):
                v_name = f"{v_name} - DEMO"

            candidates.append(CandidateVessel(
                rank=0,  # will assign after sorting
                mmsi=mmsi,
                vessel_name=v_name,
                vessel_type=cpa_rec.vessel_type,
                flag=cpa_rec.flag or "Unknown",
                draught=cpa_rec.draught or 0.0,
                destination=cpa_rec.destination or "N/A",
                cpa_distance_km=cpa_dist,
                cpa_time=cpa_rec.timestamp,
                scores=scores,
                why_reasons=reasons,
                trajectory=trajectory,
                verification_status="unverified",
                ais_anomaly_detected=has_anomaly,
                ais_anomaly_detail=anomaly_detail,
                original_score=scores.total_score
            ))

        # Sort descending by total score
        candidates.sort(key=lambda c: c.scores.total_score, reverse=True)

        # Assign 1-based ranks
        for idx, cand in enumerate(candidates):
            cand.rank = idx + 1

        return candidates

    def apply_verification_outcome(
        self,
        candidates: List[CandidateVessel],
        target_mmsi: str,
        outcome: str,
        notes: str = None
    ) -> List[CandidateVessel]:
        """
        Interactive Verification Loop:
        Updates candidate verification status and recalculates scores/ranks:
        - 'not_detected': physical aerial/port inspection found no leak -> score reduced by 60%
        - 'confirmed': positive physical evidence -> score boosted/confirmed
        - 'suspected': remains flagged
        - 'unverified': restored to baseline score
        """
        for cand in candidates:
            if cand.mmsi == target_mmsi:
                cand.verification_status = outcome
                orig = cand.original_score or cand.scores.total_score
                cand.original_score = orig

                if outcome == "not_detected":
                    # Substantial penalty: 60% reduction
                    cand.scores.total_score = max(5.0, round(orig * 0.40, 0))
                    cand.why_reasons.insert(0, f"VERIFICATION UPDATE: Physical inspection conducted — LEAK NOT DETECTED ({notes or 'No active discharge found on hull'}). Score penalized to {cand.scores.total_score}/100.")
                elif outcome in ["confirmed", "confirmed_source"]:
                    cand.verification_status = "CONFIRMED SOURCE CANDIDATE"
                    cand.scores.total_score = min(98.0, max(orig, 96.0))
                    cand.why_reasons.insert(0, f"VERIFICATION UPDATE: Physical inspection conducted — POSITIVE DISCHARGE CONFIRMED ({notes or 'Hull inspection verified oily residue and discharge pattern matching SAR anomaly'}). Marked as CONFIRMED SOURCE CANDIDATE.")
                elif outcome == "unverified":
                    cand.scores.total_score = orig

        # Rerank all candidates based on updated scores
        candidates.sort(key=lambda c: c.scores.total_score, reverse=True)
        for idx, cand in enumerate(candidates):
            cand.rank = idx + 1

        return candidates

attribution_service = AttributionService()
