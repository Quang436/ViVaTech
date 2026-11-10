from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def ensure_schema_compatibility():
    """Idempotent SQLite schema upgrade for existing local DB files."""
    Base.metadata.create_all(bind=engine)
    if settings.DATABASE_URL.startswith("sqlite"):
        with engine.begin() as conn:
            cols = conn.execute(text("PRAGMA table_info(debate_sessions)")).fetchall()
            col_names = {row[1] for row in cols}
            if "user_id" not in col_names:
                conn.execute(text("ALTER TABLE debate_sessions ADD COLUMN user_id VARCHAR(36)"))
            conn.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS ix_debate_sessions_user_id ON debate_sessions (user_id)"
                )
            )


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
