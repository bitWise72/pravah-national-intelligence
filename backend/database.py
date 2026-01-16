"""
Database configuration and session management.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import get_settings

settings = get_settings()

# Create database engine with SQLite or PostgreSQL support
engine_kwargs = {
    "pool_pre_ping": True,
    "echo": settings.debug
}

# Add connection pooling only for PostgreSQL
if not settings.database_url.startswith('sqlite'):
    engine_kwargs.update({
        "pool_size": 10,
        "max_overflow": 20
    })

engine = create_engine(settings.database_url, **engine_kwargs)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = declarative_base()


def get_db():
    """
    Dependency function to get database session.
    Yields a session and ensures it's closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)
