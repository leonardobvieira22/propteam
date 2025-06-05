import React from 'react'

import YlosAnalyzer from '@/components/analyzers/YlosAnalyzer'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        {/* Mesa Selector - TODO: Implementar quando mais mesas forem adicionadas */}
        <div className="mb-6">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            Análise de Conformidade de Saques - YLOS Trading
          </h1>
          <p className="text-lg text-gray-600">
            Verifique se suas operações atendem às regras da mesa proprietária antes de solicitar o saque
          </p>
        </div>
      </div>

      {/* YLOS Trading Analyzer */}
      <YlosAnalyzer />
    </div>
  )
}
