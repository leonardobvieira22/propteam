'use client';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  ExternalLink,
  FileText,
  Loader2,
  Moon,
  Shuffle,
  TrendingUp,
  Upload,
  XCircle,
} from 'lucide-react';
import { useCallback, useState } from 'react';

interface YlosAnalyzerProps {
  onBack?: () => void;
}

interface FormData {
  contaType: 'MASTER_FUNDED' | 'INSTANT_FUNDING';
  saldoAtual: string;
  fusoHorario: string;
  verificarNoticias: boolean;
  saques: number;
}

interface AnalysisResult {
  aprovado: boolean;
  total_operacoes: number;
  dias_operados: number;
  dias_vencedores: number;
  lucro_total: number;
  maior_lucro_dia: number;
  consistencia_40_percent: boolean;
  violacoes: Array<{
    codigo: string;
    titulo: string;
    descricao: string;
    severidade: 'CRITICAL' | 'WARNING' | 'INFO';
    valor_impacto?: number;
    operacoes_afetadas?: unknown[];
  }>;
  detalhes_noticias?: unknown[];
  recomendacoes: string[];
  proximos_passos: string[];
}

export default function YlosAnalyzer({ onBack }: YlosAnalyzerProps) {
  const [step, setStep] = useState<'form' | 'upload' | 'analyzing' | 'results'>(
    'form',
  );
  const [formData, setFormData] = useState<FormData>({
    contaType: 'MASTER_FUNDED',
    saldoAtual: '',
    fusoHorario: '-03',
    verificarNoticias: true,
    saques: 0,
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [error, setError] = useState<string>('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar formulário
    if (!formData.saldoAtual || parseFloat(formData.saldoAtual) <= 0) {
      setError('Por favor, informe um saldo válido');
      return;
    }

    setError('');
    setStep('upload');
  };

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validar tipo de arquivo
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
        setError('Por favor, selecione um arquivo CSV válido');
        return;
      }

      setCsvFile(file);
      setError('');

      // Ler conteúdo do arquivo
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCsvContent(content);
      };
      reader.readAsText(file, 'utf-8');
    },
    [],
  );

  const handleAnalyze = async () => {
    if (!csvContent) {
      setError('Por favor, faça upload de um arquivo CSV');
      return;
    }

    setError('');
    setStep('analyzing');

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
          saques_realizados: formData.saques,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro na análise');
      }

      const result = await response.json();
      setAnalysisResult(result);
      setStep('results');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro inesperado na análise',
      );
      setStep('upload');
    }
  };

  const renderForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='card p-6'
    >
      <h2 className='mb-6 text-xl font-semibold text-gray-900'>
        Informações da Conta
      </h2>

      <form onSubmit={handleFormSubmit} className='space-y-6'>
        {/* Tipo de Conta */}
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Tipo da Conta
          </label>
          <select
            value={formData.contaType}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                contaType: e.target.value as
                  | 'MASTER_FUNDED'
                  | 'INSTANT_FUNDING',
              }))
            }
            className='input w-full'
          >
            <option value='MASTER_FUNDED'>Master Funded Account</option>
            <option value='INSTANT_FUNDING'>Instant Funding</option>
          </select>
        </div>

        {/* Saldo Atual */}
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Saldo Atual (USD)
          </label>
          <input
            type='number'
            step='0.01'
            placeholder='Ex: 51616.20'
            value={formData.saldoAtual}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, saldoAtual: e.target.value }))
            }
            className='input w-full'
            required
          />
        </div>

        {/* Fuso Horário */}
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Fuso Horário das Operações
          </label>
          <select
            value={formData.fusoHorario}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, fusoHorario: e.target.value }))
            }
            className='input w-full'
          >
            <option value='-03'>-03 (BRT - Horário de Brasília)</option>
            <option value='-04'>-04 (NY com DST)</option>
            <option value='-05'>-05 (NY sem DST)</option>
            <option value='+00'>+00 (UTC)</option>
          </select>
        </div>

        {/* Verificar Notícias */}
        <div className='flex items-center space-x-3'>
          <input
            type='checkbox'
            id='verificarNoticias'
            checked={formData.verificarNoticias}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                verificarNoticias: e.target.checked,
              }))
            }
            className='checkbox'
          />
          <label htmlFor='verificarNoticias' className='text-sm text-gray-700'>
            Verificar conformidade com eventos noticiosos
          </label>
        </div>

        {/* Saques Realizados */}
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Quantos saques já realizou nesta conta?
          </label>
          <input
            type='number'
            min='0'
            placeholder='Ex: 0, 1, 2, 3...'
            value={formData.saques}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                saques: parseInt(e.target.value) || 0,
              }))
            }
            className='input w-full'
          />
        </div>

        {error && (
          <div className='rounded-lg bg-red-50 p-4'>
            <div className='flex'>
              <XCircle className='h-5 w-5 text-red-400' />
              <div className='ml-3'>
                <p className='text-sm text-red-800'>{error}</p>
              </div>
            </div>
          </div>
        )}

        <button type='submit' className='btn-primary w-full'>
          Continuar para Upload
        </button>
      </form>
    </motion.div>
  );

  const renderUpload = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-6'
    >
      {/* Resumo */}
      <div className='card bg-blue-50 p-4'>
        <h3 className='mb-2 text-sm font-medium text-blue-900'>
          Resumo da Análise
        </h3>
        <div className='space-y-1 text-sm text-blue-800'>
          <p>
            • Tipo:{' '}
            {formData.contaType === 'MASTER_FUNDED'
              ? 'Master Funded'
              : 'Instant Funding'}
          </p>
          <p>
            • Saldo: $
            {parseFloat(formData.saldoAtual).toLocaleString('en-US', {
              minimumFractionDigits: 2,
            })}
          </p>
          <p>• Fuso: {formData.fusoHorario}</p>
          <p>
            • Verificar notícias: {formData.verificarNoticias ? 'Sim' : 'Não'}
          </p>
        </div>
      </div>

      {/* Upload */}
      <div className='card p-6'>
        <h2 className='mb-4 text-xl font-semibold text-gray-900'>
          Upload do Relatório CSV
        </h2>

        <div className='rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-gray-400'>
          <Upload className='mx-auto mb-4 h-12 w-12 text-gray-400' />
          <div className='space-y-2'>
            <p className='text-lg font-medium text-gray-900'>
              Selecione seu arquivo CSV
            </p>
            <p className='text-gray-600'>
              Arquivo exportado do BlackArrow/YLOS Trading
            </p>
          </div>

          <input
            type='file'
            accept='.csv,.txt'
            onChange={handleFileUpload}
            className='mt-4'
          />
        </div>

        {csvFile && (
          <div className='mt-4 rounded-lg bg-green-50 p-4'>
            <div className='flex items-center space-x-3'>
              <FileText className='h-5 w-5 text-green-600' />
              <div>
                <p className='text-sm font-medium text-green-900'>
                  {csvFile.name}
                </p>
                <p className='text-xs text-green-700'>
                  {(csvFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className='mt-4 rounded-lg bg-red-50 p-4'>
            <div className='flex'>
              <XCircle className='h-5 w-5 text-red-400' />
              <div className='ml-3'>
                <p className='text-sm text-red-800'>{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className='mt-6 flex space-x-4'>
          <button onClick={() => setStep('form')} className='btn-ghost flex-1'>
            Voltar
          </button>
          <button
            onClick={handleAnalyze}
            disabled={!csvFile}
            className='btn-primary flex-1 disabled:opacity-50'
          >
            Analisar Relatório
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderAnalyzing = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='card p-8 text-center'
    >
      <Loader2 className='mx-auto mb-4 h-12 w-12 animate-spin text-blue-600' />
      <h2 className='mb-2 text-xl font-semibold text-gray-900'>
        Analisando Relatório...
      </h2>
      <p className='mb-6 text-gray-600'>
        Verificando conformidade com todas as regras da YLOS Trading
      </p>

      <div className='space-y-2 text-sm text-gray-500'>
        <p>✓ Processando operações...</p>
        <p>✓ Verificando dias operados e vencedores...</p>
        <p>✓ Analisando regra de consistência...</p>
        {formData.verificarNoticias && (
          <p>✓ Verificando eventos noticiosos...</p>
        )}
        <p>✓ Gerando relatório final...</p>
      </div>
    </motion.div>
  );

  const renderResults = () => {
    if (!analysisResult) return null;

    const { aprovado, violacoes, recomendacoes, proximos_passos } =
      analysisResult;
    const criticalViolations = violacoes.filter(
      (v) => v.severidade === 'CRITICAL',
    );
    const warningViolations = violacoes.filter(
      (v) => v.severidade === 'WARNING',
    );

    // Calculate compliance metrics baseado no FAQ oficial YLOS
    const minDaysRequired = formData.contaType === 'MASTER_FUNDED' ? 10 : 5;
    const minWinningDays = formData.contaType === 'MASTER_FUNDED' ? 7 : 5;
    const minDailyWin = formData.contaType === 'MASTER_FUNDED' ? 50 : 200;
    const maxDayPercentage = formData.contaType === 'MASTER_FUNDED' ? 40 : 30;

    // Calculate daily profit limit based on withdrawal threshold and consistency rule
    const withdrawalThresholds: Record<number, number> = {
      25000: 1600, // 25K account
      50000: 2600, // 50K account
      100000: 3100, // 100K account
      150000: 5100, // 150K account (estimated)
      250000: 6600, // 250K account (estimated)
      300000: 7600, // 300K account (estimated)
    };

    const saldoAtualNum = parseFloat(formData.saldoAtual);
    const withdrawalThreshold =
      withdrawalThresholds[saldoAtualNum] || saldoAtualNum * 0.052;
    const consistencyDecimal =
      formData.contaType === 'MASTER_FUNDED' ? 0.4 : 0.3;
    const dailyProfitLimit = withdrawalThreshold * consistencyDecimal;

    // Regra de Consistência oficial: % do melhor dia vs lucro total
    const bestDayPercentage =
      analysisResult.lucro_total > 0
        ? (analysisResult.maior_lucro_dia / analysisResult.lucro_total) * 100
        : 0;

    // Taxa de sucesso baseada em dias vencedores com valor mínimo oficial
    const consistencyPercentage =
      analysisResult.dias_operados > 0
        ? (
            (analysisResult.dias_vencedores / analysisResult.dias_operados) *
            100
          ).toFixed(1)
        : '0.0';

    // YLOS Trading rules analysis - conforme FAQ oficial
    const rulesAnalysis = [
      {
        code: 'DIAS_MINIMOS',
        title: 'Dias Mínimos de Operação',
        description: `Mínimo ${minDaysRequired} dias para ${formData.contaType === 'MASTER_FUNDED' ? 'Master Funded' : 'Instant Funding'}`,
        current: analysisResult.dias_operados,
        required: minDaysRequired,
        status:
          analysisResult.dias_operados >= minDaysRequired
            ? 'approved'
            : 'rejected',
        icon: Clock,
        severity:
          analysisResult.dias_operados >= minDaysRequired
            ? 'success'
            : 'critical',
      },
      {
        code: 'DIAS_VENCEDORES',
        title: 'Dias Vencedores Obrigatórios',
        description: `Mínimo ${minWinningDays} dias com lucro ≥ $${minDailyWin}`,
        current: analysisResult.dias_vencedores,
        required: minWinningDays,
        status:
          analysisResult.dias_vencedores >= minWinningDays
            ? 'approved'
            : 'rejected',
        icon: Calendar,
        severity:
          analysisResult.dias_vencedores >= minWinningDays
            ? 'success'
            : 'critical',
      },
      {
        code: 'CONSISTENCIA',
        title: 'Regra de Consistência',
        description: `Nenhum dia pode exceder ${maxDayPercentage}% do lucro total`,
        current: bestDayPercentage,
        required: maxDayPercentage,
        status: bestDayPercentage <= maxDayPercentage ? 'approved' : 'rejected',
        icon: TrendingUp,
        severity:
          bestDayPercentage <= maxDayPercentage ? 'success' : 'critical',
      },
      {
        code: 'LIMITE_DIARIO_CONSISTENCIA',
        title: 'Limite Diário (Regra Consistência)',
        description: `Máx. $${dailyProfitLimit.toFixed(0)} por dia (meta colchão $${withdrawalThreshold.toFixed(0)} x ${consistencyDecimal * 100}%)`,
        current: `$${analysisResult.maior_lucro_dia.toFixed(2)}`,
        required: `$${dailyProfitLimit.toFixed(2)}`,
        status:
          analysisResult.maior_lucro_dia <= dailyProfitLimit
            ? 'approved'
            : 'rejected',
        icon: DollarSign,
        severity:
          analysisResult.maior_lucro_dia <= dailyProfitLimit
            ? 'success'
            : 'critical',
      },
      {
        code: 'OVERNIGHT',
        title: 'Posições Overnight',
        description:
          formData.contaType === 'MASTER_FUNDED'
            ? 'PROIBIDO em Master Funded'
            : 'Verificação de operações entre dias',
        current: violacoes.some((v) => v.codigo === 'OVERNIGHT')
          ? 'Detectadas'
          : 'Nenhuma',
        required: 'Nenhuma',
        status: !violacoes.some((v) => v.codigo === 'OVERNIGHT')
          ? 'approved'
          : formData.contaType === 'MASTER_FUNDED'
            ? 'rejected'
            : 'warning',
        icon: Moon,
        severity: !violacoes.some((v) => v.codigo === 'OVERNIGHT')
          ? 'success'
          : formData.contaType === 'MASTER_FUNDED'
            ? 'critical'
            : 'warning',
      },
      {
        code: 'DCA_STRATEGY',
        title: 'Estratégia de Médio (DCA)',
        description: 'Máximo 3 dias com operações de médio',
        current: violacoes.some((v) => v.codigo === 'DCA_EXCESSIVO')
          ? 'Excedeu'
          : 'Dentro do limite',
        required: 'Máx. 3 dias',
        status: !violacoes.some((v) => v.codigo === 'DCA_EXCESSIVO')
          ? 'approved'
          : 'warning',
        icon: Shuffle,
        severity: !violacoes.some((v) => v.codigo === 'DCA_EXCESSIVO')
          ? 'success'
          : 'warning',
      },
      {
        code: 'ABERTURA_NY',
        title: 'Abertura Mercado NY',
        description:
          formData.contaType === 'MASTER_FUNDED'
            ? 'PROIBIDO operar durante abertura NY (9:30 AM)'
            : 'Verificação de operações durante abertura NY',
        current: violacoes.some((v) => v.codigo === 'ABERTURA_NY')
          ? 'Detectadas'
          : 'Nenhuma',
        required: 'Nenhuma',
        status: !violacoes.some((v) => v.codigo === 'ABERTURA_NY')
          ? 'approved'
          : formData.contaType === 'MASTER_FUNDED'
            ? 'rejected'
            : 'warning',
        icon: Clock,
        severity: !violacoes.some((v) => v.codigo === 'ABERTURA_NY')
          ? 'success'
          : formData.contaType === 'MASTER_FUNDED'
            ? 'critical'
            : 'warning',
      },
      {
        code: 'OPERACAO_NOTICIAS',
        title: 'Operações Durante Notícias',
        description:
          formData.contaType === 'MASTER_FUNDED'
            ? 'PROIBIDO estar posicionado durante notícias'
            : 'Verificação de operações durante notícias',
        current: violacoes.some((v) => v.codigo === 'OPERACAO_NOTICIAS')
          ? 'Detectadas'
          : 'Nenhuma',
        required: 'Nenhuma',
        status: !violacoes.some((v) => v.codigo === 'OPERACAO_NOTICIAS')
          ? 'approved'
          : formData.contaType === 'MASTER_FUNDED'
            ? 'rejected'
            : 'warning',
        icon: AlertTriangle,
        severity: !violacoes.some((v) => v.codigo === 'OPERACAO_NOTICIAS')
          ? 'success'
          : formData.contaType === 'MASTER_FUNDED'
            ? 'critical'
            : 'warning',
      },
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='space-y-8'
      >
        {/* Executive Summary */}
        <div
          className={`card p-8 ${aprovado ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50' : 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50'}`}
        >
          <div className='flex items-start justify-between'>
            <div className='flex items-center space-x-6'>
              <div
                className={`rounded-full p-4 ${aprovado ? 'bg-green-100' : 'bg-red-100'}`}
              >
                {aprovado ? (
                  <CheckCircle className='h-10 w-10 text-green-600' />
                ) : (
                  <XCircle className='h-10 w-10 text-red-600' />
                )}
              </div>
              <div>
                <h2
                  className={`text-3xl font-bold ${aprovado ? 'text-green-900' : 'text-red-900'}`}
                >
                  {aprovado ? 'Saque Aprovado' : 'Saque Não Aprovado'}
                </h2>
                <p
                  className={`text-lg ${aprovado ? 'text-green-700' : 'text-red-700'} mt-1`}
                >
                  {aprovado
                    ? 'Todas as regras YLOS Trading foram atendidas'
                    : `${criticalViolations.length} violação(ões) crítica(s) encontrada(s)`}
                </p>
                <div className='mt-3 flex items-center space-x-4'>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      aprovado
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {formData.contaType === 'MASTER_FUNDED'
                      ? 'Master Funded'
                      : 'Instant Funding'}
                  </span>
                  <span className='text-sm text-gray-600'>
                    Análise gerada em {new Date().toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            <div className='text-right'>
              <div className='text-3xl font-bold text-gray-900'>
                {parseFloat(consistencyPercentage)}%
              </div>
              <div className='text-sm text-gray-600'>Taxa de Sucesso</div>
            </div>
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
          <div className='card bg-gradient-to-br from-blue-50 to-blue-100 p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <BarChart3 className='h-8 w-8 text-blue-600' />
              <span className='text-2xl font-bold text-blue-900'>
                {analysisResult.total_operacoes}
              </span>
            </div>
            <h3 className='font-semibold text-blue-900'>Total de Operações</h3>
            <p className='mt-1 text-sm text-blue-700'>Executadas no período</p>
          </div>

          <div className='card bg-gradient-to-br from-green-50 to-green-100 p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <Calendar className='h-8 w-8 text-green-600' />
              <span className='text-2xl font-bold text-green-900'>
                {analysisResult.dias_operados}
              </span>
            </div>
            <h3 className='font-semibold text-green-900'>Dias Operados</h3>
            <p className='mt-1 text-sm text-green-700'>
              {analysisResult.dias_operados >= minDaysRequired
                ? 'Requisito atendido'
                : `Faltam ${minDaysRequired - analysisResult.dias_operados} dias`}
            </p>
          </div>

          <div className='card bg-gradient-to-br from-purple-50 to-purple-100 p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <TrendingUp className='h-8 w-8 text-purple-600' />
              <span className='text-2xl font-bold text-purple-900'>
                {consistencyPercentage}%
              </span>
            </div>
            <h3 className='font-semibold text-purple-900'>Consistência</h3>
            <p className='mt-1 text-sm text-purple-700'>
              {analysisResult.dias_vencedores}/{analysisResult.dias_operados}{' '}
              dias vencedores
            </p>
          </div>

          <div className='card bg-gradient-to-br from-yellow-50 to-yellow-100 p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <DollarSign className='h-8 w-8 text-yellow-600' />
              <span className='text-2xl font-bold text-yellow-900'>
                $
                {analysisResult.lucro_total.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <h3 className='font-semibold text-yellow-900'>Lucro Total</h3>
            <p className='mt-1 text-sm text-yellow-700'>
              Maior dia: $
              {analysisResult.maior_lucro_dia.toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {/* YLOS Trading Rules Analysis */}
        <div className='card p-6'>
          <h3 className='mb-6 flex items-center space-x-2 text-xl font-semibold text-gray-900'>
            <BarChart3 className='h-6 w-6 text-blue-600' />
            <span>Análise Detalhada das Regras YLOS</span>
          </h3>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {rulesAnalysis.map((rule, index) => {
              const IconComponent = rule.icon;
              const isApproved = rule.status === 'approved';
              const isWarning = rule.status === 'warning';

              return (
                <div
                  key={index}
                  className={`rounded-lg border-2 p-4 transition-all ${
                    isApproved
                      ? 'border-green-200 bg-green-50 hover:border-green-300'
                      : isWarning
                        ? 'border-yellow-200 bg-yellow-50 hover:border-yellow-300'
                        : 'border-red-200 bg-red-50 hover:border-red-300'
                  }`}
                >
                  <div className='mb-3 flex items-start justify-between'>
                    <div
                      className={`rounded-lg p-2 ${
                        isApproved
                          ? 'bg-green-100'
                          : isWarning
                            ? 'bg-yellow-100'
                            : 'bg-red-100'
                      }`}
                    >
                      <IconComponent
                        className={`h-5 w-5 ${
                          isApproved
                            ? 'text-green-600'
                            : isWarning
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}
                      />
                    </div>

                    <div
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        isApproved
                          ? 'bg-green-100 text-green-800'
                          : isWarning
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {isApproved
                        ? 'Aprovado'
                        : isWarning
                          ? 'Atenção'
                          : 'Reprovado'}
                    </div>
                  </div>

                  <h4
                    className={`mb-2 text-sm font-semibold ${
                      isApproved
                        ? 'text-green-900'
                        : isWarning
                          ? 'text-yellow-900'
                          : 'text-red-900'
                    }`}
                  >
                    {rule.title}
                  </h4>

                  <p
                    className={`mb-3 text-xs ${
                      isApproved
                        ? 'text-green-700'
                        : isWarning
                          ? 'text-yellow-700'
                          : 'text-red-700'
                    }`}
                  >
                    {rule.description}
                  </p>

                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-gray-600'>Atual:</span>
                      <span
                        className={`text-xs font-medium ${
                          isApproved
                            ? 'text-green-700'
                            : isWarning
                              ? 'text-yellow-700'
                              : 'text-red-700'
                        }`}
                      >
                        {typeof rule.current === 'number'
                          ? rule.code === 'LIMITE_DIARIO' ||
                            rule.code === 'DIAS_MINIMOS'
                            ? rule.current.toLocaleString('en-US', {
                                minimumFractionDigits:
                                  rule.code === 'LIMITE_DIARIO' ? 2 : 0,
                              })
                            : `${rule.current}${rule.code === 'CONSISTENCIA' ? '%' : ''}`
                          : rule.current}
                      </span>
                    </div>

                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-gray-600'>Requerido:</span>
                      <span className='text-xs text-gray-800'>
                        {typeof rule.required === 'number'
                          ? rule.code === 'LIMITE_DIARIO'
                            ? `≤ ${rule.required.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`
                            : rule.code === 'DIAS_MINIMOS'
                              ? `≥ ${rule.required} dias`
                              : `≥ ${rule.required}%`
                          : rule.required}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Violações Críticas */}
        {violacoes.length > 0 && (
          <div className='card p-6'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900'>
              Violações Encontradas
            </h3>
            <div className='space-y-4'>
              {criticalViolations.map((violacao, index) => (
                <div
                  key={index}
                  className='border-l-4 border-red-500 bg-red-50 p-4'
                >
                  <div className='flex items-start space-x-3'>
                    <XCircle className='mt-0.5 h-5 w-5 text-red-500' />
                    <div>
                      <h4 className='font-medium text-red-900'>
                        {violacao.titulo}
                      </h4>
                      <p className='text-sm text-red-700'>
                        {violacao.descricao}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {warningViolations.map((violacao, index) => (
                <div
                  key={index}
                  className='border-l-4 border-yellow-500 bg-yellow-50 p-4'
                >
                  <div className='flex items-start space-x-3'>
                    <AlertTriangle className='mt-0.5 h-5 w-5 text-yellow-500' />
                    <div>
                      <h4 className='font-medium text-yellow-900'>
                        {violacao.titulo}
                      </h4>
                      <p className='text-sm text-yellow-700'>
                        {violacao.descricao}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Professional Recommendations & Action Plan */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* Recomendações Estratégicas */}
          <div className='card bg-gradient-to-br from-blue-50 to-indigo-50 p-6'>
            <h3 className='mb-4 flex items-center space-x-2 text-lg font-semibold text-gray-900'>
              <AlertCircle className='h-6 w-6 text-blue-600' />
              <span>Recomendações Estratégicas</span>
            </h3>
            <div className='space-y-4'>
              {recomendacoes.map((rec, index) => (
                <div
                  key={index}
                  className='rounded-lg border border-blue-200 bg-white p-4'
                >
                  <div className='flex items-start space-x-3'>
                    <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600'>
                      {index + 1}
                    </div>
                    <p className='text-sm leading-relaxed text-gray-700'>
                      {rec}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plano de Ação */}
          <div className='card bg-gradient-to-br from-purple-50 to-pink-50 p-6'>
            <h3 className='mb-4 flex items-center space-x-2 text-lg font-semibold text-gray-900'>
              <CheckCircle className='h-6 w-6 text-purple-600' />
              <span>Plano de Ação</span>
            </h3>
            <div className='space-y-4'>
              {proximos_passos.map((step, index) => (
                <div
                  key={index}
                  className='rounded-lg border border-purple-200 bg-white p-4'
                >
                  <div className='flex items-start space-x-3'>
                    <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-xs font-medium text-white'>
                      {index + 1}
                    </div>
                    <p className='text-sm leading-relaxed text-gray-700'>
                      {step}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Professional Insights */}
        <div className='card bg-gradient-to-r from-gray-50 to-slate-50 p-6'>
          <h3 className='mb-4 flex items-center space-x-2 text-lg font-semibold text-gray-900'>
            <BarChart3 className='h-6 w-6 text-gray-600' />
            <span>Insights Profissionais</span>
          </h3>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {/* Performance Score */}
            <div className='rounded-lg border border-gray-200 bg-white p-4'>
              <div className='text-center'>
                <div
                  className={`mb-2 text-3xl font-bold ${
                    aprovado ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {(
                    100 -
                    criticalViolations.length * 30 -
                    warningViolations.length * 10
                  ).toFixed(0)}
                  %
                </div>
                <div className='text-sm text-gray-600'>
                  Score de Conformidade
                </div>
              </div>
            </div>

            {/* Risk Level */}
            <div className='rounded-lg border border-gray-200 bg-white p-4'>
              <div className='text-center'>
                <div
                  className={`mb-2 text-lg font-bold ${
                    criticalViolations.length === 0
                      ? 'text-green-600'
                      : criticalViolations.length <= 1
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {criticalViolations.length === 0
                    ? 'BAIXO'
                    : criticalViolations.length <= 1
                      ? 'MÉDIO'
                      : 'ALTO'}
                </div>
                <div className='text-sm text-gray-600'>Nível de Risco</div>
              </div>
            </div>

            {/* Trading Quality */}
            <div className='rounded-lg border border-gray-200 bg-white p-4'>
              <div className='text-center'>
                <div
                  className={`mb-2 text-lg font-bold ${
                    parseFloat(consistencyPercentage) >= 80
                      ? 'text-green-600'
                      : parseFloat(consistencyPercentage) >= 50
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {parseFloat(consistencyPercentage) >= 80
                    ? 'EXCELENTE'
                    : parseFloat(consistencyPercentage) >= 50
                      ? 'BOA'
                      : 'BAIXA'}
                </div>
                <div className='text-sm text-gray-600'>
                  Qualidade do Trading
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Action Center */}
        <div className='card bg-gradient-to-r from-slate-900 to-gray-800 p-6 text-white'>
          <h3 className='mb-4 flex items-center space-x-2 text-lg font-semibold'>
            <CheckCircle className='h-6 w-6' />
            <span>Centro de Ações</span>
          </h3>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {/* Nova Análise */}
            <button
              onClick={() => {
                setStep('form');
                setAnalysisResult(null);
                setCsvFile(null);
                setCsvContent('');
                setError('');
              }}
              className='flex items-center space-x-3 rounded-lg bg-white bg-opacity-10 p-4 text-left transition-all duration-200 hover:bg-opacity-20'
            >
              <div className='rounded-lg bg-white bg-opacity-20 p-2'>
                <ArrowLeft className='h-5 w-5' />
              </div>
              <div>
                <div className='font-medium'>Nova Análise</div>
                <div className='text-sm text-gray-300'>
                  Analisar outra conta
                </div>
              </div>
            </button>

            {/* Solicitar Saque ou Revisar */}
            {aprovado ? (
              <a
                href='https://ylostrading.com'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center space-x-3 rounded-lg bg-green-600 p-4 text-left transition-all duration-200 hover:bg-green-700'
              >
                <div className='rounded-lg bg-white bg-opacity-20 p-2'>
                  <ExternalLink className='h-5 w-5' />
                </div>
                <div>
                  <div className='font-medium'>Solicitar Saque</div>
                  <div className='text-sm text-green-100'>
                    Acesse YLOS Trading
                  </div>
                </div>
              </a>
            ) : (
              <div className='flex items-center space-x-3 rounded-lg bg-red-600 p-4 text-left opacity-75'>
                <div className='rounded-lg bg-white bg-opacity-20 p-2'>
                  <XCircle className='h-5 w-5' />
                </div>
                <div>
                  <div className='font-medium'>Saque Bloqueado</div>
                  <div className='text-sm text-red-100'>
                    Resolva as violações
                  </div>
                </div>
              </div>
            )}

            {/* Baixar Relatório */}
            <button
              onClick={() => {
                const reportData = {
                  timestamp: new Date().toISOString(),
                  account_type: formData.contaType,
                  balance: formData.saldoAtual,
                  analysis: analysisResult,
                  compliance_score: (
                    100 -
                    criticalViolations.length * 30 -
                    warningViolations.length * 10
                  ).toFixed(0),
                };
                const blob = new Blob([JSON.stringify(reportData, null, 2)], {
                  type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ylos_analysis_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className='flex items-center space-x-3 rounded-lg bg-blue-600 p-4 text-left transition-all duration-200 hover:bg-blue-700'
            >
              <div className='rounded-lg bg-white bg-opacity-20 p-2'>
                <FileText className='h-5 w-5' />
              </div>
              <div>
                <div className='font-medium'>Baixar Relatório</div>
                <div className='text-sm text-blue-100'>
                  Arquivo JSON detalhado
                </div>
              </div>
            </button>
          </div>

          <div className='mt-4 border-t border-white border-opacity-20 pt-4 text-center'>
            <p className='text-sm text-gray-300'>
              Relatório gerado pelo{' '}
              <span className='font-medium text-white'>
                Mesa Prop Trading Analyzer
              </span>{' '}
              • Versão Enterprise • {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
      <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8 flex items-center justify-between'
        >
          <div className='flex items-center space-x-4'>
            <button
              onClick={onBack}
              className='btn-ghost flex items-center space-x-2'
            >
              <ArrowLeft className='h-5 w-5' />
              <span>Voltar</span>
            </button>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Análise YLOS Trading
              </h1>
              <p className='text-gray-600'>
                Verificação de conformidade para saques
              </p>
            </div>
          </div>

          <div className='flex items-center space-x-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600'>
              <BarChart3 className='h-4 w-4 text-white' />
            </div>
            <span className='text-sm font-medium text-gray-600'>YLOS</span>
          </div>
        </motion.div>

        {/* Content */}
        {step === 'form' && renderForm()}
        {step === 'upload' && renderUpload()}
        {step === 'analyzing' && renderAnalyzing()}
        {step === 'results' && renderResults()}
      </div>
    </div>
  );
}
