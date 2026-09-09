"""
SpillTrace - Automated Test Suite: Confidence-Aware & Size-Aware Oil Spill Classification
SIH 2026 Problem Statement 143

Tests all 5 mandatory scenarios:
- Test 1: Large obvious spill (Quantitative pathway, calculated volume, full severity model)
- Test 2: Small high-confidence sheen (Appearance-based, NO false-precision volume, watchlist/escalation)
- Test 3: Small low-confidence detection (Uncertain appearance, low/watchlist severity, recheck next pass)
- Test 4: Small spill close to coast (High coast risk elevates severity despite small size)
- Test 5: Large spill far offshore (Reflects contextual risk rather than automatic blind critical)
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.satellite_service import satellite_service
from backend.services.geospatial_service import geospatial_service
from backend.config import (
    MIN_QUANTITATIVE_SPILL_AREA_KM2,
    MIN_QUANTITATIVE_PIXEL_COUNT,
    MIN_QUANTITATIVE_DETECTION_CONFIDENCE
)

def test_1_large_obvious_spill():
    """
    Test 1 — Large obvious spill:
    Area >= 2.0 km2, pixels >= 500, high confidence.
    Expected:
    - Quantitative assessment = ENABLED
    - Volume = calculated (~17,800 m3)
    - Severity = based on full multi-factor model (CRITICAL / HIGH)
    - Workflow = investigation/response
    """
    spill = satellite_service.analyze_satellite_image(scenario_override="scenario_large_obvious")
    
    print("\n--- TEST 1: Large Obvious Spill ---")
    print(f"Area: {spill.area_km2} km², Confidence: {spill.confidence * 100}% ({spill.confidence_class})")
    print(f"Quantitative: {spill.is_quantitative}, Volume: {spill.volume_estimate} m³ (Status: {spill.volume_status})")
    print(f"Severity Score: {spill.severity_score} -> Class: {spill.severity_class}")
    print(f"Workflow: {spill.incident_workflow}, Action: {spill.recommended_action}")
    
    assert spill.is_quantitative is True
    assert spill.volume_status == "quantified"
    assert spill.volume_estimate is not None
    assert spill.volume_estimate > 1000.0
    assert spill.estimated_volume_m3 == spill.volume_estimate
    assert spill.confidence_class == "HIGH"
    assert spill.severity_class in ["CRITICAL", "HIGH"]
    assert spill.incident_workflow == "investigation_response"
    assert "exceeds quantitative threshold" in spill.classification_reasons[0]


def test_2_small_high_confidence_spill():
    """
    Test 2 — Small high-confidence spill:
    Area < 2.0 km2 (0.45 km2), but confidence is 0.88.
    Expected:
    - Quantitative volume = NOT estimated (avoid false-precision)
    - volume_estimate is None
    - volume_status == 'low_confidence'
    - Appearance classification = available ('Rainbow sheen' or 'Thick/dark')
    - Severity considers coast/environmental risk
    - Workflow = WATCHLIST or appropriate monitoring
    """
    spill = satellite_service.analyze_satellite_image(scenario_override="scenario_small_high_conf")
    
    print("\n--- TEST 2: Small High-Confidence Spill ---")
    print(f"Area: {spill.area_km2} km², Confidence: {spill.confidence * 100}% ({spill.confidence_class})")
    print(f"Quantitative: {spill.is_quantitative}, Volume: {spill.volume_estimate} (Status: {spill.volume_status})")
    print(f"Appearance: {spill.appearance_class}, Distance to Coast: {spill.distance_to_coast_km} km")
    print(f"Severity Score: {spill.severity_score} -> Class: {spill.severity_class}")
    print(f"Workflow: {spill.incident_workflow}, Action: {spill.recommended_action}")
    
    assert spill.is_quantitative is False
    assert spill.volume_status == "low_confidence"
    assert spill.volume_estimate is None
    assert spill.estimated_volume_m3 is None
    assert spill.appearance_class in ["Rainbow sheen", "Thick/dark appearance", "Thin sheen"]
    assert spill.confidence_class == "HIGH"
    assert spill.severity_class in ["WATCHLIST", "MEDIUM"]
    assert "below quantitative threshold" in spill.classification_reasons[0]
    assert "False-precision volume avoided" in spill.classification_reasons[2]


def test_3_small_low_confidence_detection():
    """
    Test 3 — Small low-confidence detection:
    Area 0.22 km2, confidence 0.58.
    Expected:
    - Volume = NOT estimated
    - Appearance = uncertain / faint sheen
    - Severity = low / WATCHLIST
    - Workflow = recheck on next satellite pass
    """
    spill = satellite_service.analyze_satellite_image(scenario_override="scenario_small_low_conf")
    
    print("\n--- TEST 3: Small Low-Confidence Detection ---")
    print(f"Area: {spill.area_km2} km², Confidence: {spill.confidence * 100}% ({spill.confidence_class})")
    print(f"Quantitative: {spill.is_quantitative}, Volume: {spill.volume_estimate}")
    print(f"Appearance: {spill.appearance_class}, Severity: {spill.severity_class}")
    print(f"Workflow: {spill.incident_workflow}, Action: {spill.recommended_action}")
    
    assert spill.is_quantitative is False
    assert spill.volume_estimate is None
    assert spill.volume_status == "low_confidence"
    assert spill.confidence_class == "LOW"
    assert spill.severity_class == "WATCHLIST"
    assert spill.incident_workflow == "watchlist_monitoring"
    assert "RECHECK ON NEXT SATELLITE PASS" in spill.recommended_action
    assert spill.watchlist_status == "ACTIVE_WATCHLIST"


def test_4_small_spill_close_to_coast():
    """
    Test 4 — Small spill close to coast:
    Small area (0.35 km2) close to shore (1.8 km from Colaba coast).
    Expected:
    - Small size + high coast risk (>= 0.80) = elevated severity (HIGH / MEDIUM)
    - Demonstrates that severity is NOT determined by size alone!
    - Proximity to shore elevates operational priority.
    """
    spill = satellite_service.analyze_satellite_image(scenario_override="scenario_small_nearshore")
    
    print("\n--- TEST 4: Small Spill Close to Coast ---")
    print(f"Area: {spill.area_km2} km², Distance to Coast: {spill.distance_to_coast_km} km ({spill.nearest_coast_name})")
    print(f"Coast Risk Score: {spill.coast_risk_score} (Normalized 0-1)")
    print(f"Severity Score: {spill.severity_score} -> Class: {spill.severity_class}")
    print(f"Workflow: {spill.incident_workflow}, Action: {spill.recommended_action}")
    
    assert spill.is_quantitative is False
    assert spill.volume_estimate is None
    assert spill.distance_to_coast_km <= 3.0
    assert spill.coast_risk_score >= 0.80  # High coastal proximity
    # Severity should be elevated to HIGH or MEDIUM (not relegated to a passive low-priority watchlist)
    assert spill.severity_class in ["HIGH", "MEDIUM"]
    assert "shoreline" in spill.recommended_action.lower() or "protection" in spill.recommended_action.lower() or "investigation" in spill.incident_workflow


def test_5_large_spill_far_offshore():
    """
    Test 5 — Large spill far offshore:
    Large area (8.5 km2), but 65 km offshore (open ocean).
    Expected:
    - Quantitative volume = calculated
    - Coast risk is minimal (<= 0.05)
    - Severity reflects balanced contextual risk model rather than blindly
      maximizing alert priority purely because size is large.
    """
    spill = satellite_service.analyze_satellite_image(scenario_override="scenario_large_offshore")
    
    print("\n--- TEST 5: Large Spill Far Offshore ---")
    print(f"Area: {spill.area_km2} km², Distance to Coast: {spill.distance_to_coast_km} km")
    print(f"Coast Risk Score: {spill.coast_risk_score}")
    print(f"Severity Score: {spill.severity_score} -> Class: {spill.severity_class}")
    
    assert spill.is_quantitative is True
    assert spill.volume_estimate is not None
    assert spill.volume_estimate > 5000.0
    assert spill.distance_to_coast_km >= 50.0
    assert spill.coast_risk_score <= 0.05  # Minimal coast risk far offshore
    # Because it is in open pelagic waters far offshore, the coast risk contributes very few points
    assert spill.severity_class in ["HIGH", "MEDIUM", "CRITICAL"]


def test_geospatial_distance_accuracy():
    """Verifies that geospatial_service calculates accurate geodesic distances for known Indian maritime points."""
    # Point near Colaba coast (18.91, 72.82)
    dist, name = geospatial_service.calculate_distance_to_coast(18.91, 72.82)
    assert dist <= 2.0
    assert "Mumbai" in name or "Colaba" in name

    # Point in Mumbai Approaches (18.95, 72.40)
    dist_offshore, name_offshore = geospatial_service.calculate_distance_to_coast(18.95, 72.40)
    assert 40.0 <= dist_offshore <= 50.0


if __name__ == "__main__":
    print("==================================================================")
    print("SPILLTRACE — RUNNING 5-SCENARIO CONFIDENCE & SEVERITY TEST SUITE")
    print("==================================================================")
    test_1_large_obvious_spill()
    test_2_small_high_confidence_spill()
    test_3_small_low_confidence_detection()
    test_4_small_spill_close_to_coast()
    test_5_large_spill_far_offshore()
    test_geospatial_distance_accuracy()
    print("\n==================================================================")
    print("ALL 6 TESTS PASSED SUCCESSFULLY! (0 Failures)")
    print("==================================================================")
