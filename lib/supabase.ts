import { createClient } from '@supabase/supabase-js'

// Use environment variables or fallback to mock data
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key'

// Create client with error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
})

// Mock data for development
export const mockCommunityPosts = [
  {
    id: '1',
    user_id: '1',
    estate: 'Kilimani',
    content: 'Anyone else experiencing power issues on Kilimani Road? It\'s been out for 2 hours now.',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user: { name: 'John Doe' }
  },
  {
    id: '2',
    user_id: '2',
    estate: 'Kilimani',
    content: 'Water truck will be at the community center tomorrow at 10 AM for those affected by the water shortage.',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    user: { name: 'Jane Smith' }
  },
  {
    id: '3',
    user_id: '3',
    estate: 'Kilimani',
    content: 'Great news! The internet connectivity issues have been resolved. Thanks to everyone for reporting.',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    user: { name: 'Mike Johnson' }
  }
]

export const mockIssues = [
  {
    id: '1',
    type: 'Power',
    description: 'Complete power outage affecting entire block',
    latitude: -1.2860,
    longitude: 36.7871,
    location: 'Kilimani Road',
    status: 'investigating',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    type: 'Water',
    description: 'Low water pressure in apartment buildings',
    latitude: -1.2870,
    longitude: 36.7881,
    location: 'Argwings Kodhek Road',
    status: 'reported',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    type: 'Internet',
    description: 'Fiber internet connection restored',
    latitude: -1.2850,
    longitude: 36.7861,
    location: 'Ralph Bunche Road',
    status: 'resolved',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  }
]

export const mockBusinesses = [
  {
    id: '1',
    name: 'Kilimani Hardware',
    description: 'Your one-stop shop for all hardware needs. Quality tools and materials.',
    estate: 'Kilimani',
    contact: '+254712000001',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    name: 'Fresh Groceries',
    description: 'Fresh fruits and vegetables daily. Farm to table quality.',
    estate: 'Kilimani',
    contact: '+254712000002',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    name: 'Tech Repair Hub',
    description: 'Professional phone and laptop repair services. Quick turnaround.',
    estate: 'Kilimani',
    contact: '+254712000003',
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
  }
]

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://mock.supabase.co' && supabaseAnonKey !== 'mock-key'
}

export type Issue = {
  id: string
  type: string
  description: string
  photo_url?: string
  latitude: number
  longitude: number
  created_at: string
  user_id?: string
  status?: string
  location?: string
}

export type User = {
  id: string
  name: string
  whatsapp: string
  created_at: string
  estate?: string
}

export type CommunityPost = {
  id: string
  user_id: string
  estate: string
  content: string
  created_at: string
  user?: User
}

export type Business = {
  id: string
  name: string
  description: string
  estate: string
  image_url?: string
  contact: string
  created_at: string
}
