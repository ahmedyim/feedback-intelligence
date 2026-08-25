# audit/router.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from .models import AuditLog
from .schemas import AuditLogResponse

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])

@router.get("/", response_model=List[AuditLogResponse])
def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()