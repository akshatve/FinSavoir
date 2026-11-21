from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- Core (required) ---
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # --- Email ---
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_PORT: int = 587
    MAIL_SERVER: str

    # Admin inbox for contact form and newsletter notifications.
    ADMIN_EMAIL: str = ""

    # Public URL of the frontend, used to build password-reset links.
    FRONTEND_URL: str = "http://localhost:3000"

    # Comma-separated list of origins allowed to call the API from a browser.
    CORS_ORIGINS: str = "http://localhost:3000,https://finsavoir.com,https://www.finsavoir.com"

    # --- Third-party data (optional: the related feature degrades gracefully) ---
    YOUTUBE_API_KEY: str = ""
    FMP_API_KEY: str = ""
    GROQ_API_KEY: str = ""

    # SEC asks automated clients to identify themselves with a contact address.
    SEC_USER_AGENT: str = "FinSavoir admin@finsavoir.com"

    # --- Email verification ---
    OTP_TTL_MINUTES: int = 10
    OTP_MAX_ATTEMPTS: int = 5
    OTP_RESEND_COOLDOWN_SECONDS: int = 60
    # How long the proof of a verified email stays valid for finishing signup.
    EMAIL_VERIFICATION_TOKEN_MINUTES: int = 30

    # --- Rate limits (per client IP, in-memory, per process) ---
    CHAT_RATE_LIMIT_PER_MINUTE: int = 10
    CHAT_RATE_LIMIT_PER_DAY: int = 200
    AUTH_RATE_LIMIT_PER_HOUR: int = 20

    # Set to true when running behind a reverse proxy that sets X-Forwarded-For.
    TRUST_PROXY_HEADERS: bool = False

    # Background data refresh threads. Tests and one-off scripts turn this off.
    ENABLE_BACKGROUND_JOBS: bool = True

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip().rstrip("/") for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def frontend_url(self) -> str:
        return self.FRONTEND_URL.rstrip("/")


settings = Settings()
