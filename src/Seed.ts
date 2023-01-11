import { HardhatRuntimeEnvironment } from "hardhat/types";

class Seed {
  functions: any;
  path: Array<string>;
  allowAddresses: Array<string>;
  ethers: any;

  coverage = new Set();
  energy = 0;

  constructor(
    hre: HardhatRuntimeEnvironment, 
    path: Array<string>, 
    functions: any, 
    allowAddresses: Array<string>
  ) {
    this.path = path;
    this.functions = functions;
    this.allowAddresses = allowAddresses;
    this.ethers = hre.ethers;
  }
}

export { Seed }; 