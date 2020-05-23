pragma solidity ^0.5.8;

contract Helper {
    function generate_commitment(uint8 sx, uint8 sy, uint8 ex, uint8 ey, uint256 nonce) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(sx, sy, ex, ey, nonce));
    }
}
