import path from "path";
import shell from "shelljs";
import fs from 'fs';
function getArtifactsList(artifactsPath: string) {
  const lsTemplate = path.join(artifactsPath, 'contracts', '**', '*.json');
  const allContracts = shell.ls(lsTemplate).map(path.normalize);
  return allContracts.filter(notDbgExtension);
}

function notDbgExtension(pathToFile: string) {
  return !pathToFile.includes("dbg.json");
}

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function getCoverageFromMatrix() {
  let res: any = {};
  let contracts = JSON.parse(fs.readFileSync("./testMatrix.json", "utf-8"));
  for (let contract of Object.keys(contracts)) {
    let set = new Set();
    for (let line of Object.keys(contracts[contract])) {
      if (contracts[contract][line].length > 0) set.add(line)
    }
    res[contract] = Array.from(set);
  }
  return res;
}



export { getArtifactsList, getCoverageFromMatrix, getRandomInt };