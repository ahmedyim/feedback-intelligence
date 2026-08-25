from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.feedback import FeedbackModel, CategoryEnum
from schemas.feedback import FeedbackCreate


def create_feedback(db: Session, feedback: FeedbackCreate, category: CategoryEnum) -> FeedbackModel:
    db_feedback = FeedbackModel(
        customer_name=feedback.customer_name,
        source=feedback.source,
        message=feedback.message,
        category=category,
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback


def get_feedback_list(
    db: Session,
    category: Optional[CategoryEnum] = None,
    source: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
):
    query = db.query(FeedbackModel)
    if category:
        query = query.filter(FeedbackModel.category == category)
    if source:
        query = query.filter(FeedbackModel.source == source)
    if search:
        query = query.filter(FeedbackModel.message.ilike(f"%{search}%"))
    return query.order_by(FeedbackModel.created_at.desc()).offset(skip).limit(limit).all()


def get_feedback_stats(db: Session) -> dict:
    rows = (
        db.query(FeedbackModel.category, func.count(FeedbackModel.id))
        .group_by(FeedbackModel.category)
        .all()
    )
    counts = {c.value: 0 for c in CategoryEnum}
    total = 0
    for category, count in rows:
        counts[category.value] = count
        total += count
    return {"total_feedback": total, "category_counts": counts}