// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Test{
    function tUint(uint[] calldata a) public {}
    function tUint8(uint8[] calldata a) public {}
    function tUint8Fixed(uint[10] calldata a) public {}
    function tUint8Fixed2(uint[10] memory a) public {}
}