'use client'

import { motion } from 'framer-motion'
import { 
  AlertCircle,
  AlertTriangle, 
  ArrowLeft, 
  BarChart3,
  CheckCircle, 
  Clock,
  DollarSign,
  ExternalLink,
  FileText, 
  Loader2,
  TrendingUp,
  Upload, 
  XCircle} from 'lucide-react'
import { useCallback,useState } from 'react'

interface YlosAnalyzerProps {
  onBack?: () => void
}

interface FormData {
  contaType: 'MASTER_FUNDED' | 'INSTANT_FUNDING'
  saldoAtual: string
  fusoHorario: string
  verificarNoticias: boolean
  saques: number
}

interface AnalysisResult {
  aprovado: boolean
  total_operacoes: number
  dias_operados: number
  dias_vencedores: number
  lucro_total: number
  maior_lucro_dia: number
  consistencia_40_percent: boolean
  violacoes: Array<{
    codigo: string
    titulo: string
    descricao: string
    severidade: 'CRITICAL' | 'WARNING' | 'INFO'
    valor_impacto?: number
    operacoes_afetadas?: unknown[]
  }>
  detalhes_noticias?: unknown[]
  recomendacoes: string[]
  proximos_passos: string[]
}

export default function YlosAnalyzer({ onBack }: YlosAnalyzerProps) {
  const [step, setStep] = useState<'form' | 'upload' | 'analyzing' | 'results'>('form')
  const [formData, setFormData] = useState<FormData>({
    contaType: 'MASTER_FUNDED',
    saldoAtual: '',
    fusoHorario: '-03',
    verificarNoticias: true,
    saques: 0
  })
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvContent, setCsvContent] = useState<string>('')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string>('')

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar formulário
    if (!formData.saldoAtual || parseFloat(formData.saldoAtual) <= 0) {
      setError('Por favor, informe um saldo válido')
      return
    }
    
    setError('')
    setStep('upload')
  }

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setError('Por favor, selecione um arquivo CSV válido')
      return
    }

    setCsvFile(file)
    setError('')

    // Ler conteúdo do arquivo
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setCsvContent(content)
    }
    reader.readAsText(file, 'utf-8')
  }, [])

  const handleAnalyze = async () => {
    if (!csvContent) {
      setError('Por favor, faça upload de um arquivo CSV')
      return
    }

    setError('')
    setStep('analyzing')

    try {
      const response = await fetch('/api/ylos/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csv_content: csvContent,
          conta_type: formData.contaType,
          saldo_atual: parseFloat(formData.saldoAtual),
          fuso_horario: formData.fusoHorario,
          verificar_noticias: formData.verificarNoticias,
          saques_realizados: formData.saques
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erro na análise')
      }

      const result = await response.json()
      setAnalysisResult(result)
      setStep('results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado na análise')
      setStep('upload')
    }
  }

  const renderForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Informações da Conta
      </h2>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Tipo de Conta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo da Conta
          </label>
          <select
            value={formData.contaType}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              contaType: e.target.value as 'MASTER_FUNDED' | 'INSTANT_FUNDING' 
            }))}
            className="input w-full"
          >
            <option value="MASTER_FUNDED">Master Funded Account</option>
            <option value="INSTANT_FUNDING">Instant Funding</option>
          </select>
        </div>

        {/* Saldo Atual */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Saldo Atual (USD)
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="Ex: 51616.20"
            value={formData.saldoAtual}
            onChange={(e) => setFormData(prev => ({ ...prev, saldoAtual: e.target.value }))}
            className="input w-full"
            required
          />
        </div>

        {/* Fuso Horário */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fuso Horário das Operações
          </label>
          <select
            value={formData.fusoHorario}
            onChange={(e) => setFormData(prev => ({ ...prev, fusoHorario: e.target.value }))}
            className="input w-full"
          >
            <option value="-03">-03 (BRT - Horário de Brasília)</option>
            <option value="-04">-04 (NY com DST)</option>
            <option value="-05">-05 (NY sem DST)</option>
            <option value="+00">+00 (UTC)</option>
          </select>
        </div>

        {/* Verificar Notícias */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="verificarNoticias"
            checked={formData.verificarNoticias}
            onChange={(e) => setFormData(prev => ({ ...prev, verificarNoticias: e.target.checked }))}
            className="checkbox"
          />
          <label htmlFor="verificarNoticias" className="text-sm text-gray-700">
            Verificar conformidade com eventos noticiosos
          </label>
        </div>

        {/* Saques Realizados */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantos saques já realizou nesta conta?
          </label>
          <input
            type="number"
            min="0"
            placeholder="Ex: 0, 1, 2, 3..."
            value={formData.saques}
            onChange={(e) => setFormData(prev => ({ ...prev, saques: parseInt(e.target.value) || 0 }))}
            className="input w-full"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4">
            <div className="flex">
              <XCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <button type="submit" className="btn-primary w-full">
          Continuar para Upload
        </button>
      </form>
    </motion.div>
  )

  const renderUpload = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Resumo */}
      <div className="card p-4 bg-blue-50">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Resumo da Análise</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Tipo: {formData.contaType === 'MASTER_FUNDED' ? 'Master Funded' : 'Instant Funding'}</p>
          <p>• Saldo: ${parseFloat(formData.saldoAtual).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p>• Fuso: {formData.fusoHorario}</p>
          <p>• Verificar notícias: {formData.verificarNoticias ? 'Sim' : 'Não'}</p>
        </div>
      </div>

      {/* Upload */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Upload do Relatório CSV
        </h2>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              Selecione seu arquivo CSV
            </p>
            <p className="text-gray-600">
              Arquivo exportado do BlackArrow/YLOS Trading
            </p>
          </div>
          
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="mt-4"
          />
        </div>

        {csvFile && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">{csvFile.name}</p>
                <p className="text-xs text-green-700">
                  {(csvFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-4">
            <div className="flex">
              <XCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => setStep('form')}
            className="btn-ghost flex-1"
          >
            Voltar
          </button>
          <button
            onClick={handleAnalyze}
            disabled={!csvFile}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            Analisar Relatório
          </button>
        </div>
      </div>
    </motion.div>
  )

  const renderAnalyzing = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-8 text-center"
    >
      <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Analisando Relatório...
      </h2>
      <p className="text-gray-600 mb-6">
        Verificando conformidade com todas as regras da YLOS Trading
      </p>
      
      <div className="space-y-2 text-sm text-gray-500">
        <p>✓ Processando operações...</p>
        <p>✓ Verificando dias operados e vencedores...</p>
        <p>✓ Analisando regra de consistência...</p>
        {formData.verificarNoticias && <p>✓ Verificando eventos noticiosos...</p>}
        <p>✓ Gerando relatório final...</p>
      </div>
    </motion.div>
  )

  const renderResults = () => {
    if (!analysisResult) return null

    const { aprovado, violacoes, recomendacoes, proximos_passos } = analysisResult
    const criticalViolations = violacoes.filter(v => v.severidade === 'CRITICAL')
    const warningViolations = violacoes.filter(v => v.severidade === 'WARNING')

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Status Principal */}
        <div className={`card p-6 ${aprovado ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center space-x-4">
            {aprovado ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <XCircle className="h-8 w-8 text-red-600" />
            )}
            <div>
              <h2 className={`text-xl font-semibold ${aprovado ? 'text-green-900' : 'text-red-900'}`}>
                {aprovado ? 'Saque Aprovado!' : 'Saque Não Aprovado'}
              </h2>
              <p className={`${aprovado ? 'text-green-700' : 'text-red-700'}`}>
                {aprovado 
                  ? 'Suas operações estão em conformidade com as regras YLOS'
                  : `${criticalViolations.length} violação(ões) crítica(s) encontrada(s)`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4 text-center">
            <BarChart3 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-gray-900">{analysisResult.total_operacoes}</p>
            <p className="text-sm text-gray-600">Operações</p>
          </div>
          <div className="card p-4 text-center">
            <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-gray-900">{analysisResult.dias_operados}</p>
            <p className="text-sm text-gray-600">Dias Operados</p>
          </div>
          <div className="card p-4 text-center">
            <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-gray-900">{analysisResult.dias_vencedores}</p>
            <p className="text-sm text-gray-600">Dias Vencedores</p>
          </div>
          <div className="card p-4 text-center">
            <DollarSign className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-gray-900">
              ${analysisResult.lucro_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-600">Lucro Total</p>
          </div>
        </div>

        {/* Violações */}
        {violacoes.length > 0 && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Violações Encontradas
            </h3>
            <div className="space-y-4">
              {criticalViolations.map((violacao, index) => (
                <div key={index} className="border-l-4 border-red-500 bg-red-50 p-4">
                  <div className="flex items-start space-x-3">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900">{violacao.titulo}</h4>
                      <p className="text-sm text-red-700">{violacao.descricao}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {warningViolations.map((violacao, index) => (
                <div key={index} className="border-l-4 border-yellow-500 bg-yellow-50 p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">{violacao.titulo}</h4>
                      <p className="text-sm text-yellow-700">{violacao.descricao}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recomendações */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recomendações
          </h3>
          <ul className="space-y-2">
            {recomendacoes.map((rec, index) => (
              <li key={index} className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Próximos Passos */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Próximos Passos
          </h3>
          <ol className="space-y-2">
            {proximos_passos.map((step, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <span className="text-gray-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Ações */}
        <div className="flex space-x-4">
          <button
            onClick={() => {
              setStep('form')
              setAnalysisResult(null)
              setCsvFile(null)
              setCsvContent('')
              setError('')
            }}
            className="btn-ghost flex-1"
          >
            Nova Análise
          </button>
          
          {aprovado && (
            <a
              href="https://ylostrading.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex-1 flex items-center justify-center space-x-2"
            >
              <span>Solicitar Saque</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="btn-ghost flex items-center space-x-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Análise YLOS Trading
              </h1>
              <p className="text-gray-600">
                Verificação de conformidade para saques
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-600">YLOS</span>
          </div>
        </motion.div>

        {/* Content */}
        {step === 'form' && renderForm()}
        {step === 'upload' && renderUpload()}
        {step === 'analyzing' && renderAnalyzing()}
        {step === 'results' && renderResults()}
      </div>
    </div>
  )
} 