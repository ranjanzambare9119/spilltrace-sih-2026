"""
SpillTrace - Hydrodynamic Drift Service
Models backward leeway drift trajectory using wind and ocean current vector addition.
Estimates the Probable Origin Region and spatial-temporal dispersion boundaries.
"""

import os
import json
import math
from datetime import datetime, timedelta
from typing import Dict, Any, List, Tuple
from backend.models.schemas import EnvironmentalConditions, ProbableOriginEstimate, SpillDetection

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, "data")
ENV_PATH = os.path.join(DATA_DIR, "environment", "environment.json")

class DriftService:
    def __init__(self):
        pass

    def get_environmental_conditions(self) -> EnvironmentalConditions:
        """Reads local oceanographic environmental factors (wind and surface currents)."""
        if os.path.exists(ENV_PATH):
            try:
                with open(ENV_PATH, "r") as f:
                    data = json.load(f)
                    return EnvironmentalConditions(**data)
            except Exception as e:
                print(f"Error loading environment data, falling back to defaults: {e}")
        return EnvironmentalConditions()

    def estimate_probable_origin(
        self,
        spill: SpillDetection,
        env: EnvironmentalConditions = None,
        estimated_age_hours: float = 5.5,
        uncertainty_km: float = 3.5
    ) -> ProbableOriginEstimate:
        """
        Computes backward leeway trajectory from detected spill centroid to probable origin.
        Uses standard IMO/NOAA leeway drift formulation:
        V_drift = V_current + alpha * V_wind
        """
        if env is None:
            env = self.get_environmental_conditions()

        # Wind leeway component: typically 3% - 4% of 10m wind speed
        w_speed_kts = env.wind_speed * env.leeway_factor
        w_rad = math.radians(env.wind_direction)

        # Current component
        c_speed_kts = env.current_speed
        c_rad = math.radians(env.current_direction)

        # Vector addition (x = East, y = North)
        net_dx_kts = (c_speed_kts * math.sin(c_rad)) + (w_speed_kts * math.sin(w_rad))
        net_dy_kts = (c_speed_kts * math.cos(c_rad)) + (w_speed_kts * math.cos(w_rad))

        net_drift_speed_kts = math.sqrt(net_dx_kts**2 + net_dy_kts**2)
        net_drift_dir_deg = (math.degrees(math.atan2(net_dx_kts, net_dy_kts))) % 360

        # Total forward drift distance in Nautical Miles and km
        total_drift_nm = net_drift_speed_kts * estimated_age_hours
        total_drift_km = total_drift_nm * 1.852

        # Backward direction (180 degrees opposite to drift)
        back_bearing_deg = (net_drift_dir_deg + 180) % 360
        back_rad = math.radians(back_bearing_deg)

        # Earth coordinate displacement
        # 1 deg latitude ~ 111.0 km
        # 1 deg longitude ~ 111.0 * cos(lat) km
        d_lat = (total_drift_km * math.cos(back_rad)) / 111.0
        d_lon = (total_drift_km * math.sin(back_rad)) / (111.0 * math.cos(math.radians(spill.latitude)))

        origin_lat = round(spill.latitude + d_lat, 4)
        origin_lon = round(spill.longitude + d_lon, 4)

        # Generate intermediate path points (from spill backward to origin) for map trajectory line
        num_steps = 10
        backward_path = []
        for s in range(num_steps + 1):
            fraction = s / num_steps
            p_lat = round(spill.latitude + (fraction * d_lat), 5)
            p_lon = round(spill.longitude + (fraction * d_lon), 5)
            backward_path.append([p_lat, p_lon])

        # Release time calculation
        try:
            det_dt = datetime.strptime(spill.detection_time, "%Y-%m-%dT%H:%M:%SZ")
        except Exception:
            det_dt = datetime(2026, 9, 6, 6, 0, 0)

        est_release_dt = det_dt - timedelta(hours=estimated_age_hours)
        window_start_dt = est_release_dt - timedelta(minutes=45)
        window_end_dt = est_release_dt + timedelta(minutes=45)

        return ProbableOriginEstimate(
            spill_id=spill.spill_id,
            detected_latitude=spill.latitude,
            detected_longitude=spill.longitude,
            net_drift_speed_kts=round(net_drift_speed_kts, 2),
            net_drift_direction_deg=round(net_drift_dir_deg, 1),
            estimated_drift_hours=estimated_age_hours,
            total_drift_distance_km=round(total_drift_km, 2),
            probable_origin_latitude=origin_lat,
            probable_origin_longitude=origin_lon,
            origin_uncertainty_km=uncertainty_km,
            estimated_release_time=est_release_dt.strftime("%Y-%m-%dT%H:%M:%SZ"),
            release_window_start=window_start_dt.strftime("%Y-%m-%dT%H:%M:%SZ"),
            release_window_end=window_end_dt.strftime("%Y-%m-%dT%H:%M:%SZ"),
            backward_drift_path=backward_path
        )

drift_service = DriftService()
