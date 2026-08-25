from pydantic import BaseModel, EmailStr, Field, UUID4

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)
    
class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ForgotPasswordResponse(BaseModel):
    # Always return a generic message regardless of whether the email
    # exists — prevents user enumeration via response differences.
    message: str = "If an account with that email exists, a reset link has been sent."

class UpdatePasswordRequest(BaseModel):
    reset_token: str
    new_password: str = Field(..., min_length=8)

class UpdatePasswordResponse(BaseModel):
    message: str = "Password updated successfully."
    
    

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str

# class LoginRequest(BaseModel):
#     email: EmailStr
#     password: str


class TokenData(BaseModel):
    user_id: str | None = None
    type: str | None = None  # Track token type (access vs refresh)