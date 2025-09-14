import { eq, and, count } from "drizzle-orm";

import { db } from "../client";
import {
  subscriptions,
  users,
  gitProviders,
  messagingProviders,
  cronJobs,
  type Subscription,
  type NewSubscription,
} from "../schema";

/**
 * Interface for user usage counts
 */
export interface UserUsage {
  gitProvidersCount: number;
  messagingProvidersCount: number;
  cronJobsCount: number;
}

/**
 * Create a new subscription for a user
 */
export async function createSubscription(
  subscriptionData: NewSubscription
): Promise<Subscription> {
  const [subscription] = await db
    .insert(subscriptions)
    .values({
      ...subscriptionData,
      updatedAt: new Date(),
    })
    .returning();

  return subscription;
}

/**
 * Get subscription by user ID
 */
export async function getSubscriptionByUserId(
  userId: string
): Promise<Subscription | null> {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  return subscription || null;
}

/**
 * Get subscription by Stripe customer ID
 */
export async function getSubscriptionByStripeCustomerId(
  stripeCustomerId: string
): Promise<Subscription | null> {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeCustomerId, stripeCustomerId))
    .limit(1);

  return subscription || null;
}

/**
 * Get subscription by Stripe subscription ID
 */
export async function getSubscriptionByStripeSubscriptionId(
  stripeSubscriptionId: string
): Promise<Subscription | null> {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);

  return subscription || null;
}

/**
 * Update subscription information
 */
export async function updateSubscription(
  userId: string,
  updates: Partial<Omit<Subscription, "id" | "userId" | "createdAt">>
): Promise<Subscription | null> {
  const [subscription] = await db
    .update(subscriptions)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.userId, userId))
    .returning();

  return subscription || null;
}

/**
 * Update subscription by Stripe customer ID
 */
export async function updateSubscriptionByStripeCustomerId(
  stripeCustomerId: string,
  updates: Partial<Omit<Subscription, "id" | "userId" | "createdAt">>
): Promise<Subscription | null> {
  const [subscription] = await db
    .update(subscriptions)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeCustomerId, stripeCustomerId))
    .returning();

  return subscription || null;
}

/**
 * Update subscription by Stripe subscription ID
 */
export async function updateSubscriptionByStripeSubscriptionId(
  stripeSubscriptionId: string,
  updates: Partial<Omit<Subscription, "id" | "userId" | "createdAt">>
): Promise<Subscription | null> {
  const [subscription] = await db
    .update(subscriptions)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .returning();

  return subscription || null;
}

/**
 * Create or update subscription (upsert by user ID)
 */
export async function upsertSubscription(
  subscriptionData: NewSubscription
): Promise<Subscription> {
  const [subscription] = await db
    .insert(subscriptions)
    .values({
      ...subscriptionData,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        stripeCustomerId: subscriptionData.stripeCustomerId,
        stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
        tier: subscriptionData.tier,
        status: subscriptionData.status,
        currentPeriodStart: subscriptionData.currentPeriodStart,
        currentPeriodEnd: subscriptionData.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
        updatedAt: new Date(),
      },
    })
    .returning();

  return subscription;
}

/**
 * Delete subscription by user ID
 */
export async function deleteSubscription(userId: string): Promise<boolean> {
  const result = await db
    .delete(subscriptions)
    .where(eq(subscriptions.userId, userId));
  return (result.rowCount ?? 0) > 0;
}

/**
 * Get current usage counts for a user
 */
export async function getUserUsage(userId: string): Promise<UserUsage> {
  // Execute all count queries in parallel for better performance
  const [gitProvidersResult, messagingProvidersResult, cronJobsResult] =
    await Promise.all([
      db
        .select({ count: count() })
        .from(gitProviders)
        .where(eq(gitProviders.userId, userId)),
      db
        .select({ count: count() })
        .from(messagingProviders)
        .where(eq(messagingProviders.userId, userId)),
      db
        .select({ count: count() })
        .from(cronJobs)
        .where(eq(cronJobs.userId, userId)),
    ]);

  return {
    gitProvidersCount: gitProvidersResult[0]?.count ?? 0,
    messagingProvidersCount: messagingProvidersResult[0]?.count ?? 0,
    cronJobsCount: cronJobsResult[0]?.count ?? 0,
  };
}

/**
 * Get subscription with user information
 */
export async function getSubscriptionWithUser(userId: string): Promise<
  | (Subscription & {
      user: {
        id: string;
        email: string;
        clerkId: string;
      };
    })
  | null
> {
  const [result] = await db
    .select({
      // Subscription fields
      id: subscriptions.id,
      userId: subscriptions.userId,
      stripeCustomerId: subscriptions.stripeCustomerId,
      stripeSubscriptionId: subscriptions.stripeSubscriptionId,
      tier: subscriptions.tier,
      status: subscriptions.status,
      currentPeriodStart: subscriptions.currentPeriodStart,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
      createdAt: subscriptions.createdAt,
      updatedAt: subscriptions.updatedAt,
      // User fields
      user: {
        id: users.id,
        email: users.email,
        clerkId: users.clerkId,
      },
    })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.userId, users.id))
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  return result || null;
}

/**
 * Get all subscriptions with a specific status
 */
export async function getSubscriptionsByStatus(
  status: Subscription["status"]
): Promise<Subscription[]> {
  return await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.status, status));
}

/**
 * Get subscriptions that are set to cancel at period end
 */
export async function getSubscriptionsCancelingAtPeriodEnd(): Promise<
  Subscription[]
> {
  return await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.cancelAtPeriodEnd, true),
        eq(subscriptions.status, "active")
      )
    );
}

/**
 * Get subscriptions with expired periods (for cleanup/downgrade processing)
 */
export async function getExpiredSubscriptions(): Promise<Subscription[]> {
  return await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.tier, "pro"),
        eq(subscriptions.status, "active")
        // Note: We'll handle period end checking in the application logic
        // since we need to compare with current timestamp
      )
    );
}

/**
 * Initialize subscription for existing user (Free tier with Stripe customer)
 */
export async function initializeUserSubscription(
  userId: string,
  stripeCustomerId: string
): Promise<Subscription> {
  return await upsertSubscription({
    userId,
    stripeCustomerId,
    tier: "free",
    status: "active",
  });
}

/**
 * Synchronize subscription status from Stripe data
 */
export async function syncSubscriptionFromStripe(
  stripeCustomerId: string,
  stripeData: {
    subscriptionId?: string;
    tier: "free" | "pro";
    status: Subscription["status"];
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
  }
): Promise<Subscription | null> {
  return await updateSubscriptionByStripeCustomerId(stripeCustomerId, {
    stripeSubscriptionId: stripeData.subscriptionId,
    tier: stripeData.tier,
    status: stripeData.status,
    currentPeriodStart: stripeData.currentPeriodStart,
    currentPeriodEnd: stripeData.currentPeriodEnd,
    cancelAtPeriodEnd: stripeData.cancelAtPeriodEnd ?? false,
  });
}

// ===== USAGE TRACKING FUNCTIONS =====
