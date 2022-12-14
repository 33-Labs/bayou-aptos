import { useState, useEffect } from 'react'
import Image from 'next/image'
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'
import { Combobox } from '@headlessui/react'
import useSWR, { useSWRConfig } from 'swr'

import Decimal from 'decimal.js';
import { TokenList } from '../aptos/token-list';

import publicConfig from '../publicConfig'
import { userConnected } from '../aptos/utils';
import { getTokenBalance, isAccountRegistered } from '../aptos/client';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const balanceFetcher = async (funcName, address, token) => {
  return await getTokenBalance(address, token)
}

export default function TokenSelector(props) {
  const [query, setQuery] = useState('')
  const [tokens, setTokens] = useState([]);

  const { user, selectedToken, setSelectedToken, tokenBalance, setTokenBalance } = props
  const { mutate } = useSWRConfig()

  useEffect(() => {
    let network = "mainnet"
    if (publicConfig.chainEnv == 'testnet') {
      network = "testnet"
    }

    setTokens(TokenList(network))
  }, [setTokens])


  const { data: balanceData, error: balanceError } = useSWR(
    selectedToken && user ? ["balanceFetcher", user.address, selectedToken] : null, balanceFetcher)

  useEffect(() => {
    if (balanceData) {
      setTokenBalance(balanceData)
    }
  }, [balanceData])

  const filteredTokens =
    query === ''
      ? tokens
      : tokens.filter((token) => {
        const content = `${token.name} (${token.symbol})`
        return content.toLowerCase().includes(query.toLowerCase())
      })

  return (
    <Combobox as="div" className={props.className} value={user && userConnected(user) && selectedToken} onChange={async (token) => {
      if (user && userConnected(user)) {
        setTokenBalance(new Decimal(0))
        setSelectedToken(token)
        mutate(["balanceFetcher", user.address, token])
      }
    }}>
      <Combobox.Label className="block text-2xl font-flow font-bold">Token</Combobox.Label>
      {user && userConnected(user) ? (selectedToken
        ? <Combobox.Label className="block text-md font-flow leading-10">Your balance is {tokenBalance.toString()} {selectedToken.symbol}</Combobox.Label>
        : <Combobox.Label className="block text-md font-flow leading-10">Select the token to transfer</Combobox.Label>
      ) : <Combobox.Label className="block text-md font-flow leading-10">Please connect to wallet</Combobox.Label>
      }
      <div className="relative mt-1">
        <Combobox.Input
          className="w-full h-[50px] text-lg font-flow border border-aptos-green bg-aptos-green/10 py-2 pl-3 pr-10  focus:border-aptos-green-dark focus:outline-none focus:ring-1 focus:ring-aptos-green-dark"
          onChange={(event) => {
            setQuery(event.target.value)
          }}
          displayValue={(token) => token && `${token.name} (${token.symbol})`}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>

        {filteredTokens.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto  bg-white py-1 text-lg shadow-lg ring-1 ring-aptos-green-dark ring-opacity-5 focus:outline-none">
            {filteredTokens.map((token) => (
              <Combobox.Option
                key={token.module}
                value={token}
                className={({ active }) =>
                  classNames(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    active ? 'bg-aptos-green/50' : 'text-black'
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <div className="flex items-center">
                      <div className="w-6 h-6 relative">
                        <Image src={token.logoURI} alt="" layout="fill" objectFit="cover" className="rounded-full" />
                      </div>
                      <span className={classNames('ml-3 truncate', selected && 'font-semibold')}>{`${token.name} (${token.symbol})`}</span>
                    </div>

                    {selected && (
                      <span
                        className={classNames(
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                          active ? 'text-black' : 'text-aptos-green-dark'
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  )
}
