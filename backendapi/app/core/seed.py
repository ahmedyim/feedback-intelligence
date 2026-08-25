from sqlalchemy.orm import Session
from core.config import settings
from crud.user import get_user_by_email, create_user
from schemas.user import UserCreate


def seed_admin(db: Session) -> None:
    if get_user_by_email(db, settings.admin_email):
        return
    create_user(db, UserCreate(email=settings.admin_email, password=settings.admin_password))