import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Heart, MessageCircle, Share } from 'lucide-react'
import { CommunityPost as CommunityPostType } from "@/lib/supabase"

interface CommunityPostProps {
  post: CommunityPostType
  onLike?: (postId: string) => void
  onReply?: (postId: string) => void
  onShare?: (postId: string) => void
}

export function CommunityPost({ post, onLike, onReply, onShare }: CommunityPostProps) {
  const timeAgo = (date: string) => {
    const now = new Date()
    const postDate = new Date(date)
    const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {(post.user?.name || 'A')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-sm">{post.user?.name || 'Anonymous'}</p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <MapPin className="h-3 w-3" />
                <span>{post.estate}</span>
                <Clock className="h-3 w-3" />
                <span>{timeAgo(post.created_at)}</span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {post.estate}
          </Badge>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-800 leading-relaxed">{post.content}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-red-500 p-1"
              onClick={() => onLike?.(post.id)}
            >
              <Heart className="h-4 w-4 mr-1" />
              <span className="text-xs">Like</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-blue-500 p-1"
              onClick={() => onReply?.(post.id)}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">Reply</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-green-500 p-1"
              onClick={() => onShare?.(post.id)}
            >
              <Share className="h-4 w-4 mr-1" />
              <span className="text-xs">Share</span>
            </Button>
          </div>
          <div className="text-xs text-gray-400">
            {new Date(post.created_at).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
