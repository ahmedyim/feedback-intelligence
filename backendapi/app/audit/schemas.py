# audit/schemas.py
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class AuditLogResponse(BaseModel):
    id: int
    action: str
    status: str
    user_id: str | None
    ip_address: str | None
    details: dict | None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)