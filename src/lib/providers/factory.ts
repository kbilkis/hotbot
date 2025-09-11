// Provider factory and registry for creating provider instances

import type {
  GitProvider,
  MessagingProvider,
  GitProviderType,
  MessagingProviderType,
  ProviderConfig,
} from "../types/providers.js";

import type { ProviderFactory } from "./base.js";

// Provider configuration registry
export class ProviderConfigRegistry {
  private static gitConfigs = new Map<GitProviderType, ProviderConfig>();
  private static messagingConfigs = new Map<
    MessagingProviderType,
    ProviderConfig
  >();

  static registerGitProvider(
    type: GitProviderType,
    config: ProviderConfig
  ): void {
    this.gitConfigs.set(type, config);
  }

  static registerMessagingProvider(
    type: MessagingProviderType,
    config: ProviderConfig
  ): void {
    this.messagingConfigs.set(type, config);
  }

  static getGitConfig(type: GitProviderType): ProviderConfig {
    const config = this.gitConfigs.get(type);
    if (!config) {
      throw new Error(`Git provider ${type} not configured`);
    }
    return config;
  }

  static getMessagingConfig(type: MessagingProviderType): ProviderConfig {
    const config = this.messagingConfigs.get(type);
    if (!config) {
      throw new Error(`Messaging provider ${type} not configured`);
    }
    return config;
  }

  static initializeFromEnv(): void {
    // GitHub configuration
    if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
      this.registerGitProvider("github", {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        scopes: ["repo", "read:user"],
      });
    }

    // Bitbucket configuration
    if (
      process.env.BITBUCKET_CLIENT_ID &&
      process.env.BITBUCKET_CLIENT_SECRET
    ) {
      this.registerGitProvider("bitbucket", {
        clientId: process.env.BITBUCKET_CLIENT_ID,
        clientSecret: process.env.BITBUCKET_CLIENT_SECRET,
        scopes: ["repositories", "account"],
      });
    }

    // GitLab configuration
    if (process.env.GITLAB_CLIENT_ID && process.env.GITLAB_CLIENT_SECRET) {
      this.registerGitProvider("gitlab", {
        clientId: process.env.GITLAB_CLIENT_ID,
        clientSecret: process.env.GITLAB_CLIENT_SECRET,
        scopes: ["read_api", "read_user", "read_repository"],
      });
    }

    // Slack configuration
    if (process.env.SLACK_CLIENT_ID && process.env.SLACK_CLIENT_SECRET) {
      this.registerMessagingProvider("slack", {
        clientId: process.env.SLACK_CLIENT_ID,
        clientSecret: process.env.SLACK_CLIENT_SECRET,
        scopes: [
          "chat:write",
          "channels:read",
          "groups:read",
          "im:read",
          "mpim:read",
        ],
      });
    }

    // MS Teams configuration
    if (process.env.TEAMS_CLIENT_ID && process.env.TEAMS_CLIENT_SECRET) {
      this.registerMessagingProvider("teams", {
        clientId: process.env.TEAMS_CLIENT_ID,
        clientSecret: process.env.TEAMS_CLIENT_SECRET,
        scopes: [
          "https://graph.microsoft.com/ChannelMessage.Send",
          "https://graph.microsoft.com/Channel.ReadBasic.All",
        ],
      });
    }

    // Discord configuration
    if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
      this.registerMessagingProvider("discord", {
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        scopes: ["bot", "messages.write"],
      });
    }
  }
}

// Provider factory implementation
export class DefaultProviderFactory implements ProviderFactory {
  private gitProviders = new Map<GitProviderType, () => GitProvider>();
  private messagingProviders = new Map<
    MessagingProviderType,
    () => MessagingProvider
  >();

  registerGitProvider(type: GitProviderType, factory: () => GitProvider): void {
    this.gitProviders.set(type, factory);
  }

  registerMessagingProvider(
    type: MessagingProviderType,
    factory: () => MessagingProvider
  ): void {
    this.messagingProviders.set(type, factory);
  }

