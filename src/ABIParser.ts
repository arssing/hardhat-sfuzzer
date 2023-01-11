import { getArtifactsList } from "./utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import fs from 'fs';

//based on .format() ethers
function formatInput(input: any) {
  let result = "";
  let children = "";

  if (input.baseType === "array") {

    children += formatInput(input.arrayChildren);
    if (input.arrayLength < 0) {
      result += children;
    } else {
      result += new Array(input.arrayLength).fill(children);
    }
  } else {
    if (input.baseType === "tuple") {
      result += "[" + input.components.map(
        (comp: any) => formatInput(comp)
      ).join(",") + "]";
    } else {
      result += `"${input.type}"`;
    }
  }
  return result;
}

class ABIParser {
  ethers: any;
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
        'bytecode': contractInfo["bytecode"]
      }
  
      for (let func of Object.keys(contractIface.functions)) {
        if (contractIface.functions[func].stateMutability === 'payable' || contractIface.functions[func].stateMutability === 'nonpayable') {
          inputs = [];
          for (let input of contractIface.functions[func].inputs) {
            inputs.push(`${formatInput(input)}`)
          }
          let functionFullName = contractIface.functions[func].format();
          result[contractFullName][functionFullName] = [JSON.parse(`[${inputs}]`)];
        }
      }
    }
    
    return result;
  }
}

export { ABIParser };