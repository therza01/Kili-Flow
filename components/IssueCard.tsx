import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Zap, Droplets, Wifi, Flame } from 'lucide-react'
import { Issue } from "@/lib/api"

interface IssueCardProps {
  issue: Issue
}

export function IssueCard({ issue }: IssueCardProps) {
  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'Power': return <Zap className="h-4 w-4 text-yellow-600" />
      case 'Water': return <Droplets className="h-4 w-4 text-blue-600" />
      case 'Internet': return <Wifi className="h-4 w-4 text-green-600" />
      case 'Gas': return <Flame className="h-4 w-4 text-red-600" />
      default: return <MapPin className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return "bg-green-100 text-green-800"
      case 'investigating': return "bg-yellow-100 text-yellow-800"
      case 'reported': return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="mt-1">
              {getIssueIcon(issue.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-medium">{issue.type} Issue</h3>
                <Badge className={getStatusColor(issue.status || 'reported')}>
                  {issue.status || 'reported'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{issue.location || 'Kilimani'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
