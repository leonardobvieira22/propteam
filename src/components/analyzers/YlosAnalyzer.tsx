'use client';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
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

import '../../styles/dailyAnalysis.css';

import { devLog } from '@/lib/logger';

import DailyAnalysisModal from './DailyAnalysisModal';

import { TradeOperation } from '@/types/dailyAnalysis';

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

interface EventDetail {
  event: {
    name: string;
    impact: string;
    description: string;
    frequency: string;
    market_impact: string;
    recommendation: string;
  };
  confidenceLevel: string;
  detectedWindow: string;
  timeType: string;
  dateRationale: string;
}

interface AnalysisResult {
  aprovado: boolean;
  total_operacoes: number;
  dias_operados: number;
  dias_vencedores: number;
  lucro_total: number;
  maior_lucro_dia: number;
  consistencia_40_percent: boolean;
  periodo_analise: {
    data_inicial: string;
    data_final: string;
    total_dias: number;
  };
  operacoes_detalhadas: Array<{
    id: string;
    ativo: string;
    abertura: string;
    fechamento: string;
    lado: 'C' | 'V';
    resultado: number;
    status: 'APROVADA' | 'REPROVADA' | 'WARNING';
    violacoes: string[];
    descricao_status: string;
  }>;
  violacoes: Array<{
    codigo: string;
    titulo: string;
    descricao: string;
    severidade: 'CRITICAL' | 'WARNING' | 'INFO';
    valor_impacto?: number;
    operacoes_afetadas?: TradeOperation[];
  }>;
  detalhes_noticias?: unknown[];
  recomendacoes: string[];
  proximos_passos: string[];
}

