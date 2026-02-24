"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  ChevronDown,
  MoreHorizontal,
  Check,
  X,
  RotateCw,
  Image as ImageIcon,
  User,
  Activity,
  Calendar,
  Layers,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts"

// Mock Data Variants
const macroData = [
  { day: "1 JAN", value: 10 },
  { day: "2 JAN", value: 40 },
  { day: "3 JAN", value: 70 },
  { day: "4 JAN", value: 40 },
  { day: "5 JAN", value: 30 },
  { day: "6 JAN", value: 40 },
  { day: "7 JAN", value: 50 },
]

const carbohydrateData = [
  { day: "1 JAN", value: 120 },
  { day: "2 JAN", value: 150 },
  { day: "3 JAN", value: 180 },
  { day: "4 JAN", value: 110 },
  { day: "5 JAN", value: 140 },
  { day: "6 JAN", value: 160 },
  { day: "7 JAN", value: 190 },
]

const proteinData = [
  { day: "1 JAN", value: 60 },
  { day: "2 JAN", value: 80 },
  { day: "3 JAN", value: 75 },
  { day: "4 JAN", value: 90 },
  { day: "5 JAN", value: 85 },
  { day: "6 JAN", value: 70 },
  { day: "7 JAN", value: 95 },
]

const fatsData = [
  { day: "1 JAN", value: 30 },
  { day: "2 JAN", value: 35 },
  { day: "3 JAN", value: 45 },
  { day: "4 JAN", value: 40 },
  { day: "5 JAN", value: 38 },
  { day: "6 JAN", value: 42 },
  { day: "7 JAN", value: 35 },
]

// Mock Data for Vitamins & Minerals
const vitaminAData = [
  { day: "1 JAN", value: 800 }, { day: "2 JAN", value: 920 }, { day: "3 JAN", value: 850 },
  { day: "4 JAN", value: 900 }, { day: "5 JAN", value: 780 }, { day: "6 JAN", value: 950 }, { day: "7 JAN", value: 1000 }
]
const ironData = [
  { day: "1 JAN", value: 12 }, { day: "2 JAN", value: 15 }, { day: "3 JAN", value: 18 },
  { day: "4 JAN", value: 14 }, { day: "5 JAN", value: 10 }, { day: "6 JAN", value: 16 }, { day: "7 JAN", value: 20 }
]
const genericTrend = (base: number, variance: number) => [
  { day: "1 JAN", value: base + Math.random() * variance },
  { day: "2 JAN", value: base + Math.random() * variance },
  { day: "3 JAN", value: base + Math.random() * variance },
  { day: "4 JAN", value: base + Math.random() * variance },
  { day: "5 JAN", value: base + Math.random() * variance },
  { day: "6 JAN", value: base + Math.random() * variance },
  { day: "7 JAN", value: base + Math.random() * variance },
]

// Helper to generate 30 days of stable historical data
const generateHistoricalData = (base: number, variance: number) => {
  return Array.from({ length: 30 }, (_, i) => ({
    day: `${i + 1} JAN`,
    value: Math.floor(base + (Math.sin(i * 0.5) * variance) + (Math.random() * 10))
  }))
}

