from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import List

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")
    
    # Configurações básicas
    DEBUG: bool = False
    SECRET_KEY: str = "your-secret-key-here"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001", 
        "https://your-frontend-domain.com"
    ]
    
    # APIs externas
    FINNHUB_API_KEY: str = ""
    
    # AWS CloudWatch
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    CLOUDWATCH_LOG_GROUP: str = "/mesa-prop/api"
    
    # Redis (para cache)
    REDIS_URL: str = "redis://localhost:6379"
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/mesa_prop"
    
    # Upload settings
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_FILE_TYPES: List[str] = [".csv", ".xlsx"]

settings = Settings() 