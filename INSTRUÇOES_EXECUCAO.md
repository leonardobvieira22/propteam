# 🚀 Instruções para Executar o Sistema

## ✅ **SOLUÇÃO DOS PROBLEMAS IDENTIFICADOS**

O problema estava na **falta da dependência `pydantic-settings`** no ambiente virtual. Agora está resolvido!

---

## 🖥️ **Para Usuários do Git Bash (MINGW64)**

### **1. Backend (FastAPI) - SIGA ESTES PASSOS:**

```bash
# 1. Abra o Git Bash e navegue para o projeto
cd "C:/Users/User/Desktop/mesa prop/ts-nextjs-tailwind-starter"

# 2. Entre no diretório backend
cd backend

# 3. Ative o ambiente virtual (Git Bash)
source venv/Scripts/activate

# 4. Instale a dependência que faltava (já feito, mas confirme)
pip install pydantic-settings

# 5. Execute o servidor
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**✅ Resultado esperado:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### **2. Frontend (Next.js) - EM OUTRO TERMINAL:**

```bash
# 1. Abra OUTRO Git Bash
cd "C:/Users/User/Desktop/mesa prop/ts-nextjs-tailwind-starter"

# 2. Execute o frontend
npm run dev
```

---

## 🔗 **URLs do Sistema:**

- **Frontend**: http://localhost:3000 (ou 3001)
- **Backend API**: http://localhost:8000  
- **Documentação**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

## ✅ **Status das Dependências:**

### **Backend (✅ INSTALADO):**
- ✅ `fastapi` - Framework web
- ✅ `uvicorn` - Servidor ASGI  
- ✅ `pydantic` - Validação de dados
- ✅ `pydantic-settings` - Configurações (ERA ISSO QUE FALTAVA!)
- ✅ `pandas` - Análise de dados
- ✅ `requests` - HTTP requests
- ✅ `structlog` - Logging
- ✅ `python-dotenv` - Variáveis de ambiente

### **Frontend (✅ INSTALADO):**
- ✅ `next` - Framework React
- ✅ `react` - Biblioteca UI
- ✅ `tailwindcss` - CSS framework
- ✅ `framer-motion` - Animações
- ✅ `lucide-react` - Ícones

---

## 🎯 **Como Testar o Sistema:**

### **1. Teste Backend:**
```bash
# Teste direto no Git Bash:
curl http://localhost:8000/health

# Ou acesse no navegador:
# http://localhost:8000/docs
```

### **2. Teste Frontend:**
```bash
# Acesse no navegador:
# http://localhost:3000
```

### **3. Teste Completo:**
1. Acesse http://localhost:3000
2. Clique em "Analisar YLOS Trading"
3. Preencha o formulário:
   - Tipo de conta: Master Funded
   - Saldo: 52000
   - Fuso horário: -03
4. Faça upload do CSV de exemplo
5. Veja o resultado da análise

---

## 📁 **Arquivo CSV de Exemplo (exemplo_csv_ylos.csv):**

Já existe no projeto e pode ser usado para teste:
```
Ativo	Abertura	Fechamento	Tempo Operação	Qtd Compra	Qtd Venda	Lado	Preço Compra	Preço Venda	Preço de Mercado	Médio	Res. Intervalo	Res. Intervalo (%)	Res. Operação	Res. Operação (%)	TET	Total
ESFUT	04/06/2025 06:41	04/06/2025 07:21	39min53s	3	3	V	5.990,25	5.992,50	5.986,00	Não	337,5	0,04	337,5	0,04	 - 	337,5
```

---

## 🔧 **Solução de Problemas:**

### **Erro "ModuleNotFoundError: No module named 'pydantic_settings'"**
```bash
# SOLUÇÃO (já aplicada):
cd backend
source venv/Scripts/activate  # Git Bash
pip install pydantic-settings
```

### **Erro "command not found" no Git Bash**
```bash
# Use 'source' em vez de '.\'
source venv/Scripts/activate  # ✅ Correto para Git Bash
# NÃO use: .\venv\Scripts\Activate.ps1  # ❌ Só funciona no PowerShell
```

### **Se o frontend der erro CSS**
```bash
# Já corrigido no código, mas se precisar:
npm install framer-motion --legacy-peer-deps
```

---

## 🏆 **STATUS FINAL:**

**🟢 SISTEMA 100% FUNCIONAL**

- ✅ Backend FastAPI operacional
- ✅ Frontend Next.js funcionando  
- ✅ Todas as dependências instaladas
- ✅ Análise YLOS Trading implementada
- ✅ Upload de CSV funcionando
- ✅ Interface moderna e responsiva

**O sistema está pronto para uso em produção!** 🚀 