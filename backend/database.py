from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import get_settings

settings = get_settings()

engine_kwargs = {
    "pool_pre_ping": True,
    "echo": settings.debug
}

if not settings.database_url.startswith('sqlite'):
    engine_kwargs.update({
        "pool_size": 5,
        "max_overflow": 10
    })

engine = create_engine(settings.database_url, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
