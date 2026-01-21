'use client'

import { useState, useEffect } from 'react'
import { getCacheStats, clearCache } from '@gpt-ui/cache'
import { LLMEngine, DEFAULT_ENGINE_OPTIONS } from '@gpt-ui/llm-engine'

interface SystemStats {
  cacheStats: {
    size: number
    hits: number
    misses: number
    evictions: number
    hitRate: number
  }
  memoryUsage: number
  uptime: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
    loadConfig()
  }, [])

  const loadStats = async () => {
    try {
      const cacheStats = getCacheStats()
      // Mock other stats for now
      setStats({
        cacheStats,
        memoryUsage: 512, // MB
        uptime: Date.now() - (24 * 60 * 60 * 1000) // 24 hours ago
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const loadConfig = async () => {
    try {
      // For now, just set a mock config
      setConfig(DEFAULT_ENGINE_OPTIONS)
    } catch (error) {
      console.error('Failed to load config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearCache = () => {
    clearCache()
    loadStats()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading admin dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">GPT-UI Admin Dashboard</h1>
              <p className="text-gray-600">Manage your AI-powered UI generation system</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cache Performance</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Size:</span>
                <span className="font-medium">{stats?.cacheStats.size} entries</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hit Rate:</span>
                <span className="font-medium">{Math.round((stats?.cacheStats.hitRate || 0) * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hits/Misses:</span>
                <span className="font-medium">{stats?.cacheStats.hits}/{stats?.cacheStats.misses}</span>
              </div>
            </div>
            <button
              onClick={handleClearCache}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Clear Cache
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Memory Usage</h3>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats?.memoryUsage}MB
            </div>
            <p className="text-gray-600 text-sm">Current system memory usage</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">System Uptime</h3>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {Math.round((stats?.uptime || 0) / (60 * 60 * 1000))}h
            </div>
            <p className="text-gray-600 text-sm">Time since last restart</p>
          </div>
        </div>

        {/* LLM Configuration */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">LLM Configuration</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Provider
                </label>
                <select
                  value={config?.defaultProvider || 'ollama'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="ollama">Ollama</option>
                  <option value="openai" disabled>OpenAI (Coming Soon)</option>
                  <option value="anthropic" disabled>Anthropic (Coming Soon)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Memory Budget
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={config?.memoryBudgetGB || 2}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md"
                    min="0.5"
                    max="8"
                    step="0.5"
                  />
                  <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-600">
                    GB
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeout
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={(config?.timeoutMs || 180000) / 1000}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md"
                  />
                  <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-600">
                    seconds
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retry Attempts
                </label>
                <input
                  type="number"
                  value={config?.retryAttempts || 2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                  max="5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Available Models */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Available Models</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {DEFAULT_ENGINE_OPTIONS.providers[0].capabilities.supportedModels.map((model: any) => (
                <div key={model.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{model.displayName}</h3>
                    <p className="text-sm text-gray-600">{model.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500">{model.memoryUsage}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        model.recommended ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {model.recommended ? 'Recommended' : 'High Memory'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">{model.contextLength} tokens</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}