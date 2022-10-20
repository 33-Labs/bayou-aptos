import Decimal from 'decimal.js'

export const shortenedAddress = (address) => {
  if (typeof address != "string") { return "UNKNOWN" }
  const first = address.slice(0, 8).concat('...')
  const second = address.slice(-8)
  return first.concat(second)
}

export const userConnected = (user) => {
  return user.method == "connected" && user.status == 200
}

export const toBiggerUnit = (rawAmount, decimals) => {
  return new Decimal(rawAmount).div(new Decimal(10).toPower(decimals))
}