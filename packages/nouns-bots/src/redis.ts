import { redis } from "./clients";
import { getLastAuctionId } from "./subgraph";

export const lastAuctionCacheKey = 'NOUNS_AUCTION_CACHE';
export const lastTwitterMentionIdProcessedCacheKey = 'LAST_TWITTER_MENTION_PROCESSED';

/**
 * Get the current cache contents or 0 if empty
 * @returns The current cache contents as number or 0 if null
 */
export async function getAuctionCache(): Promise<number> {
  const auctionId = await redis.get(lastAuctionCacheKey);
  if (auctionId) {
    return Number(auctionId);
  }
  return 0;
}

/**
 * Update the auction cache with `id`
 * @param id 
 */
export async function upsertAuctionCache(id: number) {
  await redis.set(lastAuctionCacheKey, id);
}

export async function getLastTwitterMentionIdProcessed(): Promise<string | undefined> {
  const id = await redis.get(lastTwitterMentionIdProcessedCacheKey);
  if (id) {
    return id;
  }
  return undefined;
}

export async function upsertLastTwitterMentionIdProcessed(id: string) {
  await redis.set(lastTwitterMentionIdProcessedCacheKey, id);
}
