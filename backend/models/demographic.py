from sqlalchemy import Column, Integer, String, Date, Float, Index
from database import Base

class DemographicData(Base):

    __tablename__ = "demographic_data"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    pincode = Column(String(10), nullable=False, index=True)

    demo_age_0_5 = Column(Integer, default=0)
    demo_age_5_17 = Column(Integer, default=0)
    demo_age_17_plus = Column(Integer, default=0)

    total_demographic = Column(Integer, default=0)

    __table_args__ = (
        Index('idx_demo_pincode_date', 'pincode', 'date'),
        Index('idx_demo_state_district', 'state', 'district'),
    )

    def __repr__(self):
        return f"<DemographicData(pincode={self.pincode}, date={self.date}, total={self.total_demographic})>"
