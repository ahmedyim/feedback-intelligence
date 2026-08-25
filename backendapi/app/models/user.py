import uuid
from sqlalchemy import Column, String, Boolean, Integer, DateTime
from ..core.database import Base

class UserModel(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(150), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    must_change_password = Column(Boolean, default=True, nullable=False)
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime(timezone=True), nullable=True)
    # Refresh token fields
    refresh_token_hash = Column(String(64), nullable=True, index=True)
    refresh_token_expires_at = Column(DateTime(timezone=True), nullable=True)