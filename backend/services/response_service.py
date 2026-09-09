"""
SpillTrace - Response & Incident Decision Support Service
Generates conditional, data-driven recommended response actions and maintains
the chronological investigation timeline.
"""

from typing import List, Optional
from datetime import datetime
from backend.models.schemas import (
    SpillDetection,
    ProbableOriginEstimate,
    ForwardDriftPrediction,
    CandidateVessel,
    AtRiskVessel,
    RecommendedActionItem,
    InvestigationTimelineEvent,
    NavigationalWarning,
    ResponseDeploymentPackage
)

class ResponseService:
    def __init__(self):
        self._timeline: List[InvestigationTimelineEvent] = []
        self._init_default_timeline()

    def _init_default_timeline(self):
        """Initializes default chronological events for the demonstration scenario."""
        base_time = "2026-09-06T06:15:00Z"
        self._timeline = [
            InvestigationTimelineEvent(
                event_id="EVT-001",
                timestamp="2026-09-06T06:02:14Z",
                event_type="spill_detected",
                title="SAR Slick Anomaly Detected",
                description="Sentinel-1 SAR synthetic demonstration scene processed. Dark patch segmented (14.85 km², confidence: 94.2%).",
                actor="Automated Pipeline (ML Inference)",
                badge_color="red"
            ),
            InvestigationTimelineEvent(
                event_id="EVT-002",
                timestamp="2026-09-06T06:05:30Z",
                event_type="drift_calculated",
                title="Probable Origin Hindcast Calculated",
                description="Hydrodynamic backward leeway drift computed (5.5h age, bearing: 236°, uncertainty: ±3.5 km).",
                actor="Hydrodynamic Leeway Engine",
                badge_color="amber"
            ),
            InvestigationTimelineEvent(
                event_id="EVT-003",
                timestamp="2026-09-06T06:07:45Z",
                event_type="drift_calculated",
                title="Forward Drift & Exclusion Zone Generated",
                description="6.0-hour forward leeway forecast generated with expanding diffusion hazard zone (24.8 km²).",
                actor="Hydrodynamic Leeway Engine",
                badge_color="blue"
            ),
            InvestigationTimelineEvent(
                event_id="EVT-004",
                timestamp="2026-09-06T06:10:12Z",
                event_type="candidates_ranked",
                title="AIS Fleet Screened & Correlated",
                description="10 candidate vessels evaluated against release window and origin envelope. Top candidate: MT Ocean Pioneer (87/100).",
                actor="Attribution Scoring Service",
                badge_color="green"
            )
        ]

    def get_timeline(self) -> List[InvestigationTimelineEvent]:
        """Returns the chronological investigation timeline."""
        return list(self._timeline)

    def add_timeline_event(
        self,
        event_type: str,
        title: str,
        description: str,
        actor: str = "Investigator (Human-in-the-Loop)",
        badge_color: str = "blue"
    ) -> InvestigationTimelineEvent:
        """Appends a new event to the timeline."""
        now_str = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        evt_id = f"EVT-{len(self._timeline) + 1:03d}"
        event = InvestigationTimelineEvent(
            event_id=evt_id,
            timestamp=now_str,
            event_type=event_type,
            title=title,
            description=description,
            actor=actor,
            badge_color=badge_color
        )
        self._timeline.append(event)
        return event

    def generate_navigational_warning(
        self,
        spill: SpillDetection,
        forward_drift: ForwardDriftPrediction,
        candidate: Optional[CandidateVessel] = None
    ) -> NavigationalWarning:
        """
        Generates official NAVAREA VIII / NAVTEX broadcast draft.
        Formatted according to standard IMO/IHO maritime safety information guidelines.
        """
        cand_name = candidate.vessel_name if candidate else "MT OCEAN PIONEER"
        cand_mmsi = candidate.mmsi if candidate else "419001234"
        lat_deg = int(spill.latitude)
        lat_min = round((spill.latitude - lat_deg) * 60.0, 1)
        lon_deg = int(spill.longitude)
        lon_min = round((spill.longitude - lon_deg) * 60.0, 1)
        coord_str = f"{lat_deg:02d}°{lat_min:04.1f}'N {lon_deg:03d}°{lon_min:04.1f}'E"

        msg = (
            f"Potential oil-spill risk detected along the affected route. Avoid the predicted exclusion zone until further notice.\n"
            f"NAVAREA VIII 142/2026. ARABIAN SEA - MUMBAI APPROACHES.\n"
            f"1. POLLUTION HAZARD: CONFIRMED CONTINUOUS HYDROCARBON DISCHARGE OBSERVED IN VICINITY {coord_str}.\n"
            f"2. SUSPECT / SOURCE IDENTIFIED: {cand_name.upper()} (MMSI: {cand_mmsi}).\n"
            f"3. HYDRODYNAMIC DRIFT: SLICK DRIFTING {int(forward_drift.net_drift_direction_deg):03d} DEGREES AT {forward_drift.net_drift_speed_kts:.1f} KNOTS TOWARDS FAIRWAY.\n"
            f"4. ACTIVE EXCLUSION ZONE: {forward_drift.hazard_area_km2:.0f} SQ KM EXTENDING 12 NM NORTHEAST. RADIUS 4.5 NM FROM AXIS.\n"
            f"5. DIRECTIVE: ALL VESSELS IN VICINITY AND ON AFFECTED ROUTES MAINTAIN MINIMUM 3 NM CLOSEST POINT OF APPROACH (CPA), "
            f"POST EXTRA LOOKOUTS, RESTRICT ENGINE RAW WATER INTAKE, AND COMPLY WITH MUMBAI VTMS DIRECTIVES ON VHF CH 16/12.\n"
            f"6. RESPONSE FLOTILLA ON SCENE. CANCEL AT 081200 UTC."
        )

        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

        return NavigationalWarning(
            warning_id="NAV-VIII-142-2026",
            navarea_number="NAVAREA VIII 142/2026",
            station="MUMBAI VTMS / COAST RADIO (VWX)",
            coordinates_text=coord_str,
            hazard_type=f"CONFIRMED CONTINUOUS HYDROCARBON DISCHARGE ({cand_name.upper()})",
            drift_velocity_text=f"Drifting {int(forward_drift.net_drift_direction_deg):03d}° at {forward_drift.net_drift_speed_kts:.1f} kts towards Mumbai fairway",
            exclusion_radius_nm=4.5,
            message_text=msg,
            broadcast_channels=["NAVTEX 518 kHz", "VHF CH 16 / 12", "SafetyNET Inmarsat-C"],
            status="BROADCAST — SIMULATED",
            issued_at=now_str
        )

    def prepare_response_deployment(
        self,
        spill: SpillDetection,
        forward_drift: ForwardDriftPrediction,
        candidate: Optional[CandidateVessel] = None
    ) -> ResponseDeploymentPackage:
        """
        Prepares a Tier-2 Offshore Regional containment and recovery deployment package.
        """
        return ResponseDeploymentPackage(
            package_id="DEP-TIER2-001",
            tier="TIER-2 OFFSHORE REGIONAL (CONFIRMED SOURCE)",
            target_location_lat=round(spill.latitude, 5),
            target_location_lon=round(spill.longitude, 5),
            containment_boom_meters=1200,
            skimming_vessels_count=2,
            deflection_boom_meters=800,
            staging_base="JNPT Anchorage / Mumbai Port Trust (MbPT)",
            primary_assets=[
                "ICG Samudra Prahari (Pollution Control Vessel)",
                "OSRV-1 Offshore Skimmer & Storage Tug",
                "Fast Response Boom Tender-04"
            ],
            status="RESPONSE TEAM DEPLOYMENT INITIATED — SIMULATED",
            estimated_on_scene_minutes=45
        )

    def add_leak_confirmed_escalation_events(
        self,
        candidate: CandidateVessel,
        at_risk_count: int = 8,
        hazard_area_km2: float = 220.0
    ):
        """
        Appends the complete chronological escalation event chain to the investigation timeline
        matching Section 9 of the SIH decision-support specification.
        """
        cand_name = candidate.vessel_name
        cand_mmsi = candidate.mmsi

        # 1. Vessel Verification — CONFIRMED
        self.add_timeline_event(
            event_type="leak_confirmed",
            title=f"Vessel Verification — CONFIRMED ({cand_name})",
            description=f"Physical/aerial inspection confirmed active hydrocarbon discharge. Vessel classified as VERIFIED LEAK (Score: {int(candidate.scores.total_score)}/100).",
            actor="Investigator (Physical / Aerial Survey)",
            badge_color="red"
        )

        # 2. Source Verification — COMPLETE
        self.add_timeline_event(
            event_type="incident_escalation",
            title="Source Verification — COMPLETE",
            description="Source verified — DEMO. Incident status escalated to CRITICAL — TIER-2 ESCALATION (CONFIRMED SOURCE).",
            actor="Incident Command Center",
            badge_color="red"
        )

        # 3. Forward Drift — COMPLETE
        self.add_timeline_event(
            event_type="drift_calculated",
            title="Forward Drift — COMPLETE",
            description="12-hour continuous leeway forward drift model calculated. Slick drifting northeast at 1.7 kts with expanding spread.",
            actor="Hydrodynamic Leeway Engine",
            badge_color="blue"
        )

        # 4. Exclusion Zone — CREATED
        self.add_timeline_event(
            event_type="exclusion_zone_updated",
            title=f"Exclusion Zone — CREATED ({hazard_area_km2:.0f} km²)",
            description=f"Active hazard exclusion zone corridor generated ({hazard_area_km2:.0f} km² active hazard perimeter, radius 4.5 NM).",
            actor="Hydrodynamic Leeway Engine",
            badge_color="blue"
        )

        # 5. At-Risk Vessels — 8 IDENTIFIED
        self.add_timeline_event(
            event_type="route_traffic_screened",
            title=f"At-Risk Vessels — {at_risk_count} IDENTIFIED",
            description=f"AIS corridor query automatically identified {at_risk_count} vessels transiting or approaching the projected drift path. Collision and fouling hazard flagged.",
            actor="VTMS Traffic Surveillance",
            badge_color="amber"
        )

        # 6. Vessel Notifications — 8 SENT — SIMULATED
        self.add_timeline_event(
            event_type="safety_advisories_prepared",
            title=f"Vessel Notifications — {at_risk_count} SENT — SIMULATED",
            description=f"Automated simulated safety notices transmitted to all {at_risk_count} flagged route vessels with course divergence directives.",
            actor="Incident Command Communications",
            badge_color="green"
        )

        # 7. Navigational Warning — BROADCAST — SIMULATED
        self.add_timeline_event(
            event_type="navtex_warning_generated",
            title="Navigational Warning — BROADCAST — SIMULATED",
            description="NAVAREA VIII 142/2026 warning broadcast via NAVTEX 518 kHz and VHF CH 16/12 alerting regional shipping.",
            actor="Mumbai Coast Radio (VWX)",
            badge_color="green"
        )

        # 8. Response Team — DEPLOYMENT INITIATED — SIMULATED
        self.add_timeline_event(
            event_type="response_prepared",
            title="Response Team — DEPLOYMENT INITIATED — SIMULATED",
            description="Tier-2 offshore containment flotilla dispatched from JNPT Base (1,200m containment booms, 2 skimmers, 800m deflection booms, 45m ETA).",
            actor="Disaster Response Operations",
            badge_color="green"
        )

        # 9. Recommended Response Actions — GENERATED
        self.add_timeline_event(
            event_type="response_actions_generated",
            title="Recommended Response Actions — GENERATED",
            description="Incident command response checklist dynamically generated and activated based on confirmed discharge parameters.",
            actor="Incident Command Decision Engine",
            badge_color="blue"
        )

    def generate_recommended_actions(
        self,
        spill: SpillDetection,
        origin: ProbableOriginEstimate,
        candidates: List[CandidateVessel],
        at_risk_vessels: List[AtRiskVessel],
        forward_drift: ForwardDriftPrediction,
        is_confirmed: bool = False
    ) -> List[RecommendedActionItem]:
        """
        Generates CONDITIONAL, context-driven response recommendations.
        Actions depend dynamically on spill severity, coastal proximity, forward drift, candidate evidence, and confirmation state.
        """
        actions: List[RecommendedActionItem] = []
        is_minor = not spill.is_quantitative or spill.severity_class == "WATCHLIST"
        high_risk_ships = [v for v in at_risk_vessels if v.risk_state in ("INSIDE ZONE", "APPROACHING", "ON ROUTE")]

        if is_confirmed:
            top_cand = candidates[0] if candidates else None
            cand_label = f" ({top_cand.vessel_name})" if top_cand else ""

            actions.append(RecommendedActionItem(
                action_id="ACT-CONF-01",
                title="Deploy Offshore Containment Flotilla (Tier-2 JNPT Base)",
                category="containment",
                priority="CRITICAL",
                rationale=f"Active ongoing hydrocarbon release confirmed from source candidate{cand_label}. Deploy 1,200m offshore containment boom and 2 skimming vessels immediately.",
                action_type="deploy_response",
                status="RECOMMENDED"
            ))

            actions.append(RecommendedActionItem(
                action_id="ACT-CONF-02",
                title="Increase Satellite & Aerial Surveillance Monitoring",
                category="monitoring",
                priority="HIGH",
                rationale="Schedule prioritized SAR tasking (Sentinel-1 / RISAT) and dispatch Coast Guard Dornier-228 aerial surveillance for FLIR tracking.",
                action_type="schedule_satellite",
                status="RECOMMENDED"
            ))

            actions.append(RecommendedActionItem(
                action_id="ACT-CONF-03",
                title="Issue Navigational Route Warning (NAVAREA VIII 142/2026)",
                category="maritime_safety",
                priority="CRITICAL",
                rationale=f"Hazard corridor expanded to {forward_drift.hazard_area_km2:.0f} km² across active fairway. Broadcast urgent safety warning via NAVTEX 518 kHz and VHF CH 16/12.",
                action_type="broadcast_warning",
                status="RECOMMENDED"
            ))

            actions.append(RecommendedActionItem(
                action_id="ACT-CONF-04",
                title="Protect Coastal Exposure Area (Colaba Point & JNPT Harbor)",
                category="containment",
                priority="HIGH",
                rationale=f"Forward drift vector ({int(forward_drift.net_drift_direction_deg)}° at {forward_drift.net_drift_speed_kts:.1f} kts) trends towards Back Bay. Stage 800m deflection booms.",
                action_type="deploy_response",
                status="RECOMMENDED"
            ))

            actions.append(RecommendedActionItem(
                action_id="ACT-CONF-05",
                title=f"Monitor Affected Shipping Traffic ({len(high_risk_ships) or 8} Flagged Route Vessels)",
                category="maritime_safety",
                priority="CRITICAL",
                rationale=f"{len(high_risk_ships) or 8} vessels identified on direct approach or along hazard route. Automated simulated advisories active; maintain radar/AIS tracking.",
                action_type="notify_vessel",
                status="RECOMMENDED"
            ))

            actions.append(RecommendedActionItem(
                action_id="ACT-CONF-06",
                title="Reassess Spill Spread & Trajectory Horizon (+24h Forecast)",
                category="containment",
                priority="HIGH",
                rationale="Continuously assimilate dynamic wind and ocean current feeds to model slick emulsification and secondary shoreline landfall risks.",
                action_type="deploy_response",
                status="RECOMMENDED"
            ))

            if top_cand:
                actions.append(RecommendedActionItem(
                    action_id="ACT-CONF-07",
                    title=f"Issue Port State Control (PSC) Formal Notice: {top_cand.vessel_name}",
                    category="legal_audit",
                    priority="CRITICAL",
                    rationale=f"Empirical source confirmation (Score: {int(top_cand.scores.total_score)}/100) satisfies MARPOL Annex I violation criteria. Case transmitted to Mercantile Marine Department.",
                    action_type="notify_authorities",
                    status="RECOMMENDED"
                ))

            return actions

        if not is_minor:
            # 1. Physical Containment
            actions.append(RecommendedActionItem(
                action_id="ACT-01",
                title="Deploy Offshore Containment & Skimming Booms",
                category="containment",
                priority="CRITICAL" if spill.severity_class == "CRITICAL" else "HIGH",
                rationale=f"Recommended because detected slick is {spill.area_km2} km² with estimated volume ~{int(spill.volume_estimate or 17820):,} m³ and 43 km from Mumbai shoreline.",
                action_type="deploy_response",
                status="RECOMMENDED"
            ))

            # 2. Shoreline Protection
            if spill.distance_to_coast_km <= 50.0:
                actions.append(RecommendedActionItem(
                    action_id="ACT-02",
                    title="Coordinate Shoreline Defense Assets",
                    category="containment",
                    priority="HIGH",
                    rationale=f"Forward drift vector ({forward_drift.net_drift_direction_deg}°) trends towards coastal approaches ({spill.nearest_coast_name}). Advance boom placement advised.",
                    action_type="deploy_response",
                    status="RECOMMENDED"
                ))

            # 3. Port State Control Audit
            top_cand = candidates[0] if candidates else None
            if top_cand and top_cand.scores.total_score >= 70:
                actions.append(RecommendedActionItem(
                    action_id="ACT-03",
                    title=f"Request Port State Control (PSC) Inspection: {top_cand.vessel_name}",
                    category="legal_audit",
                    priority="HIGH",
                    rationale=f"Source-Likelihood Score ({top_cand.scores.total_score}/100) indicates strong spatiotemporal alignment with estimated release window ({origin.release_window_start[11:16]}-{origin.release_window_end[11:16]} UTC).",
                    action_type="notify_authorities",
                    status="RECOMMENDED"
                ))
        else:
            # Minor Spill Workflow
            actions.append(RecommendedActionItem(
                action_id="ACT-M1",
                title="Schedule Recheck on Next Satellite Pass",
                category="surveillance",
                priority="WATCHLIST",
                rationale=f"Recommended because detection is classified as {spill.appearance_class} ({spill.area_km2} km²) below quantitative threshold (2.0 km²). False precision suppressed.",
                action_type="recheck",
                status="RECOMMENDED"
            ))
            actions.append(RecommendedActionItem(
                action_id="ACT-M2",
                title="Maintain Enhanced AIS & Aerial Surveillance",
                category="surveillance",
                priority="WATCHLIST",
                rationale="Monitor for slick dispersion or secondary sheen coalescing without deploying heavy offshore containment.",
                action_type="recheck",
                status="RECOMMENDED"
            ))

        # 4. Navigational Broadcast (Maritime Safety)
        if high_risk_ships or forward_drift.hazard_area_km2 > 10.0:
            actions.append(RecommendedActionItem(
                action_id="ACT-04",
                title="Broadcast Navigational Hazard Warning (NAVTEX / SafetyNET)",
                category="maritime_safety",
                priority="CRITICAL" if high_risk_ships else "MEDIUM",
                rationale=f"Forward drift exclusion zone ({forward_drift.hazard_area_km2} km²) intersects active commercial shipping corridor. {len(high_risk_ships)} vessel(s) currently flagged.",
                action_type="broadcast_warning",
                status="RECOMMENDED"
            ))

        # 5. Direct Vessel Safety Notices
        if high_risk_ships:
            target_names = ", ".join([v.vessel_name for v in high_risk_ships[:2]])
            actions.append(RecommendedActionItem(
                action_id="ACT-05",
                title=f"Issue Safety Advisory to Flagged Vessels ({target_names})",
                category="maritime_safety",
                priority="HIGH",
                rationale=f"{len(high_risk_ships)} vessel(s) have trajectories entering or approaching the forward exclusion zone. Course divergence advised.",
                action_type="notify_vessel",
                status="RECOMMENDED"
            ))

        return actions

response_service = ResponseService()
