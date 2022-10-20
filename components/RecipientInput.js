import { useState, useEffect, useCallback } from 'react'

import publicConfig from '../publicConfig'
import Decimal from 'decimal.js'
import CSVSelector from './CSVSelector'
import { aptosClient, batchTransfer } from '../aptos/client'
import { shortenedAddress, toBiggerUnit, toSmallerUnit } from '../aptos/utils'
import { useSWRConfig } from 'swr'

export default function RecipientsInput(props) {
  const { mutate } = useSWRConfig()

  const [rawRecordsStr, setRawRecordsStr] = useState('')
  const [recordsSum, setRecordsSum] = useState(new Decimal(0))
  const [validRecords, setValidRecords] = useState([])
  const [unpreparedRecords, setUnpreparedRecords] = useState([])
  const [invalidRecords, setInvalidRecords] = useState([])
  const [txid, setTxid] = useState(null)
  const [txStatus, setTxStatus] = useState(null)
  const { user, selectedToken, setShowNotification, setNotificationContent } = props

  const [processState, setProcessState] = useState({
    disabled: false,
    text: "Process"
  })

  const cleanStatus = () => {
    setShowNotification(false)
    setValidRecords([])
    setUnpreparedRecords([])
    setInvalidRecords([])
    cleanTxInfo()
  }

  const cleanTxInfo = () => {
    setTxid(null)
    setTxStatus(null)
  }

  const Pending = 'Pending'
  const Confirmed = 'Confirmed'
  const ExecutionFailed = 'Execution Failed'
  const Rejected = 'Transaction Rejected'
  const TransactionStatus = {
    Pending,
    Confirmed,
    ExecutionFailed,
    Rejected
  }

  useEffect(() => {
    if (selectedToken) {
      cleanStatus()
    }
  }, [selectedToken])

  const filterRecordsOnChain = async (token, records) => {
    let preparedRecords = records
    let unpreparedRecords = []

    setRecordsSum(preparedRecords.reduce((p, c) => {
      return p.add(c.amount)
    }, new Decimal(0)))
    return [preparedRecords, unpreparedRecords]
  }

  const filterRecords = (rawRecordsStr) => {
    const rawRecords = rawRecordsStr.split("\n")

    let records = []
    let invalidRecords = []
    for (var i = 0; i < rawRecords.length; i++) {
      let rawRecord = rawRecords[i]
      try {
        const [address, rawAmount] = rawRecord.split(",")
        const amount = new Decimal(rawAmount)
        if (!amount.isPositive()) { throw "invalid amount" }

        if (!address.startsWith("0x") || address.length != 66) { throw "invalid address" }
        const bytes = Buffer.from(address.replace("0x", ""), "hex")
        if (bytes.length != 32) { throw "invalid address" }

        records.push({ id: i, address: address, amount: amount, rawRecord: rawRecord })
      } catch (e) {
        invalidRecords.push(rawRecord)
      }
    }
    return [records, invalidRecords]
  }

  return (
    <>
      <div className={props.className}>
        <label className="block text-2xl font-bold font-flow">
          Recipients & Amounts
        </label>
        <label className="block font-flow text-md leading-7">
          For each line, enter one address and the token amount, seperate with comma.
        </label>
        <div className="mt-1">
          <textarea
            rows={8}
            name="records"
            id="records"
            className="focus:ring-aptos-green-dark focus:border-aptos-green-dark bg-aptos-green/10 resize-none block w-full border-aptos-green font-flow text-lg placeholder:text-gray-300"
            value={rawRecordsStr}
            spellCheck={false}
            placeholder={
              "0x81e6c00687ca...125c8ae31b17d9,1.6"
            }
            disabled={txStatus == TransactionStatus.Pending}
            onChange={(event) => {
              if (validRecords.length > 0 || unpreparedRecords.length > 0 || invalidRecords.length > 0) {
                setValidRecords([])
                setInvalidRecords([])
                setRecordsSum(new Decimal(0))
              }
              setShowNotification(false)
              setRawRecordsStr(event.target.value)
            }}
          />
        </div>
        <div className="flex gap-x-4 mt-4 mb-20 justify-between">
          <button
            type="button"
            disabled={processState.disabled || txStatus && (txStatus == TransactionStatus.Pending)}
            className={`disabled:opacity-50 h-14 left-0 justify-self-end inline-flex items-center px-6 py-3 border border-transparent text-base font-medium shadow-md text-black bg-aptos-green hover:bg-aptos-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aptos-green`}
            onClick={async () => {
              cleanStatus()
              if (selectedToken && rawRecordsStr.trim().length > 0) {
                const [records, invalid] = filterRecords(rawRecordsStr.trim())
                setProcessState({ disabled: true, text: "Processing" })
                const [prepared, unprepared] = await filterRecordsOnChain(selectedToken, records)
                setProcessState({ disabled: false, text: "Process" })

                setValidRecords(prepared)
                setUnpreparedRecords(unprepared)
                setInvalidRecords(invalid)
              } else {
                setNotificationContent({
                  type: "exclamation",
                  title: "Invalid Params",
                  detail: "Please select token, input recipients and amounts"
                })
                setShowNotification(true)
              }
            }}
          >
            {processState.text}
          </button>
          <CSVSelector
            disabled={txStatus == TransactionStatus.Pending}
            onChange={(event) => {
              const f = event.target.files[0]
              const reader = new FileReader()
              reader.addEventListener('load', (e) => {
                const data = e.target.result
                setRawRecordsStr(data)
                event.target.value = null
              })
              reader.readAsText(f)
            }
            } />
        </div>
        {(unpreparedRecords.length > 0 || invalidRecords.length > 0) && (
          <label className="block text-2xl font-bold font-flow">Invalid Entries</label>
        )}
        {
          unpreparedRecords.length > 0 && (
            <>
              <label className="block font-flow text-md leading-7">
                These accounts haven't register the token you want to send. Please contact the owners of these accounts for detail.
              </label>
              <div className="mt-1">
                <textarea
                  rows={unpreparedRecords.length > 8 ? 8 : unpreparedRecords.length}
                  name="unprepared"
                  id="unprepared"
                  className="focus:ring-rose-700 focus:border-rose-700 bg-rose-300/10 resize-none block w-full border-rose-700 font-flow text-lg placeholder:text-gray-300"
                  disabled={true}
                  defaultValue={(unpreparedRecords.reduce((p, c) => { return `${p}\n${c.rawRecord}` }, '')).trim()}
                  spellCheck={false}
                />
              </div>
            </>
          )
        }
        {
          invalidRecords.length > 0 && (
            <>
              <label className="block font-flow text-md leading-7">
                Due to invalid format
              </label>
              <div className="mt-1">
                <textarea
                  rows={invalidRecords.length > 8 ? 8 : invalidRecords.length}
                  name="invalid"
                  id="invalid"
                  className="focus:ring-rose-700 focus:border-rose-700 bg-rose-300/10 resize-none block w-full border-rose-700 font-flow text-lg placeholder:text-gray-300"
                  disabled={true}
                  defaultValue={(invalidRecords.reduce((p, c) => { return `${p}\n${c}` }, '')).trim()}
                  spellCheck={false}
                />
              </div>
            </>
          )
        }
        {(unpreparedRecords.length > 0 || invalidRecords.length > 0) && (
          <div className="h-20"></div>
        )}
        {
          validRecords.length > 0 && (
            <>
              <label className="block text-2xl font-bold font-flow">Confirm</label>
              <div className="mt-1 mb-30">
                <ul role="list">
                  <li key="title">
                    <div className="flex items-center">
                      <div className="flex-none w-30 text-md font-flow font-semibold leading-10">
                        Address
                      </div>
                      <div className="grow"></div>
                      <div className="flex-none w-30 text-md font-flow font-semibold leading-10">
                        Amount ({selectedToken && selectedToken.symbol})
                      </div>
                    </div>
                  </li>
                  {
                    validRecords.map((record, index) => (
                      <li key={index}>
                        <div className="flex items-center">
                          <div className="flex-none w-30 text-lg font-flow leading-10">
                            {shortenedAddress(record.address)}
                          </div>
                          <div className="grow border-b mx-2 border-black"></div>
                          <div className="flex-none w-30 text-lg font-flow leading-10">
                            {record.amount.toString()}
                          </div>
                        </div>
                      </li>
                    ))
                  }
                  <li key="total">
                    <div className="flex items-center">
                      <div className="flex-none w-30 text-md font-flow font-semibold leading-10">
                        Total
                      </div>
                      <div className="grow"></div>
                      <div className="flex-none w-30 text-md font-flow font-semibold leading-10">
                        {recordsSum.toString()} {selectedToken && selectedToken.symbol}
                      </div>
                    </div>
                  </li>
                  <li key="balance">
                    <div className="flex items-center">
                      <div className="flex-none w-30 text-md font-flow font-semibold leading-10">
                        Your Balance
                      </div>
                      <div className="grow"></div>
                      <div className="flex-none w-30 text-md font-flow font-semibold leading-10">
                        {props.tokenBalance.toString()} {selectedToken && selectedToken.symbol}
                      </div>
                    </div>
                  </li>
                  <li key="remaining">
                    <div className="flex items-center">
                      <div className="flex-none w-30 text-md font-flow font-semibold leading-10">
                        Remaining
                      </div>
                      <div className="grow"></div>
                      {
                        !(props.tokenBalance.sub(recordsSum).isNegative())
                          ? <div className="flex-none w-30 text-md font-flow font-semibold leading-10">
                            {props.tokenBalance.sub(recordsSum).toString()} {selectedToken && selectedToken.symbol}
                          </div>
                          : <div className="flex-none w-30 text-md text-rose-500 font-flow font-semibold leading-10">
                            {props.tokenBalance.sub(recordsSum).toString()} {selectedToken && selectedToken.symbol}
                          </div>
                      }
                    </div>
                  </li>
                </ul>
              </div>
              <div className="flex gap-x-4 mt-8 mb-20 items-end h-14 mb-30">
                <button
                  type="button"
                  disabled={props.tokenBalance.sub(recordsSum).isNegative() || (txStatus && (txStatus == TransactionStatus.Pending || txStatus == TransactionStatus.Confirmed))}
                  className="shadow-md disabled:opacity-50 justify-self-end h-14 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium text-black bg-aptos-green hover:bg-aptos-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aptos-green"
                  onClick={async () => {
                    cleanTxInfo()
                    if (selectedToken) {
                      const recipients = validRecords.map((record) => {
                        return record.address
                      })

                      const amounts = validRecords.map((record) => {
                        return toSmallerUnit(record.amount.toString(), selectedToken.decimals).toString()
                      })

                      try {
                        const pendingTransaction = await batchTransfer(selectedToken, recipients, amounts)
                        console.log(pendingTransaction)
                        setTxid(pendingTransaction.hash)
                        setTxStatus(TransactionStatus.Pending)

                        await aptosClient.waitForTransaction(pendingTransaction.hash)
                        setTxStatus(TransactionStatus.Confirmed)
                        mutate(["balanceFetcher", user.address, selectedToken])
                      } catch (e) {
                        if (typeof e === "object" && e.message.includes("rejected the request")) {
                          setTxStatus(TransactionStatus.Rejected)
                        } else if (typeof e === "string" && e.includes("rejected the request")) {
                          setTxStatus(TransactionStatus.Rejected)
                        } else {
                          setTxStatus(TransactionStatus.ExecutionFailed)
                        }
                      }
                    }
                  }}
                >
                  Transfer
                </button>
                {props.tokenBalance.sub(recordsSum).isNegative() && (
                  <div className="min-w-0 flex flex-col justify-center h-14 justify-self-end">
                    <label className="font-flow text-md text-rose-500">
                      Total exceeds your balance
                    </label>
                  </div>
                )}
                {
                  txStatus && (
                    <div className="min-w-0 flex flex-col justify-center h-14 justify-self-end">
                      {
                        txStatus == TransactionStatus.Confirmed
                          ? <label className="font-flow text-md text-aptos-green font-bold">
                            Status: Success
                          </label>
                          : (txStatus == TransactionStatus.ExecutionFailed || txStatus == TransactionStatus.Rejected)
                            ? <label className="font-flow text-md text-rose-500 font-bold">
                              Status: {txStatus}
                            </label>
                            : <label className="font-flow text-md font-bold">
                              Status: {txStatus}
                            </label>
                      }

                      {txid && (
                        <a
                          href={`${publicConfig.flowscanURL}/transaction/${txid}`}
                          rel="noopener noreferrer"
                          target="_blank" className="truncate font-flow text-sm leading-6 underline decoration-aptos-green decoration-2">
                          {`${txid}`}
                        </a >
                      )}
                    </div>
                  )
                }

              </div>
            </>
          )
        }
        <div className="h-20"></div>
      </div>
    </>
  )
}