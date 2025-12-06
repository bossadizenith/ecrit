import { redis } from "./redis";

/**
 * Get cached value
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key);
    if (!cached) return null;

    if (typeof cached === "string") {
      if (cached === "[object Object]") {
        await redis.del(key);
        return null;
      }
      return JSON.parse(cached) as T;
    }

    if (typeof cached === "object" && cached !== null) {
      return cached as T;
    }

    return null;
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error);
    try {
      await redis.del(key);
    } catch (delError) {
      // Ignore delete errors
    }
    return null;
  }
}

/**
 * Set cached value
 */
export async function setCache(
  key: string,
  value: unknown,
  ttl?: number
): Promise<void> {
  try {
    let serialized: string;
    if (typeof value === "string") {
      serialized = value;
    } else {
      serialized = JSON.stringify(value);
    }

    if (ttl) {
      await redis.setex(key, ttl, serialized);
    } else {
      await redis.set(key, serialized);
    }
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error);
  }
}

/**
 * Delete cached value
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`Cache delete error for key ${key}:`, error);
  }
}

/**
 * Delete multiple cache keys by pattern
 * Note: Redis KEYS command can be slow on large datasets.
 * Consider using SCAN for production with many keys.
 */
export async function deleteCacheByPattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(`Cache delete pattern error for ${pattern}:`, error);
  }
}

/**
 * Delete multiple cache keys
 */
export async function deleteCacheKeys(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch (error) {
    console.error(`Cache delete keys error:`, error);
  }
}
