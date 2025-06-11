import { NextRequest, NextResponse } from 'next/server';

import { type LogContext, enterpriseLogger } from '@/lib/logger';

interface TradeOperation {
  ativo: string;
  abertura: string;
  fechamento: string;
  tempo_operacao: string;
  qtd_compra: number;
  qtd_venda: number;
  lado: 'C' | 'V';
  preco_compra: number;
  preco_venda: number;
  preco_mercado: number;
  medio: string;
  res_intervalo: number;
  res_operacao: number;
  total: number;
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
    operacoes_afetadas?: unknown[];
  }>;
  detalhes_noticias?: unknown[];
  recomendacoes: string[];
  proximos_passos: string[];
}

function parseCSV(
  csvContent: string,
  requestId: string,
  context?: LogContext,
): TradeOperation[] {
  const parseTimer = enterpriseLogger.startPerformanceTimer('csv_parsing', {
    ...context,
    requestId,
  });
  const lines = csvContent.trim().split('\n');
  const operations: TradeOperation[] = [];

  // Initialize CSV processing logging
  enterpriseLogger.csvProcessingStarted(requestId, csvContent.length, context);

  // Find the header line that contains "Ativo"
  let headerIndex = -1;
  let detectedSeparator = '\t';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Try different separators to find the header
    const separators = ['\t', ';', ',', '|'];

    for (const sep of separators) {
      const columns = line.split(sep);
      if (
        columns.length > 10 &&
        line.includes('Ativo') &&
        line.includes('Abertura') &&
        line.includes('Fechamento')
      ) {
        headerIndex = i;
        detectedSeparator = sep;
        enterpriseLogger.csvHeaderFound(
          requestId,
          i,
          sep,
          columns.length,
          context,
        );
        break;
      }
    }

    if (headerIndex !== -1) break;
  }

  if (headerIndex === -1) {
    enterpriseLogger.error(
      'CSV header not found - invalid CSV format',
      undefined,
      { ...context, requestId },
      {
        csvSize: csvContent.length,
        totalLines: lines.length,
        searchedColumns: ['Ativo', 'Abertura', 'Fechamento'],
      },
    );
    parseTimer.end({ status: 'failed', reason: 'header_not_found' });
    return operations; // No valid header found
  }

  // Parse number in Brazilian format (1.234,56 -> 1234.56)
  function parseBrazilianNumber(value: string): number {
    if (!value || value.trim() === '' || value.trim() === '-') return 0;

    // Remove spaces and handle special cases
    let cleanValue = value.trim().replace(/\s+/g, '');

    // If it contains both . and ,, assume . is thousands separator and , is decimal
    if (cleanValue.includes('.') && cleanValue.includes(',')) {
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
    }
    // If it only contains , assume it's decimal separator
    else if (cleanValue.includes(',') && !cleanValue.includes('.')) {
      cleanValue = cleanValue.replace(',', '.');
    }
    // If it only contains . and has more than 3 digits after it, it's thousands separator
    else if (cleanValue.includes('.')) {
      const parts = cleanValue.split('.');
      if (parts.length === 2 && parts[1].length > 2) {
        // This is thousands separator, not decimal
        cleanValue = cleanValue.replace('.', '');
      }
    }

    const result = parseFloat(cleanValue);
    return isNaN(result) ? 0 : result;
  }

  // Process data lines after header
  enterpriseLogger.debug(
    `Processing CSV data lines from ${headerIndex + 1} to ${lines.length - 1}`,
    { ...context, requestId },
  );

  let processedOperations = 0;
  let skippedLines = 0;

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split by detected separator
    const columns = line.split(detectedSeparator);

    if (columns.length < 10) {
      enterpriseLogger.debug(
        `Skipping CSV line: insufficient columns`,
        { ...context, requestId },
        {
          lineNumber: i,
          columnsCount: columns.length,
          minimumRequired: 10,
        },
      );
      skippedLines++;
      continue;
    }

    // Skip lines that don't look like data (empty first column or doesn't start with asset name)
    if (!columns[0] || columns[0].trim() === '') {
      enterpriseLogger.debug(
        `Skipping CSV line: empty first column`,
        { ...context, requestId },
        {
          lineNumber: i,
        },
      );
      skippedLines++;
      continue;
    }

    try {
      const operation: TradeOperation = {
        ativo: columns[0].trim(),
        abertura: columns[1].trim(),
        fechamento: columns[2].trim(),
        tempo_operacao: columns[3].trim(),
        qtd_compra: parseBrazilianNumber(columns[4]),
        qtd_venda: parseBrazilianNumber(columns[5]),
        lado: columns[6].trim() as 'C' | 'V',
        preco_compra: parseBrazilianNumber(columns[7]),
        preco_venda: parseBrazilianNumber(columns[8]),
        preco_mercado: parseBrazilianNumber(columns[9]),
        medio: columns[10].trim(),
        res_intervalo: parseBrazilianNumber(columns[11]),
        res_operacao: parseBrazilianNumber(columns[13]),
        total: parseBrazilianNumber(columns[16]),
      };

      // Validate that we have essential data
      if (operation.ativo && operation.abertura && operation.fechamento) {
        operations.push(operation);
        processedOperations++;
        enterpriseLogger.csvOperationParsed(
          requestId,
          processedOperations,
          {
            ativo: operation.ativo,
            abertura: operation.abertura,
            res_operacao: operation.res_operacao,
          },
          context,
        );
      } else {
        enterpriseLogger.warn(
          `Invalid operation data in CSV line`,
          { ...context, requestId },
          {
            lineNumber: i,
            ativo: operation.ativo,
            abertura: operation.abertura,
            fechamento: operation.fechamento,
          },
        );
        skippedLines++;
      }
    } catch (error) {
      enterpriseLogger.error(
        `Error processing CSV line`,
        error as Error,
        { ...context, requestId },
        {
          lineNumber: i,
          lineContent: line.substring(0, 100),
        },
      );
      skippedLines++;
    }
  }

  const processingTime = parseTimer.end({
    status: 'completed',
    totalOperations: operations.length,
    skippedLines,
  });

  enterpriseLogger.csvProcessingCompleted(
    requestId,
    operations.length,
    processingTime,
    context,
  );

  return operations;
}

