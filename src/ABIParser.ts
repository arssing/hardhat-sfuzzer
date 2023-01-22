import { getArtifactsList } from "./utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import fs from 'fs';

class ABIParser {
  ethers: any;
  solTypeAmount: any;

  constructor(hre: HardhatRuntimeEnvironment) {
    this.ethers = hre.ethers;
  }

  parseFunctionInputs(pathArtifacts: string) {
    let inputs;
    let result: any = {};
    const jsonPaths = getArtifactsList(pathArtifacts);

    for (let _path of jsonPaths) {
      let contractInfo = JSON.parse(fs.readFileSync(_path, "utf-8"));
      let contractIface = new this.ethers.utils.Interface(contractInfo["abi"]);
      let contractFullName = `${contractInfo["sourceName"]}/${contractInfo["contractName"]}`;

      result[contractFullName] = {
        'iface': contractIface,
        'pathFile': _path
      }
      let payable = [];
      let nonpayable = [];

      if (contractIface.deploy.inputs.length !== 0) {
        inputs = [];
        for (let input of contractIface.deploy.inputs) {
          inputs.push(`${this.formatInput(input)}`)
        }
        let inputTypes = JSON.parse(`[${inputs}]`);
        this.solTypeAmount = {};
        this.calculateTypes(inputTypes);
        let constructorFullName = contractIface.deploy.format(this.ethers.utils.FormatTypes.minimal);
        console.log(constructorFullName)
        result[contractFullName][constructorFullName] = {};
        result[contractFullName][constructorFullName]["inputs"] = inputTypes;
        result[contractFullName][constructorFullName]["solTypeAmount"] = this.solTypeAmount;
      }

      for (let func of Object.keys(contractIface.functions)) {
        if (contractIface.functions[func].stateMutability === 'payable' || contractIface.functions[func].stateMutability === 'nonpayable') {
          inputs = [];
          for (let input of contractIface.functions[func].inputs) {
            inputs.push(`${this.formatInput(input)}`)
          }
          let functionFullName = contractIface.functions[func].format();
          let inputTypes = JSON.parse(`[${inputs}]`);
          this.solTypeAmount = {};
          this.calculateTypes(inputTypes);
          result[contractFullName][functionFullName] = {};
          result[contractFullName][functionFullName]["inputs"] = inputTypes;
          result[contractFullName][functionFullName]["solTypeAmount"] = this.solTypeAmount;
          if (contractIface.functions[func].stateMutability === 'payable') payable.push(functionFullName);
          if (contractIface.functions[func].stateMutability === 'nonpayable') nonpayable.push(functionFullName);
        }
      }

      result[contractFullName]["payable"] = payable;
      result[contractFullName]["nonpayable"] = nonpayable;
    }

    return result;
  }

  calculateTypes(arr: any) {
    for (let t of arr) {
      if (Array.isArray(t)) {
        this.calculateTypes(t);
      } else {
        if (!(t in this.solTypeAmount)) {
          this.solTypeAmount[t] = 1;
        } else {
          this.solTypeAmount[t] += 1;
        }
      }

    }
  }
  //based on .format() ethers
  formatInput(input: any) {
    let result = "";
    let children = "";

    if (input.baseType === "array") {

      children += this.formatInput(input.arrayChildren);
      if (input.arrayLength < 0) {
        result += children;
      } else {
        result += new Array(input.arrayLength).fill(children);
      }
    } else {
      if (input.baseType === "tuple") {
        result += "[" + input.components.map(
          (comp: any) => this.formatInput(comp)
        ).join(",") + "]";
      } else {
        result += `"${input.type}"`;
      }
    }
    return result;
  }
}

export { ABIParser };