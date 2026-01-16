"""
Pincode Metadata Model
Stores location and geographic information for pincodes.
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, Index
from database import Base


class PincodeMetadata(Base):
    """Pincode location metadata from postal API."""
    
    __tablename__ = "pincode_metadata"
    
    id = Column(Integer, primary_key=True, index=True)
    pincode = Column(String(10), unique=True, nullable=False, index=True)
    
    # Location information
    post_office_name = Column(String(200))
    district = Column(String(100), index=True)
    state = Column(String(100), index=True)
    division = Column(String(100))
    region = Column(String(100))
    circle = Column(String(100))
    
    # Geographic coordinates
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Metadata
    delivery_status = Column(String(50))
    office_type = Column(String(50))
    
    __table_args__ = (
        Index('idx_pincode_location', 'state', 'district'),
    )
    
    def __repr__(self):
        return f"<PincodeMetadata(pincode={self.pincode}, district={self.district}, state={self.state})>"
