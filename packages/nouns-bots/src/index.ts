import { getAuctionCache, getAuctionStartedTweetText, getNounPngBuffer, updateAuctionCache } from './utils';
import { getLastAuctionId } from './subgraph';
import { twitter } from './clients';

/**
 * Process the last auction, update cache and push socials if new auction discovered
 */
async function processLastAuction() {
  const cachedAuctionId = await getAuctionCache();
  const lastAuctionId = await getLastAuctionId();
  console.log('cachedAuctionId', cachedAuctionId);
  console.log('lastAuctionId', lastAuctionId);

  if (cachedAuctionId < lastAuctionId) {
    const png = await getNounPngBuffer(lastAuctionId.toString());
    if(png) {
      const mediaId = await twitter.v1.uploadMedia(png, { type: 'png' });
      await twitter.v1.tweet(
        getAuctionStartedTweetText(lastAuctionId),
        {
          media_ids: mediaId,
        },
      );
    }
    await updateAuctionCache(lastAuctionId);
  }
}

async function a() {
  const res = await twitter.v1.mentionTimeline(
    {
      since_id: '1413744415995097000',
    }
  );
  for await (const tweet of res) {
    console.log('tweet', tweet);
  }

  // const currentUser = await twitter.currentUser();
  // console.log('id str', currentUser.id_str)
  // const res2 = await twitter.v2.follow(currentUser.id_str, '1075129604614938624');
  // console.log('follow', res2)
}

// setInterval(
//   async () => processLastAuction(),
//   30000,
// )

a().then(
  () => 'processLastAuction',
);
