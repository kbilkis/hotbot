import { eq, count } from "drizzle-orm";

import { db } from "../client";
import {
  subscriptions,
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
  activeRepositoriesCount: number;
  activeRepositories: string[];
  cronJobsCount: number;
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
 * Update subscription by Stripe customer ID
 */
async function updateSubscriptionByStripeCustomerId(
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
 * Get current usage counts for a user
 */
export async function getUserUsage(userId: string): Promise<UserUsage> {
  // Execute all count queries in parallel for better performance
  const [
    gitProvidersResult,
    messagingProvidersResult,
    cronJobsResult,
    userCronJobs,
  ] = await Promise.all([
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
    // Get all cron jobs to extract unique repositories
    db
      .select({ repositories: cronJobs.repositories })
      .from(cronJobs)
      .where(eq(cronJobs.userId, userId)),
  ]);

  // Extract unique repositories from all cron jobs
  const allRepositories = new Set<string>();
  for (const job of userCronJobs) {
    if (job.repositories) {
      for (const repo of job.repositories) {
        allRepositories.add(repo);
      }
    }
  }

  const activeRepositories = Array.from(allRepositories);

  return {
    gitProvidersCount: gitProvidersResult[0]?.count ?? 0,
    messagingProvidersCount: messagingProvidersResult[0]?.count ?? 0,
    activeRepositoriesCount: activeRepositories.length,
    activeRepositories,
    cronJobsCount: cronJobsResult[0]?.count ?? 0,
  };
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
