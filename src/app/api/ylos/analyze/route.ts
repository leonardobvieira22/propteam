import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados básicos
    if (!body.csv_content || !body.conta_type || !body.saldo_atual) {
      return NextResponse.json(
        { detail: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Fazer requisição para o backend FastAPI
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/api/v1/ylos/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { detail: errorData.detail || 'Erro na análise do backend' },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    // Log structured error for CloudWatch
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = {
      error: errorMessage,
      timestamp: new Date().toISOString(),
      endpoint: '/api/ylos/analyze'
    }
    
    // In production, this would be sent to CloudWatch
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('API Error:', errorDetails)
    }
    
    return NextResponse.json(
      { detail: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 