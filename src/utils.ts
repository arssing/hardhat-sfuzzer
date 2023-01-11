import path from "path";
import shell from "shelljs";

function getArtifactsList(artifactsPath: string) {
  const lsTemplate = path.join(artifactsPath, 'contracts', '**', '*.json');
  const allContracts = shell.ls(lsTemplate).map(path.normalize);
  return allContracts.filter(notDbgExtension);
}

function notDbgExtension(pathToFile: string){
  return !pathToFile.includes("dbg.json");
}

export {getArtifactsList};