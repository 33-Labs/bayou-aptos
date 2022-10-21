// import * as fcl from "@onflow/fcl";
import { useEffect } from "react";
import { connect, disconnect } from "../aptos/wallet";
import { shortenedAddress } from "../aptos/utils";
import publicConfig from "../publicConfig";
// import config from "../flow/config.js"
// import publicConfig from "../publicConfig.js";



export default function WalletConnector(props) {
  const { user, setUser, setWallet, setShowWalletSelector, setShowWrongNetwork } = props

  const AuthedState = () => {
    return (
      <div >
        <label className="w-full whitespace-pre block font-flow text-md leading-10 truncate">
          {"Logged in as "}
          <a
            href={`${publicConfig.explorerURL}/account/${user.address}?netwokr=${publicConfig.chainEnv.toLowerCase()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-flow text-lg leading-10 underline decoration-aptos-green decoration-2 truncate">
            {user ? shortenedAddress(user.address) : "No Address"}
          </a>
        </label>
        <button
          type="button"
          className="h-14 mt-8 mb-20 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium shadow-md text-black bg-aptos-green hover:bg-aptos-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bayou"
          onClick={async () => {
            // WORKAROUND:
            // If the user switch account and then click disconnect wallet,
            // Petra will raise The requested method and/or account has not been authorized by the user. 
            try {
              await disconnect(user)
            } catch (e) { console.log(e) }
            localStorage.setItem("wallet", "")
            setShowWrongNetwork(false)
            setWallet(null)
            setUser(null)
          }}
        >
          Disconnect
        </button>
      </div>
    )
  }

  const UnauthenticatedState = () => {
    return (
      <div>
        <label className="block font-flow text-md leading-10">
          Connect to wallet and start <span className="font-flow font-bold text-sm">Batch Transfer</span>
        </label>
        <button
          type="button"
          className="h-14 mt-8 mb-20 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium shadow-md text-black bg-aptos-green hover:bg-aptos-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bayou"
          onClick={async () => {
            setShowWalletSelector(true)
          }}
        >
          Connect Wallet
        </button>
      </div>
    )
  }

  return (
    <div className={props.className}>
      <label className="block text-2xl font-bold font-flow">
        Connect to Wallet
      </label>
      {user ? <AuthedState /> : <UnauthenticatedState />}
    </div>
  )
}