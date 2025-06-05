from fastapi import APIRouter
from datetime import datetime
import structlog
from ..models.ylos_models import HealthCheck
from ..core.config import settings

logger = structlog.get_logger(__name__)
router = APIRouter()

@router.get("/", response_model=HealthCheck)
async def health_check():
    """Health check endpoint para monitoramento"""
    
    services_status = {}
    
    # Verificar serviços externos
    try:
        # Verificar se as configurações estão corretas
        if settings.FINNHUB_API_KEY:
            services_status["finnhub_api"] = "configured"
        else:
            services_status["finnhub_api"] = "not_configured"
        
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            services_status["aws_cloudwatch"] = "configured"
        else:
            services_status["aws_cloudwatch"] = "not_configured"
        
        services_status["redis"] = "not_checked"  # Implementar verificação real se necessário
        
    except Exception as e:
        logger.error("Erro no health check", error=str(e))
        services_status["error"] = str(e)
    
    return HealthCheck(
        status="OK",
        timestamp=datetime.utcnow(),
        version="1.0.0",
        services=services_status
    )

@router.get("/ready")
async def readiness_check():
    """Endpoint para verificar se a aplicação está pronta para receber requests"""
    return {"status": "ready", "timestamp": datetime.utcnow()}

@router.get("/live")
async def liveness_check():
    """Endpoint para verificar se a aplicação está viva"""
    return {"status": "alive", "timestamp": datetime.utcnow()} 