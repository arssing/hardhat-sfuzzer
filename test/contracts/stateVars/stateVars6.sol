// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract StateVars6{
    struct Person{
        address addr;
        uint amount;
    }

    struct User{
        string name;
    }


    Person[] persons;
    User[] users;
}