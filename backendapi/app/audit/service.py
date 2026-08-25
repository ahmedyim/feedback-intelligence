from fastapi import Request
from sqlalchemy.orm import Session
from audit.models import AuditLog

def log_audit(
    db: Session,
    action: str,
    status: str,
    request: Request | None = None,
    user_id: str | None = None,
    details: dict | None = None
):
    ip_address = request.client.host if request and request.client else None
    
    audit_entry = AuditLog(
        action=action,
        status=status,
        user_id=user_id,
        ip_address=ip_address,
        details=details
    )
    db.add(audit_entry)
    db.commit()