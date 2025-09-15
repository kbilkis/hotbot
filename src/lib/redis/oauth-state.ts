import { redis, REDIS_KEYS, TTL } from "./config";

interface OAuthState {
  userId: string;
  redirectUri: string;
  createdAt: string;
}

export class OAuthStateManager {
  /**
   * Generate and store OAuth state tied to user session
   */
  static async generateState(
    userId: string,
    redirectUri: string
  ): Promise<string> {
    const state = crypto.randomUUID();
    const stateData: OAuthState = {
      userId,
      redirectUri,
      createdAt: new Date().toISOString(),
    };

    const serializedData = JSON.stringify(stateData);

    // Store with TTL (automatically expires after 10 minutes)
    await redis.setex(
      `${REDIS_KEYS.OAUTH_STATE}${state}`,
      TTL.OAUTH_STATE,
      serializedData
    );

    return state;
  }

  /**
   * Validate and consume OAuth state (one-time use)
   * Returns the state data if valid, null if invalid/expired/already used
   */
  static async validateAndConsumeState(
    state: string,
    expectedUserId: string
  ): Promise<OAuthState | null> {
    const key = `${REDIS_KEYS.OAUTH_STATE}${state}`;

    // Get the state data
    const stateDataStr = await redis.get(key);

    if (!stateDataStr) {
      return null; // State not found or expired
    }

    // Delete the state immediately (one-time use)
    await redis.del(key);

    try {
      // Handle case where Upstash Redis returns an object instead of string
      // This happens because Upstash automatically deserializes JSON
      let stateData: OAuthState;

      if (typeof stateDataStr === "string") {
        stateData = JSON.parse(stateDataStr);
      } else if (typeof stateDataStr === "object" && stateDataStr !== null) {
        // Upstash already deserialized it for us
        stateData = stateDataStr as OAuthState;
      } else {
        throw new Error(`Unexpected state data type: ${typeof stateDataStr}`);
      }

      // Validate that state belongs to the expected user
      if (stateData.userId !== expectedUserId) {
        console.warn(
          `OAuth state validation failed: state belongs to user ${stateData.userId}, but expected ${expectedUserId}`
        );
        return null;
      }

      // Additional validation: check if not expired (redundant but safe)
      const createdAt = new Date(stateData.createdAt);
      const now = new Date();
      const ageInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

      if (ageInMinutes > 10) {
        console.warn(
          `OAuth state validation failed: state is ${ageInMinutes} minutes old`
        );
        return null;
      }

      return stateData;
    } catch (error) {
      console.error("Failed to parse OAuth state data:", error);
      return null;
    }
  }

  /**
   * Clean up expired states (optional, Redis TTL handles this automatically)
   */
  static async cleanupExpiredStates(): Promise<void> {
    // This is optional since Redis TTL handles cleanup automatically
    // But can be useful for manual cleanup or monitoring
    try {
      const keys = await redis.keys(`${REDIS_KEYS.OAUTH_STATE}*`);
      const now = new Date();

      for (const key of keys) {
        const stateDataStr = await redis.get(key);
        if (stateDataStr) {
          try {
            const stateData: OAuthState = JSON.parse(stateDataStr as string);
            const createdAt = new Date(stateData.createdAt);
            const ageInMinutes =
              (now.getTime() - createdAt.getTime()) / (1000 * 60);

            if (ageInMinutes > 10) {
              await redis.del(key);
            }
          } catch (error) {
            // Invalid data, delete it
            await redis.del(key);
          }
        }
      }
    } catch (error) {
      console.error("Failed to cleanup expired OAuth states:", error);
    }
  }
}
