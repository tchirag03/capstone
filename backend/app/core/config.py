"""
Application configuration and settings.
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    app_name: str = "Sustainable AI Assessment Platform"
    version: str = "1.0.0"
    api_prefix: str = "/api"
    
    class Config:
        env_file = ".env"


settings = Settings()
