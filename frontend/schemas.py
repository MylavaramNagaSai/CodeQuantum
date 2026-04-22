class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordConfirm(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

    # We reuse your strict password rules here
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r"[A-Z]", v) or not re.search(r"[a-z]", v) or \
           not re.search(r"\d", v) or not re.search(r"[!@#$%^&*()]", v):
            raise ValueError('Password must meet complexity requirements')
        return v
