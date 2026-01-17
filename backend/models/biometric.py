from sqlalchemy import Column, Integer, String, Date, Float, Index
from database import Base

class BiometricData(Base):

    __tablename__ = "biometric_data"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    pincode = Column(String(10), nullable=False, index=True)

    bio_age_0_5 = Column(Integer, default=0)
    bio_age_5_17 = Column(Integer, default=0)
    bio_age_17_plus = Column(Integer, default=0)

    total_biometric = Column(Integer, default=0)

    __table_args__ = (
        Index('idx_bio_pincode_date', 'pincode', 'date'),
        Index('idx_bio_state_district', 'state', 'district'),
    )

    def __repr__(self):
        return f"<BiometricData(pincode={self.pincode}, date={self.date}, total={self.total_biometric})>"