  createGitProvider(type: GitProviderType): GitProvider {
    const factory = this.gitProviders.get(type);
    if (!factory) {
      throw new Error(`Git provider ${type} not registered`);
    }
    return factory();
  }

  createMessagingProvider(type: MessagingProviderType): MessagingProvider {
    const factory = this.messagingProviders.get(type);
    if (!factory) {
      throw new Error(`Messaging provider ${type} not registered`);
    }
    return factory();
  }

  getAvailableGitProviders(): GitProviderType[] {
    return Array.from(this.gitProviders.keys());
  }

  getAvailableMessagingProviders(): MessagingProviderType[] {
    return Array.from(this.messagingProviders.keys());
  }
}

// Global provider factory instance
export const providerFactory = new DefaultProviderFactory();

// Provider registration helper
export function registerProviders(): void {
  // Initialize configurations from environment variables
  ProviderConfigRegistry.initializeFromEnv();

  // Register git provider factories (will be implemented in specific provider files)
  // These will be registered when the specific provider modules are imported

  // Note: Actual provider implementations will register themselves
  // when their modules are imported. This keeps the factory decoupled
  // from specific implementations.
}

// Utility functions for provider management
export class ProviderUtils {
  static isGitProvider(provider: string): provider is GitProviderType {
    return ["github", "bitbucket", "gitlab"].includes(provider);
  }

  static isMessagingProvider(
    provider: string
  ): provider is MessagingProviderType {
    return ["slack", "teams", "discord"].includes(provider);
  }

  static getProviderDisplayName(
    provider: GitProviderType | MessagingProviderType
  ): string {
    const displayNames: Record<string, string> = {
      github: "GitHub",
      bitbucket: "Bitbucket",
      gitlab: "GitLab",
      slack: "Slack",
      teams: "Microsoft Teams",
      discord: "Discord",
    };

    return displayNames[provider] || provider;
  }

  static getProviderIcon(
    provider: GitProviderType | MessagingProviderType
  ): string {
    const icons: Record<string, string> = {
      github: "🐙",
      bitbucket: "🪣",
      gitlab: "🦊",
      slack: "💬",
      teams: "👥",
      discord: "🎮",
    };

    return icons[provider] || "🔗";
  }

  static validateProviderConfig(config: ProviderConfig): void {
    if (!config.clientId) {
      throw new Error("Provider config missing clientId");
    }

    if (!config.clientSecret) {
      throw new Error("Provider config missing clientSecret");
    }

    if (!config.scopes || config.scopes.length === 0) {
      throw new Error("Provider config missing scopes");
    }
  }
}

// Provider health check utility
export class ProviderHealthChecker {
  static async checkGitProvider(
    provider: GitProvider,
    token: string
  ): Promise<boolean> {
    try {
      return await provider.validateToken(token);
    } catch {
      return false;
    }
  }

  static async checkMessagingProvider(
    provider: MessagingProvider,
    token: string
  ): Promise<boolean> {
    try {
      return await provider.validateToken(token);
    } catch {
      return false;
    }
  }

  static async checkAllProviders(
    gitProviders: Array<{ type: GitProviderType; token: string }>,
    messagingProviders: Array<{ type: MessagingProviderType; token: string }>
  ): Promise<{
    git: Record<GitProviderType, boolean>;
    messaging: Record<MessagingProviderType, boolean>;
  }> {
    const results = {
      git: {} as Record<GitProviderType, boolean>,
      messaging: {} as Record<MessagingProviderType, boolean>,
    };

    // Check git providers
    await Promise.all(
      gitProviders.map(async ({ type, token }) => {
        try {
          const provider = providerFactory.createGitProvider(type);
          results.git[type] = await this.checkGitProvider(provider, token);
        } catch {
          results.git[type] = false;
        }
      })
    );

    // Check messaging providers
    await Promise.all(
      messagingProviders.map(async ({ type, token }) => {
        try {
          const provider = providerFactory.createMessagingProvider(type);
          results.messaging[type] = await this.checkMessagingProvider(
            provider,
            token
          );
        } catch {
          results.messaging[type] = false;
        }
      })
    );

    return results;
  }
}
