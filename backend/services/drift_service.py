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
from backend.models.schemas import (
    EnvironmentalConditions, 
    ProbableOriginEstimate, 
    SpillDetection,
    ForwardDriftPrediction
)

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

    def predict_forward_drift(
        self,
        spill: SpillDetection,
        env: EnvironmentalConditions = None,
        forecast_hours: float = 6.0,
        uncertainty_growth_rate: float = 0.5,
        is_confirmed: bool = False
    ) -> ForwardDriftPrediction:
        """
        Computes forward leeway trajectory and generates a future risk corridor & exclusion zone.
        When is_confirmed is True, expands to a 12-hour continuous discharge safety corridor.
        Uses standard IMO/NOAA leeway drift formulation:
        V_drift = V_current + alpha * V_wind
        """
        if is_confirmed and forecast_hours == 6.0:
            forecast_hours = 12.0

        if env is None:
            env = self.get_environmental_conditions()

        # Wind leeway component
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

        # Forward drift distance
        total_drift_nm = net_drift_speed_kts * forecast_hours
        total_drift_km = total_drift_nm * 1.852

        fwd_rad = math.radians(net_drift_dir_deg)

        # Displacement
        d_lat = (total_drift_km * math.cos(fwd_rad)) / 111.0
        d_lon = (total_drift_km * math.sin(fwd_rad)) / (111.0 * math.cos(math.radians(spill.latitude)))

        pred_lat = round(spill.latitude + d_lat, 4)
        pred_lon = round(spill.longitude + d_lon, 4)

        # Generate forward path points [lat, lon, t_hours, radius_km]
        num_steps = 10
        forward_path = []
        base_radius_km = max(1.5, math.sqrt(spill.area_km2 / math.pi)) if spill.area_km2 else 2.0

        for s in range(num_steps + 1):
            fraction = s / num_steps
            t_h = round(fraction * forecast_hours, 1)
            p_lat = round(spill.latitude + (fraction * d_lat), 5)
            p_lon = round(spill.longitude + (fraction * d_lon), 5)
            radius_km = round(base_radius_km + (t_h * uncertainty_growth_rate * 0.8), 2)
            forward_path.append([p_lat, p_lon, t_h, radius_km])

        # Generate Exclusion Zone Polygon around corridor
        perp_bearing_left = (net_drift_dir_deg - 90) % 360
        perp_bearing_right = (net_drift_dir_deg + 90) % 360
        left_rad = math.radians(perp_bearing_left)
        right_rad = math.radians(perp_bearing_right)

        cos_lat = math.cos(math.radians(spill.latitude))
        polygon_left = []
        polygon_right = []

        buffer_offset = 2.5 if is_confirmed else 1.5
        for pt in forward_path:
            p_lat, p_lon, _, r_km = pt
            buf_km = r_km + buffer_offset
            l_lat = round(p_lat + (buf_km * math.cos(left_rad)) / 111.0, 5)
            l_lon = round(p_lon + (buf_km * math.sin(left_rad)) / (111.0 * cos_lat), 5)
            polygon_left.append([l_lat, l_lon])
            
            r_lat = round(p_lat + (buf_km * math.cos(right_rad)) / 111.0, 5)
            r_lon = round(p_lon + (buf_km * math.sin(right_rad)) / (111.0 * cos_lat), 5)
            polygon_right.append([r_lat, r_lon])

        exclusion_zone_polygon = polygon_left + list(reversed(polygon_right))

        final_uncertainty_km = round(base_radius_km + (forecast_hours * uncertainty_growth_rate), 1)
        if is_confirmed:
            hazard_area_km2 = 220.0
            label = "UPDATED ACTIVE HAZARD EXCLUSION ZONE (LEAK CONFIRMED)"
        else:
            avg_width_km = (forward_path[0][3] + forward_path[-1][3]) + 3.0
            hazard_area_km2 = round(total_drift_km * avg_width_km, 1)
            label = "FORWARD DRIFT PREDICTION (SIMPLIFIED / PROTOTYPE PREDICTION)"

        return ForwardDriftPrediction(
            spill_id=spill.spill_id,
            detected_latitude=spill.latitude,
            detected_longitude=spill.longitude,
            net_drift_speed_kts=round(net_drift_speed_kts, 2),
            net_drift_direction_deg=round(net_drift_dir_deg, 1),
            forecast_hours=forecast_hours,
            predicted_latitude=pred_lat,
            predicted_longitude=pred_lon,
            total_forward_distance_km=round(total_drift_km, 2),
            forward_drift_path=forward_path,
            exclusion_zone_polygon=exclusion_zone_polygon,
            uncertainty_radius_km=final_uncertainty_km,
            hazard_area_km2=hazard_area_km2,
            prediction_label=label
        )

drift_service = DriftService()
