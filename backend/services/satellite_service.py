"""
SpillTrace - Satellite Service
Handles satellite scene ingestion, SAR backscatter analysis, and oil spill segmentation.
"""

import os
import json
import xml.etree.ElementTree as ET
from typing import Dict, Any, List, Optional
from ml.detector_interface import MockUNetDetector
from backend.models.schemas import SpillDetection

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, "data")
SATELLITE_DIR = os.path.join(DATA_DIR, "satellite")
MASKS_DIR = os.path.join(DATA_DIR, "masks")
META_PATH = os.path.join(DATA_DIR, "spill_metadata.json")
ANNOTATION_XML = os.path.join(MASKS_DIR, "source_annotation.xml")

class SatelliteService:
    def __init__(self):
        self.detector = MockUNetDetector()

    def parse_voc_annotation(self, xml_path: str = ANNOTATION_XML) -> Optional[Dict[str, Any]]:
        """Parses Pascal VOC XML annotation for Sentinel-1 oil bounding boxes."""
        if not os.path.exists(xml_path):
            return None
        try:
            tree = ET.parse(xml_path)
            root = tree.getroot()
            size_elem = root.find("size")
            width = int(size_elem.find("width").text) if size_elem is not None else 640
            height = int(size_elem.find("height").text) if size_elem is not None else 640
            
            obj_elem = root.find("object")
            if obj_elem is not None:
                name = obj_elem.find("name").text if obj_elem.find("name") is not None else "oil"
                bnd = obj_elem.find("bndbox")
                if bnd is not None:
                    xmin = int(bnd.find("xmin").text)
                    ymin = int(bnd.find("ymin").text)
                    xmax = int(bnd.find("xmax").text)
                    ymax = int(bnd.find("ymax").text)
                    return {
                        "name": name,
                        "width": width,
                        "height": height,
                        "bbox": {
                            "xmin": xmin,
                            "ymin": ymin,
                            "xmax": xmax,
                            "ymax": ymax
                        },
                        "rel_bbox": {
                            "x": round(xmin / width, 4),
                            "y": round(ymin / height, 4),
                            "width": round((xmax - xmin) / width, 4),
                            "height": round((ymax - ymin) / height, 4)
                        }
                    }
        except Exception as e:
            print(f"Warning: Error parsing VOC annotation '{xml_path}': {e}")
        return None
        
    def list_available_images(self) -> List[Dict[str, Any]]:
        """
        Returns available satellite/SAR demonstration scenes in local storage.
        Priority order:
        1. demo_sar_oil.png (Primary Hero Visual - Synthetic SAR-like Demonstration)
        2. real_spill.jpg (Real Dataset Reference - Sentinel-1 SAR)
        3. sample_spill.png (Synthetic Benchmark Scenario - Fallback)
        """
        if not os.path.exists(SATELLITE_DIR):
            return []
            
        real_voc = self.parse_voc_annotation()
        items = []

        # 1. Primary Hero Image: Synthetic SAR-like Demonstration
        hero_fpath = os.path.join(SATELLITE_DIR, "demo_sar_oil.png")
        if os.path.exists(hero_fpath):
            mask_path = os.path.join(MASKS_DIR, "demo_sar_oil_mask.png")
            items.append({
                "id": "demo_sar_oil.png",
                "filename": "demo_sar_oil.png",
                "label": "Synthetic SAR-like Demonstration (Hero Visual)",
                "satellite": "Synthetic SAR-like Demonstration",
                "mode": "Simulated SAR Backscatter",
                "polarization": "VV",
                "path": hero_fpath,
                "is_real_data": False,
                "is_synthetic_hero": True,
                "data_tag": "SYNTHETIC SAR-LIKE DEMONSTRATION",
                "detection_label": "Prototype Segmentation",
                "scenario_location_label": "Prototype Scenario Coordinates",
                "has_annotation": False,
                "bbox": {"xmin": 484, "ymin": 248, "xmax": 1019, "ymax": 806},
                "rel_bbox": {"x": 0.3860, "y": 0.1978, "width": 0.4266, "height": 0.4450},
                "has_mask": os.path.exists(mask_path),
                "size_bytes": os.path.getsize(hero_fpath),
                "image_url": "/static/satellite/demo_sar_oil.png",
                "mask_url": "/static/masks/demo_sar_oil_mask.png" if os.path.exists(mask_path) else None,
                "boundary_url": "/static/masks/demo_sar_oil_boundary.png" if os.path.exists(os.path.join(MASKS_DIR, "demo_sar_oil_boundary.png")) else None
            })

        # 2. Real Dataset Reference: Sentinel-1 SAR Scene
        real_fpath = os.path.join(SATELLITE_DIR, "real_spill.jpg")
        if os.path.exists(real_fpath):
            mask_path = os.path.join(MASKS_DIR, "real_spill_mask.png")
            items.append({
                "id": "real_spill.jpg",
                "filename": "real_spill.jpg",
                "label": "Real Dataset Reference (Sentinel-1 SAR)",
                "satellite": "Sentinel-1 SAR",
                "mode": "Interferometric Wide (IW)",
                "polarization": "VV",
                "path": real_fpath,
                "is_real_data": True,
                "is_synthetic_hero": False,
                "data_tag": "REAL DATASET REFERENCE",
                "detection_label": "Prototype Detection / Annotated Region",
                "scenario_location_label": "Prototype Scenario Coordinates",
                "has_annotation": real_voc is not None,
                "bbox": real_voc["bbox"] if real_voc else {"xmin": 345, "ymin": 297, "xmax": 368, "ymax": 343},
                "rel_bbox": real_voc["rel_bbox"] if real_voc else {"x": 0.5391, "y": 0.4641, "width": 0.0359, "height": 0.0719},
                "has_mask": os.path.exists(mask_path),
                "size_bytes": os.path.getsize(real_fpath),
                "image_url": "/static/satellite/real_spill.jpg",
                "mask_url": "/static/masks/real_spill_mask.png" if os.path.exists(mask_path) else None
            })

        # 3. Fallback: Synthetic benchmark scenario
        synth_fpath = os.path.join(SATELLITE_DIR, "sample_spill.png")
        if os.path.exists(synth_fpath):
            synth_mask = os.path.join(MASKS_DIR, "sample_spill_mask.png")
            items.append({
                "id": "sample_spill.png",
                "filename": "sample_spill.png",
                "label": "Synthetic Benchmark Scenario (Fallback)",
                "satellite": "Sentinel-1B C-SAR",
                "mode": "Interferometric Wide (IW)",
                "polarization": "VV+VH",
                "path": synth_fpath,
                "is_real_data": False,
                "is_synthetic_hero": False,
                "data_tag": "SYNTHETIC BENCHMARK SCENARIO",
                "detection_label": "Prototype Segmentation",
                "scenario_location_label": "Prototype Scenario Coordinates",
                "has_annotation": False,
                "bbox": None,
                "rel_bbox": None,
                "has_mask": os.path.exists(synth_mask),
                "size_bytes": os.path.getsize(synth_fpath),
                "image_url": "/static/satellite/sample_spill.png",
                "mask_url": "/static/masks/sample_spill_mask.png" if os.path.exists(synth_mask) else None
            })

        return items

    def analyze_satellite_image(self, filename: str = "demo_sar_oil.png") -> SpillDetection:
        """Runs prototype segmentation on the requested satellite/SAR demonstration image."""
        img_path = os.path.join(SATELLITE_DIR, filename)
        if not os.path.exists(img_path):
            # Fallback if specific file missing
            filename = "demo_sar_oil.png"
            img_path = os.path.join(SATELLITE_DIR, filename)
            if not os.path.exists(img_path):
                filename = "sample_spill.png"
                img_path = os.path.join(SATELLITE_DIR, filename)
                if not os.path.exists(img_path):
                    raise FileNotFoundError(f"Satellite image '{filename}' not found.")

        # Determine image category
        is_hero = (filename == "demo_sar_oil.png")
        is_real = (filename == "real_spill.jpg")
        voc_info = self.parse_voc_annotation() if is_real else None

        mask_filename = filename.replace(".jpg", "_mask.png").replace(".png", "_mask.png")
        mask_path = os.path.join(MASKS_DIR, mask_filename)
        if not os.path.exists(mask_path):
            mask_path = None

        detection_res = self.detector.detect(img_path, mask_path)
        
        # Scenario baseline parameters
        spill_id = "SP-DEMO-2026-HERO" if is_hero else ("SP-S1-20190101-001" if is_real else "SP-20260906-001")
        detection_time = "2026-09-06T06:00:00Z"
        slick_thickness = 1.2
        volume_m3 = 17800.0
        
        if os.path.exists(META_PATH):
            try:
                with open(META_PATH, "r") as f:
                    meta = json.load(f)
                    detection_time = meta.get("detection_time", detection_time)
                    slick_thickness = meta.get("slick_thickness_estimate_um", slick_thickness)
                    volume_m3 = meta.get("estimated_volume_m3", volume_m3)
            except Exception as e:
                print(f"Warning: Error reading spill metadata: {e}")

        if is_hero:
            bbox = {"xmin": 484, "ymin": 248, "xmax": 1019, "ymax": 806}
            rel_bbox = {"x": 0.3860, "y": 0.1978, "width": 0.4266, "height": 0.4450}
            img_dims = {"width": 1254, "height": 1254}
            data_source_label = "SYNTHETIC SAR-LIKE DEMONSTRATION"
            detection_label = "Prototype Segmentation"
            mission_label = "Synthetic SAR-like Demonstration"
            sensor_label = "Synthetic SAR-like Demonstration (Simulated Radar Backscatter)"
            confidence = 0.942
            area_km2 = 14.85
        elif is_real:
            bbox = voc_info["bbox"] if voc_info else {"xmin": 345, "ymin": 297, "xmax": 368, "ymax": 343}
            rel_bbox = voc_info["rel_bbox"] if voc_info else {"x": 0.5391, "y": 0.4641, "width": 0.0359, "height": 0.0719}
            img_dims = {"width": voc_info["width"], "height": voc_info["height"]} if voc_info else {"width": 640, "height": 640}
            data_source_label = "REAL DATASET REFERENCE"
            detection_label = "Prototype Detection / Annotated Region"
            mission_label = "Sentinel-1 SAR (Real IW Scene)"
            sensor_label = "Sentinel-1 C-SAR (Synthetic Aperture Radar - Real IW Scene)"
            confidence = 0.915
            area_km2 = detection_res["area_km2"]
        else:
            bbox = None
            rel_bbox = None
            img_dims = {"width": 512, "height": 512}
            data_source_label = "SYNTHETIC BENCHMARK SCENARIO"
            detection_label = "Prototype Segmentation"
            mission_label = "Sentinel-1B C-SAR"
            sensor_label = detection_res["sensor"]
            confidence = detection_res["confidence"]
            area_km2 = detection_res["area_km2"]

        return SpillDetection(
            spill_id=spill_id,
            classification="Possible Oil Spill",
            satellite_mission=mission_label,
            detection_time=detection_time,
            latitude=detection_res["centroid_latitude"],
            longitude=detection_res["centroid_longitude"],
            area_km2=area_km2,
            perimeter_km=detection_res["perimeter_km"],
            confidence=confidence,
            slick_thickness_estimate_um=slick_thickness,
            estimated_volume_m3=volume_m3,
            polygon_coordinates=detection_res["polygon_coordinates"],
            sensor=sensor_label,
            model_architecture="Prototype Segmentation (Modular Detector Interface)",
            is_real_data=is_real,
            is_synthetic_hero=is_hero,
            scenario_location_label="Prototype Scenario Coordinates",
            data_source_label=data_source_label,
            detection_label=detection_label,
            bbox=bbox,
            rel_bbox=rel_bbox,
            image_dimensions=img_dims,
            filename=filename
        )

satellite_service = SatelliteService()

