import {assert} from "chai";
import { ASTHelper } from "../src/ASTHelper";


describe('getAllStateVariables()', () => {
    it('uint', function () {
        const astHelp = new ASTHelper(`${__dirname}/contracts/stateVars/stateVars1.sol`);
        const variables = astHelp.getAllStateVariables();
        assert.deepEqual(Object.keys(variables), ['a','b','u8','u16','u32','u64'])
    })

    it('int', function () {
        const astHelp = new ASTHelper(`${__dirname}/contracts/stateVars/stateVars2.sol`);
        const variables = astHelp.getAllStateVariables();
        assert.deepEqual(Object.keys(variables), ['a','i8','i16','i32','i64','i128','i256'])
    })

    it('bytes', function () {
        const astHelp = new ASTHelper(`${__dirname}/contracts/stateVars/stateVars3.sol`);
        const variables = astHelp.getAllStateVariables();
        assert.deepEqual(Object.keys(variables), ['b1','b2','b3','b4','b5','b6','b7','b32'])
    })

    it('address', function () {
        const astHelp = new ASTHelper(`${__dirname}/contracts/stateVars/stateVars4.sol`);
        const variables = astHelp.getAllStateVariables();
        assert.deepEqual(Object.keys(variables), ['addr1','addr2'])
    })

    it('string', function () {
        const astHelp = new ASTHelper(`${__dirname}/contracts/stateVars/stateVars5.sol`);
        const variables = astHelp.getAllStateVariables();
        assert.deepEqual(Object.keys(variables), ['str','hello'])
    })

    it('structs', function () {
        const astHelp = new ASTHelper(`${__dirname}/contracts/stateVars/stateVars6.sol`);
        const variables = astHelp.getAllStateVariables();
        assert.deepEqual(Object.keys(variables), ['persons','users'])
    })

    it('different place', function () {
        const astHelp = new ASTHelper(`${__dirname}/contracts/stateVars/stateVars7.sol`);
        const variables = astHelp.getAllStateVariables();
        assert.deepEqual(Object.keys(variables), ['a','b'])
    })
})

describe('getFunctionFullName()', () => {
    it('basic types', function () {
        const astHelp = new ASTHelper(`${__dirname}/contracts/fullName/fullName1.sol`);
        const funcs = astHelp._getAllFunctions();
        const fullNames = funcs.map( (item: any) => {
            return astHelp.getFunctionFullName(item);
        })
        assert.equal(fullNames[0], 'tUint(uint256,uint8,uint32)');
        assert.equal(fullNames[1], 'tInt2(int8,int32,int256)');
        assert.equal(fullNames[2], 'tStr(string,string)');
        assert.equal(fullNames[3], 'tAddr(address)');
        assert.equal(fullNames[4], 'tBytes(bytes1,bytes32)');
        assert.equal(fullNames[5], 'tBytes2(bytes)');
    })

    it('arrays', function () {
        const astHelp = new ASTHelper(`${__dirname}/contracts/fullName/fullName2.sol`);
        const funcs = astHelp._getAllFunctions();
        const fullNames = funcs.map( (item: any) => {
            return astHelp.getFunctionFullName(item);
        })
        assert.equal(fullNames[0], 'tUint(uint256[])');
        assert.equal(fullNames[1], 'tUint8(uint8[])');
        assert.equal(fullNames[2], 'tUint8Fixed(uint256[10])');
        assert.equal(fullNames[3], 'tUint8Fixed2(uint256[10])');
    })

    it('structs', function () {
        const astHelp = new ASTHelper(`${__dirname}/contracts/fullName/fullName3.sol`);
        const funcs = astHelp._getAllFunctions();
        const fullNames = funcs.map( (item: any) => {
            return astHelp.getFunctionFullName(item);
        })
        assert.equal(fullNames[0], 'onePerson(Person)');
        assert.equal(fullNames[1], 'personArray(Person[])');
        assert.equal(fullNames[2], 'personArrayFixed(Person[20])');
    })
})