// Daily Meal Data Mapping with Extended Details
const dailyMeals: Record<string, any[]> = {
  "WED": [
    {
      type: 'Breakfast', color: 'indigo', time: '08:00 AM', cal: '380', recipe: 'Oatmeal with Berries', pro: '15g', carb: '45g', fat: '8g',
      ingredients: ["1/2 cup rolled oats", "1 cup almond milk", "1/4 cup blueberries", "1 tsp chia seeds", "Honey for drizzle"],
      instructions: ["Boil almond milk and add oats.", "Simmer for 5-7 minutes.", "Top with blueberries and chia seeds."]
    },
    {
      type: 'Lunch', color: 'teal', time: '01:00 PM', cal: '520', recipe: 'Quinoa Buddha Bowl', pro: '22g', carb: '65g', fat: '14g',
      ingredients: ["1/2 cup cooked quinoa", "1/2 avocado", "1/4 cup chickpeas", "Spinach", "Lemon tahini dressing"],
      instructions: ["Layer quinoa and spinach in a bowl.", "Add avocado and chickpeas.", "Drizzle with dressing."]
    },
    {
      type: 'Dinner', color: 'emerald', time: '07:30 PM', cal: '450', recipe: 'Baked Salmon & Asparagus', pro: '35g', carb: '12g', fat: '22g',
      ingredients: ["150g Salmon fillet", "1 bunch asparagus", "Olive oil", "Lemon slices", "Garlic powder"],
      instructions: ["Season salmon and asparagus.", "Place on baking sheet with lemon.", "Bake at 400°F for 12-15 minutes."]
    }
  ],
  "THR": [
    {
      type: 'Breakfast', color: 'indigo', time: '08:30 AM', cal: '410', recipe: 'Greek Yogurt Parfait', pro: '25g', carb: '30g', fat: '6g',
      ingredients: ["1 cup Greek yogurt", "1/4 cup granola", "Small handful mixed nuts", "Dash of cinnamon"],
      instructions: ["Layer yogurt and granola.", "Topped with nuts and cinnamon."]
    },
    {
      type: 'Lunch', color: 'teal', time: '12:45 PM', cal: '580', recipe: 'Turkey Avocado Wrap', pro: '28g', carb: '40g', fat: '18g',
      ingredients: ["Whole wheat tortilla", "3 slices turkey breast", "1/4 avocado", "Lettuce", "Mustard"],
      instructions: ["Spread avocado on tortilla.", "Layer turkey and lettuce.", "Roll and serve."]
    },
    {
      type: 'Dinner', color: 'emerald', time: '08:00 PM', cal: '490', recipe: 'Lentil Soup & Side Salad', pro: '20g', carb: '55g', fat: '10g',
      ingredients: ["1 cup lentil soup", "Mixed greens", "Cucumber", "Balsamic vinaigrette"],
      instructions: ["Heat soup in a pot.", "Assemble greens and cucumber.", "Serve together."]
    }
  ],
  "FRI": [
    {
      type: 'Breakfast', color: 'indigo', time: '07:45 AM', cal: '440', recipe: 'Avocado Toast w/ Egg', pro: '18g', carb: '35g', fat: '24g',
      ingredients: ["2 slices soughdough", "1 whole avocado", "2 poached eggs", "Red pepper flakes"],
      instructions: ["Toast bread, mash avocado on top.", "Place eggs and season."]
    },
    {
      type: 'Lunch', color: 'teal', time: '01:30 PM', cal: '620', recipe: 'Beef & Broccoli Stir-fry', pro: '32g', carb: '50g', fat: '20g',
      ingredients: ["150g beef strips", "2 cups broccoli", "Soy sauce", "Ginger & Garlic", "Sesame oil"],
      instructions: ["Sauté beef until browned.", "Add broccoli and sauce.", "Cook until tender."]
    },
    {
      type: 'Dinner', color: 'emerald', time: '07:00 PM', cal: '510', recipe: 'Whole Wheat Pasta Primavera', pro: '15g', carb: '70g', fat: '12g',
      ingredients: ["1 cup pasta", "Zucchini", "Bell peppers", "Olive oil", "Parmesan"],
      instructions: ["Boil pasta.", "Sauté veggies in oil.", "Toss and top with cheese."]
    }
  ],
  "SAT": [
    {
      type: 'Breakfast', color: 'indigo', time: '08:30 AM', cal: '450', recipe: 'Grilled Chicken Salad', pro: '40g', carb: '10g', fat: '15g',
      ingredients: ["Grilled chicken breast", "Romaine lettuce", "Cherry tomatoes", "Cucumber", "Olive oil dressing"],
      instructions: ["Chop veggies and chicken.", "Toss together in a large bowl."]
    },
    {
      type: 'Lunch', color: 'teal', time: '01:15 PM', cal: '650', recipe: 'Grilled Chicken Salad', pro: '40g', carb: '10g', fat: '15g',
      ingredients: ["Grilled chicken breast", "Romaine lettuce", "Cherry tomatoes", "Cucumber", "Olive oil dressing"],
      instructions: ["Chop veggies and chicken.", "Toss together with extra dressing."]
    },
    {
      type: 'Dinner', color: 'emerald', time: '08:00 PM', cal: '400', recipe: 'Grilled Chicken Salad', pro: '40g', carb: '10g', fat: '15g',
      ingredients: ["Grilled chicken breast", "Romaine lettuce", "Cherry tomatoes", "Cucumber", "Olive oil dressing"],
      instructions: ["Light version of the day's salad."]
    }
  ],
  "SUN": [
    {
      type: 'Breakfast', color: 'indigo', time: '09:00 AM', cal: '520', recipe: 'Protein Pancakes', pro: '30g', carb: '40g', fat: '12g',
      ingredients: ["1 scoop protein powder", "1 egg", "1/2 banana", "1/4 cup oats"],
      instructions: ["Blend and cook on a griddle."]
    },
    {
      type: 'Lunch', color: 'teal', time: '02:00 PM', cal: '700', recipe: 'Roasted Sunday Chicken', pro: '45g', carb: '50g', fat: '25g',
      ingredients: ["Chicken thigh", "Potato", "Carrots", "Herbs"],
      instructions: ["Roast everything at once."]
    },
    {
      type: 'Dinner', color: 'emerald', time: '07:30 PM', cal: '350', recipe: 'Tuna Salad Grapes', pro: '25g', carb: '5g', fat: '18g',
      ingredients: ["Canned tuna", "Grapes", "Celery", "Greek yogurt instead of mayo"],
      instructions: ["Mix and chill before serving."]
    }
  ],
  "MON": [
    {
      type: 'Breakfast', color: 'indigo', time: '08:15 AM', cal: '390', recipe: 'Spinach & Feta Omelet', pro: '22g', carb: '8g', fat: '20g',
      ingredients: ["3 eggs", "1 cup spinach", "30g feta cheese"],
      instructions: ["Whisk eggs.", "Cook spinach, add eggs and feta."]
    },
    {
      type: 'Lunch', color: 'teal', time: '12:30 PM', cal: '540', recipe: 'Chickpea Mediterranean Salad', pro: '18g', carb: '60g', fat: '15g',
      ingredients: ["Chickpeas", "Olives", "Cucumber", "Red onion", "Lemon dressing"],
      instructions: ["Combine and let marinate for 10 mins."]
    },
    {
      type: 'Dinner', color: 'emerald', time: '08:15 PM', cal: '460', recipe: 'Lemon Herb Grilled Fish', pro: '34g', carb: '15g', fat: '10g',
      ingredients: ["White fish fillet", "Lemon juice", "Parsley", "Quinoa side"],
      instructions: ["Grill fish until flaky."]
    }
  ],
  "TUE": [
    {
      type: 'Breakfast', color: 'indigo', time: '07:30 AM', cal: '420', recipe: 'Chia Seed Pudding', pro: '12g', carb: '40g', fat: '18g',
      ingredients: ["Chia seeds", "Coconut milk", "Vanilla", "Mixed berries"],
      instructions: ["Soak overnight.", "Top with berries in the morning."]
    },
    {
      type: 'Lunch', color: 'teal', time: '01:00 PM', cal: '600', recipe: 'Shrimp Tacos (3 count)', pro: '28g', carb: '45g', fat: '12g',
      ingredients: ["9 jumbo shrimp", "Corn tortillas", "Slaw mix", "Lime"],
      instructions: ["Sauté shrimp.", "Assemble tacos."]
    },
    {
      type: 'Dinner', color: 'emerald', time: '07:45 PM', cal: '480', recipe: 'Vegetable Curry w/ Brown Rice', pro: '10g', carb: '75g', fat: '8g',
      ingredients: ["Mixed frozen veggies", "Curry paste", "Coconut milk", "1/2 cup rice"],
      instructions: ["Simmer veggies in coconut sauce.", "Serve over rice."]
    }
  ]
}

