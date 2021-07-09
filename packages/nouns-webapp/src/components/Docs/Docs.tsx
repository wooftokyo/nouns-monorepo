import React from 'react';
import classes from './Docs.module.css';

const Docs = () => {
  return (
    <div className={classes.body}>
    
      <h3>Introduction</h3>
      <p>Nouns are an experimental attempt to improve the formation of on-chain avatar communities. While projects such as Cryptopunks have attempted to bootstrap digital community and identity, Nouns attempt to bootstrap identity, community, governance and a treasury that can be used by the community for the creation of long-term value. Additionally, nouns attempt to significantly slow community formation to ensure continuous community growth over time and to incentivize long-term thinking</p>

      <h3>Summary</h3>
      <ul>
        <li>1 noun trustlessly auctioned every 24 hours, forever</li>
        <li>settlement of one auction kicks off the next</li>
        <li>all nouns are members of nounsDAO</li>
        <li>nounsDAO uses a fork of Compound Governance</li>
        <li>1 noun = 1 vote</li>
        <li>votes are delegatable, but non-transferable</li>
        <li>100% of noun auction proceeds are trustlessly sent to nounsDAO treasury</li>
        <li>treasury is controlled by Compound Governance framework</li>
        <li>artwork is generative, on-chain</li>
        <li>on-chain source of randomness, artwork lives on Ethereum (not IPFS)</li>
        <li>200 different noun bodies, ~100 shirts and accessories, ~25 glasses</li>
        <li>no explicit rules for attribute scarcity, all nouns are equally rare</li>
        <li>artwork is open source (license TBD)</li>
        <li>project creators (‘nounders’) receive rewards in the form of nouns (10% of supply for first 5 years)</li>
      </ul>

      <h3>Daily Auctions</h3>
      <p>The nouns auction contract will act as a self-sufficient noun generation and distribution mechanism, auctioning one noun per 24 hour period indefinitely. Each time an auction is settled, the settlement transaction will result in the minting and auction of a new noun by the contract. While settlement is most heavily incentivized for the winning bidder, it can be triggered by anyone, allowing the system to trustlessly auction nouns as long as Ethereum is operational and there are interested participants.</p>
    </div>
  );
};
export default Docs;