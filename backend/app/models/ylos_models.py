from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime

class ContaType(str, Enum):
    MASTER_FUNDED = "master_funded"
    INSTANT_FUNDING = "instant_funding"

class YlosAnalysisRequest(BaseModel):
    """Modelo para requisição de análise YLOS"""
    conta_type: ContaType = Field(..., description="Tipo da conta (1=Master Funded, 2=Instant Funding)")
    saldo_atual: float = Field(..., gt=0, description="Saldo atual em USD")
    fuso_horario: str = Field(..., description="Fuso horário das operações (ex: -03, -04, -05)")
    verificar_noticias: bool = Field(default=False, description="Verificar conformidade com eventos noticiosos")
    num_saques_realizados: int = Field(..., ge=0, description="Número de saques já realizados")
    
    @validator('fuso_horario')
    def validate_timezone(cls, v):
        allowed_timezones = ['-03', '-04', '-05', '+00', '+01']
        if v not in allowed_timezones:
            raise ValueError(f'Fuso horário deve ser um de: {allowed_timezones}')
        return v

class OperacaoCSV(BaseModel):
    """Modelo para uma operação individual do CSV"""
    ativo: str
    abertura: str  # Data/hora como string
    fechamento: str  # Data/hora como string
    tempo_operacao: str
    qtd_compra: int
    qtd_venda: int
    lado: str  # C para compra, V para venda
    preco_compra: float
    preco_venda: float
    preco_mercado: float
    medio: str  # "Sim" ou "Não"
    res_intervalo: float
    res_intervalo_percent: float
    res_operacao: float
    res_operacao_percent: float
    tet: str
    total: float

class ViolacaoRegra(BaseModel):
    """Modelo para uma violação de regra"""
    codigo: str = Field(..., description="Código da regra violada")
    titulo: str = Field(..., description="Título da violação")
    descricao: str = Field(..., description="Descrição detalhada da violação")
    severidade: str = Field(..., description="Severidade: WARNING, ERROR, CRITICAL")
    operacoes_afetadas: List[Dict[str, Any]] = Field(default_factory=list)
    valor_impacto: Optional[float] = Field(None, description="Valor monetário do impacto")

class YlosAnalysisResponse(BaseModel):
    """Modelo para resposta da análise YLOS"""
    aprovado: bool = Field(..., description="Se o saque seria aprovado")
    total_operacoes: int = Field(..., description="Total de operações analisadas")
    dias_operados: int = Field(..., description="Dias únicos operados")
    dias_vencedores: int = Field(..., description="Dias com lucro >= mínimo")
    lucro_total: float = Field(..., description="Lucro total das operações")
    maior_lucro_dia: float = Field(..., description="Maior lucro em um único dia")
    consistencia_40_percent: bool = Field(..., description="Se passa na regra dos 40%")
    violacoes: List[ViolacaoRegra] = Field(default_factory=list)
    detalhes_noticias: Optional[List[Dict[str, Any]]] = Field(None)
    recomendacoes: List[str] = Field(default_factory=list)
    proximos_passos: List[str] = Field(default_factory=list)
    
class HealthCheck(BaseModel):
    """Modelo para health check"""
    status: str = "OK"
    timestamp: datetime
    version: str = "1.0.0"
    services: Dict[str, str] = Field(default_factory=dict) 