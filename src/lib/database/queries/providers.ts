import { eq, and } from "drizzle-orm";
import { db } from "../client";
import {
  gitProviders,
  messagingProviders,
  type GitProvider,
  type NewGitProvider,
  type MessagingProvider,
  type NewMessagingProvider,
} from "../schema";

// Git Provider Queries

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
        repositories: providerData.repositories,
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
  userId: number
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
  userId: number,
  provider: "github" | "bitbucket" | "gitlab"
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
  id: number
): Promise<GitProvider | null> {
  const [provider] = await db
    .select()
    .from(gitProviders)
    .where(eq(gitProviders.id, id))
    .limit(1);

  return provider || null;
}

/**
 * Update git provider tokens
 */
export async function updateGitProviderTokens(
  id: number,
  tokens: {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }
): Promise<GitProvider | null> {
  const [provider] = await db
    .update(gitProviders)
    .set({
      ...tokens,
      updatedAt: new Date(),
    })
    .where(eq(gitProviders.id, id))
    .returning();

  return provider || null;
}

/**
 * Delete git provider connection
 */
export async function deleteGitProvider(
  userId: number,
  provider: "github" | "bitbucket" | "gitlab"
): Promise<boolean> {
  const result = await db
    .delete(gitProviders)
    .where(
      and(eq(gitProviders.userId, userId), eq(gitProviders.provider, provider))
    );

  return (result.rowCount ?? 0) > 0;
}

// Messaging Provider Queries

/**
 * Create or update a messaging provider connection
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
      target: [
        messagingProviders.userId,
        messagingProviders.provider,
        messagingProviders.channelId,
      ],
      set: {
        accessToken: providerData.accessToken,
        refreshToken: providerData.refreshToken,
        channelName: providerData.channelName,
        expiresAt: providerData.expiresAt,
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
  userId: number
): Promise<MessagingProvider[]> {
  return await db
    .select()
    .from(messagingProviders)
    .where(eq(messagingProviders.userId, userId));
}

/**
 * Get specific messaging provider for a user
 */
export async function getUserMessagingProvider(
  userId: number,
  provider: "slack" | "teams" | "discord",
  channelId?: string
): Promise<MessagingProvider | null> {
  const conditions = [
    eq(messagingProviders.userId, userId),
    eq(messagingProviders.provider, provider),
  ];

  if (channelId) {
    conditions.push(eq(messagingProviders.channelId, channelId));
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
  id: number
): Promise<MessagingProvider | null> {
  const [provider] = await db
    .select()
    .from(messagingProviders)
    .where(eq(messagingProviders.id, id))
    .limit(1);

  return provider || null;
}

/**
 * Update messaging provider tokens
 */
export async function updateMessagingProviderTokens(
  id: number,
  tokens: {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }
): Promise<MessagingProvider | null> {
  const [provider] = await db
    .update(messagingProviders)
    .set({
      ...tokens,
      updatedAt: new Date(),
    })
    .where(eq(messagingProviders.id, id))
    .returning();

  return provider || null;
}

/**
 * Delete messaging provider connection
 */
export async function deleteMessagingProvider(
  userId: number,
  provider: "slack" | "teams" | "discord",
  channelId?: string
): Promise<boolean> {
  const conditions = [
    eq(messagingProviders.userId, userId),
    eq(messagingProviders.provider, provider),
  ];

  if (channelId) {
    conditions.push(eq(messagingProviders.channelId, channelId));
  }

  const result = await db.delete(messagingProviders).where(and(...conditions));

  return (result.rowCount ?? 0) > 0;
}