export default function PatientHealthSnapshot() {
  const router = useRouter()
  const params = useParams()
  const { id } = params

  // Generate the last 7 days dynamically
  const generateDays = () => {
    const daysArr = []
    const dayNames = ["SUN", "MON", "TUE", "WED", "THR", "FRI", "SAT"]
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      daysArr.push({
        label: dayNames[d.getDay()],
        date: d.toISOString().split('T')[0]
      })
    }
    return daysArr
  }

  const days = generateDays()
  const [activeDay, setActiveDay] = useState(days[days.length - 1].label)
  const [activeDate, setActiveDate] = useState(days[days.length - 1].date)

  const [activeTab, setActiveTab] = useState("Macro")
  const [activeSubTab, setActiveSubTab] = useState("Carbohydrate")
  const [timeRange, setTimeRange] = useState("7")
  const [selectedMeal, setSelectedMeal] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [meals, setMeals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDetailsLoading, setIsDetailsLoading] = useState(false)
  const [intakeStats, setIntakeStats] = useState<any>(null)
  const [patientInfo, setPatientInfo] = useState<any>(null)
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [isChartLoading, setIsChartLoading] = useState(false)

  const categoryMap: Record<string, string[]> = {
    "Macro": ["Carbohydrate", "Protein", "Fats"],
    "Vitamin": ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"],
    "Mineral": ["Calcium", "Iron", "Zinc", "Sodium"]
  }

  // Fetch Patient Basic Details
  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (!id) return
      setIsDetailsLoading(true)
      try {
        const response = await fetch(`/api/patient/${id}/basic-details`)
        const result = await response.json()
        if (result.success && result.data) {
          setPatientInfo(result.data)
        }
      } catch (error) {
        console.error('Error fetching patient details:', error)
      } finally {
        setIsDetailsLoading(false)
      }
    }
    fetchPatientDetails()
  }, [id])

  // Fetch Intake Logs when date changes
  useEffect(() => {
    const fetchIntakeLogs = async () => {
      if (!id) return

      setIsLoading(true)
      try {
        const response = await fetch(`/api/patient/${id}/intake-by-day?date=${activeDate}`)
        const result = await response.json()

        if (result.success && result.data) {
          setIntakeStats(result.data)

          // Map backend meals to frontend UI format
          const mappedMeals = result.data.meals.map((m: any) => {
            let color = 'slate'
            if (m.mealtype?.toLowerCase() === 'breakfast') color = 'indigo'
            else if (m.mealtype?.toLowerCase() === 'lunch') color = 'teal'
            else if (m.mealtype?.toLowerCase() === 'dinner') color = 'emerald'

            // Format HH:MM AM/PM
            const date = new Date(m.time)
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

            return {
              type: m.mealtype.charAt(0).toUpperCase() + m.mealtype.slice(1),
              color: color,
              time: timeStr,
              cal: m.macros.calories.toString(),
              recipe: m.recipe_name,
              pro: `${m.macros.protein}g`,
              carb: `${m.macros.carbs}g`,
              fat: `${m.macros.fat}g`,
              ingredients: ["Recipe Ingredients not provided by log API"],
              instructions: ["Preparation steps not provided by log API"]
            }
          })
          setMeals(mappedMeals)
        } else {
          setMeals([])
          setIntakeStats(null)
        }
      } catch (error) {
        console.error('Error fetching meals:', error)
        setMeals([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchIntakeLogs()
  }, [id, activeDate])

  // Fetch Historical Data for Graph when timeRange changes
  useEffect(() => {
    const fetchHistoricalIntake = async () => {
      if (!id) return
      setIsChartLoading(true)
      try {
        const response = await fetch(`/api/patient/${id}/historical-intake?days=${timeRange}`)
        const result = await response.json()
        if (result.success && result.data) {
          setHistoricalData(result.data)
        }
      } catch (error) {
        console.error('Error fetching historical intake:', error)
      } finally {
        setIsChartLoading(false)
      }
    }
    fetchHistoricalIntake()
  }, [id, timeRange])

  // Reset subtab when main tab changes
  useEffect(() => {
    setActiveSubTab(categoryMap[activeTab][0])
  }, [activeTab])

  const getChartData = () => {
    if (historicalData.length > 0) {
      if (activeTab === "Macro") {
        return historicalData.map(d => ({
          day: d.day,
          value: activeSubTab === "Carbohydrate" ? d.carbs :
            activeSubTab === "Protein" ? d.protein :
              activeSubTab === "Fats" ? d.fat : d.calories
        }))
      }
      // For Vitamin/Mineral, rotate some generic data if not available in real logs
      return historicalData.map((d, i) => ({
        day: d.day,
        value: activeTab === "Vitamin" ? (800 + Math.sin(i) * 100) : (15 + Math.cos(i) * 5)
      }))
    }

    // Fallback Mock Data
    if (timeRange === "30") {
      if (activeTab === "Macro") return generateHistoricalData(150, 40)
      if (activeTab === "Vitamin") return generateHistoricalData(800, 100)
      return generateHistoricalData(20, 10)
    }

    if (activeTab === "Macro") {
      if (activeSubTab === "Carbohydrate") return carbohydrateData
      if (activeSubTab === "Protein") return proteinData
      if (activeSubTab === "Fats") return fatsData
      return macroData
    }
    if (activeTab === "Vitamin") {
      if (activeSubTab === "Vitamin A") return vitaminAData
      return genericTrend(100, 50)
    }
    if (activeTab === "Mineral") {
      if (activeSubTab === "Iron") return ironData
      return genericTrend(15, 10)
    }
    return macroData
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-slate-200"
            >
              <ArrowLeft className="h-5 w-5 text-slate-700" />
            </Button>
            <h1 className="text-xl font-bold text-[#334155]">Patient Health Snapshot</h1>
          </div>
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-10 text-sm font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Top Section: Profile & Macros */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-7 p-6 border-[#cbd5e1] shadow-none border rounded-2xl bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-full -mr-16 -mt-16 z-0" />

            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
              <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                <User className="h-10 w-10 text-blue-500" />
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                  <h2 className="text-3xl font-black text-[#111827]">
                    {isDetailsLoading ? "Loading..." : (patientInfo?.user_name || patientInfo?.name || "Patient")}
                  </h2>
                  <div className="flex gap-2 justify-center md:justify-start flex-wrap">
                    {patientInfo?.medical_info?.map((info: any, idx: number) => (
                      <Badge key={idx} className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none font-black px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
                        {info.condition}
                      </Badge>
                    )) || (
                        <>
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none font-black px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">Obesity</Badge>
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none font-black px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">Type 2 Diabetic</Badge>
                        </>
                      )}
                  </div>
                </div>
                <p className="text-slate-500 font-bold flex items-center justify-center md:justify-start gap-2">
                  <Activity className="w-4 h-4 text-rose-500" />
                  {patientInfo?.gender || "Male"} • {patientInfo?.age ? `${patientInfo.age} Years` : "42 Years"} • {patientInfo?.phone_number || patientInfo?.phone || "9840336751"}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-slate-100">
                  <div>
                    <p className="text-2xl font-black text-[#111827]">
                      {patientInfo?.height || "4.8"}
                      <span className="text-xs font-bold text-slate-400 ml-1">
                        {patientInfo?.height && !isNaN(Number(patientInfo.height)) ? (Number(patientInfo.height) > 10 ? 'cm' : 'ft') : 'ft'}
                      </span>
                    </p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Height</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[#111827]">
                      {patientInfo?.weight || "82"}
                      <span className="text-xs font-bold text-slate-400 ml-1">
                        {patientInfo?.weight && !isNaN(Number(patientInfo.weight)) ? (Number(patientInfo.weight) > 40 ? 'kgs' : 'lbs') : 'kgs'}
                      </span>
                    </p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Weight</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-blue-600">{patientInfo?.bmi_score || "210"}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">BMI Score</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-rose-600">{patientInfo?.blood_pressure || "124/80"}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Blood Pressure</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Macros Card */}
          <Card className="lg:col-span-5 p-6 border-[#cbd5e1] shadow-none border rounded-2xl bg-white">
            <h3 className="text-lg font-black text-[#111827] mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              Daily Intake Analysis
            </h3>

            <div className="space-y-6">
              <div className="group">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Calories</p>
                  <p className="text-[11px] font-black text-indigo-600">
                    {intakeStats?.calories || '0'} / 1500 kcal
                  </p>
                </div>
                <Progress value={intakeStats ? (intakeStats.calories / 1500) * 100 : 0} className="h-2.5 bg-slate-100 [&>div]:bg-indigo-500 rounded-full" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Protein</p>
                  <p className="text-lg font-black text-blue-700 leading-none">{intakeStats?.protein || '0'}g</p>
                  <Progress value={intakeStats ? (intakeStats.protein / 100) * 100 : 0} className="h-1 bg-blue-100 [&>div]:bg-blue-500 rounded-full mt-2" />
                </div>

                <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100/50">
                  <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1">Carbs</p>
                  <p className="text-lg font-black text-orange-700 leading-none">{intakeStats?.carbs || '0'}g</p>
                  <Progress value={intakeStats ? (intakeStats.carbs / 200) * 100 : 0} className="h-1 bg-orange-100 [&>div]:bg-orange-500 rounded-full mt-2" />
                </div>

                <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100/50">
                  <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Fats</p>
                  <p className="text-lg font-black text-rose-700 leading-none">{intakeStats?.fat || '0'}g</p>
                  <Progress value={intakeStats ? (intakeStats.fat / 60) * 100 : 0} className="h-1 bg-rose-100 [&>div]:bg-rose-500 rounded-full mt-2" />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Activity className="w-4 h-4 text-emerald-500" />
                <p className="text-[10px] font-bold text-slate-500">
                  {intakeStats?.calories > 1500 ? (
                    <span className="text-rose-600 font-extrabold uppercase">Exceeding daily limit</span>
                  ) : (
                    <>Patient is currently <span className="text-emerald-600 font-extrabold uppercase">within healthy limits</span> for today.</>
                  )}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Middle Section: Graph */}
        <Card className="p-6 border-slate-200 shadow-sm border relative overflow-hidden">
          <div className="flex justify-end gap-3 mb-8 md:absolute md:right-6 md:top-6 z-10">
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-1.5 pr-8 text-[11px] font-bold text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm"
              >
                <option value="Macro">Macro</option>
                <option value="Vitamin">Vitamin</option>
                <option value="Mineral">Mineral</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={activeSubTab}
                onChange={(e) => setActiveSubTab(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-1.5 pr-8 text-[11px] font-bold text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm"
              >
                {categoryMap[activeTab].map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="h-72 w-full mt-4 flex items-center justify-center relative">
            {isChartLoading && (
              <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center backdrop-blur-[1px] md:rounded-2xl">
                <RotateCw className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getChartData()} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
                  dy={10}
                  interval={timeRange === "30" ? 5 : 0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
                  dx={-5}
                />
                <Tooltip
                  cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                    fontSize: '12px',
                    fontWeight: 'bold',
                    padding: '12px 16px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  dot={{ r: 6, fill: "#fff", stroke: "#6366f1", strokeWidth: 3 }}
                  activeDot={{ r: 8, fill: "#6366f1", stroke: "#fff", strokeWidth: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Bottom Section: Diets In-take */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-[#111827] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Patient Dietary Intake Logs
            </h2>

            <div className="flex gap-2 p-1 bg-slate-100 rounded-full">
              {days.map((day) => (
                <button
                  key={day.date}
                  onClick={() => {
                    setActiveDay(day.label)
                    setActiveDate(day.date)
                  }}
                  className={`
                    px-4 py-1.5 rounded-full text-[10px] font-black transition-all
                    ${activeDay === day.label
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                    }
                  `}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <RotateCw className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
              <p className="text-sm font-bold text-slate-500">Fetching intake logs for {activeDate}...</p>
            </div>
          ) : meals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <Layers className="w-8 h-8 text-slate-300 mb-4" />
              <p className="text-sm font-bold text-slate-500">No logs found for this date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {meals.map((meal, idx) => (
                <Card key={idx} className="p-0 border-[#cbd5e1] shadow-none hover:shadow-md transition-all group bg-white rounded-2xl border overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 bg-${meal.color}-50 rounded-lg flex items-center justify-center`}>
                        <Activity className={`w-4 h-4 text-${meal.color}-500`} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{meal.type}</p>
                        <p className="text-xs font-bold text-slate-600 leading-none">{meal.time}</p>
                      </div>
                    </div>
                    <Badge className="bg-[#14b8a6] text-white border-none font-black text-[9px] px-2 py-0.5 rounded-full">WITHIN LIMIT</Badge>
                  </div>

                  <div className="p-5">
                    <h3 className="text-base font-extrabold text-[#111827] mb-3">{meal.recipe}</h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400">ENERGY CONTENT</p>
                        <p className="text-xs font-black text-indigo-600">{meal.cal} kcal</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-50 p-2 rounded-lg text-center">
                          <p className="text-[8px] font-bold text-slate-400">PRO</p>
                          <p className="text-[11px] font-black text-slate-700">{meal.pro}</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg text-center">
                          <p className="text-[8px] font-bold text-slate-400">CARB</p>
                          <p className="text-[11px] font-black text-slate-700">{meal.carb}</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg text-center">
                          <p className="text-[8px] font-bold text-slate-400">FAT</p>
                          <p className="text-[11px] font-black text-slate-700">{meal.fat}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <Dialog open={isModalOpen && selectedMeal?.recipe === meal.recipe} onOpenChange={(open) => {
                      setIsModalOpen(open)
                      if (!open) setSelectedMeal(null)
                    }}>
                      <DialogTrigger asChild>
                        <button
                          onClick={() => {
                            setSelectedMeal(meal)
                            setIsModalOpen(true)
                          }}
                          className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest"
                        >
                          View Details
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-white rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
                        <DialogHeader className="p-6 bg-indigo-600 text-white">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">{meal.type} • {meal.time}</p>
                              <DialogTitle className="text-2xl font-black">{meal.recipe}</DialogTitle>
                            </div>
                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">Within Limit</Badge>
                          </div>
                        </DialogHeader>

                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                          {/* Macro Summary Grid */}
                          <div className="grid grid-cols-4 gap-4">
                            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Calories</p>
                              <p className="text-xl font-black text-indigo-700">{meal.cal} <span className="text-xs">kcal</span></p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Protein</p>
                              <p className="text-xl font-black text-blue-700">{meal.pro}</p>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                              <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Carbs</p>
                              <p className="text-xl font-black text-orange-700">{meal.carb}</p>
                            </div>
                            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Fats</p>
                              <p className="text-xl font-black text-rose-700">{meal.fat}</p>
                            </div>
                          </div>

                          {/* Ingredients Section */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-black text-[#111827] flex items-center gap-2">
                              <Layers className="w-4 h-4 text-indigo-500" />
                              INGREDIENTS LIST
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              {meal.ingredients?.map((ing: string, i: number) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                                  <div className="w-2 h-2 bg-indigo-400 rounded-full group-hover:scale-125 transition-transform" />
                                  <p className="text-xs font-bold text-slate-600">{ing}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Instructions Section */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-black text-[#111827] flex items-center gap-2">
                              <Activity className="w-4 h-4 text-emerald-500" />
                              PREPARATION STEPS
                            </h4>
                            <div className="space-y-3">
                              {meal.instructions?.map((step: string, i: number) => (
                                <div key={i} className="flex gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                                  <div className="w-6 h-6 bg-emerald-500 text-white rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black">
                                    {i + 1}
                                  </div>
                                  <p className="text-xs font-bold text-slate-600 leading-relaxed">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                          <Button
                            onClick={() => setIsModalOpen(false)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider px-8 py-2 rounded-xl h-auto"
                          >
                            Close Details
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <div className="w-5 h-5 bg-white border border-slate-200 rounded-md flex items-center justify-center">
                      <Check className="w-3 h-3 text-emerald-500" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
