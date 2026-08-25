from sqlalchemy.orm import Session
from ..models.user import UserModel
from ..schemas.user import UserCreate
from ..core.security import hash_password


def get_user_by_email(db: Session, email: str) -> UserModel | None:
    return db.query(UserModel).filter(UserModel.email == email).first()

def create_user(db: Session, user: UserCreate) -> UserModel:
    db_user = UserModel(email=user.email, hashed_password=hash_password(user.password))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user