from sqlalchemy import Column, Integer, String, JSON, DateTime
from database import Base


class Sessions(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String, nullable=False)
    annotations = Column(JSON, nullable=False)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
