from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime
from datetime import datetime
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    is_verified = Column(Boolean, default=False)
    otp_code = Column(String, nullable=True)
    profile_image = Column(String, default="default_avatar.png")
    
    threads = relationship("Thread", back_populates="owner")

class Thread(Base):
    __tablename__ = "threads"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    is_pinned = Column(Boolean, default=False)
    # FIX: Use datetime.now (no extra .datetime and no parentheses)
    created_at = Column(DateTime, default=datetime.now) 
    
    owner = relationship("User", back_populates="threads")
    messages = relationship("Message", back_populates="thread", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    thread_id = Column(Integer, ForeignKey("threads.id"))
    role = Column(String) # "user" or "assistant"
    content = Column(Text)
    # FIX: Use datetime.now
    timestamp = Column(DateTime, default=datetime.now) 

    thread = relationship("Thread", back_populates="messages")

class BugReport(Base):
    __tablename__ = "bug_reports"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    description = Column(String)
    time_occurred = Column(String)
    status = Column(String, default="Open") 
    # FIX: Use datetime.now
    created_at = Column(DateTime, default=datetime.now)