from pydantic import BaseModel, EmailStr, UUID4, Field

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    id: UUID4
    email: EmailStr
    is_active: bool

    class Config:
        from_attributes = True

