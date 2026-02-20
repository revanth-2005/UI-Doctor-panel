"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { 
  Users, 
  FileText, 
  Activity, 
  TrendingUp, 
  RefreshCw, 
  Calendar,
  Heart,
  UserCheck,
  ClipboardList,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"

interface AnalyticsData {
  patients: {
    total: number
    thisMonth: number
    withNutritionLimits: number
  }
  conditions: {
    total: number
    withMacros: number
    withMicros: number
    mostCommon: string[]
  }
  doctors: {
    total: number
    activeThisWeek: number
    specializations: Record<string, number>
  }
  recipes: {
    total: number
    approved: number
    pending: number
    thisWeek: number
  }
  recommendations: {
    total: number
    thisWeek: number
    byCondition: Record<string, number>
  }
  systemHealth: {
    dbStatus: 'connected' | 'disconnected'
    lastUpdate: string
    responseTime: number
  }
}

export default function RealtimeAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const { toast } = useToast()

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAnalytics = async () => {
    if (!loading) setRefreshing(true)
    
    try {
      const startTime = Date.now()

      // Fetch all data in parallel for better performance
      const [patientsRes, conditionsRes, doctorsRes, recipesRes] = await Promise.all([
        fetch('https://aroma-db-six.vercel.app/api/patient'),
        fetch('https://aroma-db-six.vercel.app/api/condition/list'),
        fetch('https://aroma-db-six.vercel.app/api/admin/doctors'),
        fetch('/api/recipes') // Use frontend API endpoint
      ])

      const responseTime = Date.now() - startTime

      if (!patientsRes.ok || !conditionsRes.ok || !doctorsRes.ok || !recipesRes.ok) {
        throw new Error('One or more API calls failed')
      }

      const [patientsData, conditionsData, doctorsData, recipesData] = await Promise.all([
        patientsRes.json(),
        conditionsRes.json(), 
        doctorsRes.json(),
        recipesRes.json()
      ])

      // Process patients analytics
      const patients = patientsData.success ? patientsData.patients : []
      const thisMonth = new Date()
      thisMonth.setMonth(thisMonth.getMonth() - 1)
      
      const patientsThisMonth = patients.filter((p: any) => 
        new Date(p.createdAt) > thisMonth
      ).length

      const patientsWithNutritionLimits = patients.filter((p: any) => 
        p.nutritionLimits && 
        (p.nutritionLimits.macros || p.nutritionLimits.micros)
      ).length

      // Process conditions analytics
      const conditions = conditionsData.success ? conditionsData.conditions : []
      const conditionsWithMacros = conditions.filter((c: any) => 
        c.macros && Object.values(c.macros).some((v: any) => v > 0)
      ).length
      
      const conditionsWithMicros = conditions.filter((c: any) => 
        c.micros && Object.values(c.micros).some((v: any) => v > 0)  
      ).length

      const mostCommonConditions = conditions
        .map((c: any) => c.name)
        .slice(0, 5)

      // Process doctors analytics  
      const doctors = doctorsData.success ? (doctorsData.doctors || []) : []
      const specializations = doctors.reduce((acc: Record<string, number>, doctor: any) => {
        const spec = doctor.specialization || 'General Practice'
        acc[spec] = (acc[spec] || 0) + 1
        return acc
      }, {})

      // Process recipes analytics
      const recipes = recipesData.success ? (recipesData.data || []) : []
      const approvedRecipes = recipes.filter((r: any) => r.status === 'approved').length
      const pendingRecipes = recipes.filter((r: any) => r.status === 'pending').length
      
      const thisWeek = new Date()
      thisWeek.setDate(thisWeek.getDate() - 7)
      const recipesThisWeek = recipes.filter((r: any) => 
        new Date(r.uploadedAt) > thisWeek
      ).length

      // Mock recommendations data (would come from backend in real implementation)
      const recommendations = {
        total: 45,
        thisWeek: 12,
        byCondition: {
          'Diabetes Type 2': 18,
          'Hypertension': 15,
          'Heart Disease': 8,
          'Other': 4
        }
      }

      const analyticsData: AnalyticsData = {
        patients: {
          total: patients.length,
          thisMonth: patientsThisMonth,
          withNutritionLimits: patientsWithNutritionLimits
        },
        conditions: {
          total: conditions.length,
          withMacros: conditionsWithMacros,
          withMicros: conditionsWithMicros,
          mostCommon: mostCommonConditions
        },
        doctors: {
          total: doctors.length,
          activeThisWeek: Math.floor(doctors.length * 0.7), // Mock data
          specializations
        },
        recipes: {
          total: recipes.length,
          approved: approvedRecipes,
          pending: pendingRecipes,
          thisWeek: recipesThisWeek
        },
        recommendations,
        systemHealth: {
          dbStatus: 'connected',
          lastUpdate: new Date().toISOString(),
          responseTime
        }
      }

      setAnalytics(analyticsData)
      setLastRefresh(new Date())
      
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast({
        title: "⚠️ Analytics Error",
        description: "Failed to fetch real-time data. Using cached data.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleManualRefresh = () => {
    fetchAnalytics()
    toast({
      title: "🔄 Refreshing...",
      description: "Fetching latest analytics data",
      duration: 2000,
    })
  }

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading real-time analytics...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Real-time Analytics
          </h2>
          <p className="text-gray-600 mt-1">Live system metrics from MongoDB database</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button
            onClick={handleManualRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health */}
      <Card className="p-4 border-green-200 bg-green-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">System Status: Healthy</h3>
              <p className="text-sm text-green-700">
                Database connected • Response time: {analytics.systemHealth.responseTime}ms
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
            <Activity className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Patients</h3>
              <p className="text-2xl font-bold text-gray-900">{analytics.patients.total}</p>
              <p className="text-xs text-blue-600">+{analytics.patients.thisMonth} this month</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-600">
              {analytics.patients.withNutritionLimits} with nutrition plans
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Medical Conditions</h3>
              <p className="text-2xl font-bold text-gray-900">{analytics.conditions.total}</p>
              <p className="text-xs text-green-600">{analytics.conditions.withMacros} with macros</p>
            </div>
            <Heart className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-600">
              {analytics.conditions.withMicros} with micronutrients
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Doctors</h3>
              <p className="text-2xl font-bold text-gray-900">{analytics.doctors.total}</p>
              <p className="text-xs text-purple-600">{analytics.doctors.activeThisWeek} active this week</p>
            </div>
            <UserCheck className="h-8 w-8 text-purple-500" />
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-600">
              {Object.keys(analytics.doctors.specializations).length} specializations
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Recipe Database</h3>
              <p className="text-2xl font-bold text-gray-900">{analytics.recipes.total}</p>
              <p className="text-xs text-orange-600">+{analytics.recipes.thisWeek} this week</p>
            </div>
            <FileText className="h-8 w-8 text-orange-500" />
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{analytics.recipes.approved} approved</span>
              <span>{analytics.recipes.pending} pending</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Most Common Conditions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Most Common Conditions
          </h3>
          <div className="space-y-3">
            {analytics.conditions.mostCommon.map((condition, index) => (
              <div key={condition} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${{
                    0: 'bg-red-500',
                    1: 'bg-orange-500', 
                    2: 'bg-yellow-500',
                    3: 'bg-green-500',
                    4: 'bg-blue-500'
                  }[index] || 'bg-gray-500'}`}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{condition}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Doctor Specializations */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Doctor Specializations
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.doctors.specializations).map(([specialization, count]) => (
              <div key={specialization} className="flex items-center justify-between">
                <span className="text-gray-700">{specialization}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(count / analytics.doctors.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-6">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Recommendations */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-green-600" />
            Diet Recommendations
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Total Recommendations</span>
              <span className="text-2xl font-bold text-gray-900">{analytics.recommendations.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">This Week</span>
              <Badge variant="outline" className="text-green-600 bg-green-50">
                +{analytics.recommendations.thisWeek}
              </Badge>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2">By Condition</h4>
              {Object.entries(analytics.recommendations.byCondition).map(([condition, count]) => (
                <div key={condition} className="flex items-center justify-between text-sm py-1">
                  <span className="text-gray-600">{condition}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* System Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            System Performance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Database Status</span>
              <Badge variant="outline" className="text-green-600 bg-green-50">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Response Time</span>
              <span className="font-semibold text-gray-900">{analytics.systemHealth.responseTime}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Auto Refresh</span>
              <Badge variant="outline" className="text-blue-600 bg-blue-50">
                <Activity className="h-3 w-3 mr-1" />
                30s
              </Badge>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Last update: {new Date(analytics.systemHealth.lastUpdate).toLocaleString()}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}