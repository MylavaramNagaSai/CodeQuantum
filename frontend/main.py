@app.post("/api/forgot-password")
def forgot_password(req: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user:
        # Security tip: Don't tell them if the email doesn't exist to prevent "User Enumeration"
        return {"message": "If this email exists, an OTP has been sent."}
    
    new_otp = utils.generate_otp()
    user.otp_code = new_otp
    db.commit()
    
    utils.send_otp_email(user.email, new_otp) # Reuses your HTML template
    return {"message": "OTP sent to your email."}

@app.post("/api/reset-password")
def reset_password(req: schemas.ResetPasswordConfirm, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    
    if not user or user.otp_code != req.otp:
        raise HTTPException(status_code=400, detail="Invalid Email or OTP")
    
    # Update password and clear OTP
    user.hashed_password = utils.hash_password(req.new_password)
    user.otp_code = None
    db.commit()
    
    return {"message": "Password reset successful! You can now log in."}
