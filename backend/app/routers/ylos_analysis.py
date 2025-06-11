from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
import structlog
from typing import Optional
from ..services.ylos_analyzer import YlosTradeAnalyzer
from ..models.ylos_models import YlosAnalysisRequest, YlosAnalysisResponse, ContaType
from ..core.config import settings
import os

logger = structlog.get_logger(__name__)
router = APIRouter()

# Dependency para o analisador
def get_analyzer() -> YlosTradeAnalyzer:
    return YlosTradeAnalyzer()

@router.post("/analyze", response_model=YlosAnalysisResponse)
async def analyze_trading_report(
    csv_file: UploadFile = File(..., description="Arquivo CSV com relatório de operações"),
    conta_type: int = Form(..., description="Tipo da conta: 1=Master Funded, 2=Instant Funding"),
    saldo_atual: float = Form(..., description="Saldo atual em USD"),
    fuso_horario: str = Form(..., description="Fuso horário das operações (ex: -03, -04, -05)"),
    verificar_noticias: bool = Form(False, description="Verificar conformidade com eventos noticiosos"),
    num_saques_realizados: int = Form(..., description="Número de saques já realizados"),
    analyzer: YlosTradeAnalyzer = Depends(get_analyzer)
):
    """
    Analisa relatório CSV de operações conforme regras YLOS Trading
    
    - **csv_file**: Arquivo CSV com as operações
    - **conta_type**: 1 para Master Funded, 2 para Instant Funding
    - **saldo_atual**: Saldo atual da conta em USD
    - **fuso_horario**: Fuso horário das operações (-03, -04, -05, etc.)
    - **verificar_noticias**: Se deve verificar posicionamento durante notícias
    - **num_saques_realizados**: Quantos saques já foram feitos
    """
    
    logger.info(
        "Recebida requisição de análise YLOS",
        filename=csv_file.filename,
        conta_type=conta_type,
        saldo_atual=saldo_atual
    )
    
    try:
        # Validar arquivo
        if not csv_file.filename.endswith(('.csv', '.CSV')):
            raise HTTPException(
                status_code=400,
                detail="Apenas arquivos CSV são aceitos"
            )
        
        # Verificar tamanho do arquivo
        content = await csv_file.read()
        if len(content) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail=f"Arquivo muito grande. Máximo: {settings.MAX_FILE_SIZE_MB}MB"
            )
        
        # Converter tipo de conta
        conta_type_enum = ContaType.MASTER_FUNDED if conta_type == 1 else ContaType.INSTANT_FUNDING
        
        # Criar request object
        request_data = YlosAnalysisRequest(
            conta_type=conta_type_enum,
            saldo_atual=saldo_atual,
            fuso_horario=fuso_horario,
            verificar_noticias=verificar_noticias,
            num_saques_realizados=num_saques_realizados
        )
        
        # Processar CSV
        csv_content = content.decode('utf-8')
        
        # Executar análise
        result = await analyzer.analyze_csv(csv_content, request_data)
        
        logger.info(
            "Análise YLOS concluída com sucesso",
            filename=csv_file.filename,
            aprovado=result.aprovado,
            total_violacoes=len(result.violacoes)
        )
        
        return result
        
    except UnicodeDecodeError:
        logger.error("Erro de codificação no arquivo CSV")
        raise HTTPException(
            status_code=400,
            detail="Arquivo CSV com codificação inválida. Use UTF-8."
        )
    except ValueError as e:
        logger.error("Erro de validação", error=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Erro interno na análise", error=str(e))
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor. Tente novamente."
        )

@router.get("/rules/{conta_type}")
async def get_trading_rules(conta_type: str):
    """
    Retorna as regras específicas para o tipo de conta
    
    - **conta_type**: 'master_funded' ou 'instant_funding'
    """
    
    analyzer = YlosTradeAnalyzer()
    
    if conta_type == "master_funded":
        rules = analyzer.rules_master_funded
    elif conta_type == "instant_funding":
        rules = analyzer.rules_instant_funding
    else:
        raise HTTPException(
            status_code=400,
            detail="Tipo de conta inválido. Use 'master_funded' ou 'instant_funding'"
        )
    
    return {
        "conta_type": conta_type,
        "regras": rules,
        "descricao": {
            "dias_minimos": "Mínimo de dias que deve operar para solicitar saque",
            "dias_vencedores_minimos": "Mínimo de dias vencedores necessários",
            "lucro_minimo_dia_vencedor": "Lucro mínimo em USD para considerar dia vencedor",
            "consistencia_max_percent": "Máximo % que um dia pode representar do lucro total",
            "medios_max_por_operacao": "Máximo de médios permitidos por operação",
            "posicionamento_noticias": "Se é permitido estar posicionado durante notícias",
            "overnight_trading": "Se é permitido trading overnight"
        }
    }

@router.get("/exemplo-csv")
async def get_csv_example():
    """
    Retorna um exemplo do formato CSV esperado baseado em configuração
    """
    
    # ENTERPRISE: CSV example should be configurable via environment or config file
    exemplo_csv_config = os.getenv('CSV_EXAMPLE_TEMPLATE')
    if exemplo_csv_config:
        exemplo_csv = exemplo_csv_config
    else:
        # Default template for YLOS Trading format
        exemplo_csv = """Ativo\tAbertura\tFechamento\tTempo Operação\tQtd Compra\tQtd Venda\tLado\tPreco Compra\tPreco Venda\tPreco de Mercado\tMédio\tRes. Intervalo\tRes. Intervalo (%)\tRes. Operação\tRes. Operação (%)\tTET\tTotal
ESFUT\t[DATA] [HORA]\t[DATA] [HORA]\t[TEMPO]\t[QTD]\t[QTD]\t[C/V]\t[PREÇO]\t[PREÇO]\t[PREÇO]\t[SIM/NÃO]\t[VALOR]\t[%]\t[VALOR]\t[%]\t[TEMPO]\t[VALOR]"""
    
    return {
        "exemplo_csv": exemplo_csv,
        "formato": "Separado por TAB (\\t)",
        "colunas_obrigatorias": [
            "Ativo", "Abertura", "Fechamento", "Tempo Operação",
            "Qtd Compra", "Qtd Venda", "Lado", "Preço Compra", 
            "Preço Venda", "Médio", "Res. Operação", "Total"
        ],
        "formato_data": "dd/mm/yyyy HH:MM",
        "observacoes": [
            "Use vírgula como separador decimal",
            "Lado: C para Compra, V para Venda",
            "Médio: Sim ou Não",
            "Salve o arquivo como CSV com codificação UTF-8"
        ],
        "enterprise_note": "Para dados reais, use o relatório exportado diretamente da plataforma de trading"
    } 