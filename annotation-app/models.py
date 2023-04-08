from sqlalchemy import Column, Integer, String, JSON, DateTime
from database import Base


class Sessions(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String, nullable=False)
    annotations = Column(JSON, nullable=False)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)


class DocumentSessions(Base):
    __tablename__ = "document_sessions"

    id = Column(Integer, primary_key=True, index=True)
    document = Column(String, nullable=False)
    user_responses = Column(JSON, nullable=False)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
