import { HardhatRuntimeEnvironment } from "hardhat/types";
import fs from 'fs';

class Seed {
  path: Array<string>;
  inputData: any;
  coverage = new Set();
  payable: Array<string>;
  nonpayable: Array<string>;
  energy = 0;

  constructor(
    path: Array<string>,
    payable: Array<string>,
    nonpayable: Array<string>
  ) {
    this.path = path;
    this.payable = payable;
    this.nonpayable = nonpayable;
  }

  setInputData(inputData: any) {
    this.inputData = inputData;
  }

  saveAsJson(artifactsJson: string, outputFile: string = "./seed.json") {
    const path = {
      path: this.path,
      inputData: this.inputData,
      pathFile: artifactsJson
    }
    const data = JSON.stringify(path);
    fs.writeFileSync(outputFile, data);
  }
  clone() {
    let seed = new Seed(this.path, this.payable, this.nonpayable);
    seed.inputData = this.inputData;
    seed.energy = this.energy;
    return seed;
  }
}

export { Seed }; 