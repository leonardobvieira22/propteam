import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata = {
  title: 'Mesa Prop Trading Analyzer',
  description: 'Sistema enterprise para análise de conformidade de saques em mesas proprietárias',
  keywords: ['trading', 'mesa proprietária', 'ylos', 'análise', 'saque'],
  authors: [{ name: 'Mesa Prop Team' }],
  creator: 'Mesa Prop Team',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://mesa-prop-analyzer.com',
    title: 'Mesa Prop Trading Analyzer',
    description: 'Sistema enterprise para análise de conformidade de saques em mesas proprietárias',
    siteName: 'Mesa Prop Trading Analyzer',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mesa Prop Trading Analyzer',
    description: 'Sistema enterprise para análise de conformidade de saques em mesas proprietárias',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <div className="flex min-h-screen flex-col">
          {/* Header */}
          <header className="border-b border-gray-200 bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600"></div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Mesa Prop Analyzer
                  </h1>
                </div>
                <div className="text-sm text-gray-600">
                  v1.0.0 - Enterprise Grade
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  © 2025 Mesa Prop Trading Analyzer. Sistema enterprise-grade.
                </p>
                <div className="flex space-x-4 text-sm text-gray-600">
                  <span>Desenvolvido para traders profissionais</span>
                </div>
              </div>
            </div>
          </footer>
        </div>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
