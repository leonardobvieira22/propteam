from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv
import structlog
from .routers import ylos_analysis, health
from .core.config import settings
from .core.logging import setup_logging

load_dotenv()

# Configurar logging estruturado
setup_logging()
logger = structlog.get_logger(__name__)

app = FastAPI(
    title="Mesa Prop Trading Analysis API",
    description="Sistema enterprise para análise de conformidade de saques em mesas proprietárias",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(health.router, prefix="/api/health", tags=["health"])
app.include_router(ylos_analysis.router, prefix="/api/ylos", tags=["ylos"])

@app.on_event("startup")
async def startup_event():
    logger.info("Iniciando Mesa Prop Trading Analysis API", version="1.0.0")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Finalizando Mesa Prop Trading Analysis API")

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=settings.DEBUG
    ) 