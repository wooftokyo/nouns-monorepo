// SPDX-License-Identifier: GPL-3.0

/// @title The Nouns art storage contract

/*********************************
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░█████████░░█████████░░░ *
 * ░░░░░░██░░░████░░██░░░████░░░ *
 * ░░██████░░░████████░░░████░░░ *
 * ░░██░░██░░░████░░██░░░████░░░ *
 * ░░██░░██░░░████░░██░░░████░░░ *
 * ░░░░░░█████████░░█████████░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 *********************************/

pragma solidity ^0.8.12;

import { INounsArt } from './interfaces/INounsArt.sol';
import { Inflate } from './libs/Inflate.sol';
import { SSTORE2 } from './libs/SSTORE2.sol';

contract NounsArt is INounsArt {
    // prettier-ignore
    // https://creativecommons.org/publicdomain/zero/1.0/legalcode.txt
    bytes32 constant COPYRIGHT_CC0_1_0_UNIVERSAL_LICENSE = 0xa2010f343487d3f7618affe54f789f5487602331c0a8d03f49e9a7c547cf0499;

    // Noun Color Palette Pointers (Palette Index => Pointer)
    mapping(uint8 => address) public palettes;

    // Noun Backgrounds (Hex Colors)
    string[] public backgrounds;

    // Noun Bodies Pointers (DEFLATE-Compressed Custom RLE)
    NounArtPointer[] private _bodies;

    // Noun Accessories Pointers (DEFLATE-Compressed Custom RLE)
    NounArtPointer[] private _accessories;

    // Noun Heads Pointers (DEFLATE-Compressed Custom RLE)
    NounArtPointer[] private _heads;

    // Noun Glasses Pointers (DEFLATE-Compressed Custom RLE)
    NounArtPointer[] private _glasses;

    // Current Nouns Descriptor address
    address public descriptor;

    // Pending Nouns Descriptor address
    address public pendingDescriptor;

    /**
     * @notice Require that the sender is the descriptor.
     */
    modifier onlyDescriptor() {
        if (msg.sender != descriptor) {
            revert SenderIsNotDescriptor();
        }
        _;
    }

    constructor(address _descriptor) {
        descriptor = _descriptor;
    }

    /**
     * @notice Set the pending descriptor, which can be confirmed
     * by calling `confirmDescriptor`.
     * @dev This function can only be called by the current descriptor.
     */
    function setDescriptor(address _pendingDescriptor) external onlyDescriptor {
        pendingDescriptor = _pendingDescriptor;
    }

    /**
     * @notice Confirm the pending descriptor.
     * @dev This function can only be called by the pending descriptor.
     */
    function confirmDescriptor() external {
        if (msg.sender != pendingDescriptor) {
            revert SenderIsNotPendingDescriptor();
        }

        address oldDescriptor = descriptor;
        descriptor = pendingDescriptor;
        delete pendingDescriptor;

        emit DescriptorUpdated(oldDescriptor, descriptor);
    }

    /**
     * @notice Get a Noun body by `index`.
     */
    function bodies(uint256 index) external view returns (bytes memory) {
        bytes memory body = SSTORE2.read(_bodies[index].pointer);
        return decompress(body, _bodies[index].length);
    }

    /**
     * @notice Get a Noun accessory by `index`.
     */
    function accessories(uint256 index) external view returns (bytes memory) {
        bytes memory accessory = SSTORE2.read(_accessories[index].pointer);
        return decompress(accessory, _accessories[index].length);
    }

    /**
     * @notice Get a Noun head by `index`.
     */
    function heads(uint256 index) external view returns (bytes memory) {
        bytes memory head = SSTORE2.read(_heads[index].pointer);
        return decompress(head, _heads[index].length);
    }

    /**
     * @notice Get Noun glasses by `index`.
     */
    function glasses(uint256 index) external view returns (bytes memory) {
        bytes memory glasses_ = SSTORE2.read(_glasses[index].pointer);
        return decompress(glasses_, _glasses[index].length);
    }

    /**
     * @notice Get the number of available Noun `backgrounds`.
     */
    function backgroundCount() external view returns (uint256) {
        return backgrounds.length;
    }

    /**
     * @notice Get the number of available Noun `bodies`.
     */
    function bodyCount() external view returns (uint256) {
        return _bodies.length;
    }

    /**
     * @notice Get the number of available Noun `accessories`.
     */
    function accessoryCount() external view returns (uint256) {
        return _accessories.length;
    }

    /**
     * @notice Get the number of available Noun `heads`.
     */
    function headCount() external view returns (uint256) {
        return _heads.length;
    }

    /**
     * @notice Get the number of available Noun `glasses`.
     */
    function glassesCount() external view returns (uint256) {
        return _glasses.length;
    }

    /**
     * @notice Decompress a DEFLATE-compressed data stream.
     */
    function decompress(bytes memory input, uint256 len) public pure returns (bytes memory) {
        (, bytes memory decompressed) = Inflate.puff(input, len);
        return decompressed;
    }

    /**
     * @notice Update a single color palette. This function can be used to
     * add a new color palette or update an existing palette.
     * @dev This function can only be called by the descriptor.
     */
    function setPalette(uint8 paletteIndex, bytes calldata palette) external onlyDescriptor {
        if (palette.length == 0) {
            revert EmptyPalette();
        }
        if (palette.length % 3 != 0 || palette.length > 768) {
            revert BadPaletteLength();
        }
        palettes[paletteIndex] = SSTORE2.write(palette);
    }

    /**
     * @notice Batch add Noun backgrounds.
     * @dev This function can only be called by the descriptor.
     */
    function addManyBackgrounds(string[] calldata backgrounds_) external onlyDescriptor {
        for (uint256 i = 0; i < backgrounds_.length; i++) {
            _addBackground(backgrounds_[i]);
        }
    }

    /**
     * @notice Batch add Noun bodies.
     * @dev This function can only be called by the descriptor.
     */
    function addManyBodies(NounArt[] calldata bodies_) external onlyDescriptor {
        for (uint256 i = 0; i < bodies_.length; i++) {
            _addBody(bodies_[i]);
        }
    }

    /**
     * @notice Batch add Noun accessories.
     * @dev This function can only be called by the descriptor.
     */
    function addManyAccessories(NounArt[] calldata accessories_) external onlyDescriptor {
        for (uint256 i = 0; i < accessories_.length; i++) {
            _addAccessory(accessories_[i]);
        }
    }

    /**
     * @notice Batch add Noun heads.
     * @dev This function can only be called by the descriptor.
     */
    function addManyHeads(NounArt[] calldata heads_) external onlyDescriptor {
        for (uint256 i = 0; i < heads_.length; i++) {
            _addHead(heads_[i]);
        }
    }

    /**
     * @notice Batch add Noun glasses.
     * @dev This function can only be called by the descriptor.
     */
    function addManyGlasses(NounArt[] calldata glasses_) external onlyDescriptor {
        for (uint256 i = 0; i < glasses_.length; i++) {
            _addGlasses(glasses_[i]);
        }
    }

    /**
     * @notice Add a Noun background.
     * @dev This function can only be called by the descriptor.
     */
    function addBackground(string calldata background_) external onlyDescriptor {
        _addBackground(background_);
    }

    /**
     * @notice Add a Noun body.
     * @dev This function can only be called by the descriptor.
     */
    function addBody(NounArt calldata body_) external onlyDescriptor {
        _addBody(body_);
    }

    /**
     * @notice Add a Noun accessory.
     * @dev This function can only be called by the descriptor.
     */
    function addAccessory(NounArt calldata accessory_) external onlyDescriptor {
        _addAccessory(accessory_);
    }

    /**
     * @notice Add a Noun head.
     * @dev This function can only be called by the descriptor.
     */
    function addHead(NounArt calldata head_) external onlyDescriptor {
        _addHead(head_);
    }

    /**
     * @notice Add Noun glasses.
     * @dev This function can only be called by the descriptor.
     */
    function addGlasses(NounArt calldata glasses_) external onlyDescriptor {
        _addGlasses(glasses_);
    }

    /**
     * @notice Add a Noun background.
     */
    function _addBackground(string calldata background_) internal {
        backgrounds.push(background_);
    }

    /**
     * @notice Add a Noun body.
     */
    function _addBody(NounArt calldata body_) internal {
        _bodies.push(NounArtPointer({ length: body_.length, pointer: SSTORE2.write((body_.data)) }));
    }

    /**
     * @notice Add a Noun accessory.
     */
    function _addAccessory(NounArt calldata accessory_) internal {
        _accessories.push(NounArtPointer({ length: accessory_.length, pointer: SSTORE2.write((accessory_.data)) }));
    }

    /**
     * @notice Add a Noun head.
     */
    function _addHead(NounArt calldata head_) internal {
        _heads.push(NounArtPointer({ length: head_.length, pointer: SSTORE2.write((head_.data)) }));
    }

    /**
     * @notice Add Noun glasses.
     */
    function _addGlasses(NounArt calldata glasses_) internal {
        _glasses.push(NounArtPointer({ length: glasses_.length, pointer: SSTORE2.write((glasses_.data)) }));
    }
}
