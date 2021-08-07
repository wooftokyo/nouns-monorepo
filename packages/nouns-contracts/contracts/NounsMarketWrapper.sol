// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

// ============ External Imports ============
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {INounsAuctionHouse} from "./interfaces/INounsAuctionHouse.sol";

// ============ Internal Imports ============
import {IMarketWrapper} from "./external/partybid/IMarketWrapper.sol";

/**
 * @title NounsMarketWrapper
 * @author Anna Carroll (original); modified by nounders
 * @notice MarketWrapper contract implementing IMarketWrapper interface
 * according to the logic of Nouns' Auction Houses
 */
contract NounsMarketWrapper is IMarketWrapper {
    using SafeMath for uint256;

    // ============ Internal Immutables ============

    INounsAuctionHouse internal immutable market;
    uint8 internal immutable minBidIncrementPercentage;

    // ======== Constructor =========

    constructor(address _nounsAuctionHouse) {
        market = INounsAuctionHouse(_nounsAuctionHouse);
        minBidIncrementPercentage = INounsAuctionHouse(_nounsAuctionHouse)
            .minBidIncrementPercentage();
    }

    // ======== External Functions =========

    /**
     * @notice Determine whether there is an existing auction
     * for this token is active
     * @return TRUE if the auction exists
     */
    function auctionExists(uint256 auctionId)
        public
        view
        override
        returns (bool)
    {
        (uint256 currentAuctionId, , , , , ) = market.auction();
        return auctionId == currentAuctionId;
    }

    /**
     * @notice Determine whether the given auctionId and tokenId is active.
     * we ignore nftContract since it is static for all nouns auctions
     * @return TRUE if the auctionId and tokenId matches the active auction
     */
    function auctionIdMatchesToken(
        uint256 auctionId,
        address nftContract,
        uint256 tokenId
    ) public view override returns (bool) {
        (uint256 currentAuctionId, , , , , ) = market.auction();
        return
            currentAuctionId == tokenId && currentAuctionId == auctionId;
    }

    /**
     * @notice Calculate the minimum next bid for the active auction
     * @return minimum bid amount
     */
    function getMinimumBid(uint256 auctionId)
        external
        view
        override
        returns (uint256)
    {
        (, uint256 amount, , , address payable bidder, ) = market.auction();
        if (bidder == address(0)) {
            // if there are NO bids, the minimum bid is 1 wei (any amount > 0)
            return 1 wei;
        } else {
            // if there ARE bids, the minimum bid is the current bid plus the increment buffer
            return amount.add(amount.mul(minBidIncrementPercentage).div(100));
        }
    }

    /**
     * @notice Query the current highest bidder for this auction
     * @return highest bidder
     */
    function getCurrentHighestBidder(uint256 auctionId)
        external
        view
        override
        returns (address)
    {
        (, , , , address payable bidder, ) = market.auction();
        return bidder;
    }

    /**
     * @notice Submit bid to Market contract
     * TODO modify method
     */
    function bid(uint256 auctionId, uint256 bidAmount) external override {
        // line 153 of Zora Auction House, createBid() function
        (bool success, bytes memory returnData) =
            address(market).call{value: bidAmount}(
                abi.encodeWithSignature(
                    "createBid(uint256,uint256)",
                    auctionId,
                    bidAmount
                )
            );
        require(success, string(returnData));
    }

    /**
     * @notice Determine whether the auction has been finalized
     * @return TRUE if the auction has been finalized
     */
    function isFinalized(uint256 auctionId)
        external
        view
        override
        returns (bool)
    {
        // line 302 of Zora Auction House,
        // the auction is deleted at the end of the endAuction() function
        // since we checked that the auction DID exist when we deployed the partyBid,
        // if it no longer exists that means the auction has been finalized.
        return !auctionExists(auctionId);
    }

    /**
     * @notice Finalize the results of the auction
     */
    function finalize(uint256 auctionId) external override {
        market.settleAuction();
    }
}
