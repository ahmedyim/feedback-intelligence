from sqlalchemy.orm import Session
from .config import settings
from ..crud.user import get_user_by_email, create_user
from ..schemas.user import UserCreate


def seed_admin(db: Session) -> None:
    if get_user_by_email(db, settings.ADMIN_EMAIL):
        return
    create_user(db, UserCreate(email=settings.ADMIN_EMAIL, password=settings.ADMIN_PASSWORD,must_change_password=True,))
