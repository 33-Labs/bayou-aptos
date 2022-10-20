export const Wallet = {
  Petra: {
    name: "Petra",
    getWallet: function(directToInstall) {
      if ('aptos' in window) {
        return window.aptos
      } 
      if (directToInstall) {
        window.open("https://petra.app", "_blank")
      }
      return null
    },
    getAccount: async function() {
      const wallet = this.getWallet()
      if (wallet && (await wallet.isConnected())) {
        const account = await wallet.account()
        return {...account, wallet: this.name}
      } 
      return null
    },
    connect: async function() {
      const wallet = this.getWallet(true)
      if (!wallet) { 
        console.error("Wallet not found")
        return null
      }
      const account = await wallet.connect()
      return {...account, wallet: this.name}
    },
    disconnect: async function() {
      const wallet = this.getWallet(true)
      if (!wallet) { 
        console.error("Wallet not found")
        return null
      }
      await wallet.disconnect()
    }
  },
  Martian: {
    name: "Martian",
    getWallet: function(directToInstall) {
      if ('martian' in window) {
        return window.martian
      } 
      if (directToInstall) {
        window.open("https://www.martianwallet.xyz/", "_blank")
      }
      return null
    },
    getAccount: async function() {
      const wallet = this.getWallet()
      console.log("isConnected:", await wallet.isConnected())
      if (wallet && (await wallet.isConnected())) {
        const account = await wallet.account()
        console.log("connected account:", account)
        return {...account, wallet: this.name}
      } 
      return null
    },
    connect: async function() {
      const wallet = this.getWallet()
      if (!wallet) { 
        console.error("Wallet not found")
        return null
      }
      const account = await wallet.connect()
      return {...account, wallet: this.name}
    },
    disconnect: async function() {
      const wallet = this.getWallet()
      if (!wallet) { 
        console.error("Wallet not found")
        return null
      }
      await wallet.disconnect()
    }
  }
}

export const connect = async (wallet) => {
  return await Wallet[wallet].connect()
}

export const disconnect = async (user) => {
  if (user && user.wallet) {
    const wallet = Wallet[user.wallet]
    await wallet.disconnect()
    return
  }
  console.log("Disconnect failed")
}

export const getConnectedAccount = async () => {
  let account = await Wallet.Petra.getAccount()
  if (account) { return account }

  console.log(account)
  account = await Wallet.Martian.getAccount()
  if (account) { return account } 
  console.log(account)
  return null
}