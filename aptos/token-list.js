const MainnetTokenList = [
  {
    symbol: "APT",
    name: "Aptos Coin",
    decimals: 8,
    logoURI: "/aptos.svg",
    store: "0x1::coin::CoinStore",
    module: "0x1::aptos_coin::AptosCoin",
    type: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
  }
]

const TestnetTokenList = MainnetTokenList

export const TokenList = (network) => {
  if (network == "mainnet") {
    return MainnetTokenList
  }
  return TestnetTokenList
}