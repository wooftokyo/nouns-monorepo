// BASED ON FOMO NOUNS PROPOSAL PARAMS: https://hackmd.io/@forager/S1PRlYY7t

/**************

TARGETS
[
  '0x286cD2FF7Ad1337BaA783C345080e5Af9bBa0b6e',
  '0xBa5A9D43d0A6b7C00cFa18538eF1B8F5163b1E77',
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  '0xCD18eAa163733Da39c232722cBC4E8940b1D8888',
  '0xCD18eAa163733Da39c232722cBC4E8940b1D8888'
]

VALUES
[
  '14000000000000000000',
  '11000000000000000000',
  '25000000000002777600',
  '0',
  '0',
  '0'
]

SIGNATURES
[
  '',
  '',
  'deposit()',
  'approve(address,uint256)',
  'createStream(address,uint256,address,uint256,uint256)',
  'createStream(address,uint256,address,uint256,uint256)'
]

CALLDATAS
[
  '0x',
  '0x',
  '0x',
  '0x000000000000000000000000cd18eaa163733da39c232722cbc4e8940b1d88880000000000000000000000000000000000000000000000015af1d78b58ee6200',
  '0x000000000000000000000000286cd2ff7ad1337baa783c345080e5af9bba0b6e000000000000000000000000000000000000000000000000c249fdd327812e00000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000000000000000000000000000006168c4800000000000000000000000000000000000000000000000000000000061a56980',
  '0x000000000000000000000000ba5a9d43d0a6b7c00cfa18538ef1b8f5163b1e7700000000000000000000000000000000000000000000000098a7d9b8316d3400000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000000000000000000000000000006168c4800000000000000000000000000000000000000000000000000000000061a56980'
]

**************/

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
        blockNumber: 13282300 // Sep-23-2021 01:36:56 PM +UTC
      }
    }]
  })
}

