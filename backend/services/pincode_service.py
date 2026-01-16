"""
Pincode Service
Integrates with postal API to enrich pincode data with location information.
"""
import httpx
import logging
from typing import Optional, Dict, Any
from config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class PincodeService:
    """Service to fetch pincode metadata from postal API."""
    
    def __init__(self):
        self.base_url = settings.postal_api_url
        self.cache = {}  # Simple in-memory cache
    
    async def get_pincode_info(self, pincode: str) -> Optional[Dict[str, Any]]:
        """
        Fetch pincode information from postal API.
        
        Args:
            pincode: 6-digit pincode
            
        Returns:
            Dictionary with pincode metadata or None if not found
        """
        # Check cache first
        if pincode in self.cache:
            return self.cache[pincode]
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/pincode/{pincode}")
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Extract first post office data
                    if data and data[0]["Status"] == "Success":
                        post_office = data[0]["PostOffice"][0]
                        
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
                            # Note: Postal API doesn't provide lat/lon, would need geocoding service
                            "latitude": None,
                            "longitude": None
                        }
                        
                        # Cache the result
                        self.cache[pincode] = result
                        return result
                    
                logger.warning(f"Pincode {pincode} not found in postal API")
                return None
                
        except Exception as e:
            logger.error(f"Error fetching pincode {pincode}: {e}")
            return None
    
    def get_pincode_info_sync(self, pincode: str) -> Optional[Dict[str, Any]]:
        """
        Synchronous version for use in scripts.
        
        Args:
            pincode: 6-digit pincode
            
        Returns:
            Dictionary with pincode metadata or None if not found
        """
        # Check cache first
        if pincode in self.cache:
            return self.cache[pincode]
        
        try:
            response = httpx.get(f"{self.base_url}/pincode/{pincode}", timeout=10.0)
            
            if response.status_code == 200:
                data = response.json()
                
                if data and data[0]["Status"] == "Success":
                    post_office = data[0]["PostOffice"][0]
                    
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
                        "latitude": None,
                        "longitude": None
                    }
                    
                    self.cache[pincode] = result
                    return result
                    
            return None
            
        except Exception as e:
            logger.error(f"Error fetching pincode {pincode}: {e}")
            return None


# Global instance
pincode_service = PincodeService()