// YLOS Trading Logo Component (SVG)
const YlosLogo = ({
  size = 60,
  className = '',
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 200 200'
    className={className}
    xmlns='http://www.w3.org/2000/svg'
  >
    {/* Hexagon background */}
    <path
      d='M50 15 L150 15 L175 50 L175 150 L150 185 L50 185 L25 150 L25 50 Z'
      fill='#E5E7EB'
      stroke='#9CA3AF'
      strokeWidth='2'
    />

    {/* Trading symbol - stylized chart/growth */}
    <path
      d='M60 140 L80 120 L100 100 L120 80 L140 60'
      stroke='#3B82F6'
      strokeWidth='4'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    />

    {/* Arrow pointing up */}
    <path
      d='M130 70 L140 60 L150 70'
      stroke='#3B82F6'
      strokeWidth='4'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    />

    {/* YLOS text styling */}
    <text
      x='100'
      y='170'
      textAnchor='middle'
      className='fill-gray-700 text-lg font-bold'
      style={{ fontSize: '18px' }}
    >
      YLOS
    </text>
  </svg>
);

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
  const [expandedViolations, setExpandedViolations] = useState<Set<string>>(
    new Set(),
  );
  const [showDailyAnalysis, setShowDailyAnalysis] = useState(false);
  const [operations, setOperations] = useState<TradeOperation[]>([]);

  const toggleViolationDetails = (codigo: string) => {
    setExpandedViolations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(codigo)) {
        newSet.delete(codigo);
      } else {
        newSet.add(codigo);
      }
      return newSet;
    });
  };

  const formatOperation = (op: TradeOperation) => {
    return {
      ativo: op.ativo || 'N/A',
      abertura: op.abertura || 'N/A',
      fechamento: op.fechamento || 'N/A',
      resultado: `$${op.res_operacao.toFixed(2)}`,
      lado: op.lado || 'N/A',
      // Check if this operation has detected news events
      detectedNewsEvents:
        (op as TradeOperation & { detectedNewsEvents?: EventDetail[] })
          .detectedNewsEvents || [],
    };
  };

  const parseCSVOperations = (csvContent: string): TradeOperation[] => {
    try {
      devLog.info(
        'CRITICAL DEBUG - parseCSVOperations called with content length:',
        csvContent.length,
      );
      devLog.info(
        'CRITICAL DEBUG - CSV content first 500 chars:',
        csvContent.substring(0, 500),
      );

      const lines = csvContent.split('\n').filter((line) => line.trim());
      devLog.info('Lines after filtering:', lines.length);

      if (lines.length <= 1) {
        devLog.error('CRITICAL DEBUG - Not enough lines in CSV:', lines.length);
        devLog.error(
          'CRITICAL DEBUG - RETURNING EMPTY ARRAY DUE TO INSUFFICIENT LINES!',
        );
        return [];
      }

      // Detect separator (tab or comma)
      const separator = lines[0].includes('\t') ? '\t' : ',';

      const headers = lines[0]
        .split(separator)
        .map((h) => h.trim().replace(/"/g, ''));

      devLog.info('CSV Headers detected:', headers);
      devLog.info('Using separator:', separator === '\t' ? 'TAB' : 'COMMA');
      devLog.info('First line raw:', lines[0]);

      // Check if required headers exist
      const requiredHeaders = [
        'Ativo',
        'Abertura',
        'Fechamento',
        'Res. Operação',
        'Lado',
      ];
      const missingHeaders = requiredHeaders.filter(
        (h) => headers.indexOf(h) === -1,
      );
      if (missingHeaders.length > 0) {
        devLog.error(
          'CRITICAL DEBUG - Missing required headers:',
          missingHeaders,
        );
        devLog.info('CRITICAL DEBUG - Available headers:', headers);
        devLog.error(
          'CRITICAL DEBUG - RETURNING EMPTY ARRAY DUE TO MISSING HEADERS!',
        );
        return [];
      }

      const operations: TradeOperation[] = [];

      for (let i = 1; i < lines.length; i++) {
        devLog.info(`Processing line ${i}:`, lines[i]);

        const values = lines[i]
          .split(separator)
          .map((v) => v.trim().replace(/"/g, ''));

        devLog.info(`Line ${i} values:`, values);

        if (values.length < headers.length) {
          devLog.warn(
            `Line ${i} has ${values.length} values but expected ${headers.length}`,
          );
          continue;
        }

        const ativoIndex = headers.indexOf('Ativo');
        const aberturaIndex = headers.indexOf('Abertura');
        const fechamentoIndex = headers.indexOf('Fechamento');
        const resOperacaoIndex = headers.indexOf('Res. Operação');
        const ladoIndex = headers.indexOf('Lado');

        const ativo = values[ativoIndex] || '';
        const abertura = values[aberturaIndex] || '';
        const fechamento = values[fechamentoIndex] || '';
        const resOperacaoStr = values[resOperacaoIndex] || '0';
        const lado = values[ladoIndex] || '';

        devLog.info(`Line ${i} extracted values:`, {
          ativo,
          abertura,
          fechamento,
          resOperacaoStr,
          lado,
          indexes: {
            ativoIndex,
            aberturaIndex,
            fechamentoIndex,
            resOperacaoIndex,
            ladoIndex,
          },
        });

        // Validate data before creating operation
        if (!ativo || !abertura || !fechamento) {
          devLog.warn('Skipping incomplete operation:', {
            ativo,
            abertura,
            fechamento,
            line: i,
            values: values.slice(0, 5),
          });
          continue;
        }

        // Clean and parse the result value (remove dots for thousands, replace comma with dot for decimal)
        const cleanResOperacao = resOperacaoStr
          .replace(/\./g, '')
          .replace(',', '.');
        const resOperacao = parseFloat(cleanResOperacao);

        devLog.info(`Line ${i} result parsing:`, {
          original: resOperacaoStr,
          cleaned: cleanResOperacao,
          parsed: resOperacao,
          isNaN: isNaN(resOperacao),
        });

        if (isNaN(resOperacao)) {
          devLog.warn('Invalid result value:', {
            original: resOperacaoStr,
            cleaned: cleanResOperacao,
            line: i,
          });
          continue;
        }

        const op: TradeOperation = {
          ativo,
          abertura,
          fechamento,
          res_operacao: resOperacao,
          lado,
        };

        devLog.info(`CRITICAL DEBUG - Line ${i} created operation:`, {
          op,
          hasAllFields: !!(
            op.ativo &&
            op.abertura &&
            op.fechamento &&
            typeof op.res_operacao === 'number'
          ),
          fieldTypes: {
            ativo: typeof op.ativo,
            abertura: typeof op.abertura,
            fechamento: typeof op.fechamento,
            res_operacao: typeof op.res_operacao,
            lado: typeof op.lado,
          },
        });
        operations.push(op);
      }

      devLog.info(
        `CRITICAL DEBUG - Successfully parsed ${operations.length} operations from ${lines.length - 1} lines`,
      );
      devLog.info('CRITICAL DEBUG - Final operations array:', {
        operationsLength: operations.length,
        operations: operations,
        firstOperation: operations[0],
        lastOperation: operations[operations.length - 1],
      });
      return operations;
    } catch (error) {
      devLog.error('Error parsing CSV operations:', error);
      return [];
    }
  };

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
    devLog.info('CRITICAL DEBUG - handleAnalyze called');

    if (!csvContent) {
      setError('Por favor, faça upload de um arquivo CSV');
      return;
    }

    setError('');
    setStep('analyzing');

    try {
      devLog.info(
        'CRITICAL DEBUG - About to make API call to /api/ylos/analyze',
      );
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
      devLog.info('CRITICAL DEBUG - API response received successfully');

      // Parse operations from CSV content for daily analysis
      devLog.info(
        'CRITICAL DEBUG - Starting CSV parsing with content length:',
        csvContent.length,
      );
      devLog.info(
        'CRITICAL DEBUG - CSV content preview:',
        csvContent.substring(0, 200),
      );

      devLog.info('CRITICAL DEBUG - About to call parseCSVOperations...');
      const parsedOperations = parseCSVOperations(csvContent);
      devLog.info('CRITICAL DEBUG - parseCSVOperations returned:', {
        length: parsedOperations.length,
        operations: parsedOperations,
      });
      devLog.info('Parsed operations result:', {
        count: parsedOperations.length,
        operations: parsedOperations,
      });

      // CRITICAL DEBUG: Log exactly what we're setting
      devLog.info('CRITICAL DEBUG - Setting operations state:', {
        parsedOperationsLength: parsedOperations.length,
        firstOperation: parsedOperations[0],
        allOperations: parsedOperations,
      });

      setOperations(parsedOperations);

      // CRITICAL DEBUG: Verify state was set
      setTimeout(() => {
        devLog.info('CRITICAL DEBUG - Operations state after setOperations:', {
          operationsLength: operations.length,
          operations: operations,
        });
      }, 100);

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
      {/* YLOS Trading Header */}
      <div className='mb-8 flex items-center justify-center'>
        <div className='flex items-center space-x-4'>
          <YlosLogo size={60} />
          <div className='text-center'>
            <h1 className='text-xl font-bold text-gray-800'>YLOS Trading</h1>
            <p className='text-sm text-gray-600'>Análise de Conformidade</p>
          </div>
        </div>
      </div>

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
      {/* YLOS Trading Header */}
      <div className='card bg-gradient-to-r from-blue-50 to-indigo-50 p-4'>
        <div className='flex items-center justify-center space-x-4'>
          <YlosLogo size={50} />
          <div className='text-center'>
            <h1 className='text-lg font-bold text-gray-800'>YLOS Trading</h1>
            <p className='text-xs text-gray-600'>Sistema de Análise</p>
          </div>
        </div>
      </div>

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

    // Determine account size based on current balance (find closest account size)
    const determineAccountSize = (balance: number): number => {
      const accountSizes = [25000, 50000, 100000, 150000, 250000, 300000];

      // For balances within reasonable range of standard account sizes
      for (const size of accountSizes) {
        // If balance is within reasonable profit range of account size (up to 50% profit)
        if (balance >= size * 0.95 && balance <= size * 1.5) {
          return size;
        }
      }

      // If no match found, find the closest account size
      return accountSizes.reduce((prev, curr) =>
        Math.abs(curr - balance) < Math.abs(prev - balance) ? curr : prev,
      );
    };

    const saldoAtualNum = parseFloat(formData.saldoAtual);
    const accountSize = determineAccountSize(saldoAtualNum);
    const withdrawalThreshold =
      withdrawalThresholds[accountSize] || saldoAtualNum * 0.052;
    const consistencyDecimal =
      formData.contaType === 'MASTER_FUNDED' ? 0.4 : 0.3;
    const dailyProfitLimit = withdrawalThreshold * consistencyDecimal;

    // Regra de Consistência oficial: % do melhor dia vs lucro total
    const bestDayPercentage =
      analysisResult.lucro_total > 0
        ? Math.round(
            (analysisResult.maior_lucro_dia / analysisResult.lucro_total) *
              100 *
              100,
          ) / 100
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
        required: `≤ ${maxDayPercentage}%`,
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
        required: `≤ $${dailyProfitLimit.toFixed(2)}`,
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
            ? 'PROIBIDO estar posicionado 15 min antes até 15 min depois da abertura NY (9:15-9:45 AM NY)'
            : 'Verificação de posições durante abertura NY',
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
          'YLOS Trading recomenda evitar operações durante notícias de alto impacto (regras específicas não claramente definidas)',
        current: violacoes.some((v) => v.codigo === 'OPERACAO_NOTICIAS')
          ? 'Detectadas'
          : 'Nenhuma',
        required: 'Nenhuma',
        status: !violacoes.some((v) => v.codigo === 'OPERACAO_NOTICIAS')
          ? 'approved'
          : 'warning',
        icon: AlertTriangle,
        severity: !violacoes.some((v) => v.codigo === 'OPERACAO_NOTICIAS')
          ? 'success'
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
          {/* YLOS Trading Header */}
          <div className='mb-6 flex items-center justify-center'>
            <div className='flex items-center space-x-4'>
              <YlosLogo size={80} />
              <div className='text-center'>
                <h1 className='text-2xl font-bold text-gray-800'>
                  YLOS Trading
                </h1>
                <p className='text-sm text-gray-600'>
                  Sistema Oficial de Análise de Regras
                </p>
              </div>
            </div>
          </div>

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
                    Análise gerada em{' '}
                    {(() => {
                      try {
                        return new Date().toLocaleDateString('pt-BR');
                      } catch (error) {
                        devLog.error('Date format error:', error);
                        return new Date().toISOString().split('T')[0];
                      }
                    })()}
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

        {/* Período de Análise */}
        <div className='card p-6'>
          <div className='mb-6 flex items-center justify-between'>
            <h3 className='flex items-center space-x-2 text-xl font-semibold text-gray-900'>
              <Calendar className='h-6 w-6 text-blue-600' />
              <span>Período Analisado</span>
            </h3>
            <div className='flex items-center space-x-2'>
              <YlosLogo size={32} className='opacity-60' />
              <span className='text-sm font-medium text-gray-500'>
                Dados do CSV
              </span>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            <div className='rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 p-4'>
              <div className='flex items-center space-x-3'>
                <div className='rounded-lg bg-indigo-100 p-2'>
                  <Calendar className='h-5 w-5 text-indigo-600' />
                </div>
                <div>
                  <p className='text-sm font-medium text-indigo-700'>
                    Data Inicial
                  </p>
                  <p className='text-lg font-bold text-indigo-900'>
                    {analysisResult.periodo_analise.data_inicial}
                  </p>
                </div>
              </div>
            </div>

            <div className='rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 p-4'>
              <div className='flex items-center space-x-3'>
                <div className='rounded-lg bg-teal-100 p-2'>
                  <Calendar className='h-5 w-5 text-teal-600' />
                </div>
                <div>
                  <p className='text-sm font-medium text-teal-700'>
                    Data Final
                  </p>
                  <p className='text-lg font-bold text-teal-900'>
                    {analysisResult.periodo_analise.data_final}
                  </p>
                </div>
              </div>
            </div>

            <div className='rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 p-4'>
              <div className='flex items-center space-x-3'>
                <div className='rounded-lg bg-amber-100 p-2'>
                  <Clock className='h-5 w-5 text-amber-600' />
                </div>
                <div>
                  <p className='text-sm font-medium text-amber-700'>
                    Período Total
                  </p>
                  <p className='text-lg font-bold text-amber-900'>
                    {analysisResult.periodo_analise.total_dias} dia
                    {analysisResult.periodo_analise.total_dias !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='mt-4 rounded-lg bg-blue-50 p-4'>
            <div className='flex items-start space-x-3'>
              <div className='rounded-lg bg-blue-100 p-2'>
                <BarChart3 className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <p className='text-sm font-medium text-blue-900'>
                  Resumo do Período
                </p>
                <p className='mt-1 text-sm text-blue-700'>
                  Foram analisadas{' '}
                  <strong>{analysisResult.total_operacoes} operações</strong>{' '}
                  executadas ao longo de{' '}
                  <strong>
                    {analysisResult.dias_operados} dias de negociação
                  </strong>{' '}
                  no período de{' '}
                  <strong>{analysisResult.periodo_analise.data_inicial}</strong>{' '}
                  até{' '}
                  <strong>{analysisResult.periodo_analise.data_final}</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* YLOS Trading Rules Analysis */}
        <div className='card p-6'>
          <div className='mb-6 flex items-center justify-between'>
            <h3 className='flex items-center space-x-2 text-xl font-semibold text-gray-900'>
              <BarChart3 className='h-6 w-6 text-blue-600' />
              <span>Análise Detalhada das Regras YLOS</span>
            </h3>
            <div className='flex items-center space-x-2'>
              <YlosLogo size={32} className='opacity-60' />
              <span className='text-sm font-medium text-gray-500'>
                YLOS Trading
              </span>
            </div>
          </div>

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
                            : `${rule.code === 'CONSISTENCIA' ? (typeof rule.current === 'number' ? rule.current.toFixed(2) : rule.current) : rule.current}${rule.code === 'CONSISTENCIA' ? '%' : ''}`
                          : rule.current}
                      </span>
                    </div>

                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-gray-600'>
                        {rule.code === 'LIMITE_DIARIO_CONSISTENCIA'
                          ? 'Máximo:'
                          : 'Requerido:'}
                      </span>
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
                  <div className='flex items-start justify-between'>
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

                    {/* Botão Ver Detalhes se há operações afetadas */}
                    {violacao.operacoes_afetadas &&
                      Array.isArray(violacao.operacoes_afetadas) &&
                      violacao.operacoes_afetadas.length > 0 && (
                        <button
                          onClick={() =>
                            toggleViolationDetails(violacao.codigo)
                          }
                          className='flex items-center space-x-1 text-sm text-red-600 transition-colors hover:text-red-800'
                        >
                          <span>Ver Detalhes</span>
                          {expandedViolations.has(violacao.codigo) ? (
                            <ChevronUp className='h-4 w-4' />
                          ) : (
                            <ChevronDown className='h-4 w-4' />
                          )}
                        </button>
                      )}
                  </div>

                  {/* Detalhes expandidos das operações */}
                  {expandedViolations.has(violacao.codigo) &&
                    violacao.operacoes_afetadas && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className='mt-4 border-t border-red-200 pt-4'
                      >
                        <h5 className='mb-3 font-medium text-red-900'>
                          Operações Afetadas (
                          {violacao.operacoes_afetadas.length}):
                        </h5>
                        <div className='max-h-60 overflow-y-auto'>
                          <div className='space-y-2'>
                            {violacao.operacoes_afetadas.map(
                              (op: TradeOperation, opIndex: number) => {
                                const formattedOp = formatOperation(op);
                                return (
                                  <div
                                    key={opIndex}
                                    className='rounded-lg border border-red-200 bg-white p-4 text-xs'
                                  >
                                    {/* Basic Operation Info */}
                                    <div className='mb-3 grid grid-cols-2 gap-2 md:grid-cols-5'>
                                      <div>
                                        <span className='font-medium text-gray-600'>
                                          Ativo:
                                        </span>
                                        <div className='text-red-800'>
                                          {formattedOp.ativo}
                                        </div>
                                      </div>
                                      <div>
                                        <span className='font-medium text-gray-600'>
                                          Abertura:
                                        </span>
                                        <div className='text-red-800'>
                                          {formattedOp.abertura}
                                        </div>
                                      </div>
                                      <div>
                                        <span className='font-medium text-gray-600'>
                                          Fechamento:
                                        </span>
                                        <div className='text-red-800'>
                                          {formattedOp.fechamento}
                                        </div>
                                      </div>
                                      <div>
                                        <span className='font-medium text-gray-600'>
                                          Resultado:
                                        </span>
                                        <div
                                          className={`font-medium ${
                                            typeof op.res_operacao ===
                                              'number' && op.res_operacao >= 0
                                              ? 'text-green-600'
                                              : 'text-red-600'
                                          }`}
                                        >
                                          {formattedOp.resultado}
                                        </div>
                                      </div>
                                      <div>
                                        <span className='font-medium text-gray-600'>
                                          Lado:
                                        </span>
                                        <div className='text-red-800'>
                                          {formattedOp.lado}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Economic Events Details - only for news violations */}
                                    {violacao.codigo === 'OPERACAO_NOTICIAS' &&
                                      formattedOp.detectedNewsEvents.length >
                                        0 && (
                                        <div className='mt-3 border-t border-red-200 pt-3'>
                                          <h6 className='mb-2 flex items-center font-semibold text-red-900'>
                                            <AlertTriangle className='mr-1 h-4 w-4' />
                                            Eventos Econômicos Detectados:
                                          </h6>
                                          {formattedOp.detectedNewsEvents.map(
                                            (
                                              eventDetail: EventDetail,
                                              eventIndex: number,
                                            ) => (
                                              <div
                                                key={eventIndex}
                                                className='mb-2 rounded-lg border border-red-100 bg-red-50 p-3'
                                              >
                                                <div className='mb-2 flex items-start justify-between'>
                                                  <div>
                                                    <div className='flex items-center text-sm font-semibold text-red-900'>
                                                      📈{' '}
                                                      {eventDetail.event.name}
                                                      <span
                                                        className={`ml-2 rounded px-1.5 py-0.5 text-xs font-medium ${
                                                          eventDetail.confidenceLevel ===
                                                          'CONFIRMED'
                                                            ? 'bg-green-100 text-green-800'
                                                            : eventDetail.confidenceLevel ===
                                                                'HIGH_PROBABILITY'
                                                              ? 'bg-blue-100 text-blue-800'
                                                              : eventDetail.confidenceLevel ===
                                                                  'ESTIMATED'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                      >
                                                        {eventDetail.confidenceLevel ===
                                                        'CONFIRMED'
                                                          ? '✓ CONFIRMADO'
                                                          : eventDetail.confidenceLevel ===
                                                              'HIGH_PROBABILITY'
                                                            ? '⚡ PROVÁVEL'
                                                            : eventDetail.confidenceLevel ===
                                                                'ESTIMATED'
                                                              ? '⚠️ ESTIMADO'
                                                              : '❌ SEM EVENTO'}
                                                      </span>
                                                    </div>
                                                    <div className='mt-1 text-xs text-red-700'>
                                                      <span className='font-medium'>
                                                        Impacto:
                                                      </span>{' '}
                                                      {eventDetail.event.impact}{' '}
                                                      |
                                                      <span className='ml-2 font-medium'>
                                                        Janela Detectada:
                                                      </span>{' '}
                                                      {
                                                        eventDetail.detectedWindow
                                                      }{' '}
                                                      ({eventDetail.timeType})
                                                    </div>
                                                    <div className='mt-1 text-xs italic text-red-600'>
                                                      📅{' '}
                                                      {
                                                        eventDetail.dateRationale
                                                      }
                                                    </div>
                                                  </div>
                                                  <span
                                                    className={`rounded px-2 py-1 text-xs font-medium ${
                                                      eventDetail.event
                                                        .impact === 'EXTREMO'
                                                        ? 'bg-red-600 text-white'
                                                        : eventDetail.event
                                                              .impact ===
                                                            'MUITO ALTO'
                                                          ? 'bg-red-500 text-white'
                                                          : 'bg-orange-500 text-white'
                                                    }`}
                                                  >
                                                    {eventDetail.event.impact}
                                                  </span>
                                                </div>

                                                <div className='space-y-1 text-xs text-red-700'>
                                                  <div>
                                                    <span className='font-medium'>
                                                      📊 Descrição:
                                                    </span>{' '}
                                                    {
                                                      eventDetail.event
                                                        .description
                                                    }
                                                  </div>
                                                  <div>
                                                    <span className='font-medium'>
                                                      📅 Frequência:
                                                    </span>{' '}
                                                    {
                                                      eventDetail.event
                                                        .frequency
                                                    }
                                                  </div>
                                                  <div>
                                                    <span className='font-medium'>
                                                      ⚡ Impacto no Mercado:
                                                    </span>{' '}
                                                    {
                                                      eventDetail.event
                                                        .market_impact
                                                    }
                                                  </div>
                                                  <div className='mt-2 rounded border border-yellow-200 bg-yellow-50 p-2'>
                                                    <span className='font-medium text-yellow-800'>
                                                      💡 Recomendação YLOS:
                                                    </span>
                                                    <div className='mt-1 text-yellow-700'>
                                                      {
                                                        eventDetail.event
                                                          .recommendation
                                                      }
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            ),
                                          )}

                                          <div className='mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3'>
                                            <div className='text-xs text-blue-800'>
                                              <span className='font-semibold'>
                                                🔍 Por que isso é detectado?
                                              </span>
                                              <div className='mt-1'>
                                                Sua posição estava ABERTA
                                                durante o horário de release de
                                                um evento econômico de alto
                                                impacto. A YLOS Trading
                                                recomenda evitar operações
                                                durante esses momentos devido à
                                                volatilidade extrema e
                                                imprevisível que pode causar
                                                perdas significativas.
                                              </div>
                                            </div>
                                          </div>

                                          <div className='mt-2 rounded-lg border border-orange-200 bg-orange-50 p-3'>
                                            <div className='text-xs text-orange-800'>
                                              <span className='font-semibold'>
                                                ⚠️ Transparência sobre Precisão
                                                dos Dados:
                                              </span>
                                              <div className='mt-1'>
                                                <strong>
                                                  LIMITAÇÃO ATUAL:
                                                </strong>{' '}
                                                Este sistema ainda não utiliza
                                                uma API real de calendário
                                                econômico. As detecções são
                                                baseadas em:
                                                <br />•{' '}
                                                <strong>CONFIRMADO</strong>:
                                                Datas conhecidas de eventos (ex:
                                                reuniões FED programadas)
                                                <br />•{' '}
                                                <strong>PROVÁVEL</strong>:
                                                Padrões típicos (ex: Claims às
                                                quintas, NFP na 1ª sexta)
                                                <br />•{' '}
                                                <strong>ESTIMADO</strong>:
                                                Horários típicos de eventos
                                                (pode gerar falsos positivos)
                                                <br />
                                                <br />
                                                Para máxima precisão, sempre
                                                consulte calendários econômicos
                                                oficiais.
                                              </div>
                                            </div>
                                          </div>

                                          <div className='mt-2 rounded-lg border border-green-200 bg-green-50 p-3'>
                                            <div className='text-xs text-green-800'>
                                              <span className='font-semibold'>
                                                ✅ Como evitar no futuro:
                                              </span>
                                              <div className='mt-1'>
                                                1. Use um calendário econômico
                                                (investing.com,
                                                forexfactory.com)
                                                <br />
                                                2. Feche todas as posições 15
                                                minutos antes de eventos de alto
                                                impacto
                                                <br />
                                                3. Aguarde 30 minutos após o
                                                release antes de reposicionar
                                                <br />
                                                4. Configure alertas para
                                                eventos importantes no seu
                                                celular
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                </div>
              ))}

              {warningViolations.map((violacao, index) => (
                <div
                  key={index}
                  className='border-l-4 border-yellow-500 bg-yellow-50 p-4'
                >
                  <div className='flex items-start justify-between'>
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

                    {/* Botão Ver Detalhes se há operações afetadas */}
                    {violacao.operacoes_afetadas &&
                      Array.isArray(violacao.operacoes_afetadas) &&
                      violacao.operacoes_afetadas.length > 0 && (
                        <button
                          onClick={() =>
                            toggleViolationDetails(violacao.codigo)
                          }
                          className='flex items-center space-x-1 text-sm text-yellow-600 transition-colors hover:text-yellow-800'
                        >
                          <span>Ver Detalhes</span>
                          {expandedViolations.has(violacao.codigo) ? (
                            <ChevronUp className='h-4 w-4' />
                          ) : (
                            <ChevronDown className='h-4 w-4' />
                          )}
                        </button>
                      )}
                  </div>

                  {/* Detalhes expandidos das operações */}
                  {expandedViolations.has(violacao.codigo) &&
                    violacao.operacoes_afetadas && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className='mt-4 border-t border-yellow-200 pt-4'
                      >
                        <h5 className='mb-3 font-medium text-yellow-900'>
                          Operações Afetadas (
                          {violacao.operacoes_afetadas.length}):
                        </h5>
                        <div className='max-h-60 overflow-y-auto'>
                          <div className='space-y-2'>
                            {violacao.operacoes_afetadas.map(
                              (op: TradeOperation, opIndex: number) => {
                                const formattedOp = formatOperation(op);
                                return (
                                  <div
                                    key={opIndex}
                                    className='rounded-lg border border-yellow-200 bg-white p-4 text-xs'
                                  >
                                    {/* Basic Operation Info */}
                                    <div className='mb-3 grid grid-cols-2 gap-2 md:grid-cols-5'>
                                      <div>
                                        <span className='font-medium text-gray-600'>
                                          Ativo:
                                        </span>
                                        <div className='text-yellow-800'>
                                          {formattedOp.ativo}
                                        </div>
                                      </div>
                                      <div>
                                        <span className='font-medium text-gray-600'>
                                          Abertura:
                                        </span>
                                        <div className='text-yellow-800'>
                                          {formattedOp.abertura}
                                        </div>
                                      </div>
                                      <div>
                                        <span className='font-medium text-gray-600'>
                                          Fechamento:
                                        </span>
                                        <div className='text-yellow-800'>
                                          {formattedOp.fechamento}
                                        </div>
                                      </div>
                                      <div>
                                        <span className='font-medium text-gray-600'>
                                          Resultado:
                                        </span>
                                        <div
                                          className={`font-medium ${
                                            op.res_operacao >= 0
                                              ? 'text-green-600'
                                              : 'text-red-600'
                                          }`}
                                        >
                                          {formattedOp.resultado}
                                        </div>
                                      </div>
                                      <div>
                                        <span className='font-medium text-gray-600'>
                                          Lado:
                                        </span>
                                        <div className='text-yellow-800'>
                                          {formattedOp.lado}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Economic Events Details - only for news violations */}
                                    {violacao.codigo === 'OPERACAO_NOTICIAS' &&
                                      formattedOp.detectedNewsEvents.length >
                                        0 && (
                                        <div className='mt-3 border-t border-yellow-200 pt-3'>
                                          <h6 className='mb-2 flex items-center font-semibold text-yellow-900'>
                                            <AlertTriangle className='mr-1 h-4 w-4' />
                                            Eventos Econômicos Detectados:
                                          </h6>
                                          {formattedOp.detectedNewsEvents.map(
                                            (
                                              eventDetail: EventDetail,
                                              eventIndex: number,
                                            ) => (
                                              <div
                                                key={eventIndex}
                                                className='mb-2 rounded-lg border border-yellow-100 bg-yellow-50 p-3'
                                              >
                                                <div className='mb-2 flex items-start justify-between'>
                                                  <div>
                                                    <div className='flex items-center text-sm font-semibold text-yellow-900'>
                                                      📈{' '}
                                                      {eventDetail.event.name}
                                                      <span
                                                        className={`ml-2 rounded px-1.5 py-0.5 text-xs font-medium ${
                                                          eventDetail.confidenceLevel ===
                                                          'CONFIRMED'
                                                            ? 'bg-green-100 text-green-800'
                                                            : eventDetail.confidenceLevel ===
                                                                'HIGH_PROBABILITY'
                                                              ? 'bg-blue-100 text-blue-800'
                                                              : eventDetail.confidenceLevel ===
                                                                  'ESTIMATED'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                      >
                                                        {eventDetail.confidenceLevel ===
                                                        'CONFIRMED'
                                                          ? '✓ CONFIRMADO'
                                                          : eventDetail.confidenceLevel ===
                                                              'HIGH_PROBABILITY'
                                                            ? '⚡ PROVÁVEL'
                                                            : eventDetail.confidenceLevel ===
                                                                'ESTIMATED'
                                                              ? '⚠️ ESTIMADO'
                                                              : '❌ SEM EVENTO'}
                                                      </span>
                                                    </div>
                                                    <div className='mt-1 text-xs text-yellow-700'>
                                                      <span className='font-medium'>
                                                        Impacto:
                                                      </span>{' '}
                                                      {eventDetail.event.impact}{' '}
                                                      |
                                                      <span className='ml-2 font-medium'>
                                                        Janela Detectada:
                                                      </span>{' '}
                                                      {
                                                        eventDetail.detectedWindow
                                                      }{' '}
                                                      ({eventDetail.timeType})
                                                    </div>
                                                    <div className='mt-1 text-xs italic text-yellow-600'>
                                                      📅{' '}
                                                      {
                                                        eventDetail.dateRationale
                                                      }
                                                    </div>
                                                  </div>
                                                  <span
                                                    className={`rounded px-2 py-1 text-xs font-medium ${
                                                      eventDetail.event
                                                        .impact === 'EXTREMO'
                                                        ? 'bg-red-600 text-white'
                                                        : eventDetail.event
                                                              .impact ===
                                                            'MUITO ALTO'
                                                          ? 'bg-red-500 text-white'
                                                          : 'bg-orange-500 text-white'
                                                    }`}
                                                  >
                                                    {eventDetail.event.impact}
                                                  </span>
                                                </div>

                                                <div className='space-y-1 text-xs text-yellow-700'>
                                                  <div>
                                                    <span className='font-medium'>
                                                      📊 Descrição:
                                                    </span>{' '}
                                                    {
                                                      eventDetail.event
                                                        .description
                                                    }
                                                  </div>
                                                  <div>
                                                    <span className='font-medium'>
                                                      📅 Frequência:
                                                    </span>{' '}
                                                    {
                                                      eventDetail.event
                                                        .frequency
                                                    }
                                                  </div>
                                                  <div>
                                                    <span className='font-medium'>
                                                      ⚡ Impacto no Mercado:
                                                    </span>{' '}
                                                    {
                                                      eventDetail.event
                                                        .market_impact
                                                    }
                                                  </div>
                                                  <div className='mt-2 rounded border border-blue-200 bg-blue-50 p-2'>
                                                    <span className='font-medium text-blue-800'>
                                                      💡 Recomendação YLOS:
                                                    </span>
                                                    <div className='mt-1 text-blue-700'>
                                                      {
                                                        eventDetail.event
                                                          .recommendation
                                                      }
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            ),
                                          )}

                                          <div className='mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3'>
                                            <div className='text-xs text-blue-800'>
                                              <span className='font-semibold'>
                                                🔍 Por que isso é detectado?
                                              </span>
                                              <div className='mt-1'>
                                                Sua posição estava ABERTA
                                                durante o horário de release de
                                                um evento econômico de alto
                                                impacto. Em contas Instant
                                                Funding isso é um alerta, mas
                                                recomenda-se evitar para melhor
                                                gestão de risco.
                                              </div>
                                            </div>
                                          </div>

                                          <div className='mt-2 rounded-lg border border-orange-200 bg-orange-50 p-3'>
                                            <div className='text-xs text-orange-800'>
                                              <span className='font-semibold'>
                                                ⚠️ Transparência sobre Precisão
                                                dos Dados:
                                              </span>
                                              <div className='mt-1'>
                                                <strong>
                                                  LIMITAÇÃO ATUAL:
                                                </strong>{' '}
                                                Este sistema ainda não utiliza
                                                uma API real de calendário
                                                econômico. As detecções são
                                                baseadas em:
                                                <br />•{' '}
                                                <strong>CONFIRMADO</strong>:
                                                Datas conhecidas de eventos (ex:
                                                reuniões FED programadas)
                                                <br />•{' '}
                                                <strong>PROVÁVEL</strong>:
                                                Padrões típicos (ex: Claims às
                                                quintas, NFP na 1ª sexta)
                                                <br />•{' '}
                                                <strong>ESTIMADO</strong>:
                                                Horários típicos de eventos
                                                (pode gerar falsos positivos)
                                                <br />
                                                <br />
                                                Para máxima precisão, sempre
                                                consulte calendários econômicos
                                                oficiais.
                                              </div>
                                            </div>
                                          </div>

                                          <div className='mt-2 rounded-lg border border-green-200 bg-green-50 p-3'>
                                            <div className='text-xs text-green-800'>
                                              <span className='font-semibold'>
                                                ✅ Como evitar no futuro:
                                              </span>
                                              <div className='mt-1'>
                                                1. Use um calendário econômico
                                                (investing.com,
                                                forexfactory.com)
                                                <br />
                                                2. Feche todas as posições 15
                                                minutos antes de eventos de alto
                                                impacto
                                                <br />
                                                3. Aguarde 30 minutos após o
                                                release antes de reposicionar
                                                <br />
                                                4. Configure alertas para
                                                eventos importantes no seu
                                                celular
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visualizador de Operações */}
        <div className='card p-6'>
          <div className='mb-6 flex items-center justify-between'>
            <h3 className='flex items-center space-x-2 text-xl font-semibold text-gray-900'>
              <FileText className='h-6 w-6 text-blue-600' />
              <span>Operações Analisadas</span>
            </h3>
            <div className='flex items-center space-x-2'>
              <YlosLogo size={32} className='opacity-60' />
              <span className='text-sm font-medium text-gray-500'>
                Visualização Detalhada
              </span>
            </div>
          </div>

          {/* Filtros e Resumo */}
          <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-4'>
            <div className='rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-4'>
              <div className='flex items-center space-x-3'>
                <div className='rounded-lg bg-green-100 p-2'>
                  <CheckCircle className='h-5 w-5 text-green-600' />
                </div>
                <div>
                  <p className='text-sm font-medium text-green-700'>
                    Aprovadas
                  </p>
                  <p className='text-lg font-bold text-green-900'>
                    {
                      analysisResult.operacoes_detalhadas.filter(
                        (op) => op.status === 'APROVADA',
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className='rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 p-4'>
              <div className='flex items-center space-x-3'>
                <div className='rounded-lg bg-yellow-100 p-2'>
                  <AlertTriangle className='h-5 w-5 text-yellow-600' />
                </div>
                <div>
                  <p className='text-sm font-medium text-yellow-700'>
                    Warnings
                  </p>
                  <p className='text-lg font-bold text-yellow-900'>
                    {
                      analysisResult.operacoes_detalhadas.filter(
                        (op) => op.status === 'WARNING',
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className='rounded-lg bg-gradient-to-br from-red-50 to-red-100 p-4'>
              <div className='flex items-center space-x-3'>
                <div className='rounded-lg bg-red-100 p-2'>
                  <XCircle className='h-5 w-5 text-red-600' />
                </div>
                <div>
                  <p className='text-sm font-medium text-red-700'>Reprovadas</p>
                  <p className='text-lg font-bold text-red-900'>
                    {
                      analysisResult.operacoes_detalhadas.filter(
                        (op) => op.status === 'REPROVADA',
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className='rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4'>
              <div className='flex items-center space-x-3'>
                <div className='rounded-lg bg-blue-100 p-2'>
                  <BarChart3 className='h-5 w-5 text-blue-600' />
                </div>
                <div>
                  <p className='text-sm font-medium text-blue-700'>Total</p>
                  <p className='text-lg font-bold text-blue-900'>
                    {analysisResult.operacoes_detalhadas.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Operações */}
          <div className='overflow-hidden rounded-lg border border-gray-200'>
            <div className='border-b border-gray-200 bg-gray-50 px-6 py-3'>
              <div className='grid grid-cols-8 gap-4 text-xs font-medium uppercase tracking-wider text-gray-600'>
                <div className='col-span-1'>Status</div>
                <div className='col-span-1'>Ativo</div>
                <div className='col-span-2'>Abertura</div>
                <div className='col-span-2'>Fechamento</div>
                <div className='col-span-1'>Resultado</div>
                <div className='col-span-1'>Lado</div>
              </div>
            </div>

            <div className='max-h-96 overflow-y-auto'>
              {analysisResult.operacoes_detalhadas.map((operacao, _index) => {
                const getStatusIcon = (status: string) => {
                  switch (status) {
                    case 'APROVADA':
                      return <CheckCircle className='h-4 w-4 text-green-600' />;
                    case 'WARNING':
                      return (
                        <AlertTriangle className='h-4 w-4 text-yellow-600' />
                      );
                    case 'REPROVADA':
                      return <XCircle className='h-4 w-4 text-red-600' />;
                    default:
                      return <CheckCircle className='h-4 w-4 text-gray-400' />;
                  }
                };

                const getStatusBg = (status: string) => {
                  switch (status) {
                    case 'APROVADA':
                      return 'bg-green-50 hover:bg-green-100';
                    case 'WARNING':
                      return 'bg-yellow-50 hover:bg-yellow-100';
                    case 'REPROVADA':
                      return 'bg-red-50 hover:bg-red-100';
                    default:
                      return 'bg-white hover:bg-gray-50';
                  }
                };

                return (
                  <div
                    key={operacao.id}
                    className={`border-b border-gray-200 px-6 py-4 transition-colors ${getStatusBg(operacao.status)}`}
                  >
                    <div className='grid grid-cols-8 items-center gap-4'>
                      <div className='col-span-1 flex items-center space-x-2'>
                        {getStatusIcon(operacao.status)}
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            operacao.status === 'APROVADA'
                              ? 'bg-green-100 text-green-800'
                              : operacao.status === 'WARNING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {operacao.status === 'APROVADA'
                            ? 'OK'
                            : operacao.status === 'WARNING'
                              ? 'WARN'
                              : 'NOK'}
                        </span>
                      </div>

                      <div className='col-span-1'>
                        <span className='text-sm font-medium text-gray-900'>
                          {operacao.ativo}
                        </span>
                      </div>

                      <div className='col-span-2'>
                        <span className='text-sm text-gray-700'>
                          {operacao.abertura}
                        </span>
                      </div>

                      <div className='col-span-2'>
                        <span className='text-sm text-gray-700'>
                          {operacao.fechamento}
                        </span>
                      </div>

                      <div className='col-span-1'>
                        <span
                          className={`text-sm font-medium ${
                            operacao.resultado >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          ${operacao.resultado.toFixed(2)}
                        </span>
                      </div>

                      <div className='col-span-1'>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            operacao.lado === 'C'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {operacao.lado === 'C' ? 'COMPRA' : 'VENDA'}
                        </span>
                      </div>
                    </div>

                    {/* Detalhes das violações quando existir */}
                    {operacao.violacoes.length > 0 && (
                      <div className='mt-3 border-t border-gray-200 pt-3'>
                        <div className='flex items-start space-x-2'>
                          <AlertTriangle
                            className={`mt-0.5 h-4 w-4 ${
                              operacao.status === 'REPROVADA'
                                ? 'text-red-500'
                                : 'text-yellow-500'
                            }`}
                          />
                          <div>
                            <p
                              className={`text-xs font-medium ${
                                operacao.status === 'REPROVADA'
                                  ? 'text-red-800'
                                  : 'text-yellow-800'
                              }`}
                            >
                              {operacao.descricao_status}
                            </p>
                            {operacao.violacoes.length > 0 && (
                              <div className='mt-1'>
                                <span className='text-xs text-gray-600'>
                                  Violações:{' '}
                                </span>
                                <span
                                  className={`text-xs ${
                                    operacao.status === 'REPROVADA'
                                      ? 'text-red-700'
                                      : 'text-yellow-700'
                                  }`}
                                >
                                  {operacao.violacoes.join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legenda */}
          <div className='mt-4 rounded-lg bg-gray-50 p-4'>
            <h4 className='mb-3 text-sm font-medium text-gray-900'>
              Legenda de Status:
            </h4>
            <div className='grid grid-cols-1 gap-3 text-xs md:grid-cols-3'>
              <div className='flex items-center space-x-2'>
                <CheckCircle className='h-4 w-4 text-green-600' />
                <span className='text-gray-700'>
                  <strong>APROVADA:</strong> Operação em conformidade total com
                  as regras YLOS
                </span>
              </div>
              <div className='flex items-center space-x-2'>
                <AlertTriangle className='h-4 w-4 text-yellow-600' />
                <span className='text-gray-700'>
                  <strong>WARNING:</strong> Operação com alertas, mas não impede
                  saque
                </span>
              </div>
              <div className='flex items-center space-x-2'>
                <XCircle className='h-4 w-4 text-red-600' />
                <span className='text-gray-700'>
                  <strong>REPROVADA:</strong> Operação viola regras críticas
                  YLOS
                </span>
              </div>
            </div>
          </div>
        </div>

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

          <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
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

            {/* DEBUG: Show current operations state */}
            <button
              onClick={() => {
                devLog.info('CRITICAL DEBUG - Current operations state:', {
                  operationsLength: operations.length,
                  operations: operations,
                  csvContent: csvContent.substring(0, 100),
                  step: step,
                });
                alert(
                  `Operations: ${operations.length} | CSV: ${csvContent.length} chars`,
                );
              }}
              className='flex items-center space-x-3 rounded-lg bg-orange-600 p-4 text-left transition-all duration-200 hover:bg-orange-700'
            >
              <div className='rounded-lg bg-white bg-opacity-20 p-2'>
                <BarChart3 className='h-5 w-5' />
              </div>
              <div>
                <div className='font-medium'>DEBUG: Check State</div>
                <div className='text-sm text-orange-100'>
                  Operations: {operations.length}
                </div>
              </div>
            </button>

            {/* Análise Diária */}
            <button
              onClick={() => {
                devLog.info('CRITICAL DEBUG - Opening Daily Analysis Modal:', {
                  operationsLength: operations.length,
                  operations: operations.slice(0, 2),
                  operationsState: operations,
                  hasAnalysisResult: !!analysisResult,
                });
                setShowDailyAnalysis(true);
              }}
              className='flex items-center space-x-3 rounded-lg bg-purple-600 p-4 text-left transition-all duration-200 hover:bg-purple-700'
            >
              <div className='rounded-lg bg-white bg-opacity-20 p-2'>
                <BarChart3 className='h-5 w-5' />
              </div>
              <div>
                <div className='font-medium'>Análise por Dia</div>
                <div className='text-sm text-purple-100'>
                  Visualizar cards diários
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
              • Versão Enterprise •{' '}
              {(() => {
                try {
                  return new Date().toLocaleDateString('pt-BR');
                } catch (error) {
                  devLog.error('Date format error:', error);
                  return new Date().toISOString().split('T')[0];
                }
              })()}
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

      {/* Daily Analysis Modal */}
      {analysisResult && (
        <DailyAnalysisModal
          isOpen={showDailyAnalysis}
          onClose={() => setShowDailyAnalysis(false)}
          operations={operations}
          accountType={formData.contaType}
          withdrawalThreshold={(() => {
            const balance = parseFloat(formData.saldoAtual);
            const accountSizes = [25000, 50000, 100000, 150000, 250000, 300000];
            const withdrawalThresholds: Record<number, number> = {
              25000: 1600,
              50000: 2600,
              100000: 3100,
              150000: 5100,
              250000: 6600,
              300000: 7600,
            };

            // Find closest account size
            const accountSize = accountSizes.reduce((prev, curr) =>
              Math.abs(curr - balance) < Math.abs(prev - balance) ? curr : prev,
            );

            return withdrawalThresholds[accountSize] || balance * 0.052;
          })()}
        />
      )}
    </div>
  );
}
