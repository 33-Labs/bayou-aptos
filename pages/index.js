import Head from 'next/head'
import { useState, useEffect } from "react"
import { isEmptyObject, networkSupported, userConnected } from '../aptos/utils'
import { connect, getConnectedAccount, Wallet } from '../aptos/wallet'

import Decimal from 'decimal.js'
import NavigationBar from '../components/NavigationBar'
import WalletConnector from '../components/WalletConnector'
import WalletSelectorModal from '../components/WalletSelectorModal'
import TokenSelector from '../components/TokenSelector'
import RecipientsInput from '../components/RecipientInput'
import Footer from '../components/Footer';
import { XCircleIcon } from '@heroicons/react/solid'

const WrongNetworkInfo = () => {
  return (
    <div className="bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className="text-sm text-red-800">Wrong Network</p>
        </div>
      </div>
    </div>
  )
}

export default function Home(props) {
  const [user, setUser] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [showWalletSelector, setShowWalletSelector] = useState(false)
  const [selectedToken, setSelectedToken] = useState(null)
  const [tokenBalance, setTokenBalance] = useState(new Decimal(0))
  const [showWrongNetwork, setShowWrongNetwork] = useState(false)

  const { setShowNotification, setNotificationContent } = props

  useEffect(() => {
    const initUser = async () => {
      const {account: account, wallet: wallet} = await getConnectedAccount()
      if (account) {
        setUser(account)
      }

      if (wallet) {
        const network = await wallet.getNetwork()
        setShowWrongNetwork(!networkSupported(network))
      }
    }

    initUser().catch(console.error)
  }, [])

  useEffect(() => {
    if (!wallet) { return }
    const connectWallet = async () => {
      const w = Wallet[wallet]

      const user = await w.connect()
      if (user) { 
        setUser(user) 
      }

      const network = await w.getNetwork()
      setShowWrongNetwork(!networkSupported(network))

      w.onAccountChange(async (newAccount) => {
        const currentWallet = localStorage.getItem("wallet")
        if (currentWallet != wallet) { return }

        try {
          const newAccount = await w.connect()
          setUser({...newAccount, wallet: wallet})
        } catch (e) {
          setUser(null)
          setWallet(null)
        } 
      })

      w.onNetworkChange(async (supported) => {
        const currentWallet = localStorage.getItem("wallet")
        if (currentWallet != wallet) { return }
        setShowWrongNetwork(!supported)
      })

    }

    connectWallet().catch((e) => {
      setWallet(null)
      setUser(null)
      console.error(e)
    })
  }, [wallet])

  useEffect((user) => {
    setSelectedToken(null)
    setTokenBalance(new Decimal(0))
  }, [user])

  return (
    <>
      <Head>
        <title>bayou | batch token transfer tool</title>
        <meta property="og:title" content="aptos-green | batch token transfer tool" key="title" />
      </Head>
      <div className="container mx-auto max-w-[880px] min-w-[350px] px-8">
        {
          showWrongNetwork ?
            WrongNetworkInfo() : null
        }
        <NavigationBar user={user} />
        <WalletConnector
          className="mt-12 w-full"
          user={user}
          setUser={setUser}
          wallet={wallet}
          setWallet={setWallet}
          setShowWalletSelector={setShowWalletSelector}
          setShowNotification={setShowNotification}
          setShowWrongNetwork={setShowWrongNetwork}
          setNotificationContent={setNotificationContent}
        />

        <div className="flex flex-col items-center justify-center">
          {
            user && userConnected(user) && (
              <>
                <TokenSelector
                  className="w-full mb-20"
                  user={user}
                  selectedToken={selectedToken}
                  setSelectedToken={setSelectedToken}
                  tokenBalance={tokenBalance}
                  setTokenBalance={setTokenBalance}
                />
                <RecipientsInput
                  className="w-full"
                  user={user}
                  selectedToken={selectedToken}
                  tokenBalance={tokenBalance}
                  setNotificationContent={setNotificationContent}
                  setShowNotification={setShowNotification}
                />
              </>
            )
          }

        </div>
        <Footer />
        <WalletSelectorModal open={showWalletSelector} setOpen={setShowWalletSelector} setWallet={setWallet} />
      </div>
    </>
  )
}
