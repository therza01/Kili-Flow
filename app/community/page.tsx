"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Users, Send, MessageCircle, MapPin, Zap } from 'lucide-react'
import Link from "next/link"
import { supabase, CommunityPost, User, mockCommunityPosts, isSupabaseConfigured } from "@/lib/supabase"
import { CommunityPost as CommunityPostComponent } from "@/components/CommunityPost"
import { LeafletMap } from "@/components/LeafletMap"
import { LocationSetup } from "@/components/LocationSetup"

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([])
  const [newPost, setNewPost] = useState("")
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showLocationSetup, setShowLocationSetup] = useState(false)
  const { toast } = useToast()

  const fetchPosts = async (userEstate?: string) => {
    setLoading(true)
    try {
      if (!isSupabaseConfigured()) {
        console.log('Using mock data - Supabase not configured')
        setPosts(mockCommunityPosts)
        setLoading(false)
        return
      }

      const estate = userEstate || currentUser?.estate || 'Kilimani Central'
      
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          user:users(name, estate)
        `)
        .eq('estate', estate)
        .order('created_at', { ascending: false })

      if (error) {
        console.log('Supabase error, falling back to mock data:', error.message)
        setPosts(mockCommunityPosts)
      } else {
        setPosts(data || [])
      }
    } catch (err) {
      console.log('Network error, using mock data:', err)
      setPosts(mockCommunityPosts)
    } finally {
      setLoading(false)
    }
  }

  const fetchNearbyUsers = async (userEstate?: string) => {
    try {
      if (!isSupabaseConfigured()) {
        // Mock nearby users
        const mockUsers: User[] = [
          { id: '1', name: 'John Doe', whatsapp: '+254712345678', estate: userEstate || 'Yaya Center', created_at: new Date().toISOString() },
          { id: '2', name: 'Jane Smith', whatsapp: '+254723456789', estate: userEstate || 'Yaya Center', created_at: new Date().toISOString() },
          { id: '3', name: 'Mike Johnson', whatsapp: '+254734567890', estate: 'Woodlands', created_at: new Date().toISOString() },
          { id: '4', name: 'Sarah Wilson', whatsapp: '+254745678901', estate: 'Kileleshwa', created_at: new Date().toISOString() },
        ]
        setNearbyUsers(mockUsers)
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .not('estate', 'is', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.log('Error fetching users:', error.message)
      } else {
        setNearbyUsers(data || [])
      }
    } catch (err) {
      console.log('Network error fetching users:', err)
    }
  }

  const submitPost = async () => {
    if (!newPost.trim()) return

    setPosting(true)
    try {
      let userProfile = currentUser
      
      if (!userProfile) {
        const stored = localStorage.getItem('gridpulse_user')
        if (stored) {
          userProfile = JSON.parse(stored)
          setCurrentUser(userProfile)
        }
      }

      if (!userProfile?.estate) {
        setShowLocationSetup(true)
        setPosting(false)
        return
      }

      if (!isSupabaseConfigured()) {
        const newMockPost = {
          id: Date.now().toString(),
          user_id: userProfile.id || 'demo-user',
          estate: userProfile.estate,
          content: newPost,
          created_at: new Date().toISOString(),
          user: { name: userProfile.name, estate: userProfile.estate }
        }
        
        setPosts(prev => [newMockPost, ...prev])
        toast({
          title: "Post Shared! (Demo Mode)",
          description: `Your message has been posted to ${userProfile.estate} community.`,
        })
        setNewPost("")
        setPosting(false)
        return
      }

      const { error } = await supabase
        .from('community_posts')
        .insert([
          {
            user_id: userProfile.id,
            estate: userProfile.estate,
            content: newPost
          }
        ])

      if (error) throw error

      toast({
        title: "Post Shared!",
        description: `Your message has been posted to ${userProfile.estate} community.`,
      })

      setNewPost("")
      fetchPosts(userProfile.estate)
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

  const handleLocationSet = async (estate: string, lat: number, lng: number) => {
    try {
      let userProfile = currentUser
      
      if (!userProfile) {
        const stored = localStorage.getItem('gridpulse_user')
        if (stored) {
          userProfile = JSON.parse(stored)
        } else {
          // Create new user profile
          const newProfile = {
            id: Date.now().toString(),
            name: 'Community Member',
            whatsapp: '',
            estate,
            latitude: lat,
            longitude: lng,
            created_at: new Date().toISOString()
          }
          localStorage.setItem('gridpulse_user', JSON.stringify(newProfile))
          userProfile = newProfile
        }
      }

      // Update user profile with location
      const updatedProfile = {
        ...userProfile,
        estate,
        latitude: lat,
        longitude: lng
      }

      localStorage.setItem('gridpulse_user', JSON.stringify(updatedProfile))
      setCurrentUser(updatedProfile)
      setShowLocationSetup(false)

      toast({
        title: "Location Set!",
        description: `You're now connected to the ${estate} community.`,
      })

      // Fetch posts for the new estate
      fetchPosts(estate)
      fetchNearbyUsers(estate)
    } catch (err) {
      console.error('Error setting location:', err)
      toast({
        title: "Location Setup Failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    // Load user profile
    const stored = localStorage.getItem('gridpulse_user')
    if (stored) {
      const userProfile = JSON.parse(stored)
      setCurrentUser(userProfile)
      
      if (!userProfile.estate) {
        setShowLocationSetup(true)
      } else {
        fetchPosts(userProfile.estate)
        fetchNearbyUsers(userProfile.estate)
      }
    } else {
      setShowLocationSetup(true)
      setLoading(false)
    }

    // Set up real-time subscription if Supabase is configured
    if (isSupabaseConfigured()) {
      const subscription = supabase
        .channel('community_posts')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'community_posts' },
          () => {
            const stored = localStorage.getItem('gridpulse_user')
            if (stored) {
              const userProfile = JSON.parse(stored)
              fetchPosts(userProfile.estate)
            }
          }
        )
        .subscribe()

      return () => subscription.unsubscribe()
    }
  }, [])

  if (showLocationSetup) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Community Hub</h1>
          </div>
          
          <LocationSetup
            onLocationSet={handleLocationSet}
            onSkip={() => {
              setShowLocationSetup(false)
              fetchPosts('Kilimani Central')
              fetchNearbyUsers('Kilimani Central')
            }}
          />
        </div>
      </div>
    )
  }

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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Users className="h-12 w-12" />
                <div>
                  <h2 className="text-xl font-bold">
                    {currentUser?.estate || 'Kilimani'} Community
                  </h2>
                  <p className="text-orange-100">Stay connected with your neighbors</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{nearbyUsers.length}</div>
                <div className="text-sm text-orange-100">online</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estate Map */}
        <LeafletMap
          currentUser={currentUser}
          nearbyUsers={nearbyUsers}
          onUserSelect={(user) => {
            toast({
              title: `${user.name}`,
              description: `Active in ${user.estate}`,
            })
          }}
          height="300px"
        />

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
              placeholder={`What's happening in ${currentUser?.estate || 'your area'}? Share updates, ask questions, or help neighbors...`}
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              rows={3}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <Badge variant="outline">
                  {currentUser?.estate || 'Kilimani Central'}
                </Badge>
              </div>
              <Button 
                onClick={submitPost} 
                disabled={posting || !newPost.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                {posting ? "Posting..." : "Share Post"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Community Feed</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live updates</span>
            </div>
          </div>
          
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
            <div className="space-y-4">
              {posts.map((post) => (
                <CommunityPostComponent
                  key={post.id}
                  post={post}
                  onLike={(postId) => {
                    toast({
                      title: "Liked!",
                      description: "You liked this post.",
                    })
                  }}
                  onReply={(postId) => {
                    toast({
                      title: "Reply Feature",
                      description: "Reply functionality coming soon!",
                    })
                  }}
                  onShare={(postId) => {
                    toast({
                      title: "Shared!",
                      description: "Post shared with your network.",
                    })
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Community Stats */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Zap className="h-5 w-5 text-blue-600" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">Community Activity</p>
                <div className="grid grid-cols-3 gap-4 text-blue-700">
                  <div className="text-center">
                    <div className="font-bold text-lg">{posts.length}</div>
                    <div className="text-xs">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{nearbyUsers.length}</div>
                    <div className="text-xs">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">
                      {nearbyUsers.filter(u => u.estate === currentUser?.estate).length}
                    </div>
                    <div className="text-xs">Nearby</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
