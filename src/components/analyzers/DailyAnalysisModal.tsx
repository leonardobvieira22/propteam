'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Download,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { devLog } from '@/lib/logger';
import { useDailyAnalysis } from '@/hooks/useDailyAnalysis';

import {
  DailyAnalysis,
  DailyAnalysisFilters,
  DailyAnalysisProps,
} from '@/types/dailyAnalysis';

const DailyAnalysisModal: React.FC<DailyAnalysisProps> = ({
  isOpen,
  onClose,
  operations,
  accountType,
  withdrawalThreshold,
}) => {
  const [filters, setFilters] = useState<DailyAnalysisFilters>({
    status: 'all',
    sortBy: 'date',
    sortOrder: 'asc',
  });

  const [selectedDay, setSelectedDay] = useState<DailyAnalysis | null>(null);
  const [selectedViolationsDay, setSelectedViolationsDay] =
    useState<DailyAnalysis | null>(null);

  const { dailyAnalysis, summary } = useDailyAnalysis(
    operations,
    accountType,
    withdrawalThreshold,
    filters,
  );

  // Analysis logging for monitoring
  React.useEffect(() => {
    if (isOpen) {
      devLog.info('Daily analysis modal opened', {
        operationsCount: operations.length,
        accountType,
        analysisResults: dailyAnalysis.length,
        summaryStats: {
          total: summary.total,
          approved: summary.approved,
          critical: summary.critical,
        },
      });
    }
  }, [isOpen, operations.length, dailyAnalysis.length, summary, accountType]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className='h-5 w-5 text-green-500' />;
      case 'warning':
        return <AlertTriangle className='h-5 w-5 text-yellow-500' />;
      case 'critical':
        return <AlertCircle className='h-5 w-5 text-red-500' />;
      default:
        return <CheckCircle className='h-5 w-5 text-gray-400' />;
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'approved':
        return 'border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 hover:border-yellow-300 hover:bg-yellow-100';
      case 'critical':
        return 'border-red-200 bg-red-50 hover:border-red-300 hover:bg-red-100';
      default:
        return 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100';
    }
  }, []);

  const formatCurrency = useCallback((value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });
  }, []);

  const formatDate = useCallback((dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return dateStr;
      }
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      devLog.error('Date formatting error:', error, 'for string:', dateStr);
      return dateStr;
    }
  }, []);

  const handleExport = () => {
    // Implementation for PDF/Excel export
    // Future implementation: generate PDF/Excel report
  };

  const DayCard: React.FC<{ day: DailyAnalysis }> = ({ day }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        day-card cursor-pointer rounded-lg border-2 p-4 transition-all duration-200
        ${getStatusColor(day.status)}
        hover:shadow-lg active:shadow-md
      `}
      onClick={() => setSelectedDay(day)}
    >
      {/* Card Header */}
      <div className='mb-3 flex items-center justify-between'>
        <div className='flex flex-col'>
          <span className='text-sm font-semibold text-gray-900'>
            {formatDate(day.date)}
          </span>
          <span className='text-xs capitalize text-gray-500'>
            {day.dayOfWeek}
          </span>
        </div>
        {getStatusIcon(day.status)}
      </div>

      {/* Key Metrics */}
      <div className='space-y-2'>
        <div className='flex justify-between text-sm'>
          <span className='text-gray-600'>Operações</span>
          <span className='font-semibold text-gray-900'>
            {day.totalOperations}
          </span>
        </div>

        <div className='flex justify-between text-sm'>
          <span className='text-gray-600'>Win Rate</span>
          <span
            className={`font-semibold ${day.winRate >= 70 ? 'text-green-600' : day.winRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}
          >
            {day.winRate.toFixed(1)}%
          </span>
        </div>

        <div className='flex justify-between text-sm'>
          <span className='text-gray-600'>Ganhos</span>
          <span className='font-semibold text-green-600'>
            {formatCurrency(day.grossProfit)}
          </span>
        </div>

        <div className='flex justify-between text-sm'>
          <span className='text-gray-600'>Líquido</span>
          <span
            className={`font-semibold ${day.netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {formatCurrency(day.netResult)}
          </span>
        </div>

        {/* Risk Indicator */}
        <div className='flex justify-between text-sm'>
          <span className='text-gray-600'>Risco</span>
          <span
            className={`
            rounded-full px-2 py-1 text-xs font-medium
            ${
              day.riskLevel === 'low'
                ? 'bg-green-100 text-green-800'
                : day.riskLevel === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
            }
          `}
          >
            {day.riskLevel === 'low'
              ? 'Baixo'
              : day.riskLevel === 'medium'
                ? 'Médio'
                : 'Alto'}
          </span>
        </div>
      </div>

      {/* Violations Count */}
      {day.violations.length > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedViolationsDay(day);
          }}
          className='mt-3 w-full rounded-md bg-white/50 p-2 transition-colors hover:bg-white/80'
        >
          <div className='flex items-center justify-between text-xs'>
            <div className='flex items-center space-x-1'>
              <AlertTriangle className='h-3 w-3 text-orange-500' />
              <span className='text-gray-700'>
                {day.violations.length}{' '}
                {day.violations.length === 1 ? 'violação' : 'violações'}
              </span>
            </div>
            <span className='text-xs text-gray-500'>Clique para ver</span>
          </div>
        </button>
      )}
    </motion.div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4'
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className='daily-analysis-modal w-full max-w-7xl rounded-xl bg-white shadow-2xl'
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className='flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6'>
            <div className='flex items-center space-x-3'>
              <BarChart3 className='h-7 w-7 text-blue-600' />
              <div>
                <h2 className='text-2xl font-bold text-gray-900'>
                  Análise Detalhada por Dia
                </h2>
                <p className='text-sm text-gray-600'>
                  {summary.total}{' '}
                  {summary.total === 1 ? 'dia operado' : 'dias operados'}
                </p>
              </div>
            </div>

            {/* Summary Stats */}
            <div className='hidden items-center space-x-6 md:flex'>
              <div className='text-center'>
                <div className='text-lg font-bold text-green-600'>
                  {summary.approved}
                </div>
                <div className='text-xs text-gray-500'>Aprovados</div>
              </div>
              <div className='text-center'>
                <div className='text-lg font-bold text-yellow-600'>
                  {summary.warning}
                </div>
                <div className='text-xs text-gray-500'>Avisos</div>
              </div>
              <div className='text-center'>
                <div className='text-lg font-bold text-red-600'>
                  {summary.critical}
                </div>
                <div className='text-xs text-gray-500'>Críticos</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className='rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            >
              <X className='h-6 w-6' />
            </button>
          </div>

          {/* Controls */}
          <div className='border-b border-gray-200 bg-gray-50 p-4'>
            <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
              {/* Filters */}
              <div className='flex flex-wrap gap-2'>
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, status: 'all' }))
                  }
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    filters.status === 'all'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Todos ({summary.total})
                </button>
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, status: 'approved' }))
                  }
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    filters.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  ✅ Aprovados ({summary.approved})
                </button>
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, status: 'warning' }))
                  }
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    filters.status === 'warning'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  ⚠️ Avisos ({summary.warning})
                </button>
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, status: 'critical' }))
                  }
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    filters.status === 'critical'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  ❌ Críticos ({summary.critical})
                </button>
              </div>

              {/* Sort & Actions */}
              <div className='flex items-center gap-2'>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-') as [
                      'date' | 'netResult' | 'operations' | 'winRate',
                      'asc' | 'desc',
                    ];
                    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
                  }}
                  className='rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                >
                  <option value='date-asc'>Data (Mais Antigo)</option>
                  <option value='date-desc'>Data (Mais Recente)</option>
                  <option value='netResult-desc'>Maior Lucro</option>
                  <option value='netResult-asc'>Menor Lucro</option>
                  <option value='operations-desc'>Mais Operações</option>
                  <option value='winRate-desc'>Maior Win Rate</option>
                </select>

                <button
                  onClick={handleExport}
                  className='rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700'
                >
                  <Download className='h-4 w-4' />
                </button>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className='max-h-[60vh] overflow-y-auto p-6'>
            {dailyAnalysis.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-gray-500'>
                <Calendar className='mb-4 h-12 w-12' />
                <h3 className='text-lg font-medium'>Nenhum dia encontrado</h3>
                <p className='text-sm'>Tente ajustar os filtros</p>
              </div>
            ) : (
              <div className='cards-grid grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'>
                {dailyAnalysis.map((day, index) => (
                  <DayCard key={`${day.date}-${index}`} day={day} />
                ))}
              </div>
            )}
          </div>

          {/* Footer Summary */}
          <div className='border-t border-gray-200 bg-gray-50 p-4'>
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
              <div className='text-center'>
                <div className='text-lg font-bold text-green-600'>
                  {formatCurrency(summary.totalProfit)}
                </div>
                <div className='text-xs text-gray-500'>Total Ganhos</div>
              </div>
              <div className='text-center'>
                <div className='text-lg font-bold text-red-600'>
                  {formatCurrency(summary.totalLoss)}
                </div>
                <div className='text-xs text-gray-500'>Total Perdas</div>
              </div>
              <div className='text-center'>
                <div
                  className={`text-lg font-bold ${summary.netTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {formatCurrency(summary.netTotal)}
                </div>
                <div className='text-xs text-gray-500'>Resultado Líquido</div>
              </div>
              <div className='text-center'>
                <div className='text-lg font-bold text-blue-600'>
                  {summary.winningDays}
                </div>
                <div className='text-xs text-gray-500'>Dias Vencedores</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Day Detail Modal */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='z-60 fixed inset-0 flex items-center justify-center bg-black/50 p-4'
            onClick={() => setSelectedDay(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className='w-full max-w-2xl rounded-xl bg-white shadow-2xl'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='border-b border-gray-200 p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='text-xl font-bold'>
                      Detalhes - {formatDate(selectedDay.date)}
                    </h3>
                    <p className='text-sm capitalize text-gray-600'>
                      {selectedDay.dayOfWeek}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className='rounded-full p-2 text-gray-400 hover:bg-gray-100'
                  >
                    <X className='h-5 w-5' />
                  </button>
                </div>
              </div>

              <div className='space-y-6 p-6'>
                {/* Detailed Metrics */}
                <div className='grid grid-cols-2 gap-4'>
                  <div className='rounded-lg bg-gray-50 p-4'>
                    <div className='text-sm text-gray-600'>
                      Operações Totais
                    </div>
                    <div className='text-2xl font-bold'>
                      {selectedDay.totalOperations}
                    </div>
                  </div>
                  <div className='rounded-lg bg-green-50 p-4'>
                    <div className='text-sm text-gray-600'>Taxa de Acerto</div>
                    <div className='text-2xl font-bold text-green-600'>
                      {selectedDay.winRate.toFixed(1)}%
                    </div>
                  </div>
                  <div className='rounded-lg bg-blue-50 p-4'>
                    <div className='text-sm text-gray-600'>Profit Factor</div>
                    <div className='text-2xl font-bold text-blue-600'>
                      {selectedDay.profitFactor === 999
                        ? '∞'
                        : selectedDay.profitFactor.toFixed(2)}
                    </div>
                  </div>
                  <div className='rounded-lg bg-purple-50 p-4'>
                    <div className='text-sm text-gray-600'>Maior Ganho</div>
                    <div className='text-2xl font-bold text-purple-600'>
                      {formatCurrency(selectedDay.maxSingleWin)}
                    </div>
                  </div>
                </div>

                {/* Violations */}
                {selectedDay.violations.length > 0 && (
                  <div>
                    <h4 className='mb-3 font-semibold text-gray-900'>
                      Violações Detectadas
                    </h4>
                    <div className='space-y-2'>
                      {selectedDay.violations.map((violation, index) => (
                        <div
                          key={`violation-${selectedDay.date}-${index}`}
                          className={`rounded-lg border p-3 ${
                            violation.severity === 'CRITICAL'
                              ? 'border-red-200 bg-red-50'
                              : 'border-yellow-200 bg-yellow-50'
                          }`}
                        >
                          <div className='font-medium'>{violation.title}</div>
                          <div className='text-sm text-gray-600'>
                            {violation.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Violations Detail Modal */}
      <AnimatePresence>
        {selectedViolationsDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4'
            onClick={() => setSelectedViolationsDay(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className='w-full max-w-2xl rounded-xl bg-white shadow-2xl'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50 p-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <AlertTriangle className='h-6 w-6 text-orange-600' />
                    <div>
                      <h3 className='text-xl font-bold text-gray-900'>
                        Violações Detectadas
                      </h3>
                      <p className='text-sm text-gray-600'>
                        {formatDate(selectedViolationsDay.date)} -{' '}
                        {selectedViolationsDay.dayOfWeek}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedViolationsDay(null)}
                    className='rounded-full p-2 text-gray-400 hover:bg-gray-100'
                  >
                    <X className='h-5 w-5' />
                  </button>
                </div>
              </div>

              <div className='max-h-[60vh] overflow-y-auto p-6'>
                <div className='space-y-4'>
                  {selectedViolationsDay.violations.map((violation, index) => (
                    <div
                      key={`violation-${selectedViolationsDay.date}-${index}`}
                      className={`rounded-lg border-l-4 p-4 ${
                        violation.severity === 'CRITICAL'
                          ? 'border-red-500 bg-red-50'
                          : violation.severity === 'WARNING'
                            ? 'border-yellow-500 bg-yellow-50'
                            : 'border-blue-500 bg-blue-50'
                      }`}
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center space-x-2'>
                            <h4 className='font-semibold text-gray-900'>
                              {violation.title}
                            </h4>
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                violation.severity === 'CRITICAL'
                                  ? 'bg-red-100 text-red-800'
                                  : violation.severity === 'WARNING'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {violation.severity === 'CRITICAL'
                                ? 'Crítico'
                                : violation.severity === 'WARNING'
                                  ? 'Aviso'
                                  : 'Info'}
                            </span>
                          </div>
                          <p className='mt-2 text-sm text-gray-700'>
                            {violation.description}
                          </p>

                          {/* Show values if available */}
                          {violation.value !== undefined &&
                            violation.limit !== undefined && (
                              <div className='mt-3 grid grid-cols-2 gap-4 rounded-md bg-white/50 p-3'>
                                <div>
                                  <div className='text-xs font-medium text-gray-500'>
                                    Valor Atual
                                  </div>
                                  <div className='text-sm font-semibold text-gray-900'>
                                    {violation.code === 'DAILY_LIMIT' ||
                                    violation.code === 'WINNING_DAY'
                                      ? formatCurrency(violation.value)
                                      : violation.code === 'CONSISTENCY'
                                        ? `${violation.value.toFixed(1)}%`
                                        : violation.code === 'DCA_EXCESSIVE' ||
                                            violation.code === 'OVERNIGHT' ||
                                            violation.code === 'NY_OPENING' ||
                                            violation.code === 'NEWS_EVENTS'
                                          ? `${violation.value} operações`
                                          : `${violation.value.toFixed(1)}%`}
                                  </div>
                                </div>
                                <div>
                                  <div className='text-xs font-medium text-gray-500'>
                                    Limite Permitido
                                  </div>
                                  <div className='text-sm font-semibold text-gray-900'>
                                    {violation.code === 'DAILY_LIMIT' ||
                                    violation.code === 'WINNING_DAY'
                                      ? formatCurrency(violation.limit)
                                      : violation.code === 'CONSISTENCY'
                                        ? `${violation.limit.toFixed(1)}%`
                                        : violation.code === 'DCA_EXCESSIVE'
                                          ? `${violation.limit} médios`
                                          : violation.code === 'OVERNIGHT' ||
                                              violation.code === 'NY_OPENING' ||
                                              violation.code === 'NEWS_EVENTS'
                                            ? 'Nenhuma'
                                            : `${violation.limit.toFixed(1)}%`}
                                  </div>
                                </div>
                              </div>
                            )}

                          {/* Show violation code for reference */}
                          <div className='mt-2'>
                            <span className='font-mono text-xs text-gray-500'>
                              Código: {violation.code}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary of violations */}
                <div className='mt-6 rounded-lg bg-gray-50 p-4'>
                  <h5 className='font-medium text-gray-900'>
                    Resumo das Violações
                  </h5>
                  <div className='mt-2 grid grid-cols-3 gap-4 text-center'>
                    <div>
                      <div className='text-lg font-bold text-red-600'>
                        {
                          selectedViolationsDay.violations.filter(
                            (v) => v.severity === 'CRITICAL',
                          ).length
                        }
                      </div>
                      <div className='text-xs text-gray-500'>Críticas</div>
                    </div>
                    <div>
                      <div className='text-lg font-bold text-yellow-600'>
                        {
                          selectedViolationsDay.violations.filter(
                            (v) => v.severity === 'WARNING',
                          ).length
                        }
                      </div>
                      <div className='text-xs text-gray-500'>Avisos</div>
                    </div>
                    <div>
                      <div className='text-lg font-bold text-blue-600'>
                        {
                          selectedViolationsDay.violations.filter(
                            (v) => v.severity === 'INFO',
                          ).length
                        }
                      </div>
                      <div className='text-xs text-gray-500'>Informações</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default DailyAnalysisModal;