describe('FOMO Nouns proposal', async () => {

  // Proposer
  const SHARK_DAO_MULTISIG = "0xae7f458667f1b30746354abc3157907d9f6fd15e";

  // Proposal Details
  const FORAGER_ADDRESS = "0x286cD2FF7Ad1337BaA783C345080e5Af9bBa0b6e"
  const RAYO_ADDRESS = "0xBa5A9D43d0A6b7C00cFa18538eF1B8F5163b1E77"

  const FORAGER_LUMP_SUM: EthersBN = ethers.utils.parseEther('14');
  const RAYO_LUMP_SUM: EthersBN  = ethers.utils.parseEther('11');

  const STREAM_START_TIME = new Date("2021-10-15").getTime()/1000
  const STREAM_STOP_TIME = new Date("2021-11-30").getTime()/1000
  let duration: number = (STREAM_STOP_TIME - STREAM_START_TIME)

  let FORAGER_STREAMING_AMOUNT: EthersBN = FORAGER_LUMP_SUM.div(duration.toString()).add(1).mul(duration.toString())  // Make sure the streaming amounts are divisible by duration by making them OVER the asking amount by a few wei
  let RAYO_STREAMING_AMOUNT: EthersBN = RAYO_LUMP_SUM.div(duration.toString()).add(1).mul(duration.toString())

  console.log('FORAGER_STREAMING_AMOUNT', ethers.utils.formatEther(FORAGER_STREAMING_AMOUNT))
  console.log('RAYO_STREAMING_AMOUNT', ethers.utils.formatEther(RAYO_STREAMING_AMOUNT))

  let foragerStreamId: number;
  let rayoStreamId: number;

  // Contract Addresses
  const NOUNS_DAO_PROXY_ADDRESS = "0x6f3E6272A167e8AcCb32072d08E0957F9c79223d";
  const NOUNS_EXECUTOR = "0x0BC3807Ec262cB779b38D65b38158acC3bfedE10";
  const SABLIER_ADDRESS = "0xCD18eAa163733Da39c232722cBC4E8940b1D8888";
  const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

  // Governance delays
  let votingDelay: number;
  let votingPeriod: number;

  let proposalId: number;

  // Signers
  let sharkDaoMultisig: any;
  let gov: NounsDaoLogicV1;
  let sablier: Sablier;
  let weth: Weth;
  let forager: any;
  let rayo: any;

  // Helpers
  let NOW = Math.floor(Date.now()/1000)
  let foragerETHBalanceBefore: EthersBN;  // cache balances before proposal
  let rayoETHBalanceBefore: EthersBN;
  let foragerWETHBalanceBefore: EthersBN;
  let rayoWETHBalanceBefore: EthersBN;


  before(async () => {

    await networkReset()

    sharkDaoMultisig = await ethers.provider.getSigner(SHARK_DAO_MULTISIG)
    forager = await ethers.provider.getSigner(FORAGER_ADDRESS)
    rayo = await ethers.provider.getSigner(RAYO_ADDRESS)
    sablier = Sablier__factory.connect(SABLIER_ADDRESS, ethers.provider)
    weth = Weth__factory.connect(WETH_ADDRESS, ethers.provider)
    gov = NounsDaoLogicV1__factory.connect(NOUNS_DAO_PROXY_ADDRESS, ethers.provider)

    votingDelay = (await gov.votingPeriod()).toNumber()
    votingPeriod = (await gov.votingDelay()).toNumber()

    foragerStreamId = (await sablier.nextStreamId()).toNumber()
    rayoStreamId = foragerStreamId + 1

    foragerETHBalanceBefore = await ethers.provider.getBalance(FORAGER_ADDRESS);
    rayoETHBalanceBefore = await ethers.provider.getBalance(RAYO_ADDRESS);

    foragerWETHBalanceBefore = await weth.balanceOf(FORAGER_ADDRESS);
    rayoWETHBalanceBefore = await weth.balanceOf(RAYO_ADDRESS);

  });

  it('should use streaming amounts that are divisible by duration', async () => {
    expect(FORAGER_STREAMING_AMOUNT.mod(duration)).to.equal(0)
    expect(RAYO_STREAMING_AMOUNT.mod(duration)).to.equal(0)

  })

  it('should propose and execute correctly', async () => {
    // Proposal Config
    const targets: string[] = [];
    const values: string[] = [];
    const signatures: string[] = [];
    const callDatas: string[] = [];
    const description = 'FOMO NOUNS';

    await setNextBlockTimestamp(NOW, false);

    // Action 1. Upfront Payment Forager
    targets.push(FORAGER_ADDRESS);
    values.push(FORAGER_LUMP_SUM.toString());
    signatures.push('')
    callDatas.push('0x')

    // Action 2. Upfront Payment Rayo
    targets.push(RAYO_ADDRESS);
    values.push(RAYO_LUMP_SUM.toString());
    signatures.push('')
    callDatas.push('0x')

    // Action 3. Wrap ETH
    targets.push(WETH_ADDRESS);
    values.push(FORAGER_STREAMING_AMOUNT.add(RAYO_STREAMING_AMOUNT).toString());
    signatures.push('deposit()');
    callDatas.push('0x');

    // Action 4. Approve Sablier to transfer WETH
    targets.push(WETH_ADDRESS);
    values.push('0');
    signatures.push('approve(address,uint256)');
    callDatas.push(encodeParameters(['address','uint256'], [SABLIER_ADDRESS, FORAGER_STREAMING_AMOUNT.add(RAYO_STREAMING_AMOUNT)]) )

    // Action 5. Streaming Payment Forager
    targets.push(SABLIER_ADDRESS);
    values.push('0');
    signatures.push('createStream(address,uint256,address,uint256,uint256)')
    callDatas.push(encodeParameters(['address','uint256','address','uint256','uint256'],[FORAGER_ADDRESS,FORAGER_STREAMING_AMOUNT,WETH_ADDRESS, STREAM_START_TIME, STREAM_STOP_TIME]) )


    // Action 6. Streaming Payment Rayo
    targets.push(SABLIER_ADDRESS);
    values.push('0');
    signatures.push('createStream(address,uint256,address,uint256,uint256)')
    callDatas.push(encodeParameters(['address','uint256','address','uint256','uint256'],[RAYO_ADDRESS,RAYO_STREAMING_AMOUNT,WETH_ADDRESS, STREAM_START_TIME, STREAM_STOP_TIME]) )

    console.log("TARGETS")
    console.log(targets.join(','))
    console.log()

    console.log("VALUES")
    console.log(values.join(','))
    console.log()

    console.log("SIGNATURES")
    console.log(signatures.join(','))
    console.log()

    console.log("CALLDATAS")
    console.log(callDatas.join(','))
    console.log()


    await impersonateAccount(SHARK_DAO_MULTISIG)
    await gov.connect(sharkDaoMultisig).propose(targets, values, signatures, callDatas, description)

    proposalId = (await gov.latestProposalIds(SHARK_DAO_MULTISIG)).toNumber();

    // Wait for votingDelay
    console.log('Advancing past voting delay:',votingDelay,'blocks');
    await advanceBlocks(votingDelay);

    // Cast vote for proposal
    await gov.connect(sharkDaoMultisig).castVote(proposalId, 1);

    // Wait for votingPeriod
    console.log('Advancing past voting period:',votingPeriod + 1,'blocks');
    await advanceBlocks(votingPeriod + 1);

    await gov.connect(sharkDaoMultisig).queue(proposalId);

    // Wait for timelock
    console.log('Advancing to timelock delay')
    const { eta } = await gov.proposals(proposalId);
    await setNextBlockTimestamp(eta.toNumber(), false);

    await gov.connect(sharkDaoMultisig).execute(proposalId);

    expect(await gov.state(proposalId)).to.equal(7) // EXECUTED
  });

  it('should pay lump sums correctly', async () => {
    let foragerETHBalanceAfter = await ethers.provider.getBalance(FORAGER_ADDRESS);
    let rayoETHBalanceAfter = await ethers.provider.getBalance(RAYO_ADDRESS);

    expect(foragerETHBalanceAfter.sub(foragerETHBalanceBefore)).to.equal(FORAGER_LUMP_SUM)
    expect(rayoETHBalanceAfter.sub(rayoETHBalanceBefore)).to.equal(RAYO_LUMP_SUM)
  })

  it('should allow recipients to withdraw funds', async () => {
    await setNextBlockTimestamp(STREAM_STOP_TIME, true); // Stream is over

    await impersonateAccount(FORAGER_ADDRESS)
    await sablier.connect(forager).withdrawFromStream(foragerStreamId, FORAGER_STREAMING_AMOUNT) // withdraw
    await expect(sablier.connect(forager).balanceOf(foragerStreamId, FORAGER_ADDRESS)).to.be.revertedWith('stream does not exist') // No balance owing
    await stopImpersonatingAccount(FORAGER_ADDRESS)

    await impersonateAccount(RAYO_ADDRESS)
    await sablier.connect(rayo).withdrawFromStream(rayoStreamId, RAYO_STREAMING_AMOUNT)
    await expect(sablier.connect(rayo).balanceOf(rayoStreamId, RAYO_ADDRESS)).to.be.revertedWith('stream does not exist') // No balance owing
    await stopImpersonatingAccount(RAYO_ADDRESS)

    let foragerWETHBalanceAfter = await weth.balanceOf(FORAGER_ADDRESS);
    let rayoWETHBalanceAfter = await weth.balanceOf(RAYO_ADDRESS);

    expect(foragerWETHBalanceAfter.sub(foragerWETHBalanceBefore)).to.equal(FORAGER_STREAMING_AMOUNT)
    expect(rayoWETHBalanceAfter.sub(rayoWETHBalanceBefore)).to.equal(RAYO_STREAMING_AMOUNT)
  });
})
