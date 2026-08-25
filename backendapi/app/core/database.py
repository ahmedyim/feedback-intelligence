from sqlalchemy import create_engine #connection pool
from sqlalchemy.orm import declarative_base,sessionmaker
from core.config import settings
SQLALCHEMY_DB_URL=settings.DB_URL

# Cordinate db with python app
engine=create_engine(SQLALCHEMY_DB_URL)
SessionLocal=sessionmaker(autocommit=False,autoflush=False,bind=engine)

# the parent class for all orm to inherit
Base=declarative_base()
def get_db():
    db=SessionLocal()
    try:
        # provide session to the route
        yield db
    finally:
        # to close session after request finishes
        db.close()