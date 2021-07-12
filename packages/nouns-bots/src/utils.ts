import sharp from 'sharp';
import { isError, tryF } from 'ts-try';
import { nounsTokenContract } from './clients';
import { TokenMetadata } from './types';

/**
 * Get tweet text for auction started.
 * @param auctionId The started auction id.
 * @returns Text to be used in tweet when auction starts.
 */
export function getAuctionStartedTweetText(auctionId: string | number) {
  return `An auction has started for noun #${auctionId}!
        
  Learn more at https://nouns.wtf`;
}

/**
 * Get the PNG buffer data of a Noun
 * @param tokenId The ERC721 token id
 * @returns The png buffer of the Noun or undefined
 */
export async function getNounPngBuffer(tokenId: string): Promise<Buffer | undefined> {
  const dataURI = await tryF(() => nounsTokenContract.dataURI(tokenId));
  if (isError(dataURI)) {
    console.error(`Error fetching dataURI for token ID ${tokenId}: ${dataURI.message}`);
    return;
  }

  const data: TokenMetadata = JSON.parse(
    Buffer.from(dataURI.substring(29), 'base64').toString('ascii'),
  );
  const svg = Buffer.from(data.image.substring(26), 'base64');
  return sharp(svg).png().toBuffer();
}

export async function getNounOwnerAddress(tokenId: string): Promise<string | undefined> {
  const owner = await tryF(() => nounsTokenContract.ownerOf(tokenId));
  if (isError(owner)) {
    console.error(`Error fetching ownerOf for token ID ${tokenId}: ${owner.message}`);
    return;
  }
  return owner;
}
