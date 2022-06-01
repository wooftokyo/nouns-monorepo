// SPDX-License-Identifier: GPL-3.0

/// @title Interface for NounsArt

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

interface INounsArt {
    error SenderIsNotDescriptor();

    error SenderIsNotPendingDescriptor();

    error EmptyPalette();

    error BadPaletteLength();

    event DescriptorUpdated(address oldDescriptor, address newDescriptor);

    struct NounArt {
        uint96 length;
        bytes data;
    }

    struct NounArtPointer {
        uint96 length;
        address pointer;
    }

    function descriptor() external view returns (address);

    function pendingDescriptor() external view returns (address);

    function setDescriptor(address pendingDescriptor) external;

    function confirmDescriptor() external;

    function palettes(uint8 paletteIndex) external view returns (address);

    function backgrounds(uint256 index) external view returns (string memory);

    function bodies(uint256 index) external view returns (bytes memory);

    function accessories(uint256 index) external view returns (bytes memory);

    function heads(uint256 index) external view returns (bytes memory);

    function glasses(uint256 index) external view returns (bytes memory);

    function backgroundCount() external view returns (uint256);

    function bodyCount() external view returns (uint256);

    function accessoryCount() external view returns (uint256);

    function headCount() external view returns (uint256);

    function glassesCount() external view returns (uint256);

    function setPalette(uint8 paletteIndex, bytes calldata palette) external;

    function addManyBackgrounds(string[] calldata backgrounds) external;

    function addManyBodies(NounArt[] calldata bodies) external;

    function addManyAccessories(NounArt[] calldata accessories) external;

    function addManyHeads(NounArt[] calldata heads) external;

    function addManyGlasses(NounArt[] calldata glasses) external;

    function addBackground(string calldata background) external;

    function addBody(NounArt calldata body) external;

    function addAccessory(NounArt calldata accessory) external;

    function addHead(NounArt calldata head) external;

    function addGlasses(NounArt calldata glasses) external;
}
