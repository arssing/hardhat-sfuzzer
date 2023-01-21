import "hardhat/types/runtime";
import "@nomicfoundation/hardhat-toolbox";
import { extendEnvironment } from "hardhat/config";
import { HardhatUserConfig, task } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import {TASK_COMPILE} from "hardhat/builtin-tasks/task-names";
import { HardhatClient } from "./src/HardhatClient";
import { PowerSchedule } from "./src/PowerSchedule";
import { ABIParser } from "./src/ABIParser";
import { Seed } from "./src/Seed";
import { Mutator } from "./src/Mutator";
import { Fuzzer } from "./src/Fuzzer";
import { createLogger, transports, format } from "winston";

const logger = createLogger({
  level: 'info',
  transports: [
    new transports.File({ filename: 'logs.log' }),
  ],
});

const coverage = createLogger({
  level: 'info',
  transports: [
    new transports.File({ filename: 'coverage.log' }),
  ],
});

declare module "hardhat/types/runtime" {
  export interface HardhatRuntimeEnvironment {
    ABIParser: ABIParser;
  }
}

extendEnvironment((hre) => {
  hre.ABIParser = lazyObject(() => new ABIParser(hre));
});

task("sfuzzer", async (arg, hre) => {
  await hre.run(TASK_COMPILE);
  let maxTryAmount = 50;
  let contractsInfo = hre.ABIParser.parseFunctionInputs(hre.config.paths.artifacts);
  let taskArgs = {
    testfiles: "./src/CoverageRunner.ts",
    matrix: true
  }
  let hardhatClient = new HardhatClient(hre);
  let acc = await hardhatClient.getAccounts();
  let seed;
  
  for (let contract of Object.keys(contractsInfo)){
    logger.info(`${contract}:start: ${new Date().getTime() / 1000}`)
    seed = new Seed([], 
      contractsInfo[contract].payable,
      contractsInfo[contract].nonpayable
    );
    let copyinfo:any = {};
    for (let key of Object.keys(contractsInfo[contract])){
      if (key !== "iface" && key !== "bytecode" && key !== "pathFile" && key !== "payable" && key !== "nonpayable" ){
        copyinfo[key] = contractsInfo[contract][key];
      }
    }
    coverage.info(`${contract}:start: ${new Date().getTime() / 1000}`)
    //owner, erc20, attacker
    let mutator = new Mutator(
      [
        acc[0], 
        "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512", 
        "0x5fbdb2315678afecb367f032d93f642f64180aa3"
      ], 
      hre, 
      copyinfo
    );

    let seeds = [];
    for (let i=0; i<20; i++){
      seeds.push(mutator.payableRandomSeed(seed))
    }
    let pCh = new PowerSchedule();
    let mutationFuzzer = new Fuzzer(seeds, mutator, pCh);
    console.log(mutationFuzzer.seeds);
    
    let tryAmount = 0;
    for (let i=0;i<60; i++){
      seed = mutationFuzzer.fuzz();
      console.log(seed)
      console.log(contractsInfo[contract].pathFile)
      seed.saveAsJson(contractsInfo[contract].pathFile);
      try{
        await hre.run("coverage", taskArgs); 
        mutationFuzzer.checkCoverage();
      } catch {
        tryAmount += 1; 
      }
      if (tryAmount === maxTryAmount) break;
    }
  }
  
})
const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.4.24",
      },
      {
        version: "0.8.17",
      },
      {
        version: "0.7.0",
      },
    ],
  }
};

export default config;
