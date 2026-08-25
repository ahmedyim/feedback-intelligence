from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings

# Resolves dynamic database URL from settings
SQLALCHEMY_DB_URL = settings.get_database_url

# Configure engine with connection pre-ping for Vercel serverless
engine = create_engine(
    SQLALCHEMY_DB_URL,
    pool_pre_ping=True,
    pool_recycle=300
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
