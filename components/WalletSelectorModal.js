import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { Wallet } from '../aptos/wallet'

export default function WalletSelectorModal(props) {
  const router = useRouter()
  const { open, setOpen, setWallet } = props

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="sm:-mt-20 flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative bg-white rounded-2xl transform transition-all overflow-hidden shadow-xl
              px-4 pt-5 pb-5 text-left sm:my-8 min-w-[350px] sm:max-w-sm sm:w-full sm:p-6">
                <div className="w-full text-center">
                  <Dialog.Title as="h3" className="text-xl leading-6 font-semibold text-gray-900">
                    {`Connect Wallet`}
                  </Dialog.Title>
                  <div className="flex flex-col items-center justify-center gap-y-4 mt-4">
                    <button className="flex w-full rounded-xl p-4 items-center gap-x-4
                    ring-1 ring-black ring-opacity-10 overflow-hidden
                    bg-white hover:bg-gray-100"
                      onClick={async () => {
                        localStorage.setItem("wallet", "Petra")
                        if (await Wallet["Petra"].getWallet(true)) {
                          setWallet("Petra")
                        }
                        setOpen(false)
                      }}
                    >
                      <Image className="rounded-full" src="/petra.jpeg" alt="" width={36} height={36} priority />
                      <label className="font-flow text-lg">
                        Petra
                      </label>
                    </button>
                    <button className="flex w-full rounded-xl p-4 items-center gap-x-4
                    ring-1 ring-black ring-opacity-10 overflow-hidden
                    bg-white hover:bg-gray-100"
                      onClick={async () => {
                        localStorage.setItem("wallet", "Martian")
                        if (await Wallet["Martian"].getWallet(true)) {
                          setWallet("Martian")
                        }
                        setOpen(false)
                      }}>
                      <Image className="rounded-full" src="/martian.jpeg" alt="" width={36} height={36} priority />
                      <label className="font-flow text-lg">
                        Martian
                      </label>
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}