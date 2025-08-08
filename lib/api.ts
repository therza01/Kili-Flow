// API configuration and helper functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/gridpulse/api'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface User {
  id: number
  name: string
  whatsapp?: string
  estate: string
  latitude?: number
  longitude?: number
  created_at: string
}

export interface Issue {
  id: number
  user_id?: number
  type: string
  description: string
  latitude: number
  longitude: number
  location?: string
  photo_url?: string
  status: string
  created_at: string
  user_name?: string
}

export interface CommunityPost {
  id: number
  user_id?: number
  estate: string
  content: string
  created_at: string
  user: {
    name: string
  }
}

export interface Business {
  id: number
  name: string
  description?: string
  estate: string
  image_url?: string
  contact?: string
  created_at: string
}

// Generic API call function
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// User API functions
export const userApi = {
  create: async (userData: Partial<User>): Promise<ApiResponse<{ user_id: number }>> => {
    return apiCall('create_user.php', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },
}

// Issues API functions
export const issuesApi = {
  create: async (issueData: Partial<Issue>): Promise<ApiResponse<{ issue_id: number }>> => {
    return apiCall('report_issue.php', {
      method: 'POST',
      body: JSON.stringify(issueData),
    })
  },

  getAll: async (estate = 'Kilimani', limit = 50): Promise<ApiResponse<{ issues: Issue[], count: number }>> => {
    return apiCall(`get_issues.php?estate=${encodeURIComponent(estate)}&limit=${limit}`)
  },
}

// Community API functions
export const communityApi = {
  getPosts: async (estate = 'Kilimani', limit = 20): Promise<ApiResponse<{ posts: CommunityPost[], count: number }>> => {
    return apiCall(`community_posts.php?estate=${encodeURIComponent(estate)}&limit=${limit}`)
  },

  createPost: async (postData: Partial<CommunityPost>): Promise<ApiResponse<{ post_id: number }>> => {
    return apiCall('community_posts.php', {
      method: 'POST',
      body: JSON.stringify(postData),
    })
  },
}

// Businesses API functions
export const businessesApi = {
  getAll: async (estate = 'Kilimani', limit = 20): Promise<ApiResponse<{ businesses: Business[], count: number }>> => {
    return apiCall(`get_businesses.php?estate=${encodeURIComponent(estate)}&limit=${limit}`)
  },
}

// Estates API functions
export const estatesApi = {
  getAll: async (): Promise<ApiResponse<{ estates: string[], count: number }>> => {
    return apiCall('get_estates.php')
  },
}