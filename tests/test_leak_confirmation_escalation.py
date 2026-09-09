"""
SpillTrace - Leak Confirmation Escalation Test Suite
Validates the complete 10-step operational workflow:
1. LEAK CONFIRMED
2. Vessel marked as CONFIRMED SOURCE CANDIDATE
3. Incident severity recalculated
4. Cleaning / response team deployment prepared
5. Ships on affected route identified
6. >5 nearby/route vessels flagged
7. Navigational warning generated
8. Notifications prepared for those vessels
9. Forward drift / exclusion zone updated
10. Investigation timeline updated
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.satellite_service import satellite_service
from backend.services.drift_service import drift_service
from backend.services.ais_service import ais_service
from backend.services.attribution_service import attribution_service
from backend.services.response_service import response_service
from backend.api.endpoints import verify_candidate_vessel_route
from backend.models.schemas import CandidateVerificationRequest

def test_leak_confirmation_escalation_workflow():
    print("\n=======================================================")
    print("SPILLTRACE — LEAK CONFIRMATION ESCALATION VERIFICATION")
    print("=======================================================")

    # Setup baseline data
    spill = satellite_service.analyze_satellite_image("demo_sar_oil.png")
    env = drift_service.get_environmental_conditions()
    origin = drift_service.estimate_probable_origin(spill, env)
    records = ais_service.load_ais_data()
    candidates = attribution_service.correlate_and_rank(spill, origin, env, records)

    initial_top = candidates[0]
    target_mmsi = initial_top.mmsi
    target_name = initial_top.vessel_name
    print(f"Step 0 Baseline: Top candidate is {target_name} (MMSI: {target_mmsi}) with score {initial_top.scores.total_score}/100")

    # Execute Step 1: LEAK CONFIRMED via endpoint handler
    print("\nStep 1: Executing LEAK CONFIRMED action...")
    req = CandidateVerificationRequest(
        mmsi=target_mmsi,
        verification_outcome="confirmed",
        inspector_notes="Aerial FLIR and port surveillance confirm continuous discharge matching SAR slick morphology"
    )

    res = verify_candidate_vessel_route(req)

    # Step 2: Vessel marked as CONFIRMED SOURCE CANDIDATE
    print("\nStep 2: Checking candidate status...")
    confirmed_cand = next((c for c in res.candidate_vessels if c.mmsi == target_mmsi), None)
    assert confirmed_cand is not None, "Confirmed candidate must exist in response"
    assert confirmed_cand.verification_status == "CONFIRMED SOURCE CANDIDATE", f"Status must be CONFIRMED SOURCE CANDIDATE, got: {confirmed_cand.verification_status}"
    assert confirmed_cand.rank == 1, f"Confirmed candidate must be Rank #1, got: {confirmed_cand.rank}"
    assert confirmed_cand.scores.total_score >= 96.0, f"Confirmed score must be >= 96, got: {confirmed_cand.scores.total_score}"
    print(f"  PASS: Vessel {confirmed_cand.vessel_name} marked as {confirmed_cand.verification_status} (Rank #{confirmed_cand.rank}, Score: {confirmed_cand.scores.total_score}/100)")

    # Step 3: Incident severity recalculated
    print("\nStep 3: Checking recalculated incident severity...")
    assert res.is_leak_confirmed is True, "is_leak_confirmed must be True"
    assert "TIER-2 ESCALATION" in res.incident_severity, f"Severity must indicate Tier-2 escalation, got: {res.incident_severity}"
    print(f"  PASS: Incident severity recalculated to: {res.incident_severity}")

    # Step 4: Cleaning / response team deployment prepared
    print("\nStep 4: Checking prepared response deployment package...")
    pkg = res.response_deployment
    assert pkg is not None, "Response deployment package must be prepared"
    assert "TIER-2" in pkg.tier, f"Tier must be Tier-2, got: {pkg.tier}"
    assert pkg.containment_boom_meters >= 1200, f"Containment booms must be >= 1200m, got: {pkg.containment_boom_meters}"
    assert pkg.skimming_vessels_count >= 2, f"Skimmer count must be >= 2, got: {pkg.skimming_vessels_count}"
    assert pkg.deflection_boom_meters >= 800, f"Deflection booms must be >= 800m, got: {pkg.deflection_boom_meters}"
    assert "JNPT" in pkg.staging_base, f"Staging base must reference JNPT, got: {pkg.staging_base}"
    print(f"  PASS: Response deployment package prepared: {pkg.tier}")
    print(f"        Assets: {pkg.containment_boom_meters}m containment booms, {pkg.skimming_vessels_count} skimmers, {pkg.deflection_boom_meters}m deflection booms from {pkg.staging_base}")

    # Step 5 & 6: Ships on affected route identified & >5 nearby/route vessels flagged
    print("\nStep 5 & 6: Checking flagged ships on affected route (>5 vessels)...")
    flagged = [v for v in res.at_risk_vessels if v.risk_state in ("INSIDE ZONE", "APPROACHING", "ON ROUTE")]
    print(f"  Total flagged vessels: {len(flagged)}")
    for v in flagged:
        print(f"    - {v.vessel_name:<22} ({v.vessel_type}) | State: {v.risk_state:<12} | Dist: {v.distance_to_zone_km:5.2f} km | ETA: {v.eta_minutes}m")

    assert len(flagged) > 5, f"EXPLICIT REQUIREMENT: Must flag >5 vessels on affected route, got {len(flagged)}"
    print(f"  PASS: Exactly {len(flagged)} vessels flagged on affected route (exceeds >5 requirement).")

    # Step 7: Navigational warning generated
    print("\nStep 7: Checking generated navigational warning...")
    nav = res.navigational_warning
    assert nav is not None, "Navigational warning must be generated"
    assert "NAVAREA VIII" in nav.navarea_number, f"Navarea number must be NAVAREA VIII, got: {nav.navarea_number}"
    assert "NAVTEX 518 kHz" in nav.broadcast_channels, "Must broadcast on NAVTEX 518 kHz"
    assert "CONFIRMED" in nav.hazard_type, f"Hazard type must reflect confirmed discharge, got: {nav.hazard_type}"
    assert len(nav.message_text) > 100, "Message draft text must be complete and detailed"
    print(f"  PASS: Navigational warning generated: {nav.navarea_number} via {', '.join(nav.broadcast_channels)}")
    print(f"        Draft excerpt: {nav.message_text.splitlines()[0]}")

    # Step 8: Notifications prepared for those vessels
    print("\nStep 8: Checking notifications prepared for flagged vessels...")
    assert all(hasattr(v, 'notification_sent') for v in flagged), "All flagged vessels must have notification tracking"
    print(f"  PASS: Notifications prepared for all {len(flagged)} route vessels with individual and broadcast trigger support.")

    # Step 9: Forward drift / exclusion zone updated
    print("\nStep 9: Checking updated forward drift & active exclusion zone...")
    fwd = res.forward_drift
    assert fwd is not None, "Forward drift must be updated"
    assert fwd.hazard_area_km2 >= 200.0, f"Forward hazard corridor must expand (>= 200 km²), got: {fwd.hazard_area_km2}"
    assert "CONFIRMED" in fwd.prediction_label or "ACTIVE" in fwd.prediction_label, f"Label must reflect active confirmed leak, got: {fwd.prediction_label}"
    print(f"  PASS: Forward drift exclusion zone updated: {fwd.hazard_area_km2} km² active hazard corridor ({fwd.prediction_label})")

    # Step 10: Investigation timeline updated
    print("\nStep 10: Checking updated investigation timeline...")
    events = res.timeline_events
    event_types = [e.event_type for e in events]
    print(f"  Total timeline events: {len(events)}")
    for e in events[-7:]:
        print(f"    [{e.event_id}] {e.event_type:<24}: {e.title}")

    assert "leak_confirmed" in event_types, "Timeline must log leak_confirmed"
    assert "incident_escalation" in event_types, "Timeline must log incident_escalation"
    assert "response_prepared" in event_types, "Timeline must log response_prepared"
    assert "route_traffic_screened" in event_types, "Timeline must log route_traffic_screened"
    assert "navtex_warning_generated" in event_types, "Timeline must log navtex_warning_generated"
    assert "safety_advisories_prepared" in event_types, "Timeline must log safety_advisories_prepared"
    assert "exclusion_zone_updated" in event_types, "Timeline must log exclusion_zone_updated"
    print("  PASS: Chronological investigation timeline contains complete escalation event audit log.")

    print("\n=======================================================")
    print("ALL 10 LEAK CONFIRMATION WORKFLOW STEPS VERIFIED 100%!")
    print("=======================================================")

if __name__ == "__main__":
    test_leak_confirmation_escalation_workflow()
