from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "seo_blog_db"

    
    MODEL_NAME: str = "mistralai/Mistral-7B-Instruct-v0.2"
    MAX_NEW_TOKENS: int = 1500
    TEMPERATURE: float = 0.7
    TOP_P: float = 0.9
    DEVICE: str = "cpu"
    
    APP_ENV: str = "development"
    DEBUG: bool = True

    class Config:
        env_file = ".env"

settings = Settings()