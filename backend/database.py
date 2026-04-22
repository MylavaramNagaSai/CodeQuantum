from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- POSTGRESQL CONFIGURATION ---
# Format: postgresql://username:password@server_location/database_name
SQLALCHEMY_DATABASE_URL = "postgresql://cq_admin:CodeQuantumDB!2026@localhost/codequantum"

# Notice we removed "check_same_thread": False because Postgres natively handles multi-threading!
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()