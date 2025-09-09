// src/pages/About.tsx
import React from 'react'
import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="relative z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link 
                to="/" 
                className="cursor-pointer"
              >
                <img 
                  src="/InstagraphLogo.png" 
                  alt="Instagraph Logo" 
                  className="w-30 h-auto"
                  style={{ width: '120px', height: 'auto' }}
                />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/about"
                className="text-blue-600 font-medium px-3 py-2 text-sm transition-colors"
              >
                About
              </Link>
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            About Instagraph
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to make data visualization accessible to everyone, 
            regardless of technical expertise.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-6">
              At Instagraph, we believe that powerful data insights shouldn't require 
              complex technical skills or expensive software. Our AI-powered platform 
              transforms your Excel data into beautiful, interactive dashboards in seconds.
            </p>
            <p className="text-lg text-gray-600">
              Whether you're a small business owner, analyst, or data enthusiast, 
              Instagraph empowers you to unlock the stories hidden in your data 
              and make informed decisions with confidence.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What Makes Us Different
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                AI-Powered Intelligence
              </h3>
              <p className="text-gray-600">
                Our advanced AI analyzes your data structure and automatically suggests 
                the most effective visualizations and insights.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Lightning Fast
              </h3>
              <p className="text-gray-600">
                Upload your Excel file and get a fully interactive dashboard in seconds. 
                No waiting, no complex setup required.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Beautiful Design
              </h3>
              <p className="text-gray-600">
                Professional, modern dashboards that look great in presentations 
                and reports. No design skills needed.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Secure & Private
              </h3>
              <p className="text-gray-600">
                Your data is encrypted and secure. We never share your information 
                and provide enterprise-grade security.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-lg text-gray-600 mb-6">
              Instagraph was born from a simple observation: most people have valuable 
              data sitting in Excel spreadsheets, but lack the tools to turn that data 
              into actionable insights.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              That's where Instagraph comes in, whether you're running a kirana store, a small startup, or an MSME, Instagraph helps you understand your business better and make smarter decisions — without needing a team of analysts.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Just drag and drop your Excel sheet, and within seconds, Instagraph turns it into clear dashboards, charts, and reports. No coding, no formulas, no extra effort.
            </p>
            <p className="text-lg text-gray-600">
              Our mission is simple: empower every business, big or small, to see their data come alive and grow with confidence.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-blue-600 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Data?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of users who are already creating stunning dashboards with Instagraph.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-3 border border-white text-base font-medium rounded-lg text-blue-600 bg-white hover:bg-gray-50 transition-colors"
              >
                Start Free Trial
                <span className="ml-2">→</span>
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center px-8 py-3 border border-blue-300 text-base font-medium rounded-lg text-white hover:bg-blue-700 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/InstagraphLogo.png" 
                alt="Instagraph Logo" 
                className="h-auto"
                style={{ width: '100px', height: 'auto' }}
              />
            </div>
            <div className="flex justify-center space-x-6 mb-4">
              <Link
                to="/terms"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/privacy"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Privacy Policy
              </Link>
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
