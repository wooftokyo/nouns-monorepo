// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.6;

import { NounsDescriptor } from '../../../contracts/NounsDescriptor.sol';
import { NounsDescriptorV2 } from '../../../contracts/NounsDescriptorV2.sol';
import { Utils } from './Utils.sol';
import { Constants } from './Constants.sol';

abstract contract DescriptorHelpers is Utils, Constants {
    function _populateDescriptor(NounsDescriptor descriptor) internal {
        descriptor.addBackground('d5d7e1');
        descriptor.addAccessory(
            fromHex(
                '0017141e0d0100011f0500021f05000100011f0300011f01000100011f0200011f02000300011f03000200011f0200021f0100011f0200011f0100011f0400011f0100011f'
            )
        );
        descriptor.addBody(
            fromHex(
                '0015171f090e020e020e020e02020201000b02020201000b02020201000b02020201000b02020201000b02020201000b02020201000b02'
            )
        );
        descriptor.addGlasses(
            fromHex(
                '000b1710070300062001000620030001200201022301200100012002010223012004200201022303200201022301200420020102230320020102230120012002000120020102230120010001200201022301200300062001000620'
            )
        );
        descriptor.addHead(
            fromHex(
                '00021e140605000137020001370f0004000237020002370e0003000337020003370d0002000437020004370c0003000337020003370d0004000237020002370e0005000137020001370f000d370b000d370b000d370b000d370b000d370b000d370b000d370600057d0d370600017d017e017d017e017d0b37097d017e017d017e017d0b370d7d0a370523097d0b370d7d'
            )
        );
        descriptor.addManyColorsToPalette(0, paletteColors);
    }

    /**
     * @dev the hard-coded values below were copied from running the hardhat task `descriptor-art-to-console` with
     * the parameter `slice` set to 1.
     */
    function _populateDescriptorV2(NounsDescriptorV2 descriptorV2) internal {
        descriptorV2.addBackground('d5d7e1');
        descriptorV2.addAccessories(
            fromHex(
                '6360c00b14f04b3330129027a4df95415c448e979181519e95810988412c66206604b398c098192c066133c9c3c441340b94c6630100'
            ),
            224,
            1
        );
        descriptorV2.addBodies(fromHex('6360c00b14f04b3330129027a4df9c41545c9e938f090299981819b88922e1060000'), 192, 1);
        descriptorV2.addGlasses(
            fromHex(
                '6360c00b14f04b3330129027a43f9a815b5c809d99814d811188991918159818999419813c188b054c3363e501d560d101330d6c0100'
            ),
            224,
            1
        );
        descriptorV2.addHeads(
            fromHex(
                '6360c00b14f04b3330129027a47f2203939c081b2b03a3391310f333b0303001594ce67c0ccc0ccc4016b3392f0313038b3908f3208921d421f4f29a73e3c06c0cacb52092b196b10e82b9cd3991d8bcb55ce6acca9c60169a0301'
            ),
            288,
            1
        );
        descriptorV2.setPalette(
            0,
            fromHex(
                '000000ffffffc5b9a1cfc2ab63a0f9807f7ecaeff95648ed5a423fb9185cb87b11fffdf24b49493432351f1d29068940867c1dae32089f21a0f98f30fe500cd26451fd8b5b5a65fad22209e9265cc54e3880a72d4bea6934ac80eed81162616dff638d8bc0c5c4da53000000f3322cffae1affc110505a5cffef16fff671fff449db8323df2c39f938d85c25fb2a86fd45faff38dd56ff3a0ed32a099037076e3206552e05e8705bf38b7ce4a499667af9648df97cc4f297f2fba3efd087e4d971bde4ff1a0bf78a182b83f6d62149834398ffc925d9391fbd2d24ff7216254efbe5e5de00a556c5030eabf131fb4694e7a32cfff0ee009c590385eb00499ce1183326b1f3fff0bed8dadfd7d3cd1929f4eab1180b5027f9f5cbcfc9b8feb9d5f8d6895d606176858b757576ff0e0e0adc4dfdf8ff70e890f7913dff1ad2ff82ad535a15fa6fe2ffe939ab36beadc8cc604666f20422abaaa84b65f7a19c9a58565cda42cb027c92cec189909b0e74580d027ee6b2958defad817d635eeff2fa6f597ad4b7b2d18687cd916d6b3f394d271b85634ff9f4e6f8ddb0b92b3cd08b11257ceda3baed5fd4fbc16710a28ef43a085b67b1e31e3445ffd067962236769ca95a6b7b7e5243a86f608f785ecc059542ffb0d56333b8ced2b91b43f39713e8e8e2ec5b43235476b2a8a5d6c3be49b38bfccf25f59b34375dfc99e6de27a463554543b19e00d4a0159f4b27f9e8dd6b72129d8e6e4243f8fa5e20f82905555353876f69410d66552d1df71248fee3f3c169232b28340079fcd31e14f830018dd122fffdf4ffa21ee4afa3fbc311aa940ceedc00fff0069cb4b8a38654ae6c0a2bb26be2c8c0f89865f86100dcd8d3049d43d0aea9f39d44eeb78cf9f5e95d3500c3a199aaa6a4caa26afde7f5fdf008fdcef2f681e6018146d19a549eb5e1f5fcff3f932300fcff4a5358fbc800d596a6ffb913e9ba12767c0ef9f6d1d29607f8ce47395ed1ffc5f0cbc1bcd4cfc0'
            )
        );
    }
}
