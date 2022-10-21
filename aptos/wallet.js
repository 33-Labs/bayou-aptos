import { networkSupported } from "./utils"

export const Wallet = {
  Pontem: {
    name: "Pontem",
    signAndSubmitTransaction: async function(sender, payload) {
      const wallet = this.getWallet(false)
      if (wallet) {
        const pendingTx = await wallet.signAndSubmit(payload)
        console.log("pendingTx", pendingTx)
        return pendingTx.result.hash
      }
      return "Wallet not found"
    },
    onNetworkChange: function(callback) {
      const wallet = this.getWallet(false)
      if (wallet) {
        wallet.onChangeNetwork(async (newNetwork) => {
          let network = newNetwork.name.toLowercase()
          if (network.includes("devnet")) {
            network = "devnet"
          } else if (network.includes("testnet")) {
            network = "testnet"
          } else if (network.includes("mainnet")) {
            network = "mainnet"
          } 
          const supported = networkSupported(network)
          callback(supported)
        })
      }
    },
    onAccountChange: function(callback) {
      const wallet = this.getWallet(false)
      if (wallet) {
        wallet.onChangeAccount(callback)
      }
    },
    getNetwork: async function() {
      const wallet = this.getWallet(false) 
      if (wallet) {
        const network = (await wallet.network()).name.toLowerCase()
        if (network.includes("devnet")) {
          return "devnet"
        } else if (network.includes("testnet")) {
          return "testnet"
        } else if (network.includes("mainnet")) {
          return "mainnet"
        } 
      }
      
      return "unknown"
    },
    getWallet: (directToInstall) => {
      if ('pontem' in window) {
        return window.pontem
      } 
      if (directToInstall) {
        window.open("https://pontem.network", "_blank")
      }
      return null
    },
    isConnected: async function() {
      const wallet = this.getWallet(false) 
      if (wallet) {
        return await wallet.isConnected()
      }
      return false
    },
    getAccount: async function() {
      const wallet = this.getWallet(false)
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
      const wallet = this.getWallet(false)
      if (!wallet) { 
        console.error("Wallet not found")
        return null
      }
      await wallet.disconnect()
    }
  },
  Petra: {
    name: "Petra",
    signAndSubmitTransaction: async function(sender, payload) {
      const wallet = this.getWallet(false)
      if (wallet) {
        const pendingTx = await wallet.signAndSubmitTransaction(payload)
        return pendingTx.hash
      }
      return "Wallet not found"
    },
    onNetworkChange: function(callback) {
      const wallet = this.getWallet(false)
      if (wallet) {
        wallet.onNetworkChange(async (newNetwork) => {
          const network = newNetwork.networkName
          const supported = networkSupported(network)
          callback(supported)
        })
      }
    },
    onAccountChange: function(callback) {
      const wallet = this.getWallet(false)
      if (wallet) {
        wallet.onAccountChange(callback)
      }
    },
    getNetwork: async function() {
      const wallet = this.getWallet(false) 
      if (wallet) {
        return await wallet.network()
      }
      return "unknown"
    },
    getWallet: (directToInstall) => {
      if ('aptos' in window) {
        return window.aptos
      } 
      if (directToInstall) {
        window.open("https://petra.app", "_blank")
      }
      return null
    },
    isConnected: async function() {
      const wallet = this.getWallet(false) 
      if (wallet) {
        return await wallet.isConnected()
      }
      return false
    },
    getAccount: async function() {
      const wallet = this.getWallet(false)
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
      const wallet = this.getWallet(false)
      if (!wallet) { 
        console.error("Wallet not found")
        return null
      }
      await wallet.disconnect()
    }
  },
  Martian: {
    name: "Martian",
    signAndSubmitTransaction: function(account, payload) {
      const wallet = this.getWallet(false)
      if (wallet) {
        return wallet.generateSignAndSubmitTransaction(account.address, payload)
      }
      return "Wallet not found"
    },
    onNetworkChange: function(callback) {
      const wallet = this.getWallet(false)
      if (wallet) {
        wallet.onNetworkChange(async (network) => {
          const supported = networkSupported(network)
          callback(supported)
        })
      }
    },
    onAccountChange: function(callback) {
      const wallet = this.getWallet(false)
      if (wallet) {
        wallet.onAccountChange(callback)
      }
    },
    getNetwork: async function() {
      const wallet = this.getWallet(false) 
      if (wallet) {
        return await wallet.network()
      }
      return "unknown"
    },
    getWallet: (directToInstall) => {
      if ('martian' in window) {
        return window.martian
      } 
      if (directToInstall) {
        window.open("https://www.martianwallet.xyz/", "_blank")
      }
      return null
    },
    getAccount: async function() {
      const wallet = this.getWallet(false)
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
      const wallet = this.getWallet(false)
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
}

export const getConnectedAccount = async () => {
  let account = await Wallet.Petra.getAccount()
  if (account) { return {account: account, wallet: Wallet.Petra} }

  account = await Wallet.Martian.getAccount()
  if (account) { return {account: account, wallet: Wallet.Martian } }

  return {account: null, wallet: null}
}