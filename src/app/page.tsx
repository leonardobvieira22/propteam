'use client';

import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';

import YlosAnalyzer from '@/components/analyzers/YlosAnalyzer';

export default function HomePage() {
  const [selectedMesa, setSelectedMesa] = useState<string | null>(null);

  const handleBackToHome = () => {
    setSelectedMesa(null);
  };

  if (selectedMesa === 'ylos') {
    return <YlosAnalyzer onBack={handleBackToHome} />;
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50'>
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        {/* Hero Section */}
        <div className='text-center'>
          <div className='mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600'>
            <BarChart3 className='h-10 w-10 text-white' />
          </div>

          <h1 className='mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl'>
            Mesa Prop Trading
            <span className='block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              Analyzer
            </span>
          </h1>

          <p className='mx-auto mb-8 max-w-3xl text-xl text-gray-600'>
            Sistema enterprise-grade para análise de conformidade de saques em
            mesas proprietárias. Verifique automaticamente se suas operações
            atendem às regras antes de solicitar o saque.
          </p>

          <div className='mb-12 flex items-center justify-center space-x-4 text-sm text-gray-500'>
            <span className='flex items-center'>
              <CheckCircle className='mr-1 h-4 w-4 text-green-500' />
              Enterprise Grade
            </span>
            <span className='flex items-center'>
              <Shield className='mr-1 h-4 w-4 text-blue-500' />
              Seguro & Confiável
            </span>
            <span className='flex items-center'>
              <TrendingUp className='mr-1 h-4 w-4 text-purple-500' />
              Alta Precisão
            </span>
          </div>
        </div>

        {/* Features Section */}
        <div className='mb-16'>
          <h2 className='mb-12 text-center text-3xl font-bold text-gray-900'>
            Por que usar nosso sistema?
          </h2>

          <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100'>
                <Zap className='h-6 w-6 text-blue-600' />
              </div>
              <h3 className='mb-2 text-lg font-semibold text-gray-900'>
                Análise Instantânea
              </h3>
              <p className='text-gray-600'>
                Resultados em segundos. Upload seu CSV e receba análise completa
                imediatamente.
              </p>
            </div>

            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100'>
                <Shield className='h-6 w-6 text-green-600' />
              </div>
              <h3 className='mb-2 text-lg font-semibold text-gray-900'>
                100% Preciso
              </h3>
              <p className='text-gray-600'>
                Algoritmos específicos para cada mesa. Verifica todas as regras
                sem erro.
              </p>
            </div>

            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100'>
                <Users className='h-6 w-6 text-purple-600' />
              </div>
              <h3 className='mb-2 text-lg font-semibold text-gray-900'>
                Fácil de Usar
              </h3>
              <p className='text-gray-600'>
                Interface intuitiva. Poucos cliques para verificar sua
                conformidade.
              </p>
            </div>
          </div>
        </div>

        {/* Mesa Selection */}
        <div>
          <div className='mb-12 text-center'>
            <h2 className='mb-4 text-3xl font-bold text-gray-900'>
              Selecione sua Mesa Proprietária
            </h2>
            <p className='mx-auto max-w-2xl text-lg text-gray-600'>
              Escolha a mesa proprietária para análise das suas operações. Cada
              mesa possui regras específicas que são verificadas
              automaticamente.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {/* YLOS Trading */}
            <div className='group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl'>
              <div className='p-6'>
                <div className='mb-4 flex items-center justify-between'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600'>
                    <TrendingUp className='h-6 w-6 text-white' />
                  </div>
                  <span className='rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800'>
                    Disponível
                  </span>
                </div>

                <h3 className='mb-2 text-xl font-semibold text-gray-900'>
                  YLOS Trading
                </h3>

                <p className='mb-4 text-gray-600'>
                  Mesa proprietária com regras específicas para Master Funded e
                  Instant Funding. Análise completa de conformidade.
                </p>

                <ul className='mb-6 space-y-2 text-sm text-gray-500'>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-green-500' />
                    Análise de dias operados e vencedores
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-green-500' />
                    Verificação da regra de consistência (40%/30%)
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-green-500' />
                    Detecção de posicionamento durante notícias
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-green-500' />
                    Análise de estratégia de médio (DCA)
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='mr-2 h-4 w-4 text-green-500' />
                    Verificação de overnight trading
                  </li>
                </ul>

                <button
                  onClick={() => setSelectedMesa('ylos')}
                  className='group flex w-full items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 font-medium text-white transition-all duration-200 hover:from-blue-700 hover:to-purple-700'
                >
                  <span>Analisar YLOS Trading</span>
                  <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                </button>
              </div>
            </div>

            {/* Mesas futuras - Em breve */}
            <div className='group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 opacity-60 shadow-lg'>
              <div className='p-6'>
                <div className='mb-4 flex items-center justify-between'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-gray-300'>
                    <TrendingUp className='h-6 w-6 text-gray-500' />
                  </div>
                  <span className='rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600'>
                    Em Breve
                  </span>
                </div>

                <h3 className='mb-2 text-xl font-semibold text-gray-600'>
                  FTMO
                </h3>

                <p className='mb-4 text-gray-500'>
                  Em desenvolvimento. Mesa proprietária com regras específicas
                  para Challenge e Verification.
                </p>

                <button
                  disabled
                  className='w-full cursor-not-allowed rounded-lg bg-gray-300 px-4 py-3 font-medium text-gray-500'
                >
                  Em Desenvolvimento
                </button>
              </div>
            </div>

            <div className='group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 opacity-60 shadow-lg'>
              <div className='p-6'>
                <div className='mb-4 flex items-center justify-between'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-gray-300'>
                    <TrendingUp className='h-6 w-6 text-gray-500' />
                  </div>
                  <span className='rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600'>
                    Em Breve
                  </span>
                </div>

                <h3 className='mb-2 text-xl font-semibold text-gray-600'>
                  MyForexFunds
                </h3>

                <p className='mb-4 text-gray-500'>
                  Em desenvolvimento. Mesa proprietária com regras específicas
                  para suas modalidades de conta.
                </p>

                <button
                  disabled
                  className='w-full cursor-not-allowed rounded-lg bg-gray-300 px-4 py-3 font-medium text-gray-500'
                >
                  Em Desenvolvimento
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className='mt-16 text-center'>
          <div className='mx-auto max-w-2xl rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white'>
            <h3 className='mb-4 text-2xl font-bold'>
              Pronto para verificar suas operações?
            </h3>
            <p className='mb-6 text-blue-100'>
              Selecione sua mesa proprietária acima e faça a análise completa em
              poucos minutos.
            </p>
            <div className='flex items-center justify-center space-x-4 text-sm'>
              <span className='flex items-center'>
                <CheckCircle className='mr-1 h-4 w-4' />
                Gratuito
              </span>
              <span className='flex items-center'>
                <CheckCircle className='mr-1 h-4 w-4' />
                Instantâneo
              </span>
              <span className='flex items-center'>
                <CheckCircle className='mr-1 h-4 w-4' />
                Preciso
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
