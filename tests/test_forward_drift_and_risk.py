"""
SpillTrace - Forward Drift, Exclusion Zone & Risk Verification Test Suite
Tests:
1. Forward drift trajectory & expanding exclusion zone polygon
2. At-risk vessel identification (INSIDE ZONE, APPROACHING, OUTSIDE RISK)
3. Interactive Candidate Verification feedback loop & dynamic reranking
4. Conditional response action generation
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.satellite_service import satellite_service
from backend.services.drift_service import drift_service
from backend.services.ais_service import ais_service
from backend.services.attribution_service import attribution_service
from backend.services.response_service import response_service

try:
    import pytest
except ImportError:
    class MockPytest:
        def fixture(self, f):
            return f
    pytest = MockPytest()

def get_fixtures():
    spill = satellite_service.analyze_satellite_image("demo_sar_oil.png")
    env = drift_service.get_environmental_conditions()
    fwd = drift_service.predict_forward_drift(spill, env, forecast_hours=6.0)
    records = ais_service.load_ais_data()
    at_risk = ais_service.identify_at_risk_vessels(records, fwd)
    return fwd, at_risk

def test_forward_drift_prediction():
    print("\n--- TEST 1: Forward Drift Prediction & Exclusion Zone ---")
    spill = satellite_service.analyze_satellite_image("demo_sar_oil.png")
    env = drift_service.get_environmental_conditions()
    fwd_inst = drift_service.predict_forward_drift(spill, env, forecast_hours=6.0)

    print(f"Detected: ({fwd_inst.detected_latitude}, {fwd_inst.detected_longitude})")
    print(f"Net Drift: {fwd_inst.net_drift_speed_kts} kts @ {fwd_inst.net_drift_direction_deg}°")
    print(f"Predicted (+6h): ({fwd_inst.predicted_latitude}, {fwd_inst.predicted_longitude}), Distance: {fwd_inst.total_forward_distance_km} km")
    print(f"Hazard Area: {fwd_inst.hazard_area_km2} km², Polygon Vertices: {len(fwd_inst.exclusion_zone_polygon)}")

    assert fwd_inst.total_forward_distance_km > 0, "Forward drift distance must be positive"
    assert len(fwd_inst.forward_drift_path) >= 10, "Forward path must have intermediate points"
    assert len(fwd_inst.exclusion_zone_polygon) >= 10, "Exclusion zone polygon must be closed"
    assert "PROTOTYPE PREDICTION" in fwd_inst.prediction_label
    print("PASS: Forward drift and exclusion zone polygon generated successfully.")
    return fwd_inst

def test_at_risk_vessels(fwd):
    print("\n--- TEST 2: At-Risk Vessel Flagging ---")
    records = ais_service.load_ais_data()
    at_risk = ais_service.identify_at_risk_vessels(records, fwd)

    print(f"Total screened vessels: {len(at_risk)}")
    for v in at_risk:
        print(f"  [{v.risk_state:^13}] {v.vessel_name:<24} Dist: {v.distance_to_zone_km:5.2f} km | Spd: {v.speed:4.1f} kts | Hdg: {v.heading:5.1f}° | ETA: {v.eta_minutes}")

    states = {v.risk_state for v in at_risk}
    assert "INSIDE ZONE" in states or "APPROACHING" in states, "Should flag vessels at risk"
    assert len(at_risk) >= 10, "Should evaluate all 10 candidate vessels"
    print("PASS: At-risk vessels flagged correctly.")
    return at_risk

def test_candidate_verification_loop():
    print("\n--- TEST 3: Candidate Verification Feedback Loop & Reranking ---")
    spill = satellite_service.analyze_satellite_image("demo_sar_oil.png")
    env = drift_service.get_environmental_conditions()
    origin = drift_service.estimate_probable_origin(spill, env)
    records = ais_service.load_ais_data()
    candidates = attribution_service.correlate_and_rank(spill, origin, env, records)

    initial_top = candidates[0]
    print(f"Initial #1 Candidate: {initial_top.vessel_name} (Score: {initial_top.scores.total_score}/100)")
    assert "Ocean Pioneer" in initial_top.vessel_name, "Ocean Pioneer should initially rank #1"

    # Investigator marks LEAK NOT DETECTED
    reranked = attribution_service.apply_verification_outcome(
        candidates=candidates,
        target_mmsi=initial_top.mmsi,
        outcome="not_detected",
        notes="Port inspection confirmed clean tanks and bilges, no active discharge"
    )

    new_top = reranked[0]
    pioneer = next(c for c in reranked if c.mmsi == initial_top.mmsi)
    print(f"After 'NOT DETECTED' Verification:")
    print(f"  Ocean Pioneer New Score: {pioneer.scores.total_score}/100 (Status: {pioneer.verification_status}, Rank: {pioneer.rank})")
    print(f"  New #1 Promoted Candidate: {new_top.vessel_name} (Score: {new_top.scores.total_score}/100, Rank: {new_top.rank})")

    assert pioneer.scores.total_score < 45, "Penalized score must drop substantially"
    assert new_top.mmsi != initial_top.mmsi, "A different candidate must be promoted to #1"
    assert new_top.rank == 1, "New top must have rank 1"

    # Investigator restores to CONFIRMED
    reranked_conf = attribution_service.apply_verification_outcome(
        candidates=reranked,
        target_mmsi=initial_top.mmsi,
        outcome="confirmed"
    )
    pioneer_conf = next(c for c in reranked_conf if c.mmsi == initial_top.mmsi)
    print(f"After 'CONFIRMED' Verification: Ocean Pioneer Score: {pioneer_conf.scores.total_score}/100 (Rank: {pioneer_conf.rank})")
    assert pioneer_conf.rank == 1, "Ocean Pioneer should return to #1 upon confirmation"
    print("PASS: Candidate verification and dynamic reranking loop verified.")

def test_conditional_response_actions(fwd, at_risk):
    print("\n--- TEST 4: Conditional Response Actions ---")
    spill = satellite_service.analyze_satellite_image("demo_sar_oil.png")
    env = drift_service.get_environmental_conditions()
    origin = drift_service.estimate_probable_origin(spill, env)
    records = ais_service.load_ais_data()
    candidates = attribution_service.correlate_and_rank(spill, origin, env, records)

    actions = response_service.generate_recommended_actions(spill, origin, candidates, at_risk, fwd)
    print(f"Generated {len(actions)} Conditional Response Actions for Major Spill:")
    for a in actions:
        print(f"  [{a.priority:^8}] ({a.category:<14}) {a.title}")
        print(f"             Rationale: {a.rationale[:90]}...")

    action_titles = [a.title for a in actions]
    assert any("Booms" in t for t in action_titles), "Must recommend containment booms for major spill"
    assert any("Navigational" in t for t in action_titles), "Must recommend navigational warning when exclusion zone active"

    # Test for minor spill
    spill_minor = satellite_service.analyze_satellite_image("demo_sar_oil.png", scenario_override="scenario_small_low_conf")
    actions_minor = response_service.generate_recommended_actions(spill_minor, origin, candidates, at_risk, fwd)
    print(f"\nGenerated {len(actions_minor)} Conditional Actions for Minor Spill:")
    for a in actions_minor:
        print(f"  [{a.priority:^8}] {a.title}")
    assert any("Recheck" in a.title for a in actions_minor), "Minor spill must recommend recheck"
    assert not any("Deploy Offshore Containment" in a.title for a in actions_minor), "Minor spill should not deploy heavy offshore booms"
    print("PASS: Conditional response action generation verified.")

if __name__ == "__main__":
    fwd = test_forward_drift_prediction()
    at_risk = test_at_risk_vessels(fwd)
    test_candidate_verification_loop()
    test_conditional_response_actions(fwd, at_risk)
    print("\n==================================================")
    print("ALL FORWARD DRIFT & RISK TESTS PASSED SUCCESSFULLY!")
    print("==================================================")
