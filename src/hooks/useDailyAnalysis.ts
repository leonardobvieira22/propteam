import { useMemo } from 'react';

import { devLog } from '@/lib/logger';

import {
  DailyAnalysis,
  DailyAnalysisFilters,
  DailyViolation,
  TradeOperation,
} from '@/types/dailyAnalysis';

export function useDailyAnalysis(
  operations: TradeOperation[],
  accountType: 'MASTER_FUNDED' | 'INSTANT_FUNDING',
  withdrawalThreshold: number,
  filters: DailyAnalysisFilters,
) {
  const dailyAnalysis = useMemo(() => {
    if (!operations || operations.length === 0) {
      devLog.warn('Daily analysis: no operations provided', {
        operationsLength: operations?.length || 0,
        accountType,
      });
      return [];
    }

    devLog.info('Daily analysis processing started', {
      operationsCount: operations.length,
      accountType,
      withdrawalThreshold,
      filters: filters.status,
    });

    // Parse date helper
    const parseDate = (dateStr: string): Date => {
      try {
        if (!dateStr || typeof dateStr !== 'string') {
          devLog.warn('Invalid date string:', dateStr);
          return new Date(); // fallback to current date
        }

        if (dateStr.includes('/')) {
          const [datePart] = dateStr.split(' ');
          const [day, month, year] = datePart.split('/');

          const dayNum = parseInt(day);
          const monthNum = parseInt(month);
          const yearNum = parseInt(year);

          // Validate numbers
          if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
            devLog.warn('Invalid date components:', { day, month, year });
            return new Date();
          }

          // Validate ranges
          if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
            devLog.warn('Invalid date ranges:', {
              day: dayNum,
              month: monthNum,
              year: yearNum,
            });
            return new Date();
          }

          const date = new Date(yearNum, monthNum - 1, dayNum);

          // Check if date is valid
          if (isNaN(date.getTime())) {
            devLog.warn('Invalid parsed date:', dateStr);
            return new Date();
          }

          return date;
        }

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          devLog.warn('Invalid date string:', dateStr);
          return new Date();
        }

        return date;
      } catch (error) {
        devLog.error('Date parsing error:', error, 'for string:', dateStr);
        return new Date(); // fallback to current date
      }
    };

    // Group operations by day
    const operationsByDay = new Map<string, TradeOperation[]>();

    operations.forEach((op) => {
      try {
        if (!op.abertura) {
          devLog.warn('Operation missing abertura field:', op);
          return;
        }

        const date = parseDate(op.abertura);
        const dayKey = date.toISOString().split('T')[0];

        if (!operationsByDay.has(dayKey)) {
          operationsByDay.set(dayKey, []);
        }
        const dayOps = operationsByDay.get(dayKey);
        if (dayOps) {
          dayOps.push(op);
        }
      } catch (error) {
        devLog.error('Error processing operation:', error, op);
      }
    });

    // Calculate YLOS rules parameters
    const minDailyWin = accountType === 'MASTER_FUNDED' ? 50 : 200;
    const maxDayPercentage = accountType === 'MASTER_FUNDED' ? 40 : 30;
    const consistencyDecimal = accountType === 'MASTER_FUNDED' ? 0.4 : 0.3;
    const dailyProfitLimit = withdrawalThreshold * consistencyDecimal;

    // Calculate total profits for consistency rule
    const totalProfitsOnly = operations
      .filter((op) => op.res_operacao > 0)
      .reduce((sum, op) => sum + op.res_operacao, 0);

    // Process each day
    const dailyData: DailyAnalysis[] = Array.from(
      operationsByDay.entries(),
    ).map(([date, dayOps]) => {
      const dateObj = new Date(date);

      // Calculate metrics
      const winningOps = dayOps.filter((op) => op.res_operacao > 0);
      const losingOps = dayOps.filter((op) => op.res_operacao < 0);

      const grossProfit = winningOps.reduce(
        (sum, op) => sum + op.res_operacao,
        0,
      );
      const grossLoss = Math.abs(
        losingOps.reduce((sum, op) => sum + op.res_operacao, 0),
      );
      const netResult = dayOps.reduce((sum, op) => sum + op.res_operacao, 0);

      const maxSingleWin =
        winningOps.length > 0
          ? Math.max(...winningOps.map((op) => op.res_operacao))
          : 0;
      const maxSingleLoss =
        losingOps.length > 0
          ? Math.min(...losingOps.map((op) => op.res_operacao))
          : 0;

      const averageWin =
        winningOps.length > 0 ? grossProfit / winningOps.length : 0;
      const averageLoss =
        losingOps.length > 0 ? grossLoss / losingOps.length : 0;

      const winRate =
        dayOps.length > 0 ? (winningOps.length / dayOps.length) * 100 : 0;
      const profitFactor =
        grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (maxSingleLoss < -500 || grossLoss > 1000) riskLevel = 'high';
      else if (maxSingleLoss < -200 || grossLoss > 400) riskLevel = 'medium';

      // Check violations
      const violations: DailyViolation[] = [];

      // Check if exceeds daily profit limit (YLOS rule: only profits count)
      const exceedsDailyLimit = grossProfit > dailyProfitLimit;
      if (exceedsDailyLimit) {
        violations.push({
          code: 'DAILY_LIMIT',
          title: 'Limite Diário Excedido',
          description: `Ganhos de $${grossProfit.toFixed(2)} excedem limite de $${dailyProfitLimit.toFixed(2)}`,
          severity: 'CRITICAL',
          value: grossProfit,
          limit: dailyProfitLimit,
        });
      }

      // Check consistency rule (YLOS rule: profits vs total profits only)
      const dayConsistencyPercentage =
        totalProfitsOnly > 0 ? (grossProfit / totalProfitsOnly) * 100 : 0;
      const exceedsConsistencyLimit =
        dayConsistencyPercentage > maxDayPercentage;
      if (exceedsConsistencyLimit) {
        violations.push({
          code: 'CONSISTENCY',
          title: 'Regra de Consistência',
          description: `Dia representa ${dayConsistencyPercentage.toFixed(1)}% dos ganhos totais (máx. ${maxDayPercentage}%)`,
          severity: 'CRITICAL',
          value: dayConsistencyPercentage,
          limit: maxDayPercentage,
        });
      }

      // Check if it's a winning day
      const isWinningDay = netResult >= minDailyWin;
      if (!isWinningDay && netResult > 0) {
        violations.push({
          code: 'WINNING_DAY',
          title: 'Dia Vencedor Insuficiente',
          description: `Lucro de $${netResult.toFixed(2)} abaixo do mínimo de $${minDailyWin}`,
          severity: 'WARNING',
          value: netResult,
          limit: minDailyWin,
        });
      }

      // Check for DCA strategy (maximum 3 averagings per operation)
      const dcaOperations = dayOps.filter((op) => op.medio === 'Sim');
      if (dcaOperations.length > 3) {
        violations.push({
          code: 'DCA_EXCESSIVE',
          title: 'Estratégia de Médio Excessiva',
          description: `Detectado uso de estratégia de médio em ${dcaOperations.length} operações. Regra YLOS: máximo 3 médios por operação.`,
          severity: 'WARNING',
          value: dcaOperations.length,
          limit: 3,
        });
      }

      // Check for overnight positions (prohibited in Master Funded)
      const overnightOperations = dayOps.filter((op) => {
        try {
          const abertura = parseDate(op.abertura);
          const fechamento = parseDate(op.fechamento);
          return abertura.getDate() !== fechamento.getDate();
        } catch (error) {
          devLog.error('Error checking overnight position:', error, op);
          return false;
        }
      });

      if (overnightOperations.length > 0) {
        const severidade =
          accountType === 'MASTER_FUNDED' ? 'CRITICAL' : 'WARNING';
        violations.push({
          code: 'OVERNIGHT',
          title: 'Posições Overnight Detectadas',
          description: `Detectadas ${overnightOperations.length} operações overnight. ${accountType === 'MASTER_FUNDED' ? 'PROIBIDO em Master Funded.' : 'Atenção: verifique conformidade.'}`,
          severity: severidade,
          value: overnightOperations.length,
          limit: 0,
        });
      }

      // Check for positions open during NY market opening (9:30 AM NY time - prohibited for Master Funded)
      if (accountType === 'MASTER_FUNDED') {
        const nyOpeningViolations = dayOps.filter((op) => {
          try {
            const abertura = parseDate(op.abertura);
            const fechamento = parseDate(op.fechamento);

            const hour = abertura.getHours();
            const minute = abertura.getMinutes();
            const aberturaMinutes = hour * 60 + minute;

            const fechamentoHour = fechamento.getHours();
            const fechamentoMinute = fechamento.getMinutes();
            const fechamentoMinutes = fechamentoHour * 60 + fechamentoMinute;

            // Determine if we're in Daylight Saving Time (March-November in US)
            const month = abertura.getMonth() + 1; // 1-based month
            const isDST = month >= 3 && month <= 11; // Approximate DST period

            // NY Opening windows in Brazil time (15 minutes before and after 9:30 AM NY)
            // DST: 9:15-9:45 AM NY = 10:15-10:45 AM Brazil
            // Standard: 9:15-9:45 AM NY = 11:15-11:45 AM Brazil
            const windowStart = isDST ? 615 : 675; // 10:15 AM (DST) or 11:15 AM (Standard)
            const windowEnd = isDST ? 645 : 705; // 10:45 AM (DST) or 11:45 AM (Standard)

            // Check if position was open during the prohibited window
            return (
              aberturaMinutes <= windowEnd && fechamentoMinutes >= windowStart
            );
          } catch (error) {
            devLog.error('Error checking NY opening violation:', error, op);
            return false;
          }
        });

        if (nyOpeningViolations.length > 0) {
          violations.push({
            code: 'NY_OPENING',
            title: 'Posições Durante Abertura NY',
            description: `Detectadas ${nyOpeningViolations.length} posições abertas durante abertura do mercado NY (9:15-9:45 AM NY). PROIBIDO em Master Funded.`,
            severity: 'CRITICAL',
            value: nyOpeningViolations.length,
            limit: 0,
          });
        }
      }

      // Check for positions during high-impact news events (basic check)
      // This is a simplified check - in production, you'd integrate with economic calendar API
      const newsTimeWindows = [
        { start: '08:30', end: '09:00', description: 'NFP/CPI Release' },
        { start: '14:00', end: '14:30', description: 'FOMC Meeting' },
        { start: '15:30', end: '16:00', description: 'Economic Data Release' },
      ];

      const newsViolations = dayOps.filter((op) => {
        try {
          const abertura = parseDate(op.abertura);
          const fechamento = parseDate(op.fechamento);

          const aberturaTime = `${abertura.getHours().toString().padStart(2, '0')}:${abertura.getMinutes().toString().padStart(2, '0')}`;
          const fechamentoTime = `${fechamento.getHours().toString().padStart(2, '0')}:${fechamento.getMinutes().toString().padStart(2, '0')}`;

          return newsTimeWindows.some((window) => {
            // Check if position was open during news window
            return aberturaTime <= window.end && fechamentoTime >= window.start;
          });
        } catch (error) {
          devLog.error('Error checking news violation:', error, op);
          return false;
        }
      });

      if (newsViolations.length > 0 && accountType === 'MASTER_FUNDED') {
        violations.push({
          code: 'NEWS_EVENTS',
          title: 'Posições Durante Eventos Econômicos',
          description: `Detectadas ${newsViolations.length} posições abertas durante possíveis eventos econômicos de alto impacto. ATENÇÃO: YLOS recomenda evitar operações durante notícias.`,
          severity: 'WARNING',
          value: newsViolations.length,
          limit: 0,
        });
      }

      // Determine status
      let status: 'approved' | 'warning' | 'critical' = 'approved';
      if (violations.some((v) => v.severity === 'CRITICAL'))
        status = 'critical';
      else if (violations.some((v) => v.severity === 'WARNING'))
        status = 'warning';

      return {
        date,
        dayOfWeek: (() => {
          try {
            return dateObj.toLocaleDateString('pt-BR', { weekday: 'short' });
          } catch (error) {
            devLog.error('Error formatting day of week:', error, dateObj);
            return 'N/A';
          }
        })(),
        totalOperations: dayOps.length,
        winningOperations: winningOps.length,
        losingOperations: losingOps.length,
        winRate,
        grossProfit,
        grossLoss,
        netResult,
        maxSingleWin,
        maxSingleLoss,
        averageWin,
        averageLoss,
        riskLevel,
        profitFactor,
        violations,
        status,
        operationsDetails: dayOps,
        isWinningDay,
        exceedsConsistencyLimit,
        exceedsDailyLimit,
      };
    });

    // Sort data
    const sortedData = [...dailyData].sort((a, b) => {
      let aValue: number | string, bValue: number | string;

      switch (filters.sortBy) {
        case 'date':
          try {
            aValue = new Date(a.date).getTime();
            bValue = new Date(b.date).getTime();
            // Check for invalid dates
            if (isNaN(aValue)) aValue = 0;
            if (isNaN(bValue)) bValue = 0;
          } catch (error) {
            devLog.error('Error sorting by date:', error);
            aValue = 0;
            bValue = 0;
          }
          break;
        case 'netResult':
          aValue = a.netResult;
          bValue = b.netResult;
          break;
        case 'operations':
          aValue = a.totalOperations;
          bValue = b.totalOperations;
          break;
        case 'winRate':
          aValue = a.winRate;
          bValue = b.winRate;
          break;
        default:
          try {
            aValue = new Date(a.date).getTime();
            bValue = new Date(b.date).getTime();
            if (isNaN(aValue)) aValue = 0;
            if (isNaN(bValue)) bValue = 0;
          } catch (error) {
            devLog.error('Error in default sort:', error);
            aValue = 0;
            bValue = 0;
          }
      }

      const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return filters.sortOrder === 'desc' ? -result : result;
    });

    // Filter data
    return sortedData.filter((day) => {
      if (filters.status === 'all') return true;
      return day.status === filters.status;
    });
  }, [operations, accountType, withdrawalThreshold, filters]);

  const summary = useMemo(() => {
    const total = dailyAnalysis.length;
    const approved = dailyAnalysis.filter(
      (d) => d.status === 'approved',
    ).length;
    const warning = dailyAnalysis.filter((d) => d.status === 'warning').length;
    const critical = dailyAnalysis.filter(
      (d) => d.status === 'critical',
    ).length;

    const totalProfit = dailyAnalysis.reduce(
      (sum, day) => sum + day.grossProfit,
      0,
    );
    const totalLoss = dailyAnalysis.reduce(
      (sum, day) => sum + day.grossLoss,
      0,
    );
    const netTotal = dailyAnalysis.reduce((sum, day) => sum + day.netResult, 0);

    return {
      total,
      approved,
      warning,
      critical,
      totalProfit,
      totalLoss,
      netTotal,
      winningDays: dailyAnalysis.filter((d) => d.isWinningDay).length,
    };
  }, [dailyAnalysis]);

  return {
    dailyAnalysis,
    summary,
  };
}
