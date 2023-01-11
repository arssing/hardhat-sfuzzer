import { Seed } from "./Seed";

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

class Mutator {

  mutators = [
    this.deleteRandomFuncFromPath,
    this.insertRandomFuncInPath,
    this.flipRandomFuncInPath
  ];

  mutate(s: Seed): Seed {
    let mutator = this.mutators[getRandomInt(0, this.mutators.length)];
    return mutator(s);
  }

  deleteRandomFuncFromPath(s: Seed): Seed {
    if (s.path.length == 0) return s;
    const pos = getRandomInt(0, s.path.length);
    s.path.splice(pos, 1);
    return s;
  }

  insertRandomFuncInPath(s: Seed): Seed {
    const keys = Object.keys(s.functions);
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