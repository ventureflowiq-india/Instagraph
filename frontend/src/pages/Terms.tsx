// src/pages/Terms.tsx
import React from 'react'
import { Link } from 'react-router-dom'

export default function Terms() {
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
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
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
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Terms & Conditions
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: January 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              These Terms & Conditions ("Terms") govern your use of Instagraph. By using our platform, you agree to these Terms. Please read them carefully.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Use of Service</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>You must be at least 18 years old or have parental consent.</li>
                  <li>You agree to use Instagraph only for lawful business purposes.</li>
                  <li>You are responsible for maintaining the confidentiality of your account.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Uploaded Data</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>You retain ownership of all files and data you upload.</li>
                  <li>By uploading, you grant Instagraph permission to process your data for analytics purposes.</li>
                  <li>You must not upload illegal, harmful, or copyrighted content that you do not own.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Subscription & Payments</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Some features may require a paid subscription.</li>
                  <li>Payments are non-refundable except as required by law.</li>
                  <li>Pricing and features may change, and we will notify you in advance.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Intellectual Property</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>All software, design, and content provided by Instagraph belong to us.</li>
                  <li>You may not copy, modify, or distribute our platform without permission.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Limitation of Liability</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Instagraph is provided "as is."</li>
                  <li>We are not liable for any indirect, incidental, or business losses arising from your use of the platform.</li>
                  <li>We do not guarantee 100% uptime or error-free analytics.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Termination</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>We may suspend or terminate accounts that violate these Terms.</li>
                  <li>You may close your account anytime by contacting support.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Governing Law</h2>
                <p className="text-gray-600">
                  These Terms are governed by the laws of India. Any disputes will be subject to the jurisdiction of courts in India.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to Terms</h2>
                <p className="text-gray-600">
                  We may update these Terms at any time. Continued use of Instagraph means you accept the updated Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
                <p className="text-gray-600">
                  If you have questions about these Terms, contact:
                </p>
                <p className="text-gray-600 mt-2">
                  📧 <a href="mailto:legal@instagraph.com" className="text-blue-600 hover:text-blue-800">legal@instagraph.com</a>
                </p>
              </section>
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
                className="text-sm text-blue-600 font-medium transition-colors"
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
