import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { ASTHelper } from "../../src/ASTHelper";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
};

export default config;
