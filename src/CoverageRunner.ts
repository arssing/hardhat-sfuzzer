import { createLogger, transports, format } from "winston";
import { HardhatClient } from "./HardhatClient";
import { Oracle } from "./Oracle";
import hre, { hardhatArguments } from "hardhat";
import fs from 'fs';

const logger = createLogger({
  level: 'info',
  transports: [
    new transports.File({ filename: 'logs.log' }),
  ],
});

describe("CoverageRunner", function () {

  async function start() {
    let selector;
    const etherValue = "0x927c0"; // 600000
    const oneEther = "0xde0b6b3a7640000"; //1.0
    let hardhatClient = new HardhatClient(hre);
    await hardhatClient.setupHardhatEVM();
    let oracle = new Oracle(await hardhatClient.getCount());
  
    let seed = JSON.parse(fs.readFileSync("./seed.json", "utf-8"));
    let path = seed.path;    
    let resultPath = [...path];
    const inputData = seed.inputData;
    
    let contractInfo = JSON.parse(fs.readFileSync(seed.pathFile, "utf-8"))
    let contractIface = new hre.ethers.utils.Interface(contractInfo["abi"]);

    const acc = await hardhatClient.getAccounts();
    let constructorValues = "";
    if (path[0].includes("constructor")) {
      constructorValues = contractIface.encodeDeploy(inputData[path[0]]);
      if (constructorValues.startsWith("0x")) constructorValues = constructorValues.slice(2);
      path.splice(0, 1);
    }
    let contractAddr = await hardhatClient.deploy(
      contractInfo.bytecode + constructorValues
    );
    //mint erc20 to attacker, owner, contract
    await hardhatClient.mintERC20(hardhatClient.attacker?.addr);
    await hardhatClient.mintERC20(acc[0]);
    await hardhatClient.mintERC20(contractAddr);
    //owner interact
    let copyPath = [...path];
    selector = contractIface.encodeFunctionData(path[0], inputData[path[0]]);
    await hardhatClient.interactWithValue(
      acc[0], 
      contractAddr, 
      selector, 
      etherValue
    )
    copyPath.splice(0, 1);
    for (let func of copyPath){
      selector = contractIface.encodeFunctionData(func, inputData[func]);
      await hardhatClient.interactWithoutValue(acc[0], contractAddr, selector);
      await hardhatClient.increaseTime(604800);
    }
    //send ether
    await hardhatClient.sendEther(contractAddr, oneEther);
    if (hardhatClient.attacker?.iface === undefined) return;
    // intreract via attacker smart contract
    // let's start with payable func
    let bytesToCall = contractIface.encodeFunctionData(path[0], inputData[path[0]]);
    let attackerCalldata = hardhatClient.attacker.iface.encodeFunctionData("setData", [contractAddr, bytesToCall]);
    let callWithMsgValue = hardhatClient.attacker.iface.getSighash("callWithMsgValue");
    let callWithoutMsgValue = hardhatClient.attacker.iface.getSighash("callWithoutMsgValue");
    
    //console.log(attackerCalldata)
    //set data to attacker smart contract
    await hardhatClient.interactWithoutValue(
      acc[0], 
      hardhatClient.attacker.addr, 
      attackerCalldata
    )
    await hardhatClient.interactWithValue(
      acc[0], 
      hardhatClient.attacker.addr, 
      callWithMsgValue, 
      etherValue
    )
    //remove payable func
    path.splice(0, 1);

    for (let func of path){
      selector = contractIface.encodeFunctionData(func, inputData[func]);
      attackerCalldata = hardhatClient.attacker.iface.encodeFunctionData("setData", [contractAddr, selector]);
      //set data to attacker smart contract
      await hardhatClient.interactWithoutValue(
        acc[0], 
        hardhatClient.attacker.addr, 
        attackerCalldata
      );
      await hardhatClient.interactWithoutValue(
        acc[0], 
        hardhatClient.attacker.addr, 
        callWithoutMsgValue
      )
      await hardhatClient.increaseTime(604800);
      let newCount = await hardhatClient.getCount()
      if (!oracle.isEqual(newCount)) {
        logger.info(`${new Date().getTime() / 1000}:reentrancy:${resultPath.join("->")}`);
      }
    }
  }

  async function test() {
    let hardhatClient = new HardhatClient(hre);
    await hardhatClient.setupHardhatEVM();
    console.log(await hardhatClient.mintERC20(hardhatClient.attacker?.addr));
    
  }
  it("mark", async function () {
    await start();
  });
})
