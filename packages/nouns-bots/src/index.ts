import { getAuctionStartedTweetText, getNounOwnerAddress, getNounPngBuffer } from './utils';
import { getLastAuctionId } from './subgraph';
import { twitter } from './clients';
import { getAuctionCache, getLastTwitterMentionIdProcessed, upsertAuctionCache } from './redis';
import { ethers } from 'ethers';

/**
 * Process the last auction, update cache and push socials if new auction discovered
 */
async function processLastAuction() {
  const cachedAuctionId = await getAuctionCache();
  const lastAuctionId = await getLastAuctionId();
  console.log(`processLastAuction cachedAuctionId(${cachedAuctionId}) lastAuctionId(${lastAuctionId})`);

  if (cachedAuctionId < lastAuctionId) {
    const png = await getNounPngBuffer(lastAuctionId.toString());
    if(png) {
      console.log(`processLastAuction tweeting discovered auction id and noun`);
      const mediaId = await twitter.v1.uploadMedia(png, { type: 'png' });
      await twitter.v1.tweet(
        getAuctionStartedTweetText(lastAuctionId),
        {
          media_ids: mediaId,
        },
      );
    } else {
      console.error(`Error generating png for noun auction ${lastAuctionId}`);
    }
    await upsertAuctionCache(lastAuctionId);
  }
}

async function processTwitterMentions() {
  const lastMentionIdProcessed = await getLastTwitterMentionIdProcessed();
  const mentionTimeline = await twitter.v1.mentionTimeline(
    {
      since_id: '1413744415995097089', // lastMentionIdProcessed,
      trim_user: true,
    },
  );
  if (mentionTimeline.tweets.length > 0) {
    let mostRecentTweetId: string | undefined;
    for await (const tweet of mentionTimeline) {
      if (mostRecentTweetId === undefined) {
        // mention timeline is processed top down (most recent first)
        mostRecentTweetId = tweet.id_str;
      }
      const { full_text, user } = tweet;
      if (full_text?.startsWith('@nounsDAOBot verify')) {
        const [_, __, nounId, sig] = full_text.split(' ');
        const nounOwner = await getNounOwnerAddress(nounId);
        const recoveredAddress = ethers.utils.verifyMessage(nounId, sig);
        console.log('checking nounOwner and recAddress', nounOwner, recoveredAddress);
        if (nounOwner && nounOwner === recoveredAddress) {
          console.log('following...');
          const currentUser = await twitter.currentUser();
          await twitter.v2.follow(currentUser.id_str, user.id_str);
        }
      }
    }
  }
}

setInterval(
  async () => processLastAuction(),
  30000,
);

processLastAuction().then(
  () => 'processLastAuction',
);

setInterval(
  async () => processTwitterMentions(),
  30000,
);

processTwitterMentions().then(
  () => 'processTwitterMentions',
);
