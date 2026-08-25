# orm model for feedback
import uuid
import enum
from datetime import datetime,timezone
from sqlalchemy import Column,String,Text,DateTime,Enum as SqlEnum
from core.database import Base

class CategoryEnum(str,enum.Enum):
    BUG = "Bug"
    FEATURE_REQUEST = "Feature Request"
    COMPLAINT = "Complaint"
    PRAISE = "Praise"
class FeedbackModel(Base):
    __tablename__="feedback"
    id=Column(String(36),primary_key=True,
              default=lambda:str(uuid.uuid4()))
    customer_name=Column(String(100),nullable=False)
    source=Column(String(50),nullable=False)
    message=Column(Text,nullable=False)
    category=Column(SqlEnum(CategoryEnum),nullable=False)
    created_at=Column(
        DateTime(timezone=True),
        default=lambda:datetime.now(timezone.utc),
        nullable=False
    )
    
    