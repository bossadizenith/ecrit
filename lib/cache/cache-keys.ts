/**
 * Cache key generators for consistent cache key naming
 * Format: {resource}:{action}:{params}
 */

export const cacheKeys = {
  note: (userId: string, id: string) => `note:${userId}:${id}`,
  noteBySlug: (userId: string, slug: string) => `note:slug:${userId}:${slug}`,
  notesList: (
    userId: string,
    page?: string,
    limit?: string,
    search?: string
  ) => {
    const params = [userId, page || "1", limit || "10", search || ""].join(":");
    return `notes:list:${params}`;
  },
};
