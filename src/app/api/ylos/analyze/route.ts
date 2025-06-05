import { NextRequest, NextResponse } from 'next/server'
import { enterpriseLogger, type LogContext } from '@/lib/logger'

interface TradeOperation {
  ativo: string
  abertura: string
  fechamento: string
  tempo_operacao: string
  qtd_compra: number
  qtd_venda: number
  lado: 'C' | 'V'
  preco_compra: number
  preco_venda: number
  preco_mercado: number
  medio: string
  res_intervalo: number
  res_operacao: number
  total: number
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

function parseCSV(csvContent: string, requestId: string, context?: LogContext): TradeOperation[] {
  const parseTimer = enterpriseLogger.startPerformanceTimer('csv_parsing', { ...context, requestId })
  const lines = csvContent.trim().split('\n')
  const operations: TradeOperation[] = []
  
  // Initialize CSV processing logging
  enterpriseLogger.csvProcessingStarted(requestId, csvContent.length, context)
  
  // Find the header line that contains "Ativo"
  let headerIndex = -1
  let detectedSeparator = '\t'
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Try different separators to find the header
    const separators = ['\t', ';', ',', '|']
    
    for (const sep of separators) {
      const columns = line.split(sep)
      if (columns.length > 10 && 
          line.includes('Ativo') && 
          line.includes('Abertura') && 
          line.includes('Fechamento')) {
        headerIndex = i
                 detectedSeparator = sep
         enterpriseLogger.csvHeaderFound(requestId, i, sep, columns.length, context)
         break
      }
    }
    
    if (headerIndex !== -1) break
  }
  
  if (headerIndex === -1) {
    enterpriseLogger.error('CSV header not found - invalid CSV format', undefined, { ...context, requestId }, {
      csvSize: csvContent.length,
      totalLines: lines.length,
      searchedColumns: ['Ativo', 'Abertura', 'Fechamento']
    })
    parseTimer.end({ status: 'failed', reason: 'header_not_found' })
    return operations // No valid header found
  }
  
  // Parse number in Brazilian format (1.234,56 -> 1234.56)
  function parseBrazilianNumber(value: string): number {
    if (!value || value.trim() === '' || value.trim() === '-') return 0
    
    // Remove spaces and handle special cases
    let cleanValue = value.trim().replace(/\s+/g, '')
    
    // If it contains both . and ,, assume . is thousands separator and , is decimal
    if (cleanValue.includes('.') && cleanValue.includes(',')) {
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.')
    }
    // If it only contains , assume it's decimal separator
    else if (cleanValue.includes(',') && !cleanValue.includes('.')) {
      cleanValue = cleanValue.replace(',', '.')
    }
    // If it only contains . and has more than 3 digits after it, it's thousands separator
    else if (cleanValue.includes('.')) {
      const parts = cleanValue.split('.')
      if (parts.length === 2 && parts[1].length > 2) {
        // This is thousands separator, not decimal
        cleanValue = cleanValue.replace('.', '')
      }
    }
    
    const result = parseFloat(cleanValue)
    return isNaN(result) ? 0 : result
  }
  
  // Process data lines after header
  enterpriseLogger.debug(`Processing CSV data lines from ${headerIndex + 1} to ${lines.length - 1}`, { ...context, requestId })
  
  let processedOperations = 0
  let skippedLines = 0
  
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    // Split by detected separator
    const columns = line.split(detectedSeparator)
    
    if (columns.length < 10) {
      enterpriseLogger.debug(`Skipping CSV line: insufficient columns`, { ...context, requestId }, {
        lineNumber: i,
        columnsCount: columns.length,
        minimumRequired: 10
      })
      skippedLines++
      continue
    }
    
    // Skip lines that don't look like data (empty first column or doesn't start with asset name)
    if (!columns[0] || columns[0].trim() === '') {
      enterpriseLogger.debug(`Skipping CSV line: empty first column`, { ...context, requestId }, {
        lineNumber: i
      })
      skippedLines++
      continue
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
        total: parseBrazilianNumber(columns[16])
      }
      
            // Validate that we have essential data
      if (operation.ativo && operation.abertura && operation.fechamento) {
        operations.push(operation)
        processedOperations++
        enterpriseLogger.csvOperationParsed(requestId, processedOperations, {
          ativo: operation.ativo,
          abertura: operation.abertura,
          res_operacao: operation.res_operacao
        }, context)
      } else {
        enterpriseLogger.warn(`Invalid operation data in CSV line`, { ...context, requestId }, {
          lineNumber: i,
          ativo: operation.ativo,
          abertura: operation.abertura,
          fechamento: operation.fechamento
        })
        skippedLines++
      }
    } catch (error) {
      enterpriseLogger.error(`Error processing CSV line`, error as Error, { ...context, requestId }, {
        lineNumber: i,
        lineContent: line.substring(0, 100)
      })
      skippedLines++
    }
  }
  
  const processingTime = parseTimer.end({ 
    status: 'completed',
    totalOperations: operations.length,
    skippedLines 
  })
  
  enterpriseLogger.csvProcessingCompleted(requestId, operations.length, processingTime, context)
  
  return operations
}

