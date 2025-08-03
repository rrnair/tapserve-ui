// src/lib/api.ts (Auth only)

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AuthResponse, LoginCredentials } from '@/types/auth';

// The base URL for remote backend endoint
const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api/v1';


/**
 * API client that connect to backend REST APIs hosted at remnote server. For Dev/Test environment 
 * use the "$project_root/mock" server module to initialize a mock environment
 * 
 * @author Ratheesh Nair
 * @since 0.1.0
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private axios: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.axios = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' },
    });

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token');
      if (token) this.setToken(token);
    }
  }

  setToken(token: string) {
    this.token = token;
    this.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token);
    }
  }

  clearToken() {
    this.token = null;
    delete this.axios.defaults.headers.common['Authorization'];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
    }
  }

  async request<T>(
    endpoint: string,
    config: AxiosRequestConfig & { params?: any } = {}
  ): Promise<ApiResponse<T>> {
    try {
      console.log(`API: Handle Request: ${endpoint}, Config: ${JSON.stringify(config)}`);
      
      // Handle array parameters in query strings
      if (config.params) {
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(config.params)) {
          if (Array.isArray(value)) {
            // Convert arrays to comma-separated strings for query parameters
            searchParams.append(key, value.join(','));
          } else if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        }
        
        const queryString = searchParams.toString();
        if (queryString) {
          const separator = endpoint.includes('?') ? '&' : '?';
          endpoint = `${endpoint}${separator}${queryString}`;
        }
        
        // Remove params from config since we've handled it manually
        const { params: _params, ...restConfig } = config;
        config = restConfig;
      }
      
      const response = await this.axios(endpoint, config);
      return response.data;
    } catch (error: any) {
      console.error('API request failed:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      return {
        success: false,
        error: errorMsg,
      };
    }
  }

  // Auth methods
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      data: credentials,
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    const result = await this.request<void>('/auth/logout', {
      method: 'POST',
    });
    this.clearToken();
    return result;
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.request<{ token: string }>('/auth/refresh', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export const request = apiClient.request.bind(apiClient);
