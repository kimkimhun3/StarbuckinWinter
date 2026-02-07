'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import Link from 'next/link'

interface AnalyticsData {
  totalViews: number
  days: number
  viewsByCountry: { country: string; views: number }[]
  viewsByCity: { city: string; country: string; views: number }[]
  viewsByPath: { path: string; views: number }[]
  viewsPerDay: { date: string; views: number }[]
  topPosts: { postId: string; views: number; title: string; slug: string }[]
  recentViews: {
    id: string
    path: string
    city: string | null
    country: string | null
    countryRegion: string | null
    createdAt: string
    postTitle: string | null
  }[]
}

// Simple country code to name mapping for common codes
const countryNames: Record<string, string> = {
  US: 'United States', JP: 'Japan', GB: 'United Kingdom', DE: 'Germany',
  FR: 'France', CA: 'Canada', AU: 'Australia', KR: 'South Korea',
  CN: 'China', TW: 'Taiwan', TH: 'Thailand', SG: 'Singapore',
  IN: 'India', BR: 'Brazil', MX: 'Mexico', IT: 'Italy',
  ES: 'Spain', NL: 'Netherlands', SE: 'Sweden', NO: 'Norway',
  KH: 'Cambodia', VN: 'Vietnam', PH: 'Philippines', MY: 'Malaysia',
  ID: 'Indonesia', HK: 'Hong Kong', NZ: 'New Zealand', RU: 'Russia',
}

function getCountryName(code: string) {
  return countryNames[code] || code
}

function getCountryFlag(code: string) {
  try {
    return code
      .toUpperCase()
      .split('')
      .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
      .join('')
  } catch {
    return ''
  }
}

export default function AdminAnalytics() {
  const { token } = useAuth()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [days, setDays] = useState(30)
  const [activeTab, setActiveTab] = useState<'overview' | 'locations' | 'pages' | 'recent'>('overview')

  useEffect(() => {
    if (token) {
      apiClient.setToken(token)
      loadAnalytics()
    }
  }, [token, days])

  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      const result = await apiClient.getAnalytics(days)
      setData(result)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <p className="text-gray-500">Failed to load analytics data.</p>
      </div>
    )
  }

  const maxDailyViews = Math.max(...data.viewsPerDay.map((d) => d.views), 1)

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="mt-2 text-sm text-gray-700">
            Visitor analytics with geographic data
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Views</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{data.totalViews.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Countries</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{data.viewsByCountry.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Cities</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{data.viewsByCity.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg/Day</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {data.viewsPerDay.length > 0
                      ? Math.round(data.totalViews / data.viewsPerDay.length)
                      : 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Views Per Day Chart */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Views Over Time</h2>
        {data.viewsPerDay.length === 0 ? (
          <p className="text-gray-500 text-sm">No data available for this period.</p>
        ) : (
          <div className="space-y-1">
            {data.viewsPerDay.map((day) => (
              <div key={day.date} className="flex items-center gap-3 text-sm">
                <span className="text-gray-500 w-24 text-right shrink-0">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded transition-all"
                    style={{ width: `${(day.views / maxDailyViews) * 100}%` }}
                  />
                </div>
                <span className="text-gray-700 w-12 text-right shrink-0 font-medium">
                  {day.views}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {(['overview', 'locations', 'pages', 'recent'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Countries */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Top Countries</h3>
              {data.viewsByCountry.length === 0 ? (
                <p className="text-gray-500 text-sm">No geographic data yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.viewsByCountry.slice(0, 10).map((item) => (
                    <div key={item.country} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCountryFlag(item.country)}</span>
                        <span className="text-sm text-gray-700">{getCountryName(item.country)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-gray-100 rounded overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded"
                            style={{
                              width: `${(item.views / data.viewsByCountry[0].views) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12 text-right">
                          {item.views}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Posts */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Top Posts</h3>
              {data.topPosts.length === 0 ? (
                <p className="text-gray-500 text-sm">No post views yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.topPosts.map((post) => (
                    <div key={post.postId} className="flex items-center justify-between">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-sm text-indigo-600 hover:text-indigo-500 truncate max-w-[70%]"
                      >
                        {post.title}
                      </Link>
                      <span className="text-sm font-medium text-gray-900">{post.views} views</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Countries Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">Views by Country</h3>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.viewsByCountry.map((item) => (
                    <tr key={item.country}>
                      <td className="px-6 py-3 text-sm text-gray-700">
                        <span className="mr-2">{getCountryFlag(item.country)}</span>
                        {getCountryName(item.country)}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900 text-right font-medium">{item.views}</td>
                    </tr>
                  ))}
                  {data.viewsByCountry.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-sm text-gray-500">
                        No geographic data available yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Cities Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">Views by City</h3>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.viewsByCity.map((item) => (
                    <tr key={`${item.city}-${item.country}`}>
                      <td className="px-6 py-3 text-sm text-gray-700">{item.city}</td>
                      <td className="px-6 py-3 text-sm text-gray-500">
                        <span className="mr-1">{getCountryFlag(item.country)}</span>
                        {item.country}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900 text-right font-medium">{item.views}</td>
                    </tr>
                  ))}
                  {data.viewsByCity.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                        No city-level data available yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pages' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Top Pages</h3>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Path</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.viewsByPath.map((item) => (
                  <tr key={item.path}>
                    <td className="px-6 py-3 text-sm text-gray-700 font-mono">{item.path}</td>
                    <td className="px-6 py-3 text-sm text-gray-900 text-right font-medium">{item.views}</td>
                  </tr>
                ))}
                {data.viewsByPath.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-sm text-gray-500">
                      No page view data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Recent Visitors</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Page</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.recentViews.map((view) => (
                    <tr key={view.id}>
                      <td className="px-6 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(view.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">
                        {view.postTitle ? (
                          <span className="text-indigo-600">{view.postTitle}</span>
                        ) : (
                          <span className="font-mono">{view.path}</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">{view.city || '-'}</td>
                      <td className="px-6 py-3 text-sm text-gray-500">{view.countryRegion || '-'}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">
                        {view.country ? (
                          <>
                            <span className="mr-1">{getCountryFlag(view.country)}</span>
                            {getCountryName(view.country)}
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                  {data.recentViews.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                        No recent visitors.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
