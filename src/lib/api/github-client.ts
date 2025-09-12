// Simple GitHub API client

import { hc } from "hono/client";

// Create Hono RPC client
const client = hc("/api/github");

export class GitHubApiClient {
  private token?: string;

  constructor(token?: string) {
    this.token = token;
  }

  setToken(token: string): void {
    this.token = token;
  }

  private getAuthHeaders(): Record<string, string> {
    if (!this.token) {
      throw new Error("No GitHub token available. Please authenticate first.");
    }

    return {
      Authorization: `Bearer ${this.token}`,
    };
  }

  async getAuthUrl(
    redirectUri: string
  ): Promise<{ authUrl: string; state: string }> {
    const response = await client["auth-url"].$post({
      json: { redirectUri },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error);
    }

    return await response.json();
  }

  async exchangeToken(
    code: string,
    redirectUri: string
  ): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: string;
    scope?: string;
    tokenType?: string;
  }> {
    const response = await client["exchange-token"].$post({
      json: { code, redirectUri },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error);
    }

    const tokenData = await response.json();

    // Automatically set the token for future requests
    this.setToken(tokenData.accessToken);

    return tokenData;
  }

  async validateToken(): Promise<boolean> {
    try {
      const response = await client["validate-token"].$post({
        headers: this.getAuthHeaders(),
      });

      const result = await response.json();
      return result.success;
    } catch {
      return false;
    }
  }

  async getRepositories(): Promise<string[]> {
    const response = await client.repositories.$get({
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error);
    }

    const result = await response.json();
    return result.data?.repositories || [];
  }

  async getPullRequests(options?: {
    repositories?: string[];
    filters?: {
      tags?: string[];
      labels?: string[];
      titleKeywords?: string[];
      excludeAuthors?: string[];
    };
  }): Promise<any[]> {
    const response = await client["pull-requests"].$post({
      json: options || {},
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error);
    }

    const result = await response.json();
    return result.data?.pullRequests || [];
  }

  async getUserInfo(): Promise<{ login: string; name: string; email: string }> {
    const response = await client.user.$get({
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error);
    }

    const result = await response.json();
    return result.data;
  }
}

// Singleton instance for convenience
export const githubApi = new GitHubApiClient();

// Hook for React components
export function useGitHubApi(token?: string) {
  const client = new GitHubApiClient(token);

  return {
    client,

    async connectGitHub(redirectUri: string) {
      return client.getAuthUrl(redirectUri);
    },

    async completeConnection(code: string, redirectUri: string) {
      return client.exchangeToken(code, redirectUri);
    },

    async fetchRepositories() {
      return client.getRepositories();
    },

    async fetchPullRequests(
      options?: Parameters<typeof client.getPullRequests>[0]
    ) {
      return client.getPullRequests(options);
    },

    async validateConnection() {
      return client.validateToken();
    },

    async getUserInfo() {
      return client.getUserInfo();
    },
  };
}
