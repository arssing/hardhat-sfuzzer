// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Test{
    function tUint(uint a, uint8 b, uint32 k) public {}
    function tInt2(int8 b, int32 k, int a) public {}
    function tStr(string memory a, string calldata b) public {}
    function tAddr(address a) public {}
    function tBytes(bytes1 a, bytes32 b) public {}
    function tBytes2(bytes calldata a) public {}
}