function parseDate(dateStr: string): Date {
  // Parse date in format DD/MM/YYYY HH:MM
  const [datePart, timePart] = dateStr.split(' ');
  const [day, month, year] = datePart.split('/');
  const [hour, minute] = (timePart || '00:00').split(':');

  return new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hour),
    parseInt(minute),
  );
}

function analyzeYLOSRules(
  operations: TradeOperation[],
  contaType: 'MASTER_FUNDED' | 'INSTANT_FUNDING',
  saldoAtual: number,
  requestId: string,
  context?: LogContext,
): AnalysisResult {
  const violacoes: AnalysisResult['violacoes'] = [];
  const recomendacoes: string[] = [];
  const proximos_passos: string[] = [];

  // Group operations by day
  const operationsByDay = new Map<string, TradeOperation[]>();
  const resultsByDay = new Map<string, number>(); // Net result (for winning days calculation)
  const dailyProfitsByDay = new Map<string, number>(); // Total profits only (for YLOS consistency rule)

  for (const op of operations) {
    const date = parseDate(op.abertura);
    const dayKey = date.toISOString().split('T')[0];

    if (!operationsByDay.has(dayKey)) {
      operationsByDay.set(dayKey, []);
      resultsByDay.set(dayKey, 0);
      dailyProfitsByDay.set(dayKey, 0);
    }

    const dayOps = operationsByDay.get(dayKey);
    if (dayOps) {
      dayOps.push(op);
    }

    // Net result (used for winning days calculation)
    resultsByDay.set(dayKey, (resultsByDay.get(dayKey) || 0) + op.res_operacao);

    // YLOS Rule: Only count PROFITS for consistency rule (ignore losses)
    // Se você perde $100 e ganha $1000, o ganho é $1000, não $900
    if (op.res_operacao > 0) {
      dailyProfitsByDay.set(
        dayKey,
        (dailyProfitsByDay.get(dayKey) || 0) + op.res_operacao,
      );
    }
  }

  const diasOperados = operationsByDay.size;
  const lucroTotal = operations.reduce((sum, op) => sum + op.res_operacao, 0);

  // YLOS Rule: For consistency rule, use only the profits (not net result)
  const maiorLucroDia = Math.max(...Array.from(dailyProfitsByDay.values()), 0);

  // YLOS Official Rules Implementation
  const minDays = contaType === 'MASTER_FUNDED' ? 10 : 5;
  const minWinningDays = contaType === 'MASTER_FUNDED' ? 7 : 5;
  const minDailyWin = contaType === 'MASTER_FUNDED' ? 50 : 200; // Valor mínimo para considerar dia vencedor
  const maxDayPercentage = contaType === 'MASTER_FUNDED' ? 40 : 30; // % máximo que um dia pode representar do lucro total

  // Calcular dias vencedores conforme regras oficiais YLOS
  const diasVencedores = Array.from(resultsByDay.values()).filter(
    (result) => result >= minDailyWin,
  ).length;

  // Rule 1: Minimum trading days (varies by account type)
  if (diasOperados < minDays) {
    const violation = {
      codigo: 'DIAS_MINIMOS',
      titulo: 'Dias de operação insuficientes',
      descricao: `São necessários pelo menos ${minDays} dias de operação para ${contaType === 'MASTER_FUNDED' ? 'Master Funded' : 'Instant Funding'}. Você operou apenas ${diasOperados} dias.`,
      severidade: 'CRITICAL' as const,
    };
    violacoes.push(violation);
    enterpriseLogger.ylosRuleViolation(
      requestId,
      'DIAS_MINIMOS',
      'CRITICAL',
      violation.descricao,
      context,
    );
  }

  // Rule 2: Minimum winning days (varies by account type)
  if (diasVencedores < minWinningDays) {
    const violation = {
      codigo: 'DIAS_VENCEDORES',
      titulo: 'Dias vencedores insuficientes',
      descricao: `São necessários pelo menos ${minWinningDays} dias vencedores (com lucro ≥ $${minDailyWin}). Você tem apenas ${diasVencedores} dias vencedores.`,
      severidade: 'CRITICAL' as const,
    };
    violacoes.push(violation);
    enterpriseLogger.ylosRuleViolation(
      requestId,
      'DIAS_VENCEDORES',
      'CRITICAL',
      violation.descricao,
      context,
    );
  }

  // Rule 3: Consistency rule - nenhum dia pode representar mais que % do lucro total
  // YLOS Rule: Use only profits for consistency calculation (ignore losses per day)
  const totalProfitsOnly = Array.from(dailyProfitsByDay.values()).reduce(
    (sum, profit) => sum + profit,
    0,
  );

  let consistencia_40_percent = true;
  if (totalProfitsOnly > 0 && maiorLucroDia > 0) {
    const percentualMelhorDia = (maiorLucroDia / totalProfitsOnly) * 100;

    if (percentualMelhorDia > maxDayPercentage) {
      consistencia_40_percent = false;
      violacoes.push({
        codigo: 'CONSISTENCIA',
        titulo: 'Regra de consistência violada',
        descricao: `Nenhum dia pode representar mais de ${maxDayPercentage}% do lucro total. Seu melhor dia de ganhos representa ${percentualMelhorDia.toFixed(2)}% ($${maiorLucroDia.toFixed(2)} de $${totalProfitsOnly.toFixed(2)} em ganhos totais, conforme regra YLOS que considera apenas ganhos positivos).`,
        severidade: 'CRITICAL',
      });
      enterpriseLogger.ylosRuleViolation(
        requestId,
        'CONSISTENCIA',
        'CRITICAL',
        `Dia representou ${percentualMelhorDia.toFixed(2)}% dos ganhos totais`,
        context,
      );
    }
  }

  // Rule 4: Daily profit limit based on consistency rule and withdrawal threshold
  // Based on official YLOS email: "Valor mínimo de saque x 0,40 = Lucro máximo diário permitido"
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

  const accountSize = determineAccountSize(saldoAtual);
  const withdrawalThreshold =
    withdrawalThresholds[accountSize] || saldoAtual * 0.052;
  const consistencyPercentage = contaType === 'MASTER_FUNDED' ? 0.4 : 0.3;
  const dailyProfitLimit = withdrawalThreshold * consistencyPercentage;

  // YLOS Rule: Check daily profit limit using only profits (not net result)
  dailyProfitsByDay.forEach((dailyProfits, day) => {
    if (dailyProfits > dailyProfitLimit) {
      violacoes.push({
        codigo: 'LIMITE_DIARIO_CONSISTENCIA',
        titulo: 'Limite diário de lucro excedido (Regra Consistência)',
        descricao: `No dia ${day}, os ganhos totais de $${dailyProfits.toFixed(2)} excederam o limite diário de $${dailyProfitLimit.toFixed(2)} (baseado na regra de consistência: meta colchão $${withdrawalThreshold.toFixed(2)} x ${consistencyPercentage * 100}%). YLOS considera apenas ganhos positivos, independente de perdas no mesmo dia.`,
        severidade: 'CRITICAL',
        valor_impacto: dailyProfits - dailyProfitLimit,
      });
      enterpriseLogger.ylosRuleViolation(
        requestId,
        'LIMITE_DIARIO_CONSISTENCIA',
        'CRITICAL',
        `Ganhos diários de $${dailyProfits.toFixed(2)} excederam limite de $${dailyProfitLimit.toFixed(2)}`,
        context,
      );
    }
  });

  // Rule 5: Check for DCA strategy (maximum 3 averagings per operation)
  const dcaOperations = operations.filter((op) => op.medio === 'Sim');
  const dcaDays = new Set(
    dcaOperations.map(
      (op) => parseDate(op.abertura).toISOString().split('T')[0],
    ),
  ).size;

  if (dcaDays > 3) {
    violacoes.push({
      codigo: 'DCA_EXCESSIVO',
      titulo: 'Estratégia de médio (DCA) excessiva',
      descricao: `Detectado uso de estratégia de médio em ${dcaDays} dias. Regra YLOS: máximo 3 médios por operação.`,
      severidade: 'WARNING',
      operacoes_afetadas: dcaOperations,
    });
    enterpriseLogger.ylosRuleViolation(
      requestId,
      'DCA_EXCESSIVO',
      'WARNING',
      `DCA usado em ${dcaDays} dias`,
      context,
    );
  }

  // Rule 6: Check for overnight positions (prohibited in Master Funded)
  const overnightOperations = operations.filter((op) => {
    const abertura = parseDate(op.abertura);
    const fechamento = parseDate(op.fechamento);
    return abertura.getDate() !== fechamento.getDate();
  });

  if (overnightOperations.length > 0) {
    const severidade = contaType === 'MASTER_FUNDED' ? 'CRITICAL' : 'WARNING';
    violacoes.push({
      codigo: 'OVERNIGHT',
      titulo: 'Posições overnight detectadas',
      descricao: `Detectadas ${overnightOperations.length} operações overnight. ${contaType === 'MASTER_FUNDED' ? 'PROIBIDO em Master Funded.' : 'Atenção: verifique conformidade.'}`,
      severidade,
      operacoes_afetadas: overnightOperations,
    });
    enterpriseLogger.ylosRuleViolation(
      requestId,
      'OVERNIGHT',
      severidade,
      `${overnightOperations.length} operações overnight`,
      context,
    );
  }

  // Rule 7: Check for positions open during NY market opening (9:30 AM NY time - prohibited for Master Funded)
  // Corrected logic: Check if positions were OPEN during 15 minutes before to 15 minutes after NY opening (9:15-9:45 AM NY)
  if (contaType === 'MASTER_FUNDED') {
    const nyOpeningViolations = operations.filter((op) => {
      const abertura = parseDate(op.abertura);
      const fechamento = parseDate(op.fechamento);

      // Check if position was open during the prohibited window
      // 9:15-9:45 AM NY = 10:15-10:45 AM Brazil (DST) or 11:15-11:45 AM Brazil (Standard)
      // We determine which timezone based on the date
      const checkPositionOpenDuringWindow = () => {
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
        const hasOverlap =
          aberturaMinutes <= windowEnd && fechamentoMinutes >= windowStart;

        const timezoneName = isDST
          ? 'Daylight Saving Time (DST)'
          : 'Standard Time';
        const windowBrazil = isDST ? '10:15-10:45' : '11:15-11:45';

        const hasViolation = hasOverlap;

        if (hasViolation) {
          enterpriseLogger.debug(
            `NY Opening position overlap detected`,
            { ...context, requestId },
            {
              ativo: op.ativo,
              abertura: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
              fechamento: `${fechamentoHour.toString().padStart(2, '0')}:${fechamentoMinute.toString().padStart(2, '0')}`,
              aberturaMinutes,
              fechamentoMinutes,
              isDST,
              timezoneName,
              windowBrazil,
              windowStart,
              windowEnd,
              hasOverlap,
            },
          );
        }

        return hasViolation;
      };

      return checkPositionOpenDuringWindow();
    });

    if (nyOpeningViolations.length > 0) {
      // Determine timezone for the first violation to show in description
      const firstViolation = nyOpeningViolations[0];
      const firstDate = parseDate(firstViolation.abertura);
      const month = firstDate.getMonth() + 1;
      const isDST = month >= 3 && month <= 11;
      const windowBrazil = isDST ? '10:15-10:45' : '11:15-11:45';
      const timezoneName = isDST ? 'Horário de Verão NY' : 'Horário Padrão NY';

      violacoes.push({
        codigo: 'ABERTURA_NY',
        titulo: 'Posições abertas durante abertura NY detectadas',
        descricao: `Detectadas ${nyOpeningViolations.length} posições que estavam ABERTAS durante a janela proibida de abertura do mercado NY (9:15-9:45 AM NY = ${windowBrazil} AM horário Brasil - ${timezoneName}). PROIBIDO estar posicionado 15 min antes até 15 min depois da abertura NY em Master Funded.`,
        severidade: 'CRITICAL',
        operacoes_afetadas: nyOpeningViolations,
      });
      enterpriseLogger.ylosRuleViolation(
        requestId,
        'ABERTURA_NY',
        'CRITICAL',
        `${nyOpeningViolations.length} posições abertas durante abertura NY`,
        context,
      );
    }
  }

  // Rule 8: Check for positions open during high-impact economic news events (prohibited for Master Funded)
  // ENTERPRISE SOLUTION: Configurable economic calendar with environment-based data
  if (contaType === 'MASTER_FUNDED') {
    // Economic events configuration - can be moved to environment variables or database
    const economicEventsConfig = process.env.ECONOMIC_EVENTS_CONFIG
      ? JSON.parse(process.env.ECONOMIC_EVENTS_CONFIG)
      : getDefaultEconomicEvents();

    const newsViolationsWithDetails = operations.filter((op) => {
      const abertura = parseDate(op.abertura);
      const fechamento = parseDate(op.fechamento);

      const checkSpecificNewsEvent = (startDate: Date, endDate: Date) => {
        const results = [];

        // ENTERPRISE ENHANCEMENT: Date-specific validation for known events
        const operationDate = startDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        const dayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dayOfMonth = startDate.getDate();

        for (const event of economicEventsConfig) {
          // Smart filtering: Only check events that could realistically occur on this date
          let shouldCheckEvent = false;
          let confidenceLevel = 'ESTIMATED'; // vs 'CONFIRMED'
          let dateRationale = '';

          // Event-specific date validation logic
          shouldCheckEvent = validateEventDate(
            event,
            dayOfWeek,
            dayOfMonth,
            operationDate,
          );
          const validation = getEventValidation(
            event,
            dayOfWeek,
            dayOfMonth,
            operationDate,
          );
          confidenceLevel = validation.confidence;
          dateRationale = validation.rationale;

          // Only process if event could occur on this date
          if (shouldCheckEvent || confidenceLevel === 'ESTIMATED') {
            // Check both standard and daylight time windows
            const stdTimeMinutes = timeStringToMinutes(event.time_brazil_std);
            const dstTimeMinutes = timeStringToMinutes(event.time_brazil_dst);

            // Create 10-minute windows around each event (5 minutes before and after)
            const stdWindowStart = stdTimeMinutes - 5;
            const stdWindowEnd = stdTimeMinutes + 5;
            const dstWindowStart = dstTimeMinutes - 5;
            const dstWindowEnd = dstTimeMinutes + 5;

            const startMinutes =
              startDate.getHours() * 60 + startDate.getMinutes();
            const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();

            // Check if position was open during either time window
            const overlapStd =
              startMinutes <= stdWindowEnd && endMinutes >= stdWindowStart;
            const overlapDst =
              startMinutes <= dstWindowEnd && endMinutes >= dstWindowStart;

            if (overlapStd || overlapDst) {
              const detectedWindow = overlapStd
                ? `${minutesToTimeString(stdWindowStart)}-${minutesToTimeString(stdWindowEnd)}`
                : `${minutesToTimeString(dstWindowStart)}-${minutesToTimeString(dstWindowEnd)}`;

              results.push({
                event,
                detectedWindow,
                timeType: overlapStd
                  ? 'Horário Padrão NY'
                  : 'Horário de Verão NY',
                confidenceLevel,
                dateRationale,
                operationDate,
              });

              enterpriseLogger.debug(
                `Economic news event overlap detected`,
                { ...context, requestId },
                {
                  ativo: op.ativo,
                  eventName: event.name,
                  eventTime: overlapStd
                    ? event.time_brazil_std
                    : event.time_brazil_dst,
                  positionStart: `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`,
                  positionEnd: `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`,
                  impact: event.impact,
                  detectedWindow,
                  confidenceLevel,
                  dateRationale,
                  operationDate,
                },
              );
            }
          }
        }

        return results;
      };

      const detectedEvents = checkSpecificNewsEvent(abertura, fechamento);
      if (detectedEvents.length > 0) {
        // Add the detected events to the operation for detailed reporting
        (
          op as TradeOperation & { detectedNewsEvents: unknown[] }
        ).detectedNewsEvents = detectedEvents;
        return true;
      }
      return false;
    });

    if (newsViolationsWithDetails.length > 0) {
      // Create detailed description with specific events
      const allDetectedEvents = newsViolationsWithDetails
        .flatMap(
          (op) =>
            (
              op as TradeOperation & {
                detectedNewsEvents?: Array<{ event: { name: string } }>;
              }
            ).detectedNewsEvents || [],
        )
        .map((detail) => detail.event.name)
        .filter((name, index, arr) => arr.indexOf(name) === index); // Remove duplicates

      const eventsList =
        allDetectedEvents.length > 0
          ? allDetectedEvents.join(', ')
          : 'eventos econômicos de alto impacto';

      violacoes.push({
        codigo: 'OPERACAO_NOTICIAS',
        titulo: 'Posições abertas durante eventos econômicos detectadas',
        descricao: `Detectadas ${newsViolationsWithDetails.length} posições que estavam ABERTAS durante eventos econômicos de alto impacto: ${eventsList}. ATENÇÃO: YLOS Trading recomenda evitar operações durante notícias em Master Funded, mas as regras específicas não são claramente definidas. Ver detalhes para informações específicas de cada evento.`,
        severidade: 'WARNING',
        operacoes_afetadas: newsViolationsWithDetails,
      });
      enterpriseLogger.ylosRuleViolation(
        requestId,
        'OPERACAO_NOTICIAS',
        'WARNING',
        `${newsViolationsWithDetails.length} posições durante eventos: ${eventsList}`,
        context,
      );
    }
  }

  // Helper functions for time conversion
  function timeStringToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  function minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // ENTERPRISE: Economic events configuration functions
  function getDefaultEconomicEvents() {
    return [
      {
        name: 'Non-Farm Payrolls (NFP)',
        time_ny: '08:30',
        time_brazil_std: '10:30',
        time_brazil_dst: '09:30',
        impact: 'MUITO ALTO',
        description:
          'Relatório de emprego dos EUA - Indicador econômico crítico',
        frequency: 'Primeira sexta-feira do mês',
        market_impact:
          'Causa volatilidade extrema no USD, índices e commodities',
        recommendation:
          'Feche todas as posições 15 minutos antes e aguarde 30 minutos após',
      },
      {
        name: 'Consumer Price Index (CPI)',
        time_ny: '08:30',
        time_brazil_std: '10:30',
        time_brazil_dst: '09:30',
        impact: 'MUITO ALTO',
        description:
          'Índice de Preços ao Consumidor dos EUA - Principal medida de inflação',
        frequency: 'Mensal, geralmente entre os dias 10-15',
        market_impact:
          'Impacta decisões do FED sobre juros, causa volatilidade em bonds e USD',
        recommendation: 'Evite estar posicionado durante o horário de release',
      },
      {
        name: 'Federal Reserve Interest Rate Decision',
        time_ny: '14:00',
        time_brazil_std: '16:00',
        time_brazil_dst: '15:00',
        impact: 'EXTREMO',
        description: 'Decisão de política monetária do Federal Reserve',
        frequency: '8 reuniões por ano (aproximadamente a cada 6 semanas)',
        market_impact: 'Move todos os mercados globais simultaneamente',
        recommendation: 'PROIBIDO operar no dia da decisão do FED',
      },
      {
        name: 'Initial Jobless Claims',
        time_ny: '08:30',
        time_brazil_std: '10:30',
        time_brazil_dst: '09:30',
        impact: 'ALTO',
        description: 'Pedidos iniciais de auxílio-desemprego nos EUA',
        frequency: 'Semanal (toda quinta-feira)',
        market_impact:
          'Indicador líder da saúde do mercado de trabalho americano',
        recommendation: 'Evite posições durante o release',
      },
      {
        name: 'Gross Domestic Product (GDP)',
        time_ny: '08:30',
        time_brazil_std: '10:30',
        time_brazil_dst: '09:30',
        impact: 'ALTO',
        description:
          'Produto Interno Bruto dos EUA - medida principal da atividade econômica',
        frequency: 'Trimestral (dados preliminar, revisado e final)',
        market_impact: 'Confirma tendências econômicas, impacta USD e índices',
        recommendation: 'Monitore volatilidade 15 minutos antes e depois',
      },
      {
        name: 'ISM Manufacturing PMI',
        time_ny: '10:00',
        time_brazil_std: '12:00',
        time_brazil_dst: '11:00',
        impact: 'ALTO',
        description: 'Índice de Gerentes de Compras do setor manufatureiro',
        frequency: 'Mensal (primeiro dia útil do mês)',
        market_impact: 'Indicador líder da saúde da manufatura americana',
        recommendation: 'Feche posições 10 minutos antes do release',
      },
    ];
  }

  function validateEventDate(
    event: { name: string },
    dayOfWeek: number,
    dayOfMonth: number,
    operationDate: string,
  ): boolean {
    if (event.name === 'Initial Jobless Claims') {
      return dayOfWeek === 4; // Thursday
    } else if (event.name === 'Non-Farm Payrolls (NFP)') {
      return dayOfWeek === 5 && dayOfMonth <= 7; // First Friday
    } else if (event.name === 'Federal Reserve Interest Rate Decision') {
      const fedMeetingDates = getFedMeetingDates();
      return fedMeetingDates.includes(operationDate);
    }
    return true; // For other events, check all dates
  }

  function getEventValidation(
    event: { name: string },
    dayOfWeek: number,
    dayOfMonth: number,
    operationDate: string,
  ) {
    if (event.name === 'Initial Jobless Claims') {
      return {
        confidence: dayOfWeek === 4 ? 'HIGH_PROBABILITY' : 'LOW_PROBABILITY',
        rationale:
          dayOfWeek === 4
            ? 'Quinta-feira é dia típico do Claims'
            : 'Claims não ocorre neste dia',
      };
    } else if (event.name === 'Non-Farm Payrolls (NFP)') {
      const isFirstFriday = dayOfWeek === 5 && dayOfMonth <= 7;
      return {
        confidence: isFirstFriday ? 'HIGH_PROBABILITY' : 'LOW_PROBABILITY',
        rationale: isFirstFriday
          ? 'Primeira sexta-feira do mês (típico do NFP)'
          : 'NFP só ocorre na primeira sexta-feira',
      };
    } else if (event.name === 'Federal Reserve Interest Rate Decision') {
      const fedMeetingDates = getFedMeetingDates();
      const isConfirmed = fedMeetingDates.includes(operationDate);
      return {
        confidence: isConfirmed ? 'CONFIRMED' : 'NO_EVENT',
        rationale: isConfirmed
          ? 'Data confirmada de reunião do FED'
          : 'Não há reunião do FED nesta data',
      };
    }
    return {
      confidence: 'ESTIMATED',
      rationale: 'Verificação baseada em horário típico (data não confirmada)',
    };
  }

  function getFedMeetingDates(): string[] {
    // ENTERPRISE: This should be loaded from environment variables or external API
    const fedDatesConfig = process.env.FED_MEETING_DATES;
    if (fedDatesConfig) {
      return JSON.parse(fedDatesConfig);
    }

    // Default dates for 2024-2025 (should be updated regularly)
    return [
      '2024-01-31',
      '2024-03-20',
      '2024-05-01',
      '2024-06-12',
      '2024-07-31',
      '2024-09-18',
      '2024-11-07',
      '2024-12-18',
      '2025-01-29',
      '2025-03-19',
      '2025-04-30',
      '2025-06-11',
      '2025-07-30',
      '2025-09-17',
      '2025-11-06',
      '2025-12-17',
    ];
  }

  // Generate professional recommendations based on YLOS official rules
  const criticalViolations = violacoes.filter(
    (v) => v.severidade === 'CRITICAL',
  );
  const warningViolations = violacoes.filter((v) => v.severidade === 'WARNING');

  if (violacoes.length === 0) {
    recomendacoes.push(
      '🎉 Excelente! Todas as regras oficiais da YLOS Trading foram atendidas com sucesso.',
    );
    recomendacoes.push(
      'Sua estratégia de trading demonstra consistência e conformidade enterprise-grade.',
    );
    recomendacoes.push(
      'Continue mantendo essa disciplina operacional para sustentabilidade a longo prazo.',
    );

    proximos_passos.push(
      'Solicite o saque através do painel YLOS Trading seguindo o processo oficial.',
    );
    proximos_passos.push(
      'Mantenha o saldo mínimo requerido: drawdown + $100 para futuras operações.',
    );
    proximos_passos.push(
      'Continue operando com a mesma disciplina para preservar o status aprovado.',
    );
  } else {
    recomendacoes.push(
      `⚠️ Análise identificou ${criticalViolations.length} violação(ões) crítica(s) e ${warningViolations.length} alerta(s).`,
    );

    if (criticalViolations.length > 0) {
      recomendacoes.push(
        'As violações críticas IMPEDEM a aprovação do saque conforme regulamento YLOS.',
      );

      if (criticalViolations.some((v) => v.codigo === 'DIAS_MINIMOS')) {
        recomendacoes.push(
          `Continue operando até completar ${minDays} dias de trading para ${contaType === 'MASTER_FUNDED' ? 'Master Funded' : 'Instant Funding'}.`,
        );
      }

      if (criticalViolations.some((v) => v.codigo === 'DIAS_VENCEDORES')) {
        recomendacoes.push(
          `Foque em atingir ${minWinningDays} dias vencedores com lucro mínimo de $${minDailyWin} por dia.`,
        );
      }

      if (criticalViolations.some((v) => v.codigo === 'CONSISTENCIA')) {
        recomendacoes.push(
          `Distribua melhor os lucros: nenhum dia pode exceder ${maxDayPercentage}% do lucro total.`,
        );
      }

      if (criticalViolations.some((v) => v.codigo === 'OVERNIGHT')) {
        recomendacoes.push(
          'Elimine completamente operações overnight - proibidas em Master Funded.',
        );
      }

      if (criticalViolations.some((v) => v.codigo === 'ABERTURA_NY')) {
        recomendacoes.push(
          'CRÍTICO: Evite operações durante abertura NY (9:30 AM) - proibido em Master Funded.',
        );
      }

      if (
        criticalViolations.some(
          (v) => v.codigo === 'LIMITE_DIARIO_CONSISTENCIA',
        )
      ) {
        recomendacoes.push(
          `CRÍTICO: Respeite o limite diário baseado na regra de consistência ($${dailyProfitLimit.toFixed(2)} para sua conta).`,
        );
      }
    }

    if (warningViolations.length > 0) {
      recomendacoes.push(
        'Os alertas não impedem o saque mas devem ser considerados para melhor performance.',
      );

      if (warningViolations.some((v) => v.codigo === 'DCA_EXCESSIVO')) {
        recomendacoes.push(
          'Limite a estratégia de médio a máximo 3 operações conforme regras YLOS.',
        );
      }

      if (warningViolations.some((v) => v.codigo === 'OPERACAO_NOTICIAS')) {
        recomendacoes.push(
          'ATENÇÃO: Evite operações durante notícias de alto impacto - recomendação YLOS Trading (regras específicas não claramente definidas).',
        );
      }
    }

    // Próximos passos específicos
    if (criticalViolations.length > 0) {
      proximos_passos.push(
        '🔴 AÇÃO OBRIGATÓRIA: Resolva todas as violações críticas antes de solicitar saque.',
      );
      proximos_passos.push(
        'Continue operando seguindo rigorosamente as regras oficiais YLOS Trading.',
      );
      proximos_passos.push(
        'Execute nova análise após correções para verificar conformidade.',
      );
    } else {
      proximos_passos.push(
        '🟡 Violações são avisos - saque pode ser solicitado mas considere melhorias.',
      );
      proximos_passos.push(
        'Implemente ajustes sugeridos para otimizar performance futura.',
      );
      proximos_passos.push(
        'Monitore métricas continuamente para manter excelência operacional.',
      );
    }

    proximos_passos.push(
      'Consulte FAQ oficial YLOS Trading (ylostrading.com) para esclarecimentos.',
    );
  }

  // Calcular período de análise
  const datas = operations.map((op) => parseDate(op.abertura));
  const dataInicial = new Date(Math.min(...datas.map((d) => d.getTime())));
  const dataFinal = new Date(Math.max(...datas.map((d) => d.getTime())));

  // Calcular diferença em dias de forma mais precisa
  // Normalizar para início do dia para evitar problemas de horário
  const dataInicialNormalizada = new Date(
    dataInicial.getFullYear(),
    dataInicial.getMonth(),
    dataInicial.getDate(),
  );
  const dataFinalNormalizada = new Date(
    dataFinal.getFullYear(),
    dataFinal.getMonth(),
    dataFinal.getDate(),
  );

  // Calcular diferença em dias e somar 1 (inclusive)
  const diferencaEmDias = Math.floor(
    (dataFinalNormalizada.getTime() - dataInicialNormalizada.getTime()) /
      (1000 * 60 * 60 * 24),
  );
  const totalDias = diferencaEmDias + 1;

  // Enterprise logging para debug de período
  enterpriseLogger.debug(
    'Período de análise calculado',
    { ...context, requestId },
    {
      dataInicial: dataInicial.toISOString(),
      dataFinal: dataFinal.toISOString(),
      dataInicialNormalizada: dataInicialNormalizada.toISOString(),
      dataFinalNormalizada: dataFinalNormalizada.toISOString(),
      diferencaEmDias,
      totalDias,
      totalOperacoes: operations.length,
    },
  );

  const periodo_analise = {
    data_inicial: dataInicial.toLocaleDateString('pt-BR'),
    data_final: dataFinal.toLocaleDateString('pt-BR'),
    total_dias: totalDias,
  };

  // Criar mapa de operações com violações para determinar status
  const operacoesComViolacoes = new Map<string, string[]>();

  violacoes.forEach((violacao) => {
    if (violacao.operacoes_afetadas) {
      (violacao.operacoes_afetadas as TradeOperation[]).forEach((op) => {
        const key = `${op.ativo}-${op.abertura}-${op.fechamento}`;
        if (!operacoesComViolacoes.has(key)) {
          operacoesComViolacoes.set(key, []);
        }
        operacoesComViolacoes.get(key)?.push(violacao.titulo);
      });
    }
  });

  // Processar operações detalhadas
  const operacoes_detalhadas = operations.map((op, index) => {
    const key = `${op.ativo}-${op.abertura}-${op.fechamento}`;
    const violacoesOp = operacoesComViolacoes.get(key) || [];

    let status: 'APROVADA' | 'REPROVADA' | 'WARNING' = 'APROVADA';
    let descricao_status = 'Operação está em conformidade com as regras YLOS';

    if (violacoesOp.length > 0) {
      // Verificar se tem violações críticas
      const temCritica = violacoes.some(
        (v) =>
          v.severidade === 'CRITICAL' &&
          v.operacoes_afetadas &&
          (v.operacoes_afetadas as TradeOperation[]).some(
            (opAfetada) =>
              `${opAfetada.ativo}-${opAfetada.abertura}-${opAfetada.fechamento}` ===
              key,
          ),
      );

      if (temCritica) {
        status = 'REPROVADA';
        descricao_status = `Operação viola regras críticas: ${violacoesOp.join(', ')}`;
      } else {
        status = 'WARNING';
        descricao_status = `Operação com alertas: ${violacoesOp.join(', ')}`;
      }
    }

    return {
      id: `op-${index + 1}`,
      ativo: op.ativo,
      abertura: op.abertura,
      fechamento: op.fechamento,
      lado: op.lado,
      resultado: op.res_operacao,
      status,
      violacoes: violacoesOp,
      descricao_status,
    };
  });

  const aprovado =
    violacoes.filter((v) => v.severidade === 'CRITICAL').length === 0;

  return {
    aprovado,
    total_operacoes: operations.length,
    dias_operados: diasOperados,
    dias_vencedores: diasVencedores,
    lucro_total: lucroTotal,
    maior_lucro_dia: maiorLucroDia,
    consistencia_40_percent,
    periodo_analise,
    operacoes_detalhadas,
    violacoes,
    recomendacoes,
    proximos_passos,
  };
}

