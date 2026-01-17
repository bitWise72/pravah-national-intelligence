import httpx
import logging
from typing import Optional, Dict, Any
from config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

FALLBACK_COORDINATES = {
    "110001": {"lat": 28.6327, "lon": 77.2197},
    "110002": {"lat": 28.6340, "lon": 77.2435},
    "400001": {"lat": 18.9388, "lon": 72.8353},
    "560001": {"lat": 12.9716, "lon": 77.5946},
    "600001": {"lat": 13.0827, "lon": 80.2707},
    "700001": {"lat": 22.5726, "lon": 88.3639},
    "500001": {"lat": 17.3850, "lon": 78.4867},
    "380001": {"lat": 23.0225, "lon": 72.5714},
    "411001": {"lat": 18.5204, "lon": 73.8567},
    "302001": {"lat": 26.9124, "lon": 75.7873},
    "226001": {"lat": 26.8467, "lon": 80.9462},
    "141001": {"lat": 30.9010, "lon": 75.8573},
    "682001": {"lat": 9.9312, "lon": 76.2673},
    "641001": {"lat": 11.0168, "lon": 76.9558},
    "452001": {"lat": 22.7196, "lon": 75.8577},
    "440001": {"lat": 21.1458, "lon": 79.0882},
    "800001": {"lat": 25.5941, "lon": 85.1376},
    "462001": {"lat": 23.2599, "lon": 77.4126},
    "695001": {"lat": 8.5241, "lon": 76.9366},
    "751001": {"lat": 20.2961, "lon": 85.8245},
    "122001": {"lat": 28.4595, "lon": 77.0266},
    "201301": {"lat": 28.5355, "lon": 77.3910},
    "143001": {"lat": 31.6340, "lon": 74.8723},
    "160001": {"lat": 30.7333, "lon": 76.7794},
}

class PincodeService:

    def __init__(self):
        self.base_url = settings.postal_api_url
        self.cache = {}

    async def get_pincode_info(self, pincode: str) -> Optional[Dict[str, Any]]:
        if pincode in self.cache:
            return self.cache[pincode]

        result = None
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/pincode/{pincode}")

                if response.status_code == 200:
                    data = response.json()

                    if data and data[0]["Status"] == "Success":
                        post_office = data[0]["PostOffice"][0]
                        
                        coords = FALLBACK_COORDINATES.get(pincode, {"lat": None, "lon": None})

                        result = {
                            "pincode": pincode,
                            "post_office_name": post_office.get("Name"),
                            "district": post_office.get("District"),
                            "state": post_office.get("State"),
                            "division": post_office.get("Division"),
                            "region": post_office.get("Region"),
                            "circle": post_office.get("Circle"),
                            "delivery_status": post_office.get("DeliveryStatus"),
                            "office_type": post_office.get("Type"),
                            "latitude": coords["lat"],
                            "longitude": coords["lon"]
                        }
        except Exception as e:
            logger.error(f"Error fetching pincode {pincode}: {e}")

        if not result and pincode in FALLBACK_COORDINATES:
             coords = FALLBACK_COORDINATES[pincode]
             result = {
                 "pincode": pincode,
                 "latitude": coords["lat"],
                 "longitude": coords["lon"],
                 "district": "Unknown",
                 "state": "Unknown"
             }

        if result:
            self.cache[pincode] = result
            
        return result

    def get_pincode_info_sync(self, pincode: str) -> Optional[Dict[str, Any]]:
        if pincode in self.cache:
            return self.cache[pincode]

        result = None

        try:
            response = httpx.get(f"{self.base_url}/pincode/{pincode}", timeout=10.0)

            if response.status_code == 200:
                data = response.json()

                if data and data[0]["Status"] == "Success":
                    post_office = data[0]["PostOffice"][0]

                    coords = FALLBACK_COORDINATES.get(pincode, {"lat": None, "lon": None})

                    result = {
                        "pincode": pincode,
                        "post_office_name": post_office.get("Name"),
                        "district": post_office.get("District"),
                        "state": post_office.get("State"),
                        "division": post_office.get("Division"),
                        "region": post_office.get("Region"),
                        "circle": post_office.get("Circle"),
                        "delivery_status": post_office.get("DeliveryStatus"),
                        "office_type": post_office.get("Type"),
                        "latitude": coords["lat"],
                        "longitude": coords["lon"]
                    }
        except Exception as e:
            logger.error(f"Error fetching pincode {pincode}: {e}")

        if not result and pincode in FALLBACK_COORDINATES:
             coords = FALLBACK_COORDINATES[pincode]
             result = {
                 "pincode": pincode,
                 "latitude": coords["lat"],
                 "longitude": coords["lon"],
                 "district": "Unknown",
                 "state": "Unknown"
             }

        if result:
            self.cache[pincode] = result
            
        return result

pincode_service = PincodeService()
