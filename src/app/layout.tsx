import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayout from '@/components/layout/ClientLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AWS Training Map',
  description: 'AWS Classroom Training Map to Domains',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-100">
          <header className="bg-[#0972d3] text-white p-4">
            <h1 className="text-2xl font-bold">AWS ILT Classroom - Exam Preparations - Cert</h1>
          </header>
          <main>
            <ClientLayout>
              {children}
            </ClientLayout>
          </main>
        </div>
      </body>
    </html>
  )
}
