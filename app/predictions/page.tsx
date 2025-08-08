"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Brain, TrendingUp, AlertTriangle, Clock, Zap, Droplets } from 'lucide-react'
import Link from "next/link"

const predictions = [
  {
    id: 1,
    area: "Kilimani",
    type: "Power",
    probability: 78,
    time: "Tonight 8–11pm",
    confidence: "High",
    factors: ["Historical patterns", "Grid load", "Weather conditions"],
    impact: "Medium",
    description: "High probability of power outage due to increased evening demand and recent grid instability."
  },
  {
    id: 2,
    area: "Westlands",
    type: "Water",
    probability: 45,
    time: "Tomorrow morning",
    confidence: "Medium",
    factors: ["Maintenance schedule", "Supply patterns"],
    impact: "Low",
    description: "Scheduled maintenance may affect water supply in some areas."
  },
  {
    id: 3,
    area: "Karen",
    type: "Internet",
    probability: 23,
    time: "This weekend",
    confidence: "Low",
    factors: ["Infrastructure updates"],
    impact: "Low",
    description: "Minor connectivity issues possible during planned infrastructure upgrades."
  }
]

const getProbabilityColor = (probability: number) => {
  if (probability >= 70) return "text-red-600"
  if (probability >= 40) return "text-yellow-600"
  return "text-green-600"
}

const getConfidenceColor = (confidence: string) => {
  switch (confidence) {
    case "High": return "bg-red-100 text-red-800"
    case "Medium": return "bg-yellow-100 text-yellow-800"
    case "Low": return "bg-green-100 text-green-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "Power": return <Zap className="h-5 w-5 text-yellow-600" />
    case "Water": return <Droplets className="h-5 w-5 text-blue-600" />
    default: return <AlertTriangle className="h-5 w-5 text-gray-600" />
  }
}

export default function PredictionsPage() {
  const [selectedPrediction, setSelectedPrediction] = useState<number | null>(null)

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">AI Predictions</h1>
        </div>

        {/* Header Card */}
        <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Brain className="h-12 w-12" />
              <div>
                <h2 className="text-xl font-bold">GridPulse AI</h2>
                <p className="text-purple-100">Predictive analytics for utility outages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Status */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-medium text-green-900">AI Model Active</p>
                <p className="text-sm text-green-700">Last updated: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Predictions List */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Outage Predictions</h2>
          </div>
          
          {predictions.map((prediction) => (
            <Card 
              key={prediction.id} 
              className={`hover:shadow-lg transition-all cursor-pointer ${
                selectedPrediction === prediction.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedPrediction(
                selectedPrediction === prediction.id ? null : prediction.id
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(prediction.type)}
                    <CardTitle className="text-lg">{prediction.area}</CardTitle>
                  </div>
                  <Badge className={getConfidenceColor(prediction.confidence)}>
                    {prediction.confidence} Confidence
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{prediction.type} Outage Predicted</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{prediction.time}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getProbabilityColor(prediction.probability)}`}>
                      {prediction.probability}%
                    </div>
                    <div className="text-xs text-gray-500">Probability</div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Risk Level</span>
                    <span className={getProbabilityColor(prediction.probability)}>
                      {prediction.probability >= 70 ? "High" : prediction.probability >= 40 ? "Medium" : "Low"}
                    </span>
                  </div>
                  <Progress 
                    value={prediction.probability} 
                    className="h-2"
                  />
                </div>

                {selectedPrediction === prediction.id && (
                  <div className="space-y-3 pt-3 border-t">
                    <p className="text-sm text-gray-700">{prediction.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Key Factors:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {prediction.factors.map((factor, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Expected Impact:</span>
                      <span className="font-medium">{prediction.impact}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Insights */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">How AI Predictions Work</p>
                <p className="text-blue-700 mb-2">
                  Our machine learning model analyzes multiple data sources to predict utility disruptions:
                </p>
                <ul className="text-blue-700 space-y-1 text-xs">
                  <li>• Historical outage patterns and frequency</li>
                  <li>• Weather conditions and forecasts</li>
                  <li>• Grid load and demand patterns</li>
                  <li>• Maintenance schedules and infrastructure age</li>
                  <li>• Real-time system monitoring data</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Recommendations */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-yellow-900">Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-yellow-900 text-sm">High Risk Areas</p>
                <p className="text-yellow-700 text-xs">Charge devices and prepare backup power sources</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-yellow-900 text-sm">Water Issues</p>
                <p className="text-yellow-700 text-xs">Store water in containers as a precaution</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-yellow-900 text-sm">Stay Informed</p>
                <p className="text-yellow-700 text-xs">Enable WhatsApp alerts for real-time updates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
