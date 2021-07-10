import React from 'react';
import classes from './Docs.module.css';
import { Container, Row, Col } from 'react-bootstrap';

const Docs = () => {
  return (
    <div className={classes.body}>
      <Container>
        <Row>
          <Col lg={8}>
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

            <p>The nouns auction contract will act as a self-sufficient noun generation and distribution mechanism, auctioning one noun every 24 hours forever. 100% of the proceeds for each auction are automatically deposited in the NounsDAO treasury, where they are governed by noun owners.</p>

            <p>Each time an auction is settled, the settlement transaction will result in the minting and auction of a new noun by the contract. While settlement is most heavily incentivized for the winning bidder, it can be triggered by anyone, allowing the system to trustlessly auction nouns as long as Ethereum is operational and there are interested participants.</p>

            <p>Noun auctions utilize a fork of Zora's auction house. You can see the contracts here:</p>

            <h3>Nouns DAO</h3>

            <p>Nouns DAO utilizes a fork of <a href="https://compound.finance/governance">Compound Governance</a> and is the main governing body of the Nouns ecosystem. The Nouns DAO treasury recieves 100% of ETH proceeds from daily noun auctions.</p>

            <p>Each noun is an irrevocable member of Nouns DAO and entitled to 1 vote in all governance matters. Noun votes are non-transferable (if you sell your Noun the vote goes with it) but delegatable, which means you can assign your vote to someone else as long as you own your noun.
            </p>

            <p>Nouns Governance contracts are available here:</p>

            <h3>Nounders Reward</h3>
            <p>"Nounders" are the group of ten artists and software developers that created Nouns. After the mainnet launch of the project, they will cede control of the project to Nouns DAO.</p>

            <p>As compensation for developing Nouns, Nounders have rewarded themselves every 10th noun for the first 5 years of the project, or 183 of the first 1830 Nouns. Noun ids #0, #10, #20, #30 and so on, will be automatically sent to the Nounder's multi-sig to be vested and shared among the 10 founding members of the project.</p>

             <p>Nounder distributions don't interfere with the cadence of 24 hour auctions. Nouns are sent directly to the Nounder's multisig, and auctions continue on schedule with the next available noun ID.</p>

            <h3>Noun Traits and Randomness</h3>
            <p>Nouns are generated randomly based on sets of assets per layer of artwork. There are no 'if' statements or other rules governing trait scarcity, which makes all nouns equally rare. As of this writing, nouns are made up of:</p>

            <ul>
              <li>Layer 1: backgrounds (1/2)</li>
              <li>Layer 2: shirts (1/X)</li>
              <li>Layer 3: accessories: (1/X)</li>
              <li>Layer 4: heads (1/X)</li>
              <li>Layer 5: glasses (1/X)</li>
            </ul>

            <p>Because nouns are generated on-chain, </p>

            <h3>On-Chain Artwork</h3>
          </Col>
        </Row>
      </Container>
    </div>

  );
};
export default Docs;