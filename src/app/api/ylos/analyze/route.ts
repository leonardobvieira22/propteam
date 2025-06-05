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
  const resultsByDay = new Map<string, number>();

  for (const op of operations) {
    const date = parseDate(op.abertura);
    const dayKey = date.toISOString().split('T')[0];

    if (!operationsByDay.has(dayKey)) {
      operationsByDay.set(dayKey, []);
      resultsByDay.set(dayKey, 0);
    }

    const dayOps = operationsByDay.get(dayKey);
    if (dayOps) {
      dayOps.push(op);
    }
    resultsByDay.set(dayKey, (resultsByDay.get(dayKey) || 0) + op.res_operacao);
  }

  const diasOperados = operationsByDay.size;
  const lucroTotal = operations.reduce((sum, op) => sum + op.res_operacao, 0);
  const maiorLucroDia = Math.max(
    ...Array.from(resultsByDay.values()).filter((v) => v > 0),
    0,
  );

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
  let consistencia_40_percent = true;
  if (lucroTotal > 0 && maiorLucroDia > 0) {
    const percentualMelhorDia = (maiorLucroDia / lucroTotal) * 100;

    if (percentualMelhorDia > maxDayPercentage) {
      consistencia_40_percent = false;
      violacoes.push({
        codigo: 'CONSISTENCIA',
        titulo: 'Regra de consistência violada',
        descricao: `Nenhum dia pode representar mais de ${maxDayPercentage}% do lucro total. Seu melhor dia representa ${percentualMelhorDia.toFixed(2)}% ($${maiorLucroDia.toFixed(2)} de $${lucroTotal.toFixed(2)}).`,
        severidade: 'CRITICAL',
      });
      enterpriseLogger.ylosRuleViolation(
        requestId,
        'CONSISTENCIA',
        'CRITICAL',
        `Dia representou ${percentualMelhorDia.toFixed(2)}% do lucro total`,
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

  const withdrawalThreshold =
    withdrawalThresholds[saldoAtual] || saldoAtual * 0.052; // fallback to ~5.2% if not found
  const consistencyPercentage = contaType === 'MASTER_FUNDED' ? 0.4 : 0.3;
  const dailyProfitLimit = withdrawalThreshold * consistencyPercentage;

  resultsByDay.forEach((result, day) => {
    if (result > dailyProfitLimit) {
      violacoes.push({
        codigo: 'LIMITE_DIARIO_CONSISTENCIA',
        titulo: 'Limite diário de lucro excedido (Regra Consistência)',
        descricao: `No dia ${day}, o lucro de $${result.toFixed(2)} excedeu o limite diário de $${dailyProfitLimit.toFixed(2)} (baseado na regra de consistência: meta colchão $${withdrawalThreshold.toFixed(2)} x ${consistencyPercentage * 100}%).`,
        severidade: 'CRITICAL',
        valor_impacto: result - dailyProfitLimit,
      });
      enterpriseLogger.ylosRuleViolation(
        requestId,
        'LIMITE_DIARIO_CONSISTENCIA',
        'CRITICAL',
        `Lucro diário de $${result.toFixed(2)} excedeu limite de $${dailyProfitLimit.toFixed(2)}`,
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
      // 9:15-9:45 AM NY = approximately 11:15-11:45 AM Brazil (standard time) or 10:15-10:45 AM Brazil (daylight time)
      // We'll check both windows to be safe
      const checkPositionOpenDuringWindow = () => {
        const hour = abertura.getHours();
        const minute = abertura.getMinutes();
        const aberturaMinutes = hour * 60 + minute;

        const fechamentoHour = fechamento.getHours();
        const fechamentoMinute = fechamento.getMinutes();
        const fechamentoMinutes = fechamentoHour * 60 + fechamentoMinute;

        // NY Opening windows in Brazil time (15 minutes before and after 9:30 AM NY)
        // 9:15-9:45 AM NY = 11:15-11:45 AM Brazil (standard) or 10:15-10:45 AM Brazil (daylight)
        const nyWindow1Start = 615; // 10:15 AM Brazil
        const nyWindow1End = 645;   // 10:45 AM Brazil
        const nyWindow2Start = 675; // 11:15 AM Brazil  
        const nyWindow2End = 705;   // 11:45 AM Brazil

        // Check if position was open during any of these windows
        const overlapWindow1 = 
          (aberturaMinutes <= nyWindow1End && fechamentoMinutes >= nyWindow1Start);
        const overlapWindow2 = 
          (aberturaMinutes <= nyWindow2End && fechamentoMinutes >= nyWindow2Start);

        const hasViolation = overlapWindow1 || overlapWindow2;

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
              window1Overlap: overlapWindow1,
              window2Overlap: overlapWindow2,
            },
          );
        }

        return hasViolation;
      };

      return checkPositionOpenDuringWindow();
    });

    if (nyOpeningViolations.length > 0) {
      violacoes.push({
        codigo: 'ABERTURA_NY',
        titulo: 'Posições abertas durante abertura NY detectadas',
        descricao: `Detectadas ${nyOpeningViolations.length} posições que estavam ABERTAS durante a janela proibida de abertura do mercado NY (9:15-9:45 AM NY / 10:15-10:45 ou 11:15-11:45 horário Brasil). PROIBIDO estar posicionado 15 min antes até 15 min depois da abertura NY em Master Funded.`,
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

  // Rule 8: Check for operations during news events (prohibited for Master Funded)
  // Note: This is a simplified check based on common news times
  // For a complete implementation, you would need an economic calendar API
  if (contaType === 'MASTER_FUNDED') {
    const newsTimesOperations = operations.filter((op) => {
      const abertura = parseDate(op.abertura);
      const fechamento = parseDate(op.fechamento);

      const checkNewsTime = (date: Date, operationType: string) => {
        const hour = date.getHours();
        const minute = date.getMinutes();

        // Common high-impact news times (Brazil timezone):
        // 8:30 AM NY = 10:30 AM Brazil (during NY standard) or 9:30 AM Brazil (during NY daylight)
        // 10:00 AM NY = 12:00 PM Brazil (during NY standard) or 11:00 AM Brazil (during NY daylight)
        // We'll check around these times: 9:25-9:35 AM, 10:25-10:35 AM, 11:55-12:05 PM Brazil time

        const timeInMinutes = hour * 60 + minute;
        const newsWindow1 = timeInMinutes >= 565 && timeInMinutes <= 575; // 9:25-9:35 AM
        const newsWindow2 = timeInMinutes >= 625 && timeInMinutes <= 635; // 10:25-10:35 AM
        const newsWindow3 = timeInMinutes >= 715 && timeInMinutes <= 725; // 11:55-12:05 PM

        const isInNewsWindow = newsWindow1 || newsWindow2 || newsWindow3;

        if (isInNewsWindow) {
          enterpriseLogger.debug(
            `News time window detected`,
            { ...context, requestId },
            {
              ativo: op.ativo,
              operationType,
              time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
              timeInMinutes,
              window1: newsWindow1,
              window2: newsWindow2,
              window3: newsWindow3,
            },
          );
        }

        return isInNewsWindow;
      };

      const aberturaViolation = checkNewsTime(abertura, 'abertura');
      const fechamentoViolation = checkNewsTime(fechamento, 'fechamento');
      
      return aberturaViolation || fechamentoViolation;
    });

    if (newsTimesOperations.length > 0) {
      violacoes.push({
        codigo: 'OPERACAO_NOTICIAS',
        titulo: 'Operações durante notícias detectadas',
        descricao: `Detectadas ${newsTimesOperations.length} operações durante horários típicos de notícias de alto impacto. PROIBIDO estar posicionado durante notícias em Master Funded. Janelas: 9:25-9:35, 10:25-10:35 e 11:55-12:05 (horário Brasil).`,
        severidade: 'CRITICAL',
        operacoes_afetadas: newsTimesOperations,
      });
      enterpriseLogger.ylosRuleViolation(
        requestId,
        'OPERACAO_NOTICIAS',
        'CRITICAL',
        `${newsTimesOperations.length} operações durante notícias`,
        context,
      );
    }
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

      if (criticalViolations.some((v) => v.codigo === 'OPERACAO_NOTICIAS')) {
        recomendacoes.push(
          'CRÍTICO: Não opere durante horários de notícias de alto impacto - proibido em Master Funded.',
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
