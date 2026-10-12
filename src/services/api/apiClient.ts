/**
 * APDO Operations Management System - Laravel REST API Client
 * 
 * Future Laravel integration module. When VITE_USE_MOCK_DATA=false,
 * the frontend will route calls through this HTTP client.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export class ApiClient {
  private static token: string | null = null;

  public static setAuthToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('apdo_auth_token', token);
    } else {
      localStorage.removeItem('apdo_auth_token');
    }
  }

  public static getAuthToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('apdo_auth_token');
    }
    return this.token;
  }

  public static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        errorBody.message || `API request failed with HTTP ${response.status}`
      );
    }

    return response.json();
  }

  public static get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  public static post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public static put<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  public static delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