function parseDate(dateStr: string): Date {
  // Parse date in format DD/MM/YYYY HH:MM
  const [datePart, timePart] = dateStr.split(' ')
  const [day, month, year] = datePart.split('/')
  const [hour, minute] = (timePart || '00:00').split(':')
  
  return new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hour),
    parseInt(minute)
  )
}

function analyzeYLOSRules(
  operations: TradeOperation[], 
  contaType: 'MASTER_FUNDED' | 'INSTANT_FUNDING',
  saldoAtual: number,
  requestId: string,
  context?: LogContext
): AnalysisResult {
  const violacoes: AnalysisResult['violacoes'] = []
  const recomendacoes: string[] = []
  const proximos_passos: string[] = []
  
  // Group operations by day
  const operationsByDay = new Map<string, TradeOperation[]>()
  const resultsByDay = new Map<string, number>()
  
  for (const op of operations) {
    const date = parseDate(op.abertura)
    const dayKey = date.toISOString().split('T')[0]
    
    if (!operationsByDay.has(dayKey)) {
      operationsByDay.set(dayKey, [])
      resultsByDay.set(dayKey, 0)
    }
    
    const dayOps = operationsByDay.get(dayKey)
    if (dayOps) {
      dayOps.push(op)
    }
    resultsByDay.set(dayKey, (resultsByDay.get(dayKey) || 0) + op.res_operacao)
  }
  
  const diasOperados = operationsByDay.size
  const diasVencedores = Array.from(resultsByDay.values()).filter(result => result > 0).length
  const lucroTotal = operations.reduce((sum, op) => sum + op.res_operacao, 0)
  const maiorLucroDia = Math.max(...Array.from(resultsByDay.values()))
  
  // Rule 1: Minimum trading days (varies by account type)
  const minDays = contaType === 'MASTER_FUNDED' ? 10 : 5
  if (diasOperados < minDays) {
    const violation = {
      codigo: 'DIAS_MINIMOS',
      titulo: 'Dias de operação insuficientes',
      descricao: `São necessários pelo menos ${minDays} dias de operação. Você operou apenas ${diasOperados} dias.`,
      severidade: 'CRITICAL' as const
    }
    violacoes.push(violation)
    enterpriseLogger.ylosRuleViolation(requestId, 'DIAS_MINIMOS', 'CRITICAL', violation.descricao, context)
  }
  
  // Rule 2: Consistency rule (40% for Master Funded, 30% for Instant Funding)
  const consistencyThreshold = contaType === 'MASTER_FUNDED' ? 0.4 : 0.3
  const consistencyRatio = diasOperados > 0 ? diasVencedores / diasOperados : 0
  const consistencia_40_percent = consistencyRatio >= consistencyThreshold
  
  if (!consistencia_40_percent) {
    violacoes.push({
      codigo: 'CONSISTENCIA',
      titulo: 'Regra de consistência violada',
      descricao: `É necessário ${(consistencyThreshold * 100)}% de dias vencedores. Você tem ${(consistencyRatio * 100).toFixed(1)}% (${diasVencedores}/${diasOperados} dias).`,
      severidade: 'CRITICAL'
    })
  }
  
  // Rule 3: Daily profit limit (based on account balance)
  const dailyLimit = saldoAtual * 0.05 // 5% of account balance
  resultsByDay.forEach((result, day) => {
    if (result > dailyLimit) {
      violacoes.push({
        codigo: 'LIMITE_DIARIO',
        titulo: 'Limite diário de lucro excedido',
        descricao: `No dia ${day}, o lucro de $${result.toFixed(2)} excedeu o limite diário de $${dailyLimit.toFixed(2)} (5% do saldo).`,
        severidade: 'WARNING',
        valor_impacto: result - dailyLimit
      })
    }
  })
  
  // Rule 4: Check for DCA strategy (medium averaging)
  const dcaOperations = operations.filter(op => op.medio === 'Sim')
  const dcaDays = new Set(dcaOperations.map(op => parseDate(op.abertura).toISOString().split('T')[0])).size
  
  if (dcaDays > 3) {
    violacoes.push({
      codigo: 'DCA_EXCESSIVO',
      titulo: 'Estratégia de médio excessiva',
      descricao: `Detectado uso de estratégia de médio em ${dcaDays} dias. Máximo permitido: 3 dias.`,
      severidade: 'WARNING',
      operacoes_afetadas: dcaOperations
    })
  }
  
  // Rule 5: Check for overnight positions (simplified check)
  const overnightOperations = operations.filter(op => {
    const abertura = parseDate(op.abertura)
    const fechamento = parseDate(op.fechamento)
    return abertura.getDate() !== fechamento.getDate()
  })
  
  if (overnightOperations.length > 0) {
    violacoes.push({
      codigo: 'OVERNIGHT',
      titulo: 'Posições overnight detectadas',
      descricao: `Detectadas ${overnightOperations.length} operações que permaneceram abertas durante a noite.`,
      severidade: 'WARNING',
      operacoes_afetadas: overnightOperations
    })
  }
  
  // Generate recommendations
  if (violacoes.length === 0) {
    recomendacoes.push('Parabéns! Todas as regras YLOS Trading foram atendidas.')
    proximos_passos.push('Você pode solicitar o saque seguindo o processo normal da YLOS Trading.')
  } else {
    recomendacoes.push('Foram identificadas violações das regras YLOS Trading.')
    recomendacoes.push('Revise as operações destacadas antes de solicitar o saque.')
    
    if (violacoes.some(v => v.severidade === 'CRITICAL')) {
      proximos_passos.push('Corrija as violações críticas antes de solicitar o saque.')
    } else {
      proximos_passos.push('As violações são de baixa severidade, mas devem ser consideradas.')
    }
  }
  
  const aprovado = violacoes.filter(v => v.severidade === 'CRITICAL').length === 0
  
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
    proximos_passos
  }
}

