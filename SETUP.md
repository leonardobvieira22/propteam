# Setup - Sistema de Análise de Conformidade Mesa Proprietária

🛠️ Como Usar
Executar Backend: cd backend && uvicorn app.main:app --reload
Executar Frontend: npm run dev
Acessar: http://localhost:3000
Testar: Usar arquivo exemplo_csv_ylos.csv fornecido

## Visão Geral

Sistema enterprise-grade para análise de conformidade de saques em mesas proprietárias de trading, iniciando com a **YLOS Trading**.

## Arquitetura

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python
- **Análise**: Regras específicas da YLOS Trading
- **APIs Externas**: Finnhub (verificação de notícias)

## Setup do Backend (FastAPI)

### 1. Navegar para o diretório backend

```bash
cd backend
```

### 2. Criar ambiente virtual Python

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. Instalar dependências

```bash
pip install -r ../requirements.txt
```

### 4. Configurar variáveis de ambiente

```bash
# Copiar o arquivo de exemplo
cp env.example .env

# Editar o arquivo .env com suas configurações
# Obrigatório: FINNHUB_API_KEY (para verificação de notícias)
# Opcional: AWS CloudWatch, Redis, Database
```

### 5. Executar o servidor FastAPI

```bash
# Desenvolvimento
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Produção
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**API estará disponível em**: http://localhost:8000
**Documentação Swagger**: http://localhost:8000/docs
**ReDoc**: http://localhost:8000/redoc

## Setup do Frontend (Next.js)

### 1. Voltar para o diretório raiz

```bash
cd ..
```

### 2. Instalar dependências

```bash
npm install
# ou
pnpm install
```

### 3. Configurar variáveis de ambiente (opcional)

```bash
# Criar .env.local
echo "BACKEND_URL=http://localhost:8000" > .env.local
```

### 4. Executar o servidor Next.js

```bash
npm run dev
# ou
pnpm dev
```

**Frontend estará disponível em**: http://localhost:3000

## Funcionalidades Implementadas

### Análise YLOS Trading

#### Master Funded Account

- ✅ 10 dias operados mínimo
- ✅ 7 dias vencedores (≥$50/dia)
- ✅ Consistência: máximo 40% do lucro em um dia
- ✅ Máximo 3 médios por operação
- ✅ Proibido posicionamento durante notícias
- ✅ Sem overnight trading

#### Instant Funding

- ✅ 5 dias operados mínimo
- ✅ 5 dias vencedores (≥$200/dia)
- ✅ Consistência: máximo 30% do lucro em um dia
- ✅ Demais regras iguais ao Master Funded

### Interface do Usuário

- ✅ Seleção de mesa proprietária (YLOS)
- ✅ Formulário de configuração da conta
- ✅ Upload de arquivo CSV
- ✅ Análise em tempo real
- ✅ Relatório detalhado de conformidade
- ✅ Recomendações específicas

## Formato CSV Suportado

O sistema aceita arquivos CSV exportados do BlackArrow/YLOS Trading com as seguintes colunas:

```
Ativo	Abertura	Fechamento	Tempo Operação	Qtd Compra	Qtd Venda	Lado	Preço Compra	Preço Venda	Preço de Mercado	Médio	Res. Intervalo	Res. Intervalo (%)	Res. Operação	Res. Operação (%)	TET	Total
```

### Exemplo de Linha CSV:

```
ESFUT	04/06/2025 06:41	04/06/2025 07:21	39min53s	3	3	V	5.990,25	5.992,50	5.986,00	Não	337,5	0,04	337,5	0,04	 - 	337,5
```

## API Endpoints

### Backend FastAPI

#### POST `/api/v1/ylos/analyze`

Analisa arquivo CSV conforme regras YLOS Trading

**Request Body:**

```json
{
  "csv_content": "string",
  "conta_type": "MASTER_FUNDED | INSTANT_FUNDING",
  "saldo_atual": 51616.2,
  "fuso_horario": "-03",
  "verificar_noticias": true,
  "saques_realizados": 0
}
```

**Response:**

```json
{
  "aprovado": true,
  "total_operacoes": 8,
  "dias_operados": 2,
  "dias_vencedores": 2,
  "lucro_total": 1687.5,
  "maior_lucro_dia": 1050.0,
  "consistencia_40_percent": true,
  "violacoes": [],
  "recomendacoes": ["Parabéns! Suas operações estão em conformidade..."],
  "proximos_passos": ["Seu saque está aprovado..."]
}
```

#### GET `/health`

Health check do sistema

### Frontend Next.js

#### POST `/api/ylos/analyze`

Proxy para o backend FastAPI (mesma interface)

## Logging e Monitoramento

O sistema inclui logging estruturado enterprise-grade:

- **Desenvolvimento**: Logs coloridos no console
- **Produção**: JSON estruturado para AWS CloudWatch/Pino
- **Métricas**: Tempo de resposta, erros, violações encontradas

## Segurança

- ✅ Validação de entrada robusta
- ✅ Sanitização de dados CSV
- ✅ Rate limiting (preparado)
- ✅ CORS configurado
- ✅ Logging de auditoria

## Escalabilidade

A arquitetura foi projetada para múltiplas mesas proprietárias:

- **Modular**: Cada mesa tem seu próprio analisador
- **Configurável**: Regras específicas por mesa
- **Extensível**: Fácil adição de novas mesas

## Próximas Mesas

O sistema está preparado para integrar outras mesas proprietárias seguindo o mesmo padrão:

1. Criar novo modelo em `backend/app/models/`
2. Implementar analisador em `backend/app/services/`
3. Adicionar rotas em `backend/app/routers/`
4. Criar componente frontend em `src/components/analyzers/`

## Troubleshooting

### Backend não conecta

- Verificar se Python venv está ativado
- Verificar se todas dependências estão instaladas
- Verificar porta 8000 disponível

### Frontend não carrega

- Verificar se Node.js e npm/pnpm estão instalados
- Executar `npm install` novamente
- Verificar porta 3000 disponível

### Erro na análise de notícias

- Verificar se FINNHUB_API_KEY está configurada
- Verificar conexão com internet
- A análise continua sem verificação de notícias se houver erro

## Desenvolvimento

### Adicionar nova regra YLOS

1. Editar `backend/app/services/ylos_analyzer.py`
2. Atualizar modelos em `backend/app/models/ylos_models.py`
3. Adicionar testes

### Personalizar frontend

1. Editar estilos em `src/app/globals.css`
2. Modificar componentes em `src/components/`
3. Atualizar layouts em `src/app/`

## Suporte

Para dúvidas ou problemas:

1. Verificar logs do backend e frontend
2. Conferir configurações de ambiente
3. Validar formato do arquivo CSV
