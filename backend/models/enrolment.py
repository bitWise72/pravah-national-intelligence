from sqlalchemy import Column, Integer, String, Date, Float, Index
from database import Base

class EnrolmentData(Base):

    __tablename__ = "enrolment_data"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    pincode = Column(String(10), nullable=False, index=True)

    age_0_5 = Column(Integer, default=0)
    age_5_17 = Column(Integer, default=0)
    age_18_greater = Column(Integer, default=0)

    total_enrolment = Column(Integer, default=0)

    __table_args__ = (
        Index('idx_enrol_pincode_date', 'pincode', 'date'),
        Index('idx_enrol_state_district', 'state', 'district'),
    )

    def __repr__(self):
        return f"<EnrolmentData(pincode={self.pincode}, date={self.date}, total={self.total_enrolment})>"
