import os
import sys

# Configure the app for tests before anything imports app.config.
os.environ.setdefault(
    "DATABASE_URL",
    os.environ.get("TEST_DATABASE_URL", "postgresql+psycopg2://fs_test:fs_test@localhost:5432/finsavoir_test"),
)
os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-production")
os.environ.setdefault("MAIL_USERNAME", "test@example.com")
os.environ.setdefault("MAIL_PASSWORD", "unused")
os.environ.setdefault("MAIL_FROM", "test@example.com")
os.environ.setdefault("MAIL_SERVER", "localhost")
os.environ.setdefault("FRONTEND_URL", "https://app.example.test")
os.environ["ENABLE_BACKGROUND_JOBS"] = "false"

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import text  # noqa: E402

from app.database import Base, engine  # noqa: E402
import app.models  # noqa: E402,F401  (registers every table)


@pytest.fixture(scope="session", autouse=True)
def _schema():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(autouse=True)
def _clean_state():
    from app.core.rate_limit import ALL_LIMITERS

    for limiter in ALL_LIMITERS:
        limiter.reset()
    yield
    with engine.begin() as conn:
        tables = ", ".join(t.name for t in reversed(Base.metadata.sorted_tables))
        conn.execute(text(f"TRUNCATE {tables} RESTART IDENTITY CASCADE"))


@pytest.fixture
def sent_emails(monkeypatch):
    """Capture outgoing email instead of sending it."""
    outbox = []

    async def fake_send(message):
        outbox.append(message)

    import app.core.email as email_mod

    monkeypatch.setattr(email_mod, "_deliver", fake_send)
    return outbox


@pytest.fixture
def client():
    from app.main import app

    return TestClient(app)


@pytest.fixture
def db():
    from app.database import SessionLocal

    s = SessionLocal()
    yield s
    s.close()
