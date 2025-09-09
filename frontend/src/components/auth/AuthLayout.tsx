// src/components/auth/AuthLayout.tsx
import React, { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto rounded-xl flex items-center justify-center mb-4">
            <img 
              src="/InstagraphLogo.png" 
              alt="Instagraph Logo" 
              style={{ width: '180px', height: 'auto' }}
            />
          </div>
          {title && (
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {title}
            </h2>
          )}
          <p className="text-sm font-normal text-gray-800">
            {subtitle}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>
            Secure authentication powered by Supabase
          </p>
          <p className="mt-2">
            By continuing, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}