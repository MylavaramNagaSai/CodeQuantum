import datetime
import re
from pydantic import BaseModel, EmailStr, validator


from pydantic import BaseModel
from typing import Optional
# --- 1. NEW MULTI-STEP SIGNUP SCHEMAS ---

# Step 1: User enters Email, Password, and Confirm Password
class SignupInitial(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r"[A-Z]", v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r"[a-z]", v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r"\d", v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError('Password must contain at least one special character')
        return v

    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v

# Step 2: User enters OTP and Name to finalize account
class VerifySignup(BaseModel):
    email: EmailStr
    otp: str
    name: str

# --- 2. SECURITY & AUTH SCHEMAS ---

# The JWT Token Response
class Token(BaseModel):
    access_token: str
    token_type: str
    name: str
    email: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserDelete(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordConfirm(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

# --- 3. CHAT ENGINE SCHEMAS ---

class ThreadCreate(BaseModel):
    title: str

class ThreadOut(BaseModel):
    id: int
    title: str
    is_pinned: bool
    created_at: datetime.datetime
    class Config: 
        from_attributes = True

class MessageOut(BaseModel):
    role: str
    content: str
    class Config: 
        from_attributes = True

class ChatRequest(BaseModel):
    prompt: str
    thread_id: int


class ThreadUpdate(BaseModel):
    title: Optional[str] = None
    is_pinned: Optional[bool] = None

class BugCreate(BaseModel):
    title: str
    description: str
    time_occurred: str

class ChatRequest(BaseModel): # Yours might be named slightly differently
    prompt: str
    thread_id: Optional[int] = None
    # Add this exact line below!
    persona: Optional[str] = "standard"

class ExecuteRequest(BaseModel):
    language: str
    code: str