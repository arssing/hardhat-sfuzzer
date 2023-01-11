// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Calculator {
    uint result;
    function sum(uint a, uint b) public {
        result = a+b;
    }
    function sub(uint a, uint b) public {
        result = a-b;
    }
    function checkAddr(address a) public {
    }

    function checkUint(uint16 a) public {
        result = uint(a);
    }
    
}

/*
contract Test{
    constructor(string memory b) {}
    function tUint(uint a, uint8 b, uint32 k) public {}
    function tInt2(int8 b, int32 k, int a) public {}
    function tStr(string memory a, string calldata b) public {}
    function tAddr(address a) public {}
    function tBytes(bytes1 a, bytes32 b) public {}
    function tBytes2(bytes calldata a) public {}
    function tUint(uint[] calldata a) public {}
    function tUint8(uint8[] calldata a) public {}
    function tUint8Fixed(uint[10] calldata a) public {}
    function tUint8Fixed2(uint[10] memory a) public {}
        struct Person {
        address addr;
        uint amount;
    }
    function onePerson(Person calldata a) public {}
    function personArray(Person[] calldata a) public {}
    function personArrayFixed(Person[20] calldata a) public {}
}
*/