import { AptosClient } from "aptos"
import { toBiggerUnit } from "./utils";

const client = new AptosClient('https://fullnode.testnet.aptoslabs.com/v1');

export const getTokenBalance = async (address, token) => {
  const resources = await client.getAccountResources(address)
  const accountResource = resources.find((r) => r.type === token.tokenType)
  if (accountResource) {
    return toBiggerUnit(accountResource.data.coin.value, token.decimals)
  }
  return new Decimal(0)
}