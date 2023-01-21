import { Interface } from "@ethersproject/abi/src.ts/interface";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import fs from 'fs';
class HardhatClient {
  hre: HardhatRuntimeEnvironment;
  erc20: {addr: string, iface: Interface} | undefined;
  attacker: {addr: string, iface: Interface} | undefined;

  constructor(_hre: HardhatRuntimeEnvironment) {
    this.hre = _hre;
  }

  async setupHardhatEVM(){
    let attacker = JSON.parse(fs.readFileSync("./src/contracts/Attacker.json", "utf-8"));
    let erc20 = JSON.parse(fs.readFileSync("./src/contracts/ERC20.json", "utf-8"));
    let erc20Iface = new this.hre.ethers.utils.Interface(erc20["abi"]);
    let attackerIface = new this.hre.ethers.utils.Interface(attacker["abi"]);
    const attackerAddr = await this.deploy(attacker["bytecode"]);

    let erc20Constructor = erc20Iface.encodeDeploy(["Test", "TST"]);
    if (erc20Constructor.startsWith("0x")) erc20Constructor = erc20Constructor.slice(2);
    const erc20Addr = await this.deploy(erc20["bytecode"]+erc20Constructor);
    this.erc20 = {addr: erc20Addr, iface: erc20Iface};
    this.attacker = {addr: attackerAddr, iface: attackerIface};
    return [attackerAddr, erc20Addr];
  }

  async mintERC20(toAddr: string){
    let status = "0x0";
    if (this.erc20 !== undefined){
      let selector = this.erc20.iface.encodeFunctionData("mint", [toAddr, this.hre.ethers.utils.parseEther("10.0")]);
      let acc = await this.getAccounts();
      let ransaction = await this.interactWithoutValue(acc[0], this.erc20.addr, selector);
      status = ransaction.status;
    }
    if (status === "0x0") return false;
    return true;
  }

  async getAccounts() {
    return this.hre.network.provider.send("eth_accounts", []);
  }

  async getBalance(address: string) {
    return this.hre.network.provider.send("eth_getBalance", [address]);
  }

  async getBlock() {
    return this.hre.network.provider.send("eth_blockNumber");
  }

  async deploy(bytecode: string) {
    let acc = await this.getAccounts();
    const hashAt = await this.hre.network.provider.send("eth_sendTransaction", [
      { from: acc[0], data: bytecode },
    ]);
    const addr = await this.hre.network.provider.send("eth_getTransactionReceipt", [hashAt]);
    return addr["contractAddress"];
  }

  async interactWithValue(frm: string, _to: string, _data: string, valueInEth: string){
    const hash = await this.hre.network.provider.send("eth_sendTransaction", [
      { to: _to, from: frm, data: _data, value: valueInEth},
    ]);
    const { result } = await this.hre.network.provider.send("eth_getTransactionReceipt", [hash]);
    return result;
  }

  async interactWithoutValue(frm: string, _to: string, _data: string){
    const hash = await this.hre.network.provider.send("eth_sendTransaction", [
      {to: _to, from: frm, data: _data},
    ]);
    const result = await this.hre.network.provider.send("eth_getTransactionReceipt", [hash]);
    return result;
  }

  async sendEther(to: string, valueInEth: string){
    let res = await this.hre.network.provider.send("hardhat_setBalance", [
      to, valueInEth
    ]);
    return res;
  }

  async ethCall(frm: string, _to: string, _data: string){
    const result = await this.hre.network.provider.send("eth_call", [
      {
        to: _to,
        from: frm,
        data: _data,
      },
    ]);
    return result;
  }
  async getCount(){
    let selector = this.attacker?.iface.getSighash("count");
    let acc = await this.getAccounts();
    let count = await this.ethCall(acc[0], this.attacker?.addr, selector);
    return count;
  }
  async increaseTime(timeInSec: number){
    await this.hre.network.provider.send("evm_increaseTime", [timeInSec]);
  }

  async hardhatMetadata(){
    let res = await this.hre.network.provider.send("hardhat_metadata");
    return res;
  }

  async hardhatMine(){
    let res = await this.hre.network.provider.send("hardhat_mine");
    return res;
  }

  async getBlockByHash(hash: string){
    let res = await this.hre.network.provider.send("eth_getBlockByHash",[hash, true]);
    return res;
  }

  

}
export {HardhatClient};