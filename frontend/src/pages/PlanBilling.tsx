// src/pages/PlanBilling.tsx
import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import UserProfileDropdown from '../components/UserProfileDropdown'

export default function PlanBilling() {
  const { user, userProfile } = useAuth()
  const [isUpgrading, setIsUpgrading] = useState(false)

  // Create fallback profile if user exists but no profile
  const fallbackProfile = user && !userProfile ? {
    id: user.id,
    email: user.email!,
    full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
    subscription_tier: 'free' as const,
    is_active: true,
    storage_used_mb: 0,
    monthly_uploads: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login: null
  } : null

  // Use fallback profile if no real profile exists
  const displayProfile = userProfile || fallbackProfile

  const handleUpgrade = (plan: string) => {
    setIsUpgrading(true)
    // Simulate upgrade process
    setTimeout(() => {
      setIsUpgrading(false)
      alert(`Upgrading to ${plan} plan... This would integrate with your payment provider.`)
    }, 1000)
  }

  const getCurrentPlan = () => {
    const tier = displayProfile?.subscription_tier || 'free'
    switch (tier.toLowerCase()) {
      case 'free':
        return {
          name: 'Free',
          price: '$0',
          features: ['5 monthly uploads', '10MB max file size', '3 dashboards', 'Basic charts', 'PDF export'],
          color: 'blue'
        }
      case 'pro':
        return {
          name: 'Pro',
          price: '$29',
          features: ['50 monthly uploads', '100MB max file size', '25 dashboards', 'AI insights', 'All export formats', 'Collaboration'],
          color: 'purple'
        }
      case 'enterprise':
        return {
          name: 'Enterprise',
          price: '$99',
          features: ['500 monthly uploads', '500MB max file size', '100 dashboards', 'API access', 'Priority support', 'Advanced features'],
          color: 'gray'
        }
      default:
        return {
          name: 'Free',
          price: '$0',
          features: ['5 monthly uploads', '10MB max file size', '3 dashboards', 'Basic charts', 'PDF export'],
          color: 'blue'
        }
    }
  }

  const currentPlan = getCurrentPlan()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
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
            <div className="flex items-center">
              <UserProfileDropdown 
                userEmail={displayProfile?.full_name || user?.email || ''} 
                subscriptionTier={displayProfile?.subscription_tier || 'free'} 
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Plan & Billing
              </h1>
              <p className="text-xl text-gray-600">
                Manage your subscription and billing information
              </p>
            </div>
            <a
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </a>
          </div>
        </div>

        {/* Current Plan Card */}
        <div className="mb-12">
          <div className={`relative overflow-hidden rounded-2xl p-8 ${
            currentPlan.color === 'blue' ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200' :
            currentPlan.color === 'purple' ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200' :
            'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200'
          }`}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-4 ${
                  currentPlan.color === 'blue' ? 'bg-blue-200 text-blue-800' :
                  currentPlan.color === 'purple' ? 'bg-purple-200 text-purple-800' :
                  'bg-gray-200 text-gray-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    currentPlan.color === 'blue' ? 'bg-blue-600' :
                    currentPlan.color === 'purple' ? 'bg-purple-600' :
                    'bg-gray-600'
                  }`}></div>
                  {currentPlan.name} Plan
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Current Plan</h2>
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {currentPlan.price}
                  <span className="text-2xl font-normal text-gray-500">/month</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Next billing</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What's included</h3>
                <ul className="space-y-3">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                        currentPlan.color === 'blue' ? 'bg-blue-200' :
                        currentPlan.color === 'purple' ? 'bg-purple-200' :
                        'bg-gray-200'
                      }`}>
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage this month</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Storage used</span>
                      <span>{displayProfile?.storage_used_mb || 0} MB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${
                        currentPlan.color === 'blue' ? 'bg-blue-500' :
                        currentPlan.color === 'purple' ? 'bg-purple-500' :
                        'bg-gray-500'
                      }`} style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Files uploaded</span>
                      <span>{displayProfile?.monthly_uploads || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${
                        currentPlan.color === 'blue' ? 'bg-blue-500' :
                        currentPlan.color === 'purple' ? 'bg-purple-500' :
                        'bg-gray-500'
                      }`} style={{ width: '0%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Available Plans */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className={`relative rounded-2xl p-8 transition-all duration-200 hover:shadow-lg ${
              currentPlan.name === 'Free' ? 'bg-white border-2 border-blue-500 shadow-lg' : 'bg-white border border-gray-200 hover:border-gray-300'
            }`}>
              {currentPlan.name === 'Free' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Current Plan
                  </span>
                </div>
              )}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$0<span className="text-xl font-normal text-gray-500">/month</span></div>
                <p className="text-gray-600 mb-8">Perfect for getting started</p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    5 monthly uploads
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    10MB max file size
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    3 dashboards
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Basic charts
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    PDF export
                  </li>
                </ul>
                {currentPlan.name === 'Free' ? (
                  <button disabled className="w-full py-3 px-6 border border-gray-300 rounded-xl text-sm font-semibold text-gray-400 bg-gray-100 cursor-not-allowed">
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade('Free')}
                    disabled={isUpgrading}
                    className="w-full py-3 px-6 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
                  >
                    {isUpgrading ? 'Processing...' : 'Downgrade'}
                  </button>
                )}
              </div>
            </div>

            {/* Pro Plan */}
            <div className={`relative rounded-2xl p-8 transition-all duration-200 hover:shadow-lg ${
              currentPlan.name === 'Pro' ? 'bg-white border-2 border-purple-500 shadow-lg' : 'bg-white border border-gray-200 hover:border-purple-300'
            }`}>
              {currentPlan.name === 'Pro' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Current Plan
                  </span>
                </div>
              )}
              {currentPlan.name !== 'Pro' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$29<span className="text-xl font-normal text-gray-500">/month</span></div>
                <p className="text-gray-600 mb-8">Best for growing businesses</p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    50 monthly uploads
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    100MB max file size
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    25 dashboards
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    AI insights
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    All export formats
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Collaboration
                  </li>
                </ul>
                {currentPlan.name === 'Pro' ? (
                  <button disabled className="w-full py-3 px-6 border border-gray-300 rounded-xl text-sm font-semibold text-gray-400 bg-gray-100 cursor-not-allowed">
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade('Pro')}
                    disabled={isUpgrading}
                    className="w-full py-3 px-6 border border-transparent rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all duration-200 hover:shadow-lg"
                  >
                    {isUpgrading ? 'Processing...' : 'Upgrade to Pro'}
                  </button>
                )}
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className={`relative rounded-2xl p-8 transition-all duration-200 hover:shadow-lg ${
              currentPlan.name === 'Enterprise' ? 'bg-white border-2 border-gray-500 shadow-lg' : 'bg-white border border-gray-200 hover:border-gray-300'
            }`}>
              {currentPlan.name === 'Enterprise' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gray-500 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Current Plan
                  </span>
                </div>
              )}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$99<span className="text-xl font-normal text-gray-500">/month</span></div>
                <p className="text-gray-600 mb-8">For large organizations</p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    500 monthly uploads
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    500MB max file size
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    100 dashboards
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    API access
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Priority support
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Advanced features
                  </li>
                </ul>
                {currentPlan.name === 'Enterprise' ? (
                  <button disabled className="w-full py-3 px-6 border border-gray-300 rounded-xl text-sm font-semibold text-gray-400 bg-gray-100 cursor-not-allowed">
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade('Enterprise')}
                    disabled={isUpgrading}
                    className="w-full py-3 px-6 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
                  >
                    {isUpgrading ? 'Processing...' : 'Contact Sales'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Billing Information & Usage Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Billing Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing Information</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Payment Method</h3>
                    <p className="text-sm text-gray-600">No payment method on file</p>
                  </div>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                  Add
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Billing Address</h3>
                    <p className="text-sm text-gray-600">No billing address on file</p>
                  </div>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Usage This Month</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Files Uploaded</span>
                  <span className="text-sm text-gray-600">
                    {displayProfile?.monthly_uploads || 0} / {currentPlan.name === 'Free' ? '5' : currentPlan.name === 'Pro' ? '50' : '500'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Storage Used</span>
                  <span className="text-sm text-gray-600">
                    {displayProfile?.storage_used_mb || 0} MB / {currentPlan.name === 'Free' ? '10' : currentPlan.name === 'Pro' ? '100' : '500'} MB
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Dashboards Created</span>
                  <span className="text-sm text-gray-600">
                    0 / {currentPlan.name === 'Free' ? '3' : currentPlan.name === 'Pro' ? '25' : '100'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-purple-500 h-3 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
