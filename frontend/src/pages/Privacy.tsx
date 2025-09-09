// src/pages/Privacy.tsx
import React from 'react'
import { Link } from 'react-router-dom'

export default function Privacy() {
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
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: January 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              At Instagraph, we respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains what data we collect, why we collect it, and how we keep it safe.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                <p className="text-gray-600 mb-4">When you use Instagraph, we may collect:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li><strong>Account Information:</strong> Name, email address, phone number (if provided).</li>
                  <li><strong>Business Data:</strong> Excel files, documents, or any data you upload for analytics.</li>
                  <li><strong>Usage Data:</strong> Information on how you use our platform (e.g., pages visited, features used).</li>
                  <li><strong>Technical Data:</strong> Device, browser, IP address, and cookies to improve performance.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                <p className="text-gray-600 mb-4">We use the information to:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Provide and improve our AI analytics services.</li>
                  <li>Personalize dashboards, charts, and reports.</li>
                  <li>Communicate important updates, security alerts, and offers.</li>
                  <li>Ensure platform safety and prevent misuse.</li>
                </ul>
                <p className="text-gray-600 mt-4 font-medium">
                  We do not sell or rent your personal data to third parties.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Storage and Security</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>All data is stored securely using modern encryption standards.</li>
                  <li>Uploaded files are processed only for analytics and are not shared with external parties.</li>
                  <li>We use trusted service providers (e.g., Supabase, cloud storage) to host and manage your data.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Sharing of Information</h2>
                <p className="text-gray-600 mb-4">We may share information only when:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Required by law or government authorities.</li>
                  <li>Necessary to provide services (e.g., with hosting/email providers).</li>
                  <li>To protect the rights, property, or safety of Instagraph and its users.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
                <p className="text-gray-600 mb-4">You have the right to:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Access, update, or delete your personal information.</li>
                  <li>Opt out of promotional emails anytime.</li>
                  <li>Request a copy of the data we store about you.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies</h2>
                <p className="text-gray-600">
                  We use cookies and similar technologies to improve user experience. You can disable cookies in your browser settings, but some features may not work properly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Third-Party Links</h2>
                <p className="text-gray-600">
                  Our platform may contain links to third-party websites. We are not responsible for their privacy practices.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to Privacy Policy</h2>
                <p className="text-gray-600">
                  We may update this policy from time to time. The latest version will always be available on this page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
                <p className="text-gray-600">
                  If you have any questions, please contact us at:
                </p>
                <p className="text-gray-600 mt-2">
                  📧 <a href="mailto:support@instagraph.com" className="text-blue-600 hover:text-blue-800">support@instagraph.com</a>
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
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/privacy"
                className="text-sm text-blue-600 font-medium transition-colors"
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
