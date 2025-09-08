// src/pages/LandingPage.tsx
import React from 'react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="relative z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a 
                href="/" 
                className="cursor-pointer"
              >
                <img 
                  src="/InstagraphLogo.png" 
                  alt="Instagraph Logo" 
                  className="w-30 h-auto"
                  style={{ width: '120px', height: 'auto' }}
                />
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/signin"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Your{' '}
              <span className="text-blue-600">Excel Data</span>
              <br />
              Into Beautiful Dashboards
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Upload your spreadsheets and let AI create stunning, interactive dashboards automatically. 
              No coding required. Get insights in minutes, not hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Start Free Trial
                <span className="ml-2">→</span>
              </Link>
              <Link
                to="/signin"
                className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Watch Demo
                <span className="ml-2">▶️</span>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="mt-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  AI-Powered Analytics
                </h3>
                <p className="text-gray-600">
                  Our AI analyzes your data and suggests the best visualizations automatically
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Instant Dashboards
                </h3>
                <p className="text-gray-600">
                  Upload Excel files and get interactive dashboards in seconds
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Smart Insights
                </h3>
                <p className="text-gray-600">
                  Get AI-generated insights and recommendations for your data
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Preview */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Simple, Transparent Pricing
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Tier */}
              <div className="border border-gray-200 rounded-2xl p-8 bg-white">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Free</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-4">$0</div>
                  <ul className="text-sm text-gray-600 space-y-2 mb-6">
                    <li>✓ 5 monthly uploads</li>
                    <li>✓ 10MB max file size</li>
                    <li>✓ 3 dashboards</li>
                    <li>✓ Basic charts</li>
                    <li>✓ PDF export</li>
                  </ul>
                  <Link
                    to="/signup"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              </div>

              {/* Pro Tier */}
              <div className="border-2 border-blue-500 rounded-2xl p-8 bg-white relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Pro</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-4">$29</div>
                  <ul className="text-sm text-gray-600 space-y-2 mb-6">
                    <li>✓ 50 monthly uploads</li>
                    <li>✓ 100MB max file size</li>
                    <li>✓ 25 dashboards</li>
                    <li>✓ AI insights</li>
                    <li>✓ All export formats</li>
                    <li>✓ Collaboration</li>
                  </ul>
                  <Link
                    to="/signup"
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Start Pro Trial
                  </Link>
                </div>
              </div>

              {/* Enterprise Tier */}
              <div className="border border-gray-200 rounded-2xl p-8 bg-white">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-4">$99</div>
                  <ul className="text-sm text-gray-600 space-y-2 mb-6">
                    <li>✓ 500 monthly uploads</li>
                    <li>✓ 500MB max file size</li>
                    <li>✓ 100 dashboards</li>
                    <li>✓ API access</li>
                    <li>✓ Priority support</li>
                    <li>✓ Advanced features</li>
                  </ul>
                  <Link
                    to="/signup"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Contact Sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center mr-2">
                <span className="text-white text-sm font-bold">📊</span>
              </div>
              <span className="text-lg font-bold text-gray-900">Instagraph</span>
            </div>
            <p className="text-sm text-gray-600">
              © 2025 Instagraph. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}