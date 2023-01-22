import Graph from 'graphology';
import { allSimplePaths } from 'graphology-simple-path';
import { ASTHelper } from "./ASTHelper";

function graphSimplePath(funcs: any) {

  let containsConstructor = false;
  let constructorName = "";
  let result = [];

  const graph = new Graph();
  for (let func1 of funcs) {
    if (func1.includes("null")) {
      containsConstructor = true;
      constructorName = func1;
    }
    for (let func2 of funcs) {
      graph.mergeEdge(func1, func2);
    }
  }

  for (let func1 of funcs) {
    if (!containsConstructor) {
      for (let func2 of funcs) {
        if (func1 === func2) continue;
        const paths = allSimplePaths(graph, func1, func2);
        for (let path of paths) {
          if (path.length === funcs.size) result.push(path);
        }
      }
    } else {
      if (func1 === constructorName) continue;
      const paths = allSimplePaths(graph, constructorName, func1);
      for (let path of paths) {
        if (path.length === funcs.size) result.push(path);
      }
    }
  }
  return result;
}

function getAllPaths(contractPath: string) {
  let input = new ASTHelper(contractPath);
  let allStateVar = input.getAllStateVariables();
  let res = input.getAllFunctionsByVariableName(Object.keys(allStateVar));
  console.log(res.functions["pay(uint256)"].parameters[0].typeName);
  let result: any = {};

  for (let v of Object.keys(res.stateVariables)) {
    if (res.stateVariables[v].size == 1) {
      for (let item of res.stateVariables[v].values()) result[v] = item;
      continue;
    }
    result[v] = graphSimplePath(res.stateVariables[v]);
  }

  return result;
}

export { getAllPaths };