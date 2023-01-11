import { HardhatUserConfig, task } from "hardhat/config";
import { extendEnvironment } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import "@nomicfoundation/hardhat-toolbox";
import {TASK_COMPILE} from "hardhat/builtin-tasks/task-names";
import { ASTHelper } from "./src/ASTHelper";
import { getAllPaths } from "./src/PathHelper";
import { ABIParser } from "./src/ABIParser";
import "hardhat/types/runtime";

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
  hre.ethers
  console.log(hre.ABIParser.parseFunctionInputs(hre.config.paths.artifacts));
});

const config: HardhatUserConfig = {
  solidity: "0.8.17",
};

export default config;
