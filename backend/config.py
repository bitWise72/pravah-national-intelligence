"""
PRAVAH Backend Configuration
Loads environment variables and provides configuration settings.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    database_url: str = "postgresql://pravah_user:pravah_password@localhost:5432/pravah_db"
    
    # API Configuration
    api_base_url: str = "http://localhost:8000"
    api_secret_key: str = "change-this-secret-key-in-production"
    allowed_origins: str = "http://localhost:8080,http://localhost:5173"
    
    # External APIs
    postal_api_url: str = "https://api.postalpincode.in"
    mapmyindia_api_key: str = ""
    
    # Privacy & Security
    minimum_cell_size: int = 10
    rate_limit_per_minute: int = 60
    
    # Data Processing
    data_path: str = "../public/extracted_data"
    enable_audit_log: bool = True
    log_level: str = "INFO"
    
    # Development
    debug: bool = True
    reload: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
