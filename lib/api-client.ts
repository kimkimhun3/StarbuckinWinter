export class ApiClient {
  private baseUrl: string
  private token: string | null

  constructor() {
    this.baseUrl = ''
    this.token = null
  }

  setToken(token: string | null) {
    this.token = token
  }

  private async request(url: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Request failed')
    }

    return data
  }

  // Posts
  async getPosts(all = false) {
    return this.request(`/api/posts${all ? '?all=true' : ''}`)
  }

  async getPost(id: string) {
    return this.request(`/api/posts/${id}`)
  }

  async createPost(data: {
    title: string
    content: string
    excerpt?: string
    coverImage?: string
    published: boolean
    authorName?: string
    tags?: string[]
  }) {
    return this.request('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePost(id: string, data: {
    title: string
    content: string
    excerpt?: string
    coverImage?: string
    published: boolean
    authorName?: string
    tags?: string[]
  }) {
    return this.request(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async incrementLoveCount(id: string) {
    return this.request(`/api/posts/${id}/love`, {
      method: 'POST',
    })
  }

  async incrementViewCount(id: string) {
    return this.request(`/api/posts/${id}/view`, {
      method: 'POST',
    })
  }

  async deletePost(id: string) {
    return this.request(`/api/posts/${id}`, {
      method: 'DELETE',
    })
  }

  // Comments
  async getComments(postId: string) {
    return this.request(`/api/comments?postId=${postId}`)
  }

  async approveComment(id: string) {
    return this.request(`/api/comments/${id}/approve`, {
      method: 'POST',
    })
  }

  async deleteComment(id: string) {
    return this.request(`/api/comments/${id}`, {
      method: 'DELETE',
    })
  }

  // Add this method to the ApiClient class
  async getPostBySlug(slug: string) {
    return this.request(`/api/posts/slug/${slug}`)
  }

  // Also add method for public posts (no auth needed)
  async getPublicPosts() {
    return this.request('/api/posts')
  }

  // Add method to create comment
  async createComment(postId: string, content: string) {
    return this.request('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ postId, content }),
    })
  }
}




export const apiClient = new ApiClient()