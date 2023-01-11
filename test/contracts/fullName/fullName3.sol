// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Test{
    struct Person {
        address addr;
        uint amount;
    }
    function onePerson(Person a) public {}
    function personArray(Person[] a) public {}
    function personArrayFixed(Person [20] a) public {}
}