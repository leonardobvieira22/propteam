import pandas as pd
import pytz
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
import structlog
import requests
from ..models.ylos_models import (
    YlosAnalysisRequest, 
    YlosAnalysisResponse, 
    ViolacaoRegra, 
    OperacaoCSV,
    ContaType
)
from ..core.config import settings

logger = structlog.get_logger(__name__)

class YlosTradeAnalyzer:
    """Analisador enterprise para regras da YLOS Trading"""
    
    def __init__(self):
        self.timezone_map = {
            '-03': 'America/Sao_Paulo',  # BRT
            '-04': 'America/New_York',   # NY com DST  
            '-05': 'America/New_York',   # NY sem DST
            '+00': 'UTC',
            '+01': 'Europe/London'
        }
        
        # Regras específicas por tipo de conta
        self.rules_master_funded = {
            'dias_minimos': 10,
            'dias_vencedores_minimos': 7,
            'lucro_minimo_dia_vencedor': 50.0,
            'consistencia_max_percent': 40.0,
            'medios_max_por_operacao': 3,
            'posicionamento_noticias': False,
            'overnight_trading': False
        }
        
        self.rules_instant_funding = {
            'dias_minimos': 5,
            'dias_vencedores_minimos': 5,
            'lucro_minimo_dia_vencedor': 200.0,
            'consistencia_max_percent': 30.0,
            'medios_max_por_operacao': 3,
            'posicionamento_noticias': False,
            'overnight_trading': False
        }
    
    async def analyze_csv(
        self, 
        csv_content: str, 
        request: YlosAnalysisRequest
    ) -> YlosAnalysisResponse:
        """Analisa o CSV de operações conforme regras YLOS"""
        
        logger.info(
            "Iniciando análise YLOS",
            conta_type=request.conta_type,
            saldo_atual=request.saldo_atual,
            verificar_noticias=request.verificar_noticias
        )
        
        try:
            # Processar CSV
            df = self._process_csv(csv_content)
            
            # Selecionar regras baseadas no tipo de conta
            rules = (self.rules_master_funded 
                    if request.conta_type == ContaType.MASTER_FUNDED 
                    else self.rules_instant_funding)
            
            # Executar análises
            violacoes = []
            
            # 1. Análise de dias operados e vencedores
            dias_analysis = self._analyze_trading_days(df, rules)
            violacoes.extend(dias_analysis['violacoes'])
            
            # 2. Análise de consistência (regra dos 40% ou 30%)
            consistencia_analysis = self._analyze_consistency(df, rules)
            violacoes.extend(consistencia_analysis['violacoes'])
            
            # 3. Análise de estratégia de médio
            medios_analysis = self._analyze_averaging_strategy(df, rules)
            violacoes.extend(medios_analysis['violacoes'])
            
            # 4. Análise de notícias (se solicitado)
            noticias_analysis = None
            if request.verificar_noticias:
                noticias_analysis = await self._analyze_news_compliance(
                    df, request.fuso_horario
                )
                violacoes.extend(noticias_analysis['violacoes'])
            
            # 5. Verificar overnight trading
            overnight_analysis = self._analyze_overnight_trading(df)
            violacoes.extend(overnight_analysis['violacoes'])
            
            # Determinar se está aprovado
            critical_violations = [v for v in violacoes if v.severidade == "CRITICAL"]
            aprovado = len(critical_violations) == 0
            
            # Gerar recomendações
            recomendacoes = self._generate_recommendations(violacoes, dias_analysis)
            proximos_passos = self._generate_next_steps(violacoes, aprovado)
            
            response = YlosAnalysisResponse(
                aprovado=aprovado,
                total_operacoes=len(df),
                dias_operados=dias_analysis['dias_operados'],
                dias_vencedores=dias_analysis['dias_vencedores'],
                lucro_total=df['Total'].sum(),
                maior_lucro_dia=dias_analysis['maior_lucro_dia'],
                consistencia_40_percent=consistencia_analysis['passou_consistencia'],
                violacoes=violacoes,
                detalhes_noticias=noticias_analysis['detalhes'] if noticias_analysis else None,
                recomendacoes=recomendacoes,
                proximos_passos=proximos_passos
            )
            
            logger.info(
                "Análise YLOS concluída",
                aprovado=aprovado,
                total_violacoes=len(violacoes),
                violacoes_criticas=len(critical_violations)
            )
            
            return response
            
        except Exception as e:
            logger.error("Erro na análise YLOS", error=str(e))
            raise
    
    def _process_csv(self, csv_content: str) -> pd.DataFrame:
        """Processa o conteúdo CSV e retorna DataFrame limpo"""
        from io import StringIO
        
        # Ler CSV
        df = pd.read_csv(StringIO(csv_content), sep='\t')
        
        # Converter tipos
        df['Abertura'] = pd.to_datetime(df['Abertura'], format='%d/%m/%Y %H:%M')
        df['Fechamento'] = pd.to_datetime(df['Fechamento'], format='%d/%m/%Y %H:%M')
        
        return df
    
    def _analyze_trading_days(self, df: pd.DataFrame, rules: Dict) -> Dict[str, Any]:
        """Analisa dias operados e dias vencedores"""
        violacoes = []
        
        # Agrupar por dia
        df['data'] = df['Abertura'].dt.date
        daily_results = df.groupby('data')['Res. Operação'].sum()
        
        dias_operados = len(daily_results)
        dias_vencedores = len(daily_results[daily_results >= rules['lucro_minimo_dia_vencedor']])
        maior_lucro_dia = daily_results.max() if len(daily_results) > 0 else 0
        
        # Verificar dias mínimos operados
        if dias_operados < rules['dias_minimos']:
            violacoes.append(ViolacaoRegra(
                codigo="YLOS_DIAS_MIN",
                titulo="Dias Operados Insuficientes",
                descricao=f"Operou {dias_operados} dias, mínimo exigido: {rules['dias_minimos']}",
                severidade="CRITICAL"
            ))
        
        # Verificar dias vencedores mínimos
        if dias_vencedores < rules['dias_vencedores_minimos']:
            violacoes.append(ViolacaoRegra(
                codigo="YLOS_DIAS_VENC",
                titulo="Dias Vencedores Insuficientes",
                descricao=f"Teve {dias_vencedores} dias vencedores, mínimo exigido: {rules['dias_vencedores_minimos']}",
                severidade="CRITICAL"
            ))
        
        return {
            'violacoes': violacoes,
            'dias_operados': dias_operados,
            'dias_vencedores': dias_vencedores,
            'maior_lucro_dia': maior_lucro_dia,
            'daily_results': daily_results
        }
    
    def _analyze_consistency(self, df: pd.DataFrame, rules: Dict) -> Dict[str, Any]:
        """Analisa regra de consistência (40% ou 30%)"""
        violacoes = []
        
        # Agrupar por dia
        df['data'] = df['Abertura'].dt.date
        daily_results = df.groupby('data')['Res. Operação'].sum()
        
        lucro_total = daily_results[daily_results > 0].sum()
        maior_lucro_dia = daily_results.max() if len(daily_results) > 0 else 0
        
        passou_consistencia = True
        
        if lucro_total > 0:
            percent_maior_dia = (maior_lucro_dia / lucro_total) * 100
            
            if percent_maior_dia > rules['consistencia_max_percent']:
                passou_consistencia = False
                violacoes.append(ViolacaoRegra(
                    codigo="YLOS_CONSIST",
                    titulo="Violação da Regra de Consistência",
                    descricao=f"Maior lucro diário representa {percent_maior_dia:.1f}% do lucro total, máximo permitido: {rules['consistencia_max_percent']}%",
                    severidade="CRITICAL",
                    valor_impacto=maior_lucro_dia
                ))
        
        return {
            'violacoes': violacoes,
            'passou_consistencia': passou_consistencia
        }
    
    def _analyze_averaging_strategy(self, df: pd.DataFrame, rules: Dict) -> Dict[str, Any]:
        """Analisa estratégia de médio para trás"""
        violacoes = []
        
        # Verificar operações com médio
        operacoes_medio = df[df['Médio'] == 'Sim']
        
        if len(operacoes_medio) > 0:
            for _, op in operacoes_medio.iterrows():
                if op['Res. Operação'] < 0:
                    violacoes.append(ViolacaoRegra(
                        codigo="YLOS_MEDIO",
                        titulo="Possível Violação da Regra de Médio",
                        descricao=f"Operação com estratégia de médio resultou em prejuízo: {op['Res. Operação']}",
                        severidade="WARNING",
                        operacoes_afetadas=[{
                            'abertura': str(op['Abertura']),
                            'ativo': op['Ativo'],
                            'resultado': op['Res. Operação']
                        }]
                    ))
        
        return {'violacoes': violacoes}
    
    async def _analyze_news_compliance(self, df: pd.DataFrame, fuso_horario: str) -> Dict[str, Any]:
        """Analisa conformidade com eventos noticiosos"""
        violacoes = []
        detalhes = []
        
        if not settings.FINNHUB_API_KEY:
            logger.warning("FINNHUB_API_KEY não configurada, pulando análise de notícias")
            return {'violacoes': [], 'detalhes': []}
        
        try:
            # Obter eventos de notícias do período
            start_date = df['Abertura'].min().strftime('%Y-%m-%d')
            end_date = df['Abertura'].max().strftime('%Y-%m-%d')
            
            url = f"https://finnhub.io/api/v1/calendar/economic"
            params = {
                'from': start_date,
                'to': end_date,
                'token': settings.FINNHUB_API_KEY
            }
            
            response = requests.get(url, params=params, timeout=10)
            if response.status_code != 200:
                logger.warning(f"Erro na API Finnhub: {response.status_code}")
                return {'violacoes': [], 'detalhes': []}
            
            events = response.json().get("economicCalendar", [])
            high_impact_events = [event for event in events if event.get("impact") == "high"]
            
            # Configurar fusos horários
            csv_tz = pytz.timezone(self.timezone_map[fuso_horario])
            ny_tz = pytz.timezone("America/New_York")
            
            # Verificar infrações
            for _, row in df.iterrows():
                start_time = csv_tz.localize(row['Abertura'].replace(tzinfo=None))
                end_time = csv_tz.localize(row['Fechamento'].replace(tzinfo=None))
                
                # Converter para NY time
                start_ny = start_time.astimezone(ny_tz)
                end_ny = end_time.astimezone(ny_tz)
                
                for event in high_impact_events:
                    event_time = datetime.strptime(event["date"], "%Y-%m-%d %H:%M:%S")
                    event_time = ny_tz.localize(event_time)
                    
                    # Janela de 5 minutos antes e depois do evento
                    window_start = event_time - timedelta(minutes=5)
                    window_end = event_time + timedelta(minutes=5)
                    
                    # Verificar sobreposição
                    if start_ny <= window_end and end_ny >= window_start:
                        violacao = ViolacaoRegra(
                            codigo="YLOS_NEWS",
                            titulo="Posicionamento Durante Notícias",
                            descricao=f"Operação coincide com evento de alto impacto: {event['event']}",
                            severidade="CRITICAL",
                            operacoes_afetadas=[{
                                'abertura': str(row['Abertura']),
                                'fechamento': str(row['Fechamento']),
                                'evento': event['event'],
                                'evento_hora': event['date']
                            }]
                        )
                        violacoes.append(violacao)
                        
                        detalhes.append({
                            "operacao_inicio": str(row['Abertura']),
                            "ny_inicio": start_ny.strftime("%Y-%m-%d %H:%M:%S %Z"),
                            "evento": event["event"],
                            "evento_hora": event["date"]
                        })
            
        except Exception as e:
            logger.error("Erro na análise de notícias", error=str(e))
        
        return {'violacoes': violacoes, 'detalhes': detalhes}
    
    def _analyze_overnight_trading(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analisa se há trading overnight"""
        violacoes = []
        
        # Verificar se alguma operação ficou aberta overnight
        df['data_abertura'] = df['Abertura'].dt.date
        df['data_fechamento'] = df['Fechamento'].dt.date
        
        overnight_ops = df[df['data_abertura'] != df['data_fechamento']]
        
        for _, op in overnight_ops.iterrows():
            violacoes.append(ViolacaoRegra(
                codigo="YLOS_OVERNIGHT",
                titulo="Trading Overnight Detectado",
                descricao=f"Operação mantida overnight: {op['Ativo']} aberta em {op['data_abertura']} e fechada em {op['data_fechamento']}",
                severidade="CRITICAL",
                operacoes_afetadas=[{
                    'ativo': op['Ativo'],
                    'abertura': str(op['Abertura']),
                    'fechamento': str(op['Fechamento'])
                }]
            ))
        
        return {'violacoes': violacoes}
    
    def _generate_recommendations(self, violacoes: List[ViolacaoRegra], dias_analysis: Dict) -> List[str]:
        """Gera recomendações baseadas nas violações encontradas"""
        recomendacoes = []
        
        violation_codes = [v.codigo for v in violacoes]
        
        if "YLOS_DIAS_MIN" in violation_codes:
            recomendacoes.append("Aumente o número de dias operados para atender ao mínimo exigido")
        
        if "YLOS_DIAS_VENC" in violation_codes:
            recomendacoes.append("Foque em estratégias que gerem mais dias vencedores consistentes")
        
        if "YLOS_CONSIST" in violation_codes:
            recomendacoes.append("Distribua melhor os lucros ao longo dos dias para atender a regra de consistência")
        
        if "YLOS_NEWS" in violation_codes:
            recomendacoes.append("Evite manter posições abertas durante eventos noticiosos de alto impacto")
        
        if "YLOS_OVERNIGHT" in violation_codes:
            recomendacoes.append("Feche todas as posições antes do final do dia de trading")
        
        if not recomendacoes:
            recomendacoes.append("Parabéns! Suas operações estão em conformidade com as regras da YLOS")
        
        return recomendacoes
    
    def _generate_next_steps(self, violacoes: List[ViolacaoRegra], aprovado: bool) -> List[str]:
        """Gera próximos passos baseados na análise"""
        if aprovado:
            return [
                "Seu saque está aprovado conforme as regras analisadas",
                "Proceda com a solicitação de saque através do painel YLOS",
                "Continue mantendo a disciplina operacional para futuros saques"
            ]
        else:
            steps = [
                "Seu saque NÃO está aprovado devido às violações encontradas",
                "Revise as violações críticas listadas acima",
                "Ajuste sua estratégia para atender aos requisitos"
            ]
            
            critical_violations = [v for v in violacoes if v.severidade == "CRITICAL"]
            if len(critical_violations) > 0:
                steps.append(f"Corrija as {len(critical_violations)} violações críticas antes de solicitar o saque")
            
            return steps 