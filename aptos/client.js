import { AptosClient } from "aptos"
import { toBiggerUnit } from "./utils"
import Decimal from 'decimal.js'
import publicConfig from "../publicConfig";

const client = new AptosClient(publicConfig.nodeURL)

// export const getTokenBalance = async (address, token) => {
//   const resources = await client.getAccountResources(address)
//   const accountResource = resources.find((r) => r.type === token.type)
//   if (accountResource) {
//     return toBiggerUnit(accountResource.data.coin.value, token.decimals)
//   }
//   return new Decimal(0)
// }

export const getTokenBalance = async (address, token) => {
  try {
    const resource = await client.getAccountResource(address, token.type)
    return toBiggerUnit(resource.data.coin.value, token.decimals)
  } catch (e) {
    return new Decimal(0)
  }
}

export const isAccountRegistered = async (address, token) => {
  const resource = await client.getAccountResource(address, token.type)
  console.log(resource)
}