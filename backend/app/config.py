from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    
    # Add these mail settings
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_PORT: int
    MAIL_SERVER: str


    # ... existing settings ...
    YOUTUBE_API_KEY: str

     
    #  for contact and email subscribers
    ADMIN_EMAIL: str = ""
    FMP_API_KEY: str


    # for the chatbot 
    GROQ_API_KEY: str


    class Config:
        env_file = ".env"

settings = Settings()