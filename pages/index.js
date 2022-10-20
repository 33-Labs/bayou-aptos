import Head from 'next/head'
import { useState, useEffect } from "react"
import { userConnected } from '../aptos/utils'
import { connect, getConnectedAccount } from '../aptos/wallet'

import Decimal from 'decimal.js'
import NavigationBar from '../components/NavigationBar'
import WalletConnector from '../components/WalletConnector'
import WalletSelectorModal from '../components/WalletSelectorModal'
import TokenSelector from '../components/TokenSelector'
import RecipientsInput from '../components/RecipientInput'
import Footer from '../components/Footer';

export default function Home(props) {
  const [user, setUser] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [showWalletSelector, setShowWalletSelector] = useState(false)
  const [selectedToken, setSelectedToken] = useState(null)
  const [tokenBalance, setTokenBalance] = useState(0)
  const { setShowNotification, setNotificationContent } = props

  useEffect(() => {
    const initUser = async () => {
      const account = await getConnectedAccount()
      if (account) { 
        setUser(account) 
      }
    }

    initUser().catch(console.error)
  }, [])

  useEffect(() => {
    console.log("YY")
    if (!wallet) { return }
    const connectWallet = async () => {
      console.log(wallet)
      const user = await connect(wallet)
      console.log(user)
      if (user) {
        setUser(user)
      }
    }
    connectWallet().catch(console.error)
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
        <NavigationBar user={user} />
        <WalletConnector
          className="mt-12 w-full"
          user={user}
          setUser={setUser}
          wallet={wallet}
          setWallet={setWallet}
          setShowWalletSelector={setShowWalletSelector}
          setShowNotification={setShowNotification}
          setNotificationContent={setNotificationContent}
        />

        <div className="flex flex-col items-center justify-center">
          {
            user && userConnected(user) && (
              <>
                <TokenSelector
                  className="w-full mb-20"
                  user={user}
                  onTokenSelected={(token) => setSelectedToken(token)}
                  onBalanceFetched={(balance) => setTokenBalance(balance)}
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
