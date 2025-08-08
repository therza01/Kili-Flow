"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Users, Send, MessageCircle } from 'lucide-react'
import Link from "next/link"
import { communityApi, CommunityPost } from "@/lib/api"

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [newPost, setNewPost] = useState("")
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const { toast } = useToast()

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const response = await communityApi.getPosts('Kilimani', 20)
      
      if (response.success && response.data) {
        setPosts(response.data.posts)
      } else {
        console.error('Failed to fetch posts:', response.error)
        setPosts([])
      }
    } catch (err) {
      console.error('Network error:', err)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const submitPost = async () => {
    if (!newPost.trim()) return

    setPosting(true)
    try {
      // Get or create user
      let userProfile = localStorage.getItem('gridpulse_user')
      let userId = null
      let userName = 'Anonymous User'

      if (userProfile) {
        const parsed = JSON.parse(userProfile)
        userId = parsed.id
        userName = parsed.name
      }

      const response = await communityApi.createPost({
        user_id: userId,
        estate: 'Kilimani',
        content: newPost
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to create post')
      }

      toast({
        title: "Post Shared!",
        description: response.message || "Your message has been posted to the community.",
      })

      setNewPost("")
      fetchPosts()
    } catch (err) {
      console.error('Error posting:', err)
      toast({
        title: "Failed to Post",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setPosting(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Community Hub</h1>
        </div>

        {/* Header */}
        <Card className="bg-gradient-to-r from-orange-500 to-pink-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Users className="h-12 w-12" />
              <div>
                <h2 className="text-xl font-bold">Kilimani Community</h2>
                <p className="text-orange-100">Stay connected with your neighbors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Post Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Share with Community</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="What's happening in Kilimani? Share updates, ask questions, or help neighbors..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={submitPost} 
              disabled={posting || !newPost.trim()}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {posting ? "Posting..." : "Share Post"}
            </Button>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Community Feed</h2>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No community posts yet</p>
                <p className="text-sm text-gray-400 mt-2">Be the first to share something!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {(post.user?.name || 'A')[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{post.user?.name || 'Anonymous'}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(post.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">{post.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
