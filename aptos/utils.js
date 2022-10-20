import Decimal from 'decimal.js'

export const shortenedAddress = (address) => {
  if (typeof address != "string") { return "UNKNOWN" }
  const first = address.slice(0, 10).concat('...')
  const second = address.slice(-8)
  return first.concat(second)
}

export const userConnected = (user) => {
  return (user.wallet == "Martian" && user.method == "connected" && user.status == 200) ||
    (user.wallet == "Petra" && user.address && user.publicKey) ||
    (user.address && user.publicKey)
}

export const toBiggerUnit = (rawAmount, decimals) => {
  return new Decimal(rawAmount).div(new Decimal(10).toPower(decimals))
}

export const toSmallerUnit = (amount, decimals) => {
  console.log(amount)
  console.log(decimals)
  return new Decimal(amount).mul(new Decimal(10).toPower(decimals))
}