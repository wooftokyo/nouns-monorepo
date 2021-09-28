import { useContractCall, useEthers } from '@usedapp/core';
import { BigNumber as EthersBN, utils, Contract } from 'ethers';
import { NounsTokenABI } from '@nouns/contracts';
import config from '../config';
import { useLogs } from '../hooks/useLogs';
import { useMemo } from 'react';

interface NounToken {
  name: string;
  description: string;
  image: string;
}

interface TransferLog {
  blockNumber: string;
  to: string;
  from: string;
  tokenId: string;
}

interface DelegateChangedLog {
  blockNumber: string;
  to: string;
  from: string;
  delegator: string;
}

export interface INounSeed {
  accessory: number;
  background: number;
  body: number;
  glasses: number;
  head: number;
}

export interface TokenOwnership {
  owner: string;
  delegate?: string;
}

// keyed by `tokenId`
export interface TokenOwnershipsByTokenId {
  [key: string]: TokenOwnership;
}

// keyed by `BlockNumber`
export interface TokenOwnershipsByBlock {
  [key: string]: TokenOwnershipsByTokenId;
}

const abi = new utils.Interface(NounsTokenABI);
const contract = new Contract(config.tokenAddress, abi);
const delegateChangedFilter = contract.filters?.DelegateChanged();
const transferFilter = contract.filters?.Transfer();

export const useNounToken = (nounId: EthersBN) => {
  const [noun] =
    useContractCall<[string]>({
      abi,
      address: config.tokenAddress,
      method: 'dataURI',
      args: [nounId],
    }) || [];

  if (!noun) {
    return;
  }

  const nounImgData = noun.split(';base64,').pop() as string;
  const json: NounToken = JSON.parse(atob(nounImgData));

  return json;
};

export const useNounSeed = (nounId: EthersBN) => {
  const seed = useContractCall<INounSeed>({
    abi,
    address: config.tokenAddress,
    method: 'seeds',
    args: [nounId],
  });
  return seed;
};

export const useUserVotes = (): number | undefined => {
  const { account } = useEthers();
  const [votes] =
    useContractCall<[EthersBN]>({
      abi,
      address: config.tokenAddress,
      method: 'getCurrentVotes',
      args: [account],
    }) || [];
  return votes?.toNumber();
};

export const useUserDelegatee = (): string | undefined => {
  const { account } = useEthers();
  const [delegate] =
    useContractCall<[string]>({
      abi,
      address: config.tokenAddress,
      method: 'delegates',
      args: [account],
    }) || [];
  return delegate;
};

export const useUserVotesAsOfBlock = (block: number | undefined): number | undefined => {
  const { account } = useEthers();

  // Check for available votes
  const [votes] =
    useContractCall<[EthersBN]>({
      abi,
      address: config.tokenAddress,
      method: 'getPriorVotes',
      args: [account, block],
    }) || [];
  return votes?.toNumber();
};

export const useDelegateChangedLogs = (): DelegateChangedLog[] | undefined => {
  const useLogsResult = useLogs(delegateChangedFilter);
  return useMemo(() => {
    return useLogsResult?.logs?.map(log => {
      const { args: parsed } = abi.parseLog(log);
      return {
        blockNumber: log.blockNumber.toString(),
        delegator: parsed.delegator,
        from: parsed.fromDelegate,
        to: parsed.toDelegate,
      };
    });
  }, [useLogsResult]);
};

export const useTransferLogs = (): TransferLog[] | undefined => {
  const useLogsResult = useLogs(transferFilter);
  return useMemo(() => {
    return useLogsResult?.logs
      ?.map(log => {
        const {
          args: { from, to, tokenId },
        } = abi.parseLog(log);
        return {
          blockNumber: log.blockNumber.toString(),
          from: from,
          to: to,
          tokenId: tokenId.toString(),
        };
      })
      .filter(log => {
        return (
          log.from === '0x0000000000000000000000000000000000000000' ||
          log.to.toLowerCase() === config.auctionProxyAddress.toLowerCase()
        );
      });
  }, [useLogsResult]);
};

export const useTokenOwnerDataByBlock = (): TokenOwnershipsByBlock => {
  const formattedTransferLogs: TransferLog[] | undefined = useTransferLogs();
  const formattedDelegateLogs: DelegateChangedLog[] | undefined = useDelegateChangedLogs();

  return useMemo(() => {
    if (!formattedTransferLogs || formattedTransferLogs.length == 0 || !formattedDelegateLogs)
      return {};

    const logs = [...formattedTransferLogs, ...formattedDelegateLogs].sort(
      (a, b) => Number(a.blockNumber) - Number(b.blockNumber),
    );

    const blocks: TokenOwnershipsByBlock = {};

    logs.forEach((log, i) => {
      let { blockNumber, from, to } = log;

      // If there is no record of this block, create a new one
      if (!blocks[blockNumber]) {
        // If this is the first event, create an emtpy block
        // Otherwise clone from the previous block's data
        blocks[blockNumber] = i == 0 ? {} : { ...blocks[logs[i - 1].blockNumber] };
      }

      const block: TokenOwnershipsByTokenId = blocks[blockNumber];

      // Is this a `DelegateChanged` event?
      const { delegator } = log as DelegateChangedLog;

      if (delegator) {
        Object.keys(block).forEach(tokenId => {
          let token: TokenOwnership = block[tokenId];

          if (token.owner === delegator) {
            token = { ...token }; // clone tokenId token before updating it
            token.delegate = to;
            if (token.owner === token.delegate) {
              delete token.delegate;
            }
            block[tokenId] = token; // assign the clone back
          }
        });
        return;
      }

      // This is a `Transfer` Event!
      const { tokenId } = log as TransferLog;

      // Find a token that is owned by the same recipient
      const ownedTokenId: string | undefined = Object.keys(block).find(
        tokenId => block[tokenId].owner == to,
      );

      if (ownedTokenId) {
        // If found, clone over its owner and delegate data
        block[tokenId] = { ...block[ownedTokenId] };
      } else {
        // otherwise assign ownership
        block[tokenId] = { owner: to };
      }
    });

    return blocks;
  }, [formattedTransferLogs, formattedDelegateLogs]);
};
