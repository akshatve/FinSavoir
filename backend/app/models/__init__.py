# Import every model so SQLAlchemy and Alembic see all tables.
from app.models import company, financials, user  # noqa: F401
