# feedback schema validation 
from pydantic import BaseModel,UUID4,Field
from datetime import datetime
from typing import Optional
from models.feedback import CategoryEnum


class FeedbackCreate(BaseModel):
    customer_name:str=Field(...,min_length=2,max_length=100)
    source:str=Field(...,example="email")
    message:str=Field(...,min_length=3)
    # category can be none b/c auto assigne by NLP
    category:Optional[CategoryEnum]=None
    
class FeedbackResponse(BaseModel):
    id:UUID4
    customer_name:str
    source:str
    message:str
    category:CategoryEnum
    created_at:datetime
    class Config:
        from_attributes=True
        
        
class FeedbackMetricsResponse(BaseModel):
    total_feedback: int
    category_counts: dict[str, int]
    

