import { AptosClient, BCS } from "aptos"
import { toBiggerUnit } from "./utils"
import Decimal from 'decimal.js'
import publicConfig from "../publicConfig";
import { Wallet } from "./wallet";

export const aptosClient = new AptosClient(publicConfig.nodeURL)

export const getTokenBalance = async (address, token) => {
  try {
    const resource = await aptosClient.getAccountResource(address, token.type)
    return toBiggerUnit(resource.data.coin.value, token.decimals)
  } catch (e) {
    return new Decimal(0)
  }
}

export const isAccountRegistered = async (address, token) => {
  try {
    await aptosClient.getAccountResource(address, token.type)
    return true
  } catch (e) {
    return false
  }
}

export const batchTransfer = async (token, recipients, amounts) => {
  const payload = {
    type: "entry_function_payload",
    function: `${publicConfig.bayouAddress}::bayou::batch_transfer`,
    type_arguments: [token.module],
    arguments: [recipients, amounts],
  }

  const currentWallet = localStorage.getItem("wallet")
  if (currentWallet != "") {
    const w = Wallet[currentWallet]
    const account = await w.getAccount()
    return w.signAndSubmitTransaction(account, payload)
  }
  throw "Wallet not found"
}