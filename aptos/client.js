import { AptosClient, BCS } from "aptos"
import { toBiggerUnit } from "./utils"
import Decimal from 'decimal.js'
import publicConfig from "../publicConfig";

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
    const resource = await aptosClient.getAccountResource(address, token.type)
    return true
  } catch (e) {
    return false
  }
}

export const batchTransfer = async (token, recipients, amounts) => {
  const address = '81e6c006878e0ff4d8f05d9ccd6294c4579338ddb3f1febdca125c8ae31b17d9'
  console.log(recipients)
  console.log(amounts)

  const payload = {
    type: "entry_function_payload",
    function: "0x2518acf6dc31955a622f8626927364df87491a7887d1694d66e016e4a5686c26::bayou::batch_transfer",
    type_arguments: [token.module],
    arguments: [recipients, amounts],
  }

  console.log(payload)
  return window.aptos.signAndSubmitTransaction(payload)
}