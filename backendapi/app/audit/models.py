from datetime import datetime, timezone
from sqlalchemy import String, JSON, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column
from ..core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    action: Mapped[str] = mapped_column(String(50), index=True)  # e.g., "USER_LOGIN", "FEEDBACK_SUBMITTED"
    status: Mapped[str] = mapped_column(String(20))               # "SUCCESS" or "FAILED"
    user_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    details: Mapped[dict | None] = mapped_column(JSON, nullable=True) # Extra contextual info
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )