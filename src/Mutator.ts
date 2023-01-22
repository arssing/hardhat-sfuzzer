import { Seed } from "./Seed";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getRandomInt } from "./utils";

function seedCopy(s1: Seed): Seed {
  let s = new Seed([], [], []);
  s.path = s1.path;
  s.inputData = s1.inputData;
  s.coverage = s1.coverage;
  s.payable = s1.payable;
  s.nonpayable = s1.nonpayable;
  s.energy = s1.energy;
  return s;
}

class Mutator {
  allowAddresses: Array<string>;
  ethers: any;
  functionsStructure: any;
  interestValues: any = {
    "uint32": ["600000"],
    "uint64": ["600000"],
    "uint128": ["600000"],
    "uint256": ["600000"],
    "int32": ["600000"],
    "int64": ["600000"],
    "int128": ["600000"],
    "int256": ["600000"]
  };
  count: number = 0;

  constructor(
    allowAddresses: Array<string>,
    hre: HardhatRuntimeEnvironment,
    functionsStructure: any
  ) {
    this.allowAddresses = allowAddresses;
    this.ethers = hre.ethers;
    this.functionsStructure = functionsStructure;
  }

  mutators = [
    this.payableDeleteRandomFuncFromPath,
    this.payableFlipRandomFuncInPath,
    this.payableInsertRandomFuncInPath,
    this.mutateRandFunc,
    this.mutateRandFunc
  ];

  mutate(s: Seed): Seed {
    let mutator = this.mutators[getRandomInt(0, this.mutators.length)];
    if (mutator.name === "mutateRandFunc") return mutator(s, this);
    return mutator(s);
  }

  payableDeleteRandomFuncFromPath(s: Seed): Seed {
    let pos;
    if (s.path.length == 0) return s;
    if (s.path[0].includes("constructor")) {
      pos = getRandomInt(1, s.path.length);
      if (pos === 1) {
        s.path.splice(1, 1, s.payable[getRandomInt(0, s.payable.length)]);
        return s;
      }
    } else {
      pos = getRandomInt(0, s.path.length);
      if (pos === 0) {
        s.path.splice(0, 1, s.payable[getRandomInt(0, s.payable.length)]);
        return s;
      }
    }
    s.path.splice(pos, 1);
    return s;
  }

  payableInsertRandomFuncInPath(s: Seed): Seed {
    let pos;
    let func;

    if (s.path[0].includes("constructor")) {
      pos = getRandomInt(1, s.path.length);
      func = ((pos === 1) ? s.payable[getRandomInt(0, s.payable.length)] : s.nonpayable[getRandomInt(0, s.nonpayable.length)]);
    } else {
      pos = getRandomInt(0, s.path.length);
      func = ((pos === 0) ? s.payable[getRandomInt(0, s.payable.length)] : s.nonpayable[getRandomInt(0, s.nonpayable.length)]);
    }
    s.path.splice(pos, 0, func);
    return s;
  }


  payableFlipRandomFuncInPath(s: Seed): Seed {
    let pos1;
    let pos2;
    if (s.path[0].includes("constructor")) {
      pos1 = getRandomInt(2, s.path.length);
      pos2 = getRandomInt(2, s.path.length);
    } else {
      pos1 = getRandomInt(1, s.path.length);
      pos2 = getRandomInt(1, s.path.length);
    }

    if (pos1 === pos2) return s;
    let temp = s.path[pos1];
    s.path[pos1] = s.path[pos2];
    s.path[pos2] = temp;
    console.log(`${pos1}-${pos2}`)
    return s;
  }

  deleteRandomFuncFromPath(s: Seed): Seed {
    if (s.path.length == 0) return s;
    const pos = getRandomInt(0, s.path.length);
    s.path.splice(pos, 1);
    return s;
  }

  insertRandomFuncInPath(s: Seed): Seed {
    const keys = Object.keys(this.functionsStructure);
    const func = keys[Math.floor(Math.random() * keys.length)];
    const pos = getRandomInt(0, s.path.length);
    s.path.splice(pos, 0, func);
    return s;
  }

  flipRandomFuncInPath(s: Seed): Seed {
    const pos1 = getRandomInt(0, s.path.length);
    const pos2 = getRandomInt(0, s.path.length);
    if (pos1 === pos2) return s;
    let temp = s.path[pos1];
    s.path[pos1] = s.path[pos2];
    s.path[pos2] = temp;
    return s;
  }

  fillMutateData(t: any, copyData: any, findType: string): any {
    let res;
    if (Array.isArray(t)) {
      res = t.map((item: any) => {
        return this.fillMutateData(t, copyData, findType);
      });
    } else {
      res = this.genRandData(t);
    }
    return res;
  }

  mutateBytes(solType: string, oldValue: string): string {
    let numBytes: number = +solType.slice(5);
    const pos = getRandomInt(0, numBytes);
    const bits = getRandomInt(0, 256);
    let tmp = this.ethers.utils.arrayify(oldValue);
    const mutateType = getRandomInt(0, 3);
    if (mutateType === 0) {
      tmp[pos] &= bits;
    } else if (mutateType === 1) {
      tmp[pos] ^= bits;
    } else if (mutateType === 2) {
      tmp[pos] |= bits;
    }
    return this.ethers.utils.hexlify(tmp);
  }

  mutateValue(solType: string, oldValue: string): string {
    let randValue = "";
    if (solType.includes("uint")) {
      randValue = this.mutateUint(solType, oldValue);
    }
    else if (solType.includes("int")) {
      randValue = this.mutateInt(solType, oldValue);
    }
    else if (solType.includes("address")) {
      randValue = this.allowAddresses[Math.floor(Math.random() * this.allowAddresses.length)];
      while (oldValue === randValue) randValue = this.allowAddresses[Math.floor(Math.random() * this.allowAddresses.length)];
    }
    else if (solType.includes("string")) {
      randValue = "randStr";
    }
    else if (solType.includes("bytes")) {
      randValue = this.mutateBytes(solType, oldValue);
    }
    return randValue;
  }

  mutateData(funcStructure: any, copyData: any, findType: string, pos: number) {
    funcStructure.forEach((val: any, i: number) => {
      if (!Array.isArray(val)) {
        if (val === findType) {
          this.count += 1;
          if (this.count === pos) {
            copyData[i] = this.mutateValue(findType, copyData[i]);
            return
          }
        }
      } else {
        this.mutateData(val, copyData[i], findType, pos);
      }
    })
  }

  mutateRandFunc(s: Seed, mutator: any): Seed {
    const changeFunc = s.path[Math.floor(Math.random() * s.path.length)];
    const structure = mutator.functionsStructure[changeFunc];
    if (structure.inputs.length === 0) return s;
    const types = Object.keys(structure.solTypeAmount);
    const typeToMutate = types[Math.floor(Math.random() * types.length)];
    const pos = getRandomInt(1, structure.solTypeAmount[typeToMutate] + 1);
    mutator.count = 0;
    mutator.mutateData(structure.inputs, s.inputData[Object.keys(s.inputData)[0]], typeToMutate, pos)
    return s;
  }

  payableRandomSeed(s1: Seed): Seed {
    let s = s1.clone();
    let inputData: any = {};
    let constructorName = "";
    let pathLen = 0;

    for (let k of Object.keys(this.functionsStructure)) {
      if (k.includes("constructor")) {
        constructorName = k;
        break;
      }
    }
    let keys = JSON.parse(JSON.stringify(s.nonpayable));
    if (s.payable.length === 0 || s.nonpayable.length === 0) throw "Contract must have: 1 payable and 1 nonpayable func";

    if (constructorName !== "") {
      pathLen = getRandomInt(2, keys.length + 2);
      s.path = [
        constructorName,
        s.payable[getRandomInt(0, s.payable.length)]
      ];
    } else {
      pathLen = getRandomInt(1, keys.length + 1);
      s.path = [s.payable[getRandomInt(0, s.payable.length)]];
    }

    while (s.path.length !== pathLen) {
      let select = keys[getRandomInt(0, keys.length)];
      keys.splice(keys.indexOf(select), 1);
      s.path.push(select);
    }
    for (let func of Object.keys(this.functionsStructure)) {
      let inptData = [];
      for (let inpt of this.functionsStructure[func].inputs) {
        let randData = this.fillRandomData(inpt);
        inptData.push(randData);
      }
      inputData[func] = inptData;
    }
    s.inputData = inputData;
    return s;
  }

  randomSeed(s: Seed): Seed {
    const functionStruct = this.functionsStructure;
    let keys = Object.keys(functionStruct);
    const pathLen = getRandomInt(1, keys.length + 1);
    let inputData: any = {};
    s.path = [];
    while (s.path.length !== pathLen) {
      let select = keys[Math.floor(Math.random() * keys.length)];
      keys.splice(keys.indexOf(select), 1);
      s.path.push(select);
    }

    for (let func of s.path) {
      let inptData = [];
      for (let inpt of this.functionsStructure[func].inputs) {
        let randData = this.fillRandomData(inpt);
        inptData.push(randData);
      }
      inputData[func] = inptData;
    }
    s.inputData = inputData;
    return s;
  }

  fillRandomData(t: any): any {
    let res;
    if (Array.isArray(t)) {
      res = t.map((item: any) => {
        return this.fillRandomData(item);
      });
    } else {
      res = this.genRandData(t);
    }
    return res;
  }

  genRandData(solType: string) {
    let randValue = "";
    if (solType.includes("uint")) {
      randValue = this.getUint(solType);
    }
    else if (solType.includes("int")) {
      randValue = this.getInt(solType);
    }
    else if (solType.includes("address")) {
      randValue = this.allowAddresses[Math.floor(Math.random() * this.allowAddresses.length)];
    }
    else if (solType.includes("string")) {
      randValue = "randStr";
    }
    else if (solType.includes("bytes")) {
      randValue = this.getBytes(solType);
    }
    return randValue;
  }

  getBytes(solType: string) {
    let numBytes: number = +solType.slice(5);
    return this.ethers.utils.hexValue(this.ethers.utils.randomBytes(numBytes));
  }

  getUint(solType: string) {
    let power: number = +solType.slice(4);
    let max = ((power > 16) ? 600000 : 2 ** power - 1);
    return String(getRandomInt(400000, max));
  }

  mutateUint(solType: string, value: string): string {
    let power: number = +solType.slice(4);
    let n;
    if (power > 16) {
      return "600000";
    } else {
      let t = getRandomInt(0, 2);
      let rand = getRandomInt(0, 2 ** power - 1);
      n = Number(value);
      if (t === 0) {
        while (n + rand > 2 ** power - 1) rand = getRandomInt(0, 2 ** power - 1);
        n = n + rand;
      } else {
        while (n - rand < 0) rand = getRandomInt(0, 2 ** power - 1);
        n = n - rand;
      }
    }
    return String(n);
  }

  mutateInt(solType: string, value: string): string {
    let power: number = +solType.slice(3);
    let n;
    if (power > 16) {
      return "300000";
    } else {
      let t = getRandomInt(0, 2);
      let rand = getRandomInt(-(2 ** power) / 2, 2 ** power / 2 - 1);
      n = Number(value);
      if (t === 0) {
        while (n + rand > 2 ** power / 2 - 1) rand = getRandomInt(0, 2 ** power - 1);
        n = n + rand;
      } else {
        while (n - rand < -(2 ** power) / 2) rand = getRandomInt(0, 2 ** power - 1);
        n = n - rand;
      }
    }
    return String(n);
  }

  getInt(solType: string) {
    let power: number = +solType.slice(3);
    let min = ((power > 16) ? 400000 : -(2 ** power) / 2);
    let max = ((power > 16) ? 600000 : 2 ** power / 2 - 1);
    return String(getRandomInt(min, max));
  }



  /*
  deleteRandomCharacter(s: string): string {
    if (s.length == 0) return "";

    let pos = getRandomInt(0, s.length);
    return s.substring(0, pos) + s.substring(pos + 1, s.length);
  }

  insertRandomCharacter(s: string): string {
    let pos = getRandomInt(0, s.length);
    let newChar = String.fromCharCode(getRandomInt(32, 128));
    return s.substring(0, pos) + newChar + s.substring(pos, s.length);
  }

  flipRandomCharacter(s: string): string {
    if (s.length == 0) return "";

    let pos = getRandomInt(0, s.length);
    let charNum = s.charCodeAt(pos);
    let bits = 1 << getRandomInt(0, 7);
    let newChar = String.fromCharCode(charNum ^ bits);
    return s.substring(0, pos) + newChar + s.substring(pos + 1, s.length);
  }
  */
}
export { Mutator };