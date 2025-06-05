# Guia de Deploy - AWS Amplify

## ✅ Status do Projeto

O projeto está **100% pronto para deploy** na AWS Amplify com as seguintes verificações concluídas:

- ✅ TypeScript sem erros
- ✅ ESLint sem warnings
- ✅ Build de produção funcionando
- ✅ Configuração do Amplify (`amplify.yml`)
- ✅ Variáveis de ambiente documentadas
- ✅ Headers de segurança configurados
- ✅ Otimizações de performance aplicadas

## 🚀 Passos para Deploy

### 1. Preparação do Repositório

```bash
# Verificar se está tudo funcionando
npm run deploy:check

# Commit e push para o repositório
git add .
git commit -m "feat: projeto pronto para deploy AWS Amplify"
git push origin main
```

### 2. Configuração no AWS Amplify

1. **Acesse o AWS Amplify Console**
   - Vá para: https://console.aws.amazon.com/amplify/
   - Clique em "New app" > "Host web app"

2. **Conecte o Repositório**
   - Selecione "GitHub"
   - Autorize o acesso ao repositório
   - Selecione o repositório: `leonardobvieira22/propteam`
   - Branch: `main`

3. **Configurar Build Settings**
   - O arquivo `amplify.yml` já está configurado
   - Não é necessário alterar as configurações de build

4. **Configurar Variáveis de Ambiente**
   ```
   BACKEND_URL=https://your-backend-api-url.com
   NEXT_PUBLIC_FINNHUB_API_KEY=your-finnhub-api-key
   NODE_ENV=production
   ```

### 3. Configurações Avançadas

#### Headers de Segurança
Já configurados no `next.config.js`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

#### Cache e Performance
- Cache otimizado para `node_modules` e `.next`
- Build standalone para melhor performance
- Compressão automática habilitada

## 🔧 Variáveis de Ambiente Necessárias

### Obrigatórias
```env
BACKEND_URL=https://your-backend-api-url.com
NODE_ENV=production
```

### Opcionais
```env
NEXT_PUBLIC_FINNHUB_API_KEY=your-finnhub-api-key
NEXT_PUBLIC_APP_NAME=Mesa Prop Trading Analyzer
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 📊 Monitoramento

### Logs
- Logs estruturados configurados
- Integração com AWS CloudWatch pronta
- Error tracking implementado

### Performance
- Lighthouse Score esperado: 90+
- First Load JS: ~124KB
- Build otimizado para produção

## 🔍 Verificações Pós-Deploy

1. **Funcionalidade**
   - [ ] Página inicial carrega corretamente
   - [ ] Formulário de configuração funciona
   - [ ] Upload de CSV funciona
   - [ ] Análise retorna resultados (com backend conectado)

2. **Performance**
   - [ ] Tempo de carregamento < 3s
   - [ ] Lighthouse Score > 90
   - [ ] Sem erros no console

3. **Segurança**
   - [ ] Headers de segurança aplicados
   - [ ] HTTPS funcionando
   - [ ] Sem vulnerabilidades expostas

## 🐛 Troubleshooting

### Build Falha
```bash
# Verificar localmente
npm run build

# Verificar logs no Amplify Console
# Seção: Build logs
```

### Variáveis de Ambiente
```bash
# Verificar se estão definidas corretamente
# Amplify Console > App settings > Environment variables
```

### Performance Issues
```bash
# Analisar bundle
npm run build
# Verificar tamanho dos chunks na saída
```

## 📞 Suporte

- **Documentação**: Este README.md
- **Logs**: AWS Amplify Console > Build logs
- **Monitoramento**: AWS CloudWatch (quando backend estiver conectado)

---

**Status**: ✅ Pronto para deploy
**Última verificação**: $(date)
**Versão**: 1.0.0 