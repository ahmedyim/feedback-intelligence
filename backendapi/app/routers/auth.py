from fastapi import APIRouter, Depends, Request,Response
from sqlalchemy.orm import Session
from core.database import get_db
from core.limiter import limiter
from schemas.auth import LoginRequest, ForgotPasswordRequest, UpdatePasswordRequest
from crud import auth as auth_crud
from audit.service import log_audit  # Import audit helper

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request,response: Response, payload: LoginRequest, db: Session = Depends(get_db)):
    try:
        result = auth_crud.authenticate(db, payload)
        log_audit(
            db=db, 
            action="USER_LOGIN", 
            status="SUCCESS", 
            request=request, 
            details={"email": payload.email}
        )
        print(result["refresh_token"])
        response.set_cookie(
            key="refresh_token",
            value=result["refresh_token"],
            httponly=True,
            # secure=True,          # HTTPS only
            samesite="strict",    # or "lax" if you need cross-site navigation to work
            max_age=7 * 24 * 60 * 60,
            path="/auth/refresh", # scope the cookie to only be sent to the refresh endpoint
                )

        # Only the access token goes in the JSON body — frontend keeps it in memory
        return {"access_token": result["access_token"], "token_type": "bearer"}
        
    except Exception as e:
        log_audit(
            db=db, 
            action="USER_LOGIN", 
            status="FAILED", 
            request=request, 
            details={"email": payload.email, "error": str(e)}
        )
        raise e

@router.post("/forgot-password")
@limiter.limit("3/hour")
def forgot_password(request: Request, payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    res = auth_crud.initiate_password_reset(db, payload)
    log_audit(db=db, action="FORGOT_PASSWORD_REQUEST", status="SUCCESS", request=request)
    return res