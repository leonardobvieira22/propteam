# Mesa Prop Trading Analyzer

Sistema enterprise-grade para análise de conformidade de saques em mesas proprietárias de trading.

## 🚀 Funcionalidades

- ✅ Análise automática de regras YLOS Trading (Master Funded e Instant Funding)
- ✅ Verificação de dias operados e vencedores
- ✅ Validação da regra de consistência (40%/30%)
- ✅ Detecção de estratégia de médio (máximo 3)
- ✅ Verificação de posicionamento durante notícias
- ✅ Interface moderna e responsiva
- ✅ Logging estruturado para AWS CloudWatch
- ✅ Arquitetura enterprise escalável

## 🏗️ Arquitetura

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python
- **Deploy**: AWS Amplify (Frontend) + AWS Lambda/ECS (Backend)

## 📋 Pré-requisitos

- Node.js 18+
- Python 3.8+
- npm ou yarn

## 🛠️ Instalação Local

### Frontend

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env.local

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build:production
```

### Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows
source venv/Scripts/activate
# Linux/Mac
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp env.example .env

# Executar servidor
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 🚀 Deploy AWS Amplify

### 1. Preparação

```bash
# Verificar se está pronto para deploy
npm run deploy:check
```

### 2. Configuração no AWS Amplify

1. Acesse o AWS Amplify Console
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente:
   - `BACKEND_URL`: URL do seu backend em produção
   - `NEXT_PUBLIC_FINNHUB_API_KEY`: Chave da API Finnhub
   - `NODE_ENV`: production

### 3. Build Settings

O arquivo `amplify.yml` já está configurado com:

- Cache otimizado para node_modules e .next
- Build de produção
- Artifacts corretos

### 4. Variáveis de Ambiente Necessárias

```env
BACKEND_URL=https://your-backend-api-url.com
NEXT_PUBLIC_FINNHUB_API_KEY=your-finnhub-api-key
NODE_ENV=production
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Desenvolvimento
- `npm run build` - Build padrão
- `npm run build:production` - Build otimizado para produção
- `npm run deploy:check` - Verificação completa antes do deploy
- `npm run typecheck` - Verificação de tipos TypeScript
- `npm run lint` - Linting
- `npm run test` - Testes

## 📊 Monitoramento

- Logs estruturados para AWS CloudWatch
- Métricas de performance
- Error tracking
- Health checks

## 🔒 Segurança

- Headers de segurança configurados
- Validação de entrada rigorosa
- Rate limiting
- CORS configurado

## 📝 Uso

1. Acesse a aplicação
2. Selecione o tipo de conta (Master Funded ou Instant Funding)
3. Preencha as informações da conta
4. Faça upload do relatório CSV
5. Aguarde a análise automática
6. Visualize os resultados e recomendações

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto é proprietário e confidencial.

## 📞 Suporte

Para suporte técnico, entre em contato com a equipe de desenvolvimento.
