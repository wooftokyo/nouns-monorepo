import chai from 'chai';
import { ethers, network } from 'hardhat';
import { BigNumber as EthersBN } from 'ethers';
import { solidity } from 'ethereum-waffle';
chai.use(solidity);
const { expect } = chai;

import {
  Sablier,
  Sablier__factory,
  NounsDaoLogicV1,
  NounsDaoLogicV1__factory,
  Weth,
  Weth__factory
} from '../../typechain';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import {
  mineBlock,
  address,
  encodeParameters,
  advanceBlocks,
  setNextBlockTimestamp,
  blockTimestamp
} from '../utils';

async function impersonateAccount(address: string){
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address]}
  )
}

async function stopImpersonatingAccount(address: string){
  await network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: [address]}
  )
}

async function networkReset(){
  await network.provider.request({
    method: "hardhat_reset",
    params: [{
      forking: {
        jsonRpcUrl: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_PROJECT_ID}`,
        blockNumber: 13269358
      }
    }]
  })
}

describe('Fund Nouns DAO proposal using Sablier streams', async () => {

  // Mainnet address constants
  const NOUN_OWNER_ADDRESS = "0x2573c60a6d127755aa2dc85e342f7da2378a0cc5"; // Noun owner that can propose and reach quorum
  const NOUNS_DAO_PROXY_ADDRESS = "0x6f3E6272A167e8AcCb32072d08E0957F9c79223d";
  const NOUNS_EXECUTOR = "0x0BC3807Ec262cB779b38D65b38158acC3bfedE10";
  const SABLIER_ADDRESS = "0xCD18eAa163733Da39c232722cBC4E8940b1D8888";
  const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

  // Governance delays
  let votingDelay: number;
  let votingPeriod: number;

  // Proposal Config
  const targets: string[] = [];
  const values: string[] = [];
  const signatures: string[] = [];
  const callDatas: string[] = [];

  let proposalId: number;

  let nounOwner: any;
  let gov: NounsDaoLogicV1;
  let sablier: Sablier;
  let weth: Weth;
  let recipient: SignerWithAddress;
  let sender: SignerWithAddress;


  // Stream Parameters
  const TWO_WEEKS: number = 1209600; // in seconds
  const FUNDING_DURATION: number = TWO_WEEKS;
  const FUNDING_RATE_PER_SECOND: EthersBN = EthersBN.from("100000000"); // 100 million wei per second funding; makes testing easier as stream payments must be divisible by their duration.
  const FUNDING_AMOUNT: string = FUNDING_RATE_PER_SECOND.mul(FUNDING_DURATION).toString() // This stream pays 0.00012096 ETH
  const NOW = Math.floor(Date.now()/1000)
  const STREAM_START_TIME = NOW + TWO_WEEKS; // Streams must start no earlier than the block they were mined, but Nouns DAO proposals take about 1 week to execute. Make sure STREAM_START_TIME is not before NounsDAOExecutor executes by making it 2 weeks in the future
  const STREAM_STOP_TIME = STREAM_START_TIME + FUNDING_DURATION;

  let streamId: number;  // We will use `nextStreamId` to cache this for testing. Normally it would be retrieved from the `CreateStream` event log

  before(async () => {
    [recipient] = await ethers.getSigners();

    await networkReset()

    nounOwner = await ethers.provider.getSigner(NOUN_OWNER_ADDRESS)
    sablier = Sablier__factory.connect(SABLIER_ADDRESS, ethers.provider)
    weth = Weth__factory.connect(WETH_ADDRESS, ethers.provider)
    gov = NounsDaoLogicV1__factory.connect(NOUNS_DAO_PROXY_ADDRESS, ethers.provider)
    votingDelay = (await gov.votingPeriod()).toNumber()
    votingPeriod = (await gov.votingDelay()).toNumber()
    streamId = (await sablier.nextStreamId()).toNumber()

    // NOUN_OWNER does not have enough funds to execute transactions
    // Use a Mainnet address with a lot of ETH to send some
    await impersonateAccount(WETH_ADDRESS)
    const whale = await ethers.provider.getSigner(WETH_ADDRESS)
    await whale.sendTransaction({
      value: ethers.utils.parseUnits('10', 'ether'),
      to: NOUN_OWNER_ADDRESS
    })
    await stopImpersonatingAccount(WETH_ADDRESS)
  });

  it('should allow WETH deposit, approve, create stream', async () => {
    // Proposal Config
    const targets: string[] = [];
    const values: string[] = [];
    const signatures: string[] = [];
    const callDatas: string[] = [];
    const description = 'Use Sablier to stream funds';

    await setNextBlockTimestamp(NOW, false);

    // Action 1. Deposit ETH to get WETH
    targets.push(WETH_ADDRESS);
    values.push(FUNDING_AMOUNT);
    signatures.push('deposit()');
    callDatas.push('0x');

    // Action 2. Approve Sablier to spend FUNDING_AMOUNT of WETH
    targets.push(WETH_ADDRESS);
    values.push('0');
    signatures.push('approve(address,uint256)');
    callDatas.push(encodeParameters(['address','uint256'], [SABLIER_ADDRESS, FUNDING_AMOUNT]) )

    // Action 3. Create stream funding
    targets.push(SABLIER_ADDRESS);
    values.push('0');
    signatures.push('createStream(address,uint256,address,uint256,uint256)')
    callDatas.push(encodeParameters(['address','uint256','address','uint256','uint256'],[recipient.address,FUNDING_AMOUNT,WETH_ADDRESS, STREAM_START_TIME, STREAM_STOP_TIME]) )

    await impersonateAccount(NOUN_OWNER_ADDRESS)
    await gov.connect(nounOwner).propose(targets, values, signatures, callDatas, description)

    proposalId = (await gov.latestProposalIds(NOUN_OWNER_ADDRESS)).toNumber();

    // Wait for votingDelay
    console.log('Advancing past voting delay:',votingDelay,'blocks');
    await advanceBlocks(votingDelay);

    // Cast vote for proposal
    await gov.connect(nounOwner).castVote(proposalId, 1);

    // Wait for votingPeriod
    console.log('Advancing past voting period:',votingPeriod + 1,'blocks');
    await advanceBlocks(votingPeriod + 1);

    await gov.connect(nounOwner).queue(proposalId);

    // Wait for timelock
    console.log('Advancing to timelock delay')
    const { eta } = await gov.proposals(proposalId);
    await setNextBlockTimestamp(eta.toNumber(), false);

    await gov.connect(nounOwner).execute(proposalId);

    expect(await gov.state(proposalId)).to.equal(7) // EXECUTED
  });

  it('should allow recipient to withdraw proportional funds', async () => {
    await setNextBlockTimestamp(STREAM_START_TIME + (FUNDING_DURATION/10), false); // 10% through funding duration

    await sablier.connect(recipient).withdrawFromStream(streamId, 1) // withdraw 1 WEI

    expect(await sablier.connect(recipient).balanceOf(streamId, recipient.address)).to.equal(EthersBN.from(FUNDING_AMOUNT).div(10).sub(1)) // Owed 10% of funding amount minus 1 wei

    expect(await weth.balanceOf(recipient.address)).to.equal(1) // WETH balance == stream withdraw amount of 1 wei
  });

  it('should allow Nouns DAO to cancel stream', async () => {
    // Proposal Config
    const targets: string[] = [];
    const values: string[] = [];
    const signatures: string[] = [];
    const callDatas: string[] = [];
    const description = 'Cancel Sablier stream';

    await setNextBlockTimestamp(STREAM_START_TIME + (FUNDING_DURATION/5), false); // 20% through funding duration

    // Action 1. Cancel stream
    targets.push(SABLIER_ADDRESS);
    values.push('0');
    signatures.push('cancelStream(uint256)')
    callDatas.push(encodeParameters(['uint256'],[streamId.toString()]) )

    await gov.connect(nounOwner).propose(targets, values, signatures, callDatas, description)

    proposalId = (await gov.latestProposalIds(NOUN_OWNER_ADDRESS)).toNumber();

    // Wait for votingDelay
    console.log('Advancing past voting delay:',votingDelay,'blocks');
    await advanceBlocks(votingDelay);

    // cast vote for proposal
    await gov.connect(nounOwner).castVote(proposalId, 1);

    // Wait for votingPeriod
    console.log('Advancing past voting period:',votingPeriod + 1,'blocks');
    await advanceBlocks(votingPeriod + 1);

    await gov.connect(nounOwner).queue(proposalId);

    // Wait for timelock
    console.log('Advancing to timelock delay')
    const { eta } = await gov.proposals(proposalId);

    await setNextBlockTimestamp(eta.toNumber(), false);

    await gov.connect(nounOwner).execute(proposalId);

    expect(await gov.state(proposalId)).to.equal(7) // EXECUTED
  })

  it('should pay recipient and refund Nouns DAO correctly', async () => {
    const { eta: executedBlockTimestamp } = await gov.proposals(proposalId);

    const streamElapsed = executedBlockTimestamp.sub(STREAM_START_TIME); // Seconds the stream was active
    const expectedRecipientPaid = streamElapsed.mul(FUNDING_RATE_PER_SECOND); // Recipient is paid for every second the stream was active
    const expectedSenderRefund = EthersBN.from(FUNDING_AMOUNT).sub(expectedRecipientPaid); // Remainder sent back to sender

    expect(await weth.balanceOf(recipient.address)).to.equal(expectedRecipientPaid);
    expect(await weth.balanceOf(NOUNS_EXECUTOR)).to.equal(expectedSenderRefund);
  });
})
