import { eq, and } from "drizzle-orm";

import { db } from "../client";
import {
  GitProvider,
  gitProviders,
  GitProviderType,
  MessagingProvider,
  messagingProviders,
  MessagingProviderType,
  NewGitProvider,
  NewMessagingProvider,
} from "../schema";

/**
 * Create or update a git provider connection
 */
export async function upsertGitProvider(
  providerData: NewGitProvider
): Promise<GitProvider> {
  const [provider] = await db
    .insert(gitProviders)
    .values({
      ...providerData,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [gitProviders.userId, gitProviders.provider],
      set: {
        accessToken: providerData.accessToken,
        refreshToken: providerData.refreshToken,
        expiresAt: providerData.expiresAt,
        updatedAt: new Date(),
      },
    })
    .returning();

  return provider;
}

/**
 * Get all git providers for a user
 */
export async function getUserGitProviders(
  userId: string
): Promise<GitProvider[]> {
  return await db
    .select()
    .from(gitProviders)
    .where(eq(gitProviders.userId, userId));
}

/**
 * Get specific git provider for a user
 */
export async function getUserGitProvider(
  userId: string,
  provider: GitProviderType
): Promise<GitProvider | null> {
  const [result] = await db
    .select()
    .from(gitProviders)
    .where(
      and(eq(gitProviders.userId, userId), eq(gitProviders.provider, provider))
    )
    .limit(1);

  return result || null;
}

/**
 * Get git provider by ID
 */
export async function getGitProviderById(
  providerId: string
): Promise<GitProvider | null> {
  const [provider] = await db
    .select()
    .from(gitProviders)
    .where(eq(gitProviders.id, providerId))
    .limit(1);

  return provider || null;
}

/**
 * Get git provider by ID for a user
 */
export async function getUserGitProviderById(
  userId: string,
  providerId: string
): Promise<GitProvider | null> {
  const [result] = await db
    .select()
    .from(gitProviders)
    .where(
      and(eq(gitProviders.userId, userId), eq(gitProviders.id, providerId))
    )
    .limit(1);

  return result || null;
}

/**
 * Delete git provider connection
 */
export async function deleteGitProvider(
  userId: string,
  provider: GitProviderType
): Promise<boolean> {
  const result = await db
    .delete(gitProviders)
    .where(
      and(eq(gitProviders.userId, userId), eq(gitProviders.provider, provider))
    );

  return result.rowsAffected > 0;
}

// Messaging Provider Queries

/**
 * Create or update a messaging provider connection
 * Each user can have only one connection per provider (Slack, Teams, or Discord)
 */
export async function upsertMessagingProvider(
  providerData: NewMessagingProvider
): Promise<MessagingProvider> {
  const [provider] = await db
    .insert(messagingProviders)
    .values({
      ...providerData,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [messagingProviders.userId, messagingProviders.provider],
      set: {
        accessToken: providerData.accessToken,
        refreshToken: providerData.refreshToken,
        expiresAt: providerData.expiresAt,
        guildId: providerData.guildId, // Update guildId for Discord (user switching guilds)
        guildName: providerData.guildName,
        updatedAt: new Date(),
      },
    })
    .returning();

  return provider;
}

/**
 * Get all messaging providers for a user
 */
export async function getUserMessagingProviders(
  userId: string,
  provider?: MessagingProviderType
): Promise<MessagingProvider[]> {
  const conditions = [eq(messagingProviders.userId, userId)];

  if (provider) {
    conditions.push(eq(messagingProviders.provider, provider));
  }

  return await db
    .select()
    .from(messagingProviders)
    .where(and(...conditions));
}

/**
 * Get specific messaging provider for a user
 * For Discord, optionally specify guildId to get a specific guild connection
 */
export async function getUserMessagingProvider(
  userId: string,
  provider: MessagingProviderType,
  guildId?: string
): Promise<MessagingProvider | null> {
  const conditions = [
    eq(messagingProviders.userId, userId),
    eq(messagingProviders.provider, provider),
  ];

  // For Discord, if guildId is specified, filter by it
  if (provider === "discord" && guildId) {
    conditions.push(eq(messagingProviders.guildId, guildId));
  }

  const [result] = await db
    .select()
    .from(messagingProviders)
    .where(and(...conditions))
    .limit(1);

  return result || null;
}

/**
 * Get messaging provider by ID
 */
export async function getMessagingProviderById(
  providerId: string
): Promise<MessagingProvider | null> {
  const [provider] = await db
    .select()
    .from(messagingProviders)
    .where(eq(messagingProviders.id, providerId))
    .limit(1);

  return provider || null;
}

/**
 * Get messaging provider by ID and user ID (secure)
 */
export async function getUserMessagingProviderById(
  userId: string,
  providerId: string
): Promise<MessagingProvider | null> {
  const [provider] = await db
    .select()
    .from(messagingProviders)
    .where(
      and(
        eq(messagingProviders.id, providerId),
        eq(messagingProviders.userId, userId)
      )
    )
    .limit(1);

  return provider || null;
}

/**
 * Delete messaging provider connection
 * For Discord, optionally specify guildId to delete a specific guild connection
 */
export async function deleteMessagingProvider(
  userId: string,
  provider: MessagingProviderType,
  guildId?: string
): Promise<boolean> {
  const conditions = [
    eq(messagingProviders.userId, userId),
    eq(messagingProviders.provider, provider),
  ];

  // For Discord, if guildId is specified, only delete that guild connection
  if (provider === "discord" && guildId) {
    conditions.push(eq(messagingProviders.guildId, guildId));
  }

  const result = await db.delete(messagingProviders).where(and(...conditions));

  return result.rowsAffected > 0;
}