export async function POST(request: NextRequest) {
  const requestTimer = enterpriseLogger.startPerformanceTimer(
    'ylos_analysis_request',
  );
  const requestId = enterpriseLogger.generateRequestId();

  const requestContext: LogContext = {
    requestId,
    component: 'ylos_analysis_api',
    operation: 'analyze_trading_data',
  };

  try {
    enterpriseLogger.info(
      'YLOS Trading analysis request initiated',
      requestContext,
      {
        method: request.method,
        url: request.url,
        userAgent: request.headers.get('user-agent'),
        requestPhase: 'initialization',
      },
    );

    const body = await request.json();

    // Validate required fields
    if (!body.csv_content || !body.conta_type || !body.saldo_atual) {
      // console.log('❌ Validation failed - Missing required fields', {
      //   hasCSV: !!body.csv_content,
      //   hasContaType: !!body.conta_type,
      //   hasSaldo: !!body.saldo_atual
      // })

      return NextResponse.json(
        {
          detail:
            'Dados obrigatórios não fornecidos (csv_content, conta_type, saldo_atual)',
        },
        { status: 400 },
      );
    }

    // console.log('✅ Request validation passed', {
    //   conta_type: body.conta_type,
    //   saldo_atual: body.saldo_atual,
    //   csv_length: body.csv_content.length,
    //   verificar_noticias: body.verificar_noticias,
    //   saques_realizados: body.saques_realizados
    // })

    // Parse CSV data
    const operations = parseCSV(body.csv_content, requestId, requestContext);

    if (operations.length === 0) {
      enterpriseLogger.warn(
        'No valid operations found in CSV',
        requestContext,
        {
          csvSize: body.csv_content.length,
          requestPhase: 'validation_failed',
        },
      );
      requestTimer.end(
        { status: 'failed', reason: 'no_operations_found' },
        { statusCode: 400 },
      );

      return NextResponse.json(
        { detail: 'Nenhuma operação válida encontrada no CSV' },
        { status: 400 },
      );
    }

    // Perform YLOS analysis
    const analysisTimer = enterpriseLogger.startPerformanceTimer(
      'ylos_rules_analysis',
      requestContext,
    );
    enterpriseLogger.ylosAnalysisStarted(
      requestId,
      operations.length,
      body.conta_type,
      requestContext,
    );

    const result = analyzeYLOSRules(
      operations,
      body.conta_type,
      body.saldo_atual,
      requestId,
      requestContext,
    );

    const analysisTime = analysisTimer.end({
      status: 'completed',
      operationsAnalyzed: operations.length,
      violationsFound: result.violacoes.length,
    });

    enterpriseLogger.ylosAnalysisCompleted(
      requestId,
      {
        approved: result.aprovado,
        totalOperations: result.total_operacoes,
        daysTraded: result.dias_operados,
        violationsCount: result.violacoes.length,
      },
      analysisTime,
      requestContext,
    );

    const _totalTime = requestTimer.end(
      {
        status: 'success',
        operationsProcessed: result.total_operacoes,
        analysisResult: result.aprovado ? 'approved' : 'rejected',
      },
      { statusCode: 200 },
    );

    return NextResponse.json(result);
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error('Unknown error');

    enterpriseLogger.critical(
      'Critical error in YLOS Trading analysis',
      errorInstance,
      requestContext,
      {
        endpoint: '/api/ylos/analyze',
        requestPhase: 'processing_error',
      },
    );

    requestTimer.end(
      {
        status: 'error',
        errorType: errorInstance.name,
        errorMessage: errorInstance.message,
      },
      { statusCode: 500 },
    );

    return NextResponse.json(
      {
        detail:
          'Erro interno do servidor. Verifique os dados enviados e tente novamente.',
        error_code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 },
    );
  }
}
