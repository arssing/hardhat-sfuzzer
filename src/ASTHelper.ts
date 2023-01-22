import * as parser from "@solidity-parser/parser";
import fs from 'fs';

class ASTHelper {
  ast: any;
  pathFile: string;
  stateMutableOperations = ["=", "+=", "-=", "^=", "&=", "<<=", ">>=", "*=", "/=", "%=", "|=", "++", "--"];

  constructor(_path: string) {
    this.pathFile = _path;
    this.ast = readFile(_path);
  }

  getAllStateVariables() {
    let result: any = {};

    parser.visit(this.ast, {
      StateVariableDeclaration: function (node) {
        parser.visit(node, {
          VariableDeclaration: function (node) {
            if (node.isDeclaredConst !== true) {
              parser.visit(node, {
                Identifier: function (identifier) {
                  result[identifier.name] = {
                    visibility: node.visibility,
                    node: node
                  }
                }
              })
            }
          }
        })
      }
    })
    return result;
  }

  getAllPayableFuncs(stateVars: string[]) {
    let result: any = {};
    parser.visit(this.ast, {
      FunctionDefinition: function (func) {
        console.log(func);
      }
    })
  }

  getFunctionFullName(func: any): string {
    let result;
    let parameters: any = [];

    for (let parameter of func.parameters) {
      let arrayType = false;
      let typeName = "";
      let length = -1;

      parser.visit(parameter, {
        ArrayTypeName: function (arrType) {
          arrayType = true;
          if (arrType.length !== null) {
            parser.visit(arrType, {
              NumberLiteral: function (NumLit) {
                length = Number(NumLit.number);
              }
            })

          }
        },
        ElementaryTypeName: function (tn) {
          let name;
          if (tn.name === 'uint' || tn.name === 'int') name = `${tn.name}256`;
          else name = tn.name;
          if (arrayType && length !== -1) typeName = `${name}[${length}]`;
          else if (arrayType) typeName = `${name}[]`;
          else typeName = `${name}`;
        },
        UserDefinedTypeName: function (userType) {
          let name = userType.namePath;
          if (arrayType && length !== -1) typeName = `${name}[${length}]`;
          else if (arrayType) typeName = `${name}[]`;
          else typeName = `${name}`;
        }
      })
      parameters.push(typeName);
    }
    result = `${func.name}(${parameters})`;
    return result;
  }

  _getAllFunctions() {
    let result: any = [];
    parser.visit(this.ast, {
      FunctionDefinition: function (func) {
        result.push(func);
      }
    })
    return result;
  }

  getAllFunctionsByVariableName(variables: string[], skipUnavailableFunctions = true) {
    let operations = this.stateMutableOperations;
    let functions: any = {};
    let stateVarToFuncs: any = {};

    parser.visit(this.ast, {
      FunctionDefinition: function (func) {

        if (!(skipUnavailableFunctions && (func.visibility === "private" || func.visibility === "internal"))) {
          let funcParameters: Array<string> = [];
          console.log("parameters")
          console.log(func)
          console.log(func.parameters)
          /*
          parser.visit(func.parameters, {
            ArrayTypeName: function (tn) {
              parser.visit(tn, {
                ElementaryTypeName: function (tn1) {
                  //console.log(tn);
                }
              })
            },
            ElementaryTypeName: function (tn) {
              console.log(tn);
              let name = "";
              if (tn.name === "uint") name = "uint256";
              else name = tn.name;
              funcParameters.push(name);
            }
          })
          */

          let fullName = `${func.name}(${funcParameters})`;
          functions[fullName] = func;

          parser.visit(func, {
            BinaryOperation: function (node) {
              if (operations.includes(node.operator)) {
                parser.visit(node.left, {
                  Identifier: function (identifier) {
                    if (identifier.name in stateVarToFuncs) {
                      stateVarToFuncs[identifier.name].add(fullName);
                    } else if (variables.includes(identifier.name)) {
                      stateVarToFuncs[identifier.name] = new Set([fullName]);
                    }
                  }
                })
              };
            },
            UnaryOperation: function (node) {
              parser.visit(node, {
                Identifier: function (identifier) {
                  if (identifier.name in stateVarToFuncs) {
                    stateVarToFuncs[identifier.name].add(fullName);
                  } else if (variables.includes(identifier.name)) {
                    stateVarToFuncs[identifier.name] = new Set([fullName]);
                  }
                }
              })
            }
          })
        }
      }
    })

    return {
      stateVariables: stateVarToFuncs,
      functions: functions
    };
  }
}

function readFile(path: string) {
  let ast;
  let input = fs.readFileSync(path, "utf-8");
  try {
    ast = parser.parse(input);
    return ast;
  } catch (e) {
    if (e instanceof parser.ParserError) {
      console.error(e.errors);
    }
    throw new Error("Error when parse");
  }
}

export { ASTHelper };