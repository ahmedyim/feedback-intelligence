from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, Request, Response
from sqlalchemy.orm import Session
from services.email import send_reset_password_email
from core.database import get_db
from core.limiter import limiter
from schemas.auth import LoginRequest, ForgotPasswordRequest,ChangePasswordRequest,ResetPasswordRequest
from crud import auth as auth_crud,user as crud_user
from audit.service import log_audit
from models.user import UserModel as User
from schemas.auth import AdminResetPasswordRequest
from core.deps import get_current_user  
router = APIRouter(prefix="/auth", tags=["auth"])

COOKIE_MAX_AGE = 7 * 24 * 60 * 60  # 7 days

def set_refresh_cookie(response: Response, token: str):
    response.set_cookie(
        key="refresh_token",
        value=token,
        httponly=True,
        # secure=True,        # enable in production (HTTPS)
        samesite="strict",
        max_age=COOKIE_MAX_AGE,
        path="/",
    )
@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request, response: Response, payload: LoginRequest, db: Session = Depends(get_db)):
    try:
        result = auth_crud.authenticate(db, payload)
        log_audit(
            db=db,
            action="USER_LOGIN",
            status="SUCCESS",
            request=request,
            details={"email": payload.email},
        )
        set_refresh_cookie(response, result["refresh_token"])
        return {
    "access_token": result["access_token"],
            "token_type": "bearer",
            "must_change_password": result["must_change_password"],
        }
    except Exception as e:
        log_audit(
            db=db,
            action="USER_LOGIN",
            status="FAILED",
            request=request,
            details={"email": payload.email, "error": str(e)},
        )
        raise e

@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return auth_crud.change_password(db, current_user, payload)



@router.post("/refresh")
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    raw_refresh_token = request.cookies.get("refresh_token")

    if not raw_refresh_token:
        raise HTTPException(status_code=401, detail="Please login first")

    result = auth_crud.refresh_access_token(db, raw_refresh_token)
    set_refresh_cookie(response, result["refresh_token"])  # rotated token

    return {"access_token": result["access_token"], "token_type": "bearer"}


@router.get("/me")
def get_me(request: Request, db: Session = Depends(get_db)):
    raw_refresh_token = request.cookies.get("refresh_token")
    print("Cookie value received:", raw_refresh_token)

    if not raw_refresh_token:
        raise HTTPException(status_code=401, detail="Please login first")

    token_hash = auth_crud.hash_refresh_token(raw_refresh_token)
    print("Computed hash:", token_hash)

    user = db.query(User).filter(User.refresh_token_hash == token_hash).first()
    print("User found:", user.email if user else None)

    if not user or not auth_crud.verify_refresh_token(raw_refresh_token, user.refresh_token_hash):
        raise HTTPException(status_code=401, detail="Please login first")

    if user.refresh_token_expires_at and user.refresh_token_expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Please login first")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")

    return {
        "id": str(user.id),
        "email": user.email,
        "must_change_password":user.must_change_password
        
    }


@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    raw_refresh_token = request.cookies.get("refresh_token")
    if raw_refresh_token:
        token_hash = auth_crud.hash_refresh_token(raw_refresh_token)
        user = db.query(User).filter(User.refresh_token_hash == token_hash).first()
        if user:
            auth_crud.revoke_refresh_token(db, str(user.id))
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

@router.post("/forgot-password")
@limiter.limit("5/minute")
async def forgot_password(
    request: Request,                 # required by slowapi — DO NOT repurpose this
    body: ForgotPasswordRequest,       # <-- your actual submitted email lives here
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = crud_user.get_user_by_email(db, body.email)
    if user:
        token = auth_crud.create_reset_token(user.id)
        background_tasks.add_task(send_reset_password_email, body.email, token)
    # Always return a generic success response regardless of whether the
    # user exists — don't leak account existence via response differences.
    return {"detail": "If that email exists, a reset link has been sent."}

@router.post("/reset-password")
@limiter.limit("5/minute")
def reset_password(
    request: Request,                  # required by slowapi
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    return auth_crud.reset_password(db, payload)