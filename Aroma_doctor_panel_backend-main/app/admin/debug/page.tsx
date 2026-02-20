"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { fetchDoctors } from "@/lib/api/admin"
import { checkBackendHealth } from "@/lib/api/health"

export default function AdminDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const runDebugTests = async () => {
    setLoading(true)
    const debug: any = {
      timestamp: new Date().toISOString(),
      tests: {}
    }

    // Test 1: Backend Health
    console.log('🔍 Testing backend health...')
    try {
      const healthResult = await checkBackendHealth()
      debug.tests.health = {
        success: healthResult.success,
        data: healthResult.data,
        message: healthResult.message,
        rawResponse: healthResult
      }
      console.log('Health result:', healthResult)
    } catch (error) {
      debug.tests.health = {
        success: false,
        error: (error as Error).message,
        stack: (error as Error).stack
      }
      console.error('Health error:', error)
    }

    // Test 2: Fetch Doctors
    console.log('🔍 Testing fetch doctors...')
    try {
      const doctorsResult = await fetchDoctors()
      debug.tests.doctors = {
        success: doctorsResult.success,
        data: doctorsResult.data,
        dataType: Array.isArray(doctorsResult.data) ? 'array' : typeof doctorsResult.data,
        dataLength: Array.isArray(doctorsResult.data) ? doctorsResult.data.length : 'N/A',
        message: doctorsResult.message,
        rawResponse: doctorsResult
      }
      console.log('Doctors result:', doctorsResult)
    } catch (error) {
      debug.tests.doctors = {
        success: false,
        error: (error as Error).message,
        stack: (error as Error).stack
      }
      console.error('Doctors error:', error)
    }

    // Test 3: Direct API Call
    console.log('🔍 Testing direct API call...')
    try {
      const response = await fetch('https://aroma-db-six.vercel.app/api/admin/doctors', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      
      const responseData = await response.json()
      debug.tests.directAPI = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        dataType: Array.isArray(responseData) ? 'array' : typeof responseData,
        dataKeys: typeof responseData === 'object' ? Object.keys(responseData) : 'N/A'
      }
      console.log('Direct API result:', responseData)
    } catch (error) {
      debug.tests.directAPI = {
        success: false,
        error: (error as Error).message,
        stack: (error as Error).stack
      }
      console.error('Direct API error:', error)
    }

    setDebugInfo(debug)
    setLoading(false)

    toast({
      title: "Debug Tests Complete",
      description: "Check the debug output below",
      variant: "default"
    })
  }

  useEffect(() => {
    runDebugTests()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔍 Admin API Debug Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Debug MongoDB backend API responses and data structures
          </p>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={runDebugTests}
            disabled={loading}
            className="mb-6"
          >
            {loading ? "Running Tests..." : "🔄 Rerun Debug Tests"}
          </Button>
        </div>

        {debugInfo.timestamp && (
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Debug Results</h2>
            <div className="text-sm text-gray-600 mb-4">
              Last run: {debugInfo.timestamp}
            </div>
            
            <div className="space-y-6">
              {/* Health Test */}
              {debugInfo.tests?.health && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    🔋 Backend Health Test
                    <span className={`px-2 py-1 text-xs rounded ${
                      debugInfo.tests.health.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {debugInfo.tests.health.success ? 'PASS' : 'FAIL'}
                    </span>
                  </h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(debugInfo.tests.health, null, 2)}
                  </pre>
                </div>
              )}

              {/* Doctors Test */}
              {debugInfo.tests?.doctors && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    👥 Fetch Doctors Test
                    <span className={`px-2 py-1 text-xs rounded ${
                      debugInfo.tests.doctors.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {debugInfo.tests.doctors.success ? 'PASS' : 'FAIL'}
                    </span>
                    <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                      Type: {debugInfo.tests.doctors.dataType}
                    </span>
                    {debugInfo.tests.doctors.dataLength !== 'N/A' && (
                      <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">
                        Length: {debugInfo.tests.doctors.dataLength}
                      </span>
                    )}
                  </h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(debugInfo.tests.doctors, null, 2)}
                  </pre>
                </div>
              )}

              {/* Direct API Test */}
              {debugInfo.tests?.directAPI && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    🔗 Direct API Call Test
                    <span className={`px-2 py-1 text-xs rounded ${
                      debugInfo.tests.directAPI.status === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      Status: {debugInfo.tests.directAPI.status || 'ERROR'}
                    </span>
                    {debugInfo.tests.directAPI.dataType && (
                      <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                        Type: {debugInfo.tests.directAPI.dataType}
                      </span>
                    )}
                  </h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(debugInfo.tests.directAPI, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* API Endpoints Reference */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">📋 Expected API Endpoints</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Admin Routes</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• GET /api/admin/doctors</li>
                <li>• POST /api/admin/doctors</li>
                <li>• GET /api/admin/assignments</li>
                <li>• POST /api/admin/assignments</li>
                <li>• GET /api/admin/recipes</li>
                <li>• POST /api/admin/recipes</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Expected Response Format</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs">
{`{
  "success": true,
  "data": [...],
  "message": "Success",
  "count": 0
}`}
              </pre>
            </div>
          </div>
        </Card>

        {/* Console Logs Notice */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            📝 Console Logs
          </h3>
          <p className="text-blue-800 text-sm">
            Check your browser's Developer Console (F12) for detailed API request/response logs.
            All API calls are being logged with full request and response data.
          </p>
        </Card>
      </div>
    </div>
  )
}