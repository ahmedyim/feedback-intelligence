# from fastapi import APIRouter, Depends, Query, Request, status
# from sqlalchemy.orm import Session
# from typing import Optional, List

# from core.database import get_db
# from core.limiter import limiter
# from models.feedback import CategoryEnum
# from schemas.feedback import FeedbackCreate, FeedbackResponse, FeedbackMetricsResponse
# from crud import feedback as feedback_crud
# from services.nlp_categorizer import categorize_feedback

# router = APIRouter(prefix="/feedback", tags=["feedback"])


# @router.post("/", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
# @limiter.limit("30/minute")
# def submit_feedback(request: Request, payload: FeedbackCreate, db: Session = Depends(get_db)):
#     category = payload.category or categorize_feedback(payload.message)
#     return feedback_crud.create_feedback(db, payload, category)


# @router.get("/", response_model=List[FeedbackResponse])
# @limiter.limit("60/minute")
# def list_feedback(
#     request: Request,
#     category: Optional[CategoryEnum] = None,
#     source: Optional[str] = None,
#     search: Optional[str] = None,
#     skip: int = Query(0, ge=0),
#     limit: int = Query(50, le=200),
#     db: Session = Depends(get_db),
# ):
#     return feedback_crud.get_feedback_list(db, category, source, search, skip, limit)


# @router.get("/stats", response_model=FeedbackMetricsResponse)
# @limiter.limit("60/minute")
# def feedback_stats(request: Request, db: Session = Depends(get_db)):
#     return feedback_crud.get_feedback_stats(db)


# # If you add update/delete for admin later, same pattern:
# @router.put("/{feedback_id}", response_model=FeedbackResponse)
# @limiter.limit("20/minute")
# def update_feedback(request: Request, feedback_id: str, payload: FeedbackCreate, db: Session = Depends(get_db)):
#     return feedback_crud.update_feedback(db, feedback_id, payload)


# @router.delete("/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
# @limiter.limit("10/minute")
# def delete_feedback(request: Request, feedback_id: str, db: Session = Depends(get_db)):
#     feedback_crud.delete_feedback(db, feedback_id)









from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session
from typing import Optional, List

from core.database import get_db
from core.limiter import limiter
from models.feedback import CategoryEnum
from schemas.feedback import FeedbackCreate, FeedbackResponse, FeedbackMetricsResponse
from crud import feedback as feedback_crud
from services.nlp_categorizer import categorize_feedback
from audit.service import log_audit  # Import audit helper

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("/", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def submit_feedback(request: Request, payload: FeedbackCreate, db: Session = Depends(get_db)):
    category = payload.category or categorize_feedback(payload.message)
    result = feedback_crud.create_feedback(db, payload, category)
    
    log_audit(
        db=db,
        action="CREATE_FEEDBACK",
        status="SUCCESS",
        request=request,
        details={"feedback_id": str(getattr(result, "id", None)), "category": str(category)}
    )
    return result


@router.get("/", response_model=List[FeedbackResponse])
@limiter.limit("60/minute")
def list_feedback(
    request: Request,
    category: Optional[CategoryEnum] = None,
    source: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
):
    return feedback_crud.get_feedback_list(db, category, source, search, skip, limit)


@router.get("/stats", response_model=FeedbackMetricsResponse)
@limiter.limit("60/minute")
def feedback_stats(request: Request, db: Session = Depends(get_db)):
    return feedback_crud.get_feedback_stats(db)


@router.put("/{feedback_id}", response_model=FeedbackResponse)
@limiter.limit("20/minute")
def update_feedback(request: Request, feedback_id: str, payload: FeedbackCreate, db: Session = Depends(get_db)):
    updated_item = feedback_crud.update_feedback(db, feedback_id, payload)
    
    log_audit(
        db=db,
        action="UPDATE_FEEDBACK",
        status="SUCCESS",
        request=request,
        details={"feedback_id": feedback_id}
    )
    return updated_item


@router.delete("/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("10/minute")
def delete_feedback(request: Request, feedback_id: str, db: Session = Depends(get_db)):
    feedback_crud.delete_feedback(db, feedback_id)
    
    log_audit(
        db=db,
        action="DELETE_FEEDBACK",
        status="SUCCESS",
        request=request,
        details={"feedback_id": feedback_id}
    )