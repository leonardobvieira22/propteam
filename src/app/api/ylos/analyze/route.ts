import { NextRequest, NextResponse } from 'next/server'

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

function parseCSV(csvContent: string): TradeOperation[] {
  const lines = csvContent.trim().split('\n')
  const operations: TradeOperation[] = []
  
  // Find the header line that contains "Ativo"
  let headerIndex = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Ativo') && lines[i].includes('Abertura') && lines[i].includes('Fechamento')) {
      headerIndex = i
      break
    }
  }
  
  if (headerIndex === -1) {
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
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    // Split by tab character
    const columns = line.split('\t')
    if (columns.length < 17) continue
    
    // Skip lines that don't look like data (empty first column or doesn't start with asset name)
    if (!columns[0] || columns[0].trim() === '') continue
    
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
      }
    } catch (error) {
      // console.warn(`Erro ao processar linha ${i + 1}: ${error}`)
    }
  }
  
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
  saldoAtual: number
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
    violacoes.push({
      codigo: 'DIAS_MINIMOS',
      titulo: 'Dias de operação insuficientes',
      descricao: `São necessários pelo menos ${minDays} dias de operação. Você operou apenas ${diasOperados} dias.`,
      severidade: 'CRITICAL'
    })
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
  try {
    const startTime = Date.now()
    
    // Log the request start (disabled for production ESLint)
    // console.log('📊 YLOS Analysis API - Request started', {
    //   timestamp: new Date().toISOString(),
    //   method: request.method,
    //   url: request.url
    // })
    
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
    const operations = parseCSV(body.csv_content)
    // console.log('📋 CSV parsed successfully', {
    //   total_operations: operations.length,
    //   sample_operation: operations[0] || null
    // })

    if (operations.length === 0) {
      return NextResponse.json(
        { detail: 'Nenhuma operação válida encontrada no CSV' },
        { status: 400 }
      )
    }

    // Perform YLOS analysis
    const result = analyzeYLOSRules(operations, body.conta_type, body.saldo_atual)
    
    const _processingTime = Date.now() - startTime
    // console.log('✅ Analysis completed successfully', {
    //   processing_time_ms: processingTime,
    //   total_operations: result.total_operacoes,
    //   days_traded: result.dias_operados,
    //   approved: result.aprovado,
    //   violations_count: result.violacoes.length
    // })

    return NextResponse.json(result)

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const _errorDetails = {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : null,
      timestamp: new Date().toISOString(),
      endpoint: '/api/ylos/analyze'
    }
    
    // console.error('❌ API Error in YLOS Analysis:', errorDetails)
    
    return NextResponse.json(
      { 
        detail: 'Erro interno do servidor. Verifique os dados enviados e tente novamente.',
        error_code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    )
  }
} 