export async function POST(request: NextRequest) {
  const requestTimer = enterpriseLogger.startPerformanceTimer('ylos_analysis_request')
  const requestId = enterpriseLogger.generateRequestId()
  
  const requestContext: LogContext = {
    requestId,
    component: 'ylos_analysis_api',
    operation: 'analyze_trading_data'
  }
  
  try {

    enterpriseLogger.info('YLOS Trading analysis request initiated', requestContext, {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      requestPhase: 'initialization'
    })
    
    const body = await request.json()
    
    // Validate required fields
    if (!body.csv_content || !body.conta_type || !body.saldo_atual) {
      // console.log('❌ Validation failed - Missing required fields', {
      //   hasCSV: !!body.csv_content,
      //   hasContaType: !!body.conta_type,
      //   hasSaldo: !!body.saldo_atual
      // })
      
      return NextResponse.json(
        { detail: 'Dados obrigatórios não fornecidos (csv_content, conta_type, saldo_atual)' },
        { status: 400 }
      )
    }

    // console.log('✅ Request validation passed', {
    //   conta_type: body.conta_type,
    //   saldo_atual: body.saldo_atual,
    //   csv_length: body.csv_content.length,
    //   verificar_noticias: body.verificar_noticias,
    //   saques_realizados: body.saques_realizados
    // })

    // Parse CSV data
    const operations = parseCSV(body.csv_content, requestId, requestContext)

    if (operations.length === 0) {
      enterpriseLogger.warn('No valid operations found in CSV', requestContext, {
        csvSize: body.csv_content.length,
        requestPhase: 'validation_failed'
      })
      requestTimer.end({ status: 'failed', reason: 'no_operations_found' }, { statusCode: 400 })
      
      return NextResponse.json(
        { detail: 'Nenhuma operação válida encontrada no CSV' },
        { status: 400 }
      )
    }

    // Perform YLOS analysis
    const analysisTimer = enterpriseLogger.startPerformanceTimer('ylos_rules_analysis', requestContext)
    enterpriseLogger.ylosAnalysisStarted(requestId, operations.length, body.conta_type, requestContext)
    
    const result = analyzeYLOSRules(operations, body.conta_type, body.saldo_atual, requestId, requestContext)
    
    const analysisTime = analysisTimer.end({ 
      status: 'completed',
      operationsAnalyzed: operations.length,
      violationsFound: result.violacoes.length 
    })
    
    enterpriseLogger.ylosAnalysisCompleted(requestId, {
      approved: result.aprovado,
      totalOperations: result.total_operacoes,
      daysTraded: result.dias_operados,
      violationsCount: result.violacoes.length
    }, analysisTime, requestContext)

    const _totalTime = requestTimer.end({ 
      status: 'success',
      operationsProcessed: result.total_operacoes,
      analysisResult: result.aprovado ? 'approved' : 'rejected'
    }, { statusCode: 200 })

    return NextResponse.json(result)

  } catch (error) {
    const errorInstance = error instanceof Error ? error : new Error('Unknown error')
    
    enterpriseLogger.critical('Critical error in YLOS Trading analysis', errorInstance, requestContext, {
      endpoint: '/api/ylos/analyze',
      requestPhase: 'processing_error'
    })
    
    requestTimer.end({ 
      status: 'error',
      errorType: errorInstance.name,
      errorMessage: errorInstance.message 
    }, { statusCode: 500 })
    
    return NextResponse.json(
      { 
        detail: 'Erro interno do servidor. Verifique os dados enviados e tente novamente.',
        error_code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    )
  }
} 