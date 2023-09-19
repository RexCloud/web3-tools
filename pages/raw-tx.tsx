"use client"

import type { NextPage } from "next";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { useSendTransaction, usePrepareSendTransaction, useNetwork, useAccount } from "wagmi";
import { parseEther } from "viem";

const RawTx: NextPage = () => {

    const [domLoaded, setDomLoaded] = useState(false);
    const [to, setInputTo] = useState("");
    const [value, setInputValue] = useState("");
    const [data, setInputData] = useState("");
    const [gasLimit, setInputGasLimit] = useState("");
    const [txType, setTxType] = useState(0)
    const [gasPrice, setInputGasPrice] = useState("");
    const [maxFee, setInputMaxFee] = useState("");
    const [maxPriorityFee, setInputMaxPriorityFee] = useState("");
    const [nonce, setInputNonce] = useState("");
    const [currentNonce, setCurrentNonce] = useState<number>()

    function setInputHex(input: any, target: Function) {
        target(input.replace(/[^xa-fA-F0-9]/g, ""))
    }

    const { address, isDisconnected } = useAccount()

    const { chain } = useNetwork()

    const { config } = usePrepareSendTransaction({
        to: to,
        value: parseEther(value),
        data: `0x${data && data.includes("0x") ? data.slice(2) : data}`,
        gas: BigInt(gasLimit),
        ...(!txType ? {gasPrice: parseEther(gasPrice, "gwei")} : 
        {maxFeePerGas: parseEther(maxFee, "gwei"),
        maxPriorityFeePerGas: parseEther(maxPriorityFee, "gwei")}),
        ...(nonce ? {nonce: Number(nonce)} : {nonce: currentNonce})
    })

    const { sendTransaction, error, isLoading } = useSendTransaction(config)
    
    const [txParams, setTxParams] = useState({})
    const [rawTx, setRawTx] = useState("")
    const [signedTxs, setSignedTxs] = useState<any[]>([])

    useEffect(() => {
        setDomLoaded(true)
    }, [])

    useEffect(() => {
        const getCurrentNonce = async () => {
            if (!address) return
            const options = {
                method: "POST",
                headers: { accept: "application/json", "content-type": "application/json" },
                body: JSON.stringify({
                    id: 1,
                    jsonrpc: "2.0",
                    params: [ address, "latest"],
                    method: "eth_getTransactionCount"
                })
            };
                
            fetch(`${chain?.rpcUrls.default.http[0]}`, options)
            .then(response => response.json())
            .then(response => setCurrentNonce(Number(response.result)))
            .catch(()=>0);
        }
        getCurrentNonce()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chain])

    useEffect(() => {
        if (!isDisconnected) return
        setRawTx("")
        setSignedTxs([])
    }, [isDisconnected])

    useEffect(() => {
        if (!isLoading) return
        const txParams = Object(config)
        txParams.chainId = chain && chain.id
        txParams.value = txParams.value.toString()
        txParams.gas = txParams.gas && txParams.gas.toString()
        txParams.gasPrice = txParams.gasPrice && txParams.gasPrice.toString()
        txParams.maxFeePerGas = txParams.maxFeePerGas && txParams.maxFeePerGas.toString()
        txParams.maxPriorityFeePerGas = txParams.maxPriorityFeePerGas && txParams.maxPriorityFeePerGas.toString()
        delete txParams.accessList
        delete txParams.account
        delete txParams.mode
        setTxParams(txParams)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading])

    useEffect(() => {
        error?.message.includes("rawTx") && setRawTx(error?.message.substring(error?.message.indexOf("rawTx") + 9, error?.message.indexOf('"]}}}')))
    }, [error])

    useEffect(() => {
        if (!rawTx || !txParams) return
        const signedTx = {
            ...txParams,
            rawTx: rawTx
        }
        setSignedTxs([...signedTxs, signedTx])
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rawTx])

    function confirmSign() {
        if (domLoaded && !chain) {
            const buttons = document.getElementsByTagName("button")
            for (const btnIdx in buttons) buttons[btnIdx].innerText == "Connect Wallet" && buttons[btnIdx].click()
            return
        }
        const msg = `Please make sure that balance in your wallet shows 1000 ${chain?.nativeCurrency.symbol}\r\rIf the balance shown is not 1000 ${chain?.nativeCurrency.symbol}\rThen you are on wrong RPC and your transaction may be broadcasted\r\rAdd network with chain ID: ${chain && chain.id} and RPC: ${chain?.rpcUrls.public.http[0]}\r\rType "confirm" to continue`
        const userMsg = prompt(msg)
        userMsg?.toLocaleLowerCase() == "confirm" && sendTransaction?.()
    }

    return (
        <div className="h-fit py-8 sm:py-16 justify-center flex xs:flex-col lg:flex-row">
            <div className="h-full sm:max-h-[742px] flex flex-col justify-center text-lg border xs:border-x-0 xs:border-b-0 lg:border p-8 border-slate-500 border-r-[1px] lg:border-r-0 sm:w-full lg:w-auto">
                <div className="flex flex-col mb-5 sm:flex-row">
                    <div className="flex flex-col">
                        <label className="text-slate-50 font-semibold pb-1">To</label>
                        <input className="sm:w-[27.375rem] mb-5 pl-1 pr-1 h-8 rounded-md text-slate-50 bg-slate-600 outline outline-slate-500 outline-1 focus:ring focus:outline-none" value={to} placeholder="ENS is not supported" onChange={e => setInputHex(e.target.value, setInputTo)}></input>
                    </div>
                    <div className="flex flex-col sm:pl-6 w-full">
                        <label className="text-slate-50 font-semibold pb-1">Value</label>
                        <input className="w-full lg:w-24 mb-5 pl-1 pr-1 h-8 rounded-md text-slate-50 bg-slate-600 outline outline-slate-500 outline-1 focus:ring focus:outline-none" value={value} placeholder="0.2 (ether)" type="number" onChange={e => setInputValue(e.target.value)}></input>
                    </div>
                </div>
                <label className="text-slate-50 font-semibold pb-1">Data</label>
                <input className="w-auto mb-5 pl-1 pr-1 h-8 rounded-md text-slate-50 bg-slate-600 outline outline-slate-500 outline-1 focus:ring focus:outline-none" value={data} onChange={e => setInputHex(e.target.value, setInputData)}></input>
                <div className="flex flex-col mb-5 sm:flex-row">
                    <div className="flex flex-col">
                        <label className="text-slate-50 font-semibold pb-1">Tx Type</label>
                        <select className="sm:w-24 mb-5 h-8 rounded-md text-slate-50 bg-slate-600 outline outline-slate-500 outline-1 focus:ring focus:outline-none" onChange={e => {setTxType(Number(e.target.value)); setInputGasPrice(""); setInputMaxFee(""); setInputMaxPriorityFee("")}}> 
                            <option value="0">Legacy</option>
                            <option value="1">EIP-1559</option>
                        </select>
                    </div>
                    { !txType ?
                        <div className="flex flex-col sm:pl-6">
                            <label className="text-slate-50 font-semibold pb-1">Gas Price</label>
                            <input className="w-26 mb-5 pl-1 pr-1 h-8 rounded-md text-slate-50 bg-slate-600 outline outline-slate-500 outline-1 focus:ring focus:outline-none" value={gasPrice} placeholder="20 (gwei)" type="number" onChange={e => setInputGasPrice(e.target.value)}></input>
                        </div> :
                        <div className="flex flex-col sm:flex-row">
                            <div className="flex flex-col mb-5 sm:pl-6">
                                <label className="text-slate-50 font-semibold pb-1">Max Fee</label>
                                <input className="w-26 mb-5 pl-1 h-8 rounded-md text-slate-50 bg-slate-600 outline outline-slate-500 outline-1 focus:ring focus:outline-none" value={maxFee} placeholder="25 (gwei)" type="number" onChange={e => setInputMaxFee(e.target.value)}></input>
                            </div>
                            <div className="flex flex-col sm:pl-6">
                                <label className="text-slate-50 font-semibold pb-1">Max Priority Fee</label>
                                <input className="w-26 mb-5 pl-1 h-8 rounded-md text-slate-50 bg-slate-600 outline outline-slate-500 outline-1 focus:ring focus:outline-none" value={maxPriorityFee} placeholder="10 (gwei)" type="number" onChange={e => setInputMaxPriorityFee(e.target.value)}></input>
                            </div>
                        </div>
                    }
                </div>
                <div className="flex flex-row">
                    <div className="flex flex-col">
                        <label className="text-slate-50 font-semibold pb-1">Nonce</label>
                        <input className="w-24 mb-5 pl-1 pr-1 h-8 rounded-md text-slate-50 bg-slate-600 outline outline-slate-500 outline-1 focus:ring focus:outline-none" value={nonce} placeholder={address && currentNonce?.toString()} onChange={e => setInputNonce(e.target.value)}></input>
                    </div>
                    <div className="flex flex-col pl-6">
                        <label className="text-slate-50 font-semibold pb-1">Gas Limit</label>
                        <input className="w-full sm:w-auto mb-5 pl-1 pr-1 h-8 rounded-md text-slate-50 bg-slate-600 outline outline-slate-500 outline-1 focus:ring focus:outline-none" value={gasLimit} type="number" onChange={e => setInputGasLimit(e.target.value)}></input>
                    </div>
                </div>
                { domLoaded && chain && chain.id &&
                    <div className="flex flex-col sm:w-[506px]">
                        <p className="text-slate-50 font-semibold pb-1">Chain ID: {chain.id} ({chain.name})</p>
                        <p className="text-red-400 font-semibold pb-1">Make sure your RPC URL is {chain.rpcUrls.public.http[0]}</p>
                        <p className="text-red-400 font-semibold pb-1">Balance should be 1000 {chain.nativeCurrency.symbol}</p>
                    </div>
                }
                <button className="bg-gray-600 text-slate-50 font-semibold h-9 rounded-xl shadow-md shadow-gray-800 mt-4 mb-5 outline outline-slate-500 outline-1 focus:ring focus:outline-none active:bg-gray-700 disabled:opacity-20 disabled:active:bg-gray-600" disabled={isLoading} onClick={confirmSign}>{!isLoading ? "Sign" : "Signing"}</button>
                { rawTx &&
                    <>
                        <div className="flex flex-row">
                            <label className="text-slate-50 font-semibold pb-1">Signed tx:</label>
                            <svg className="ml-2 opacity-20 hover:opacity-100 active:opacity-50" onClick={()=>navigator.clipboard.writeText(rawTx)} fill="#ffffff" width="32px" height="32px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M9.101,7l8.899,0c1.857,-0 3.637,0.737 4.95,2.05c1.313,1.313 2.05,3.093 2.05,4.95l0,8.899c0.953,-0.195 1.837,-0.665 2.536,-1.363c0.937,-0.938 1.464,-2.21 1.464,-3.536c0,-2.977 0,-7.023 0,-10c0,-1.326 -0.527,-2.598 -1.464,-3.536c-0.938,-0.937 -2.21,-1.464 -3.536,-1.464c-2.977,0 -7.023,0 -10,0c-1.326,-0 -2.598,0.527 -3.536,1.464c-0.698,0.699 -1.168,1.583 -1.363,2.536Z"></path><path d="M23,14c0,-1.326 -0.527,-2.598 -1.464,-3.536c-0.938,-0.937 -2.21,-1.464 -3.536,-1.464c-2.977,0 -7.023,0 -10,0c-1.326,-0 -2.598,0.527 -3.536,1.464c-0.937,0.938 -1.464,2.21 -1.464,3.536c0,2.977 0,7.023 0,10c-0,1.326 0.527,2.598 1.464,3.536c0.938,0.937 2.21,1.464 3.536,1.464c2.977,-0 7.023,-0 10,-0c1.326,0 2.598,-0.527 3.536,-1.464c0.937,-0.938 1.464,-2.21 1.464,-3.536l0,-10Zm-15,10l10,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-10,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Zm0,-4l10,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-10,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Zm0,-4l10,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-10,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Z"></path><g id="Icon"></g></g></svg>
                        </div>
                        <label className="text-slate-50 font-semibold pb-1 max-w-[506px] break-words">{rawTx}</label>
                    </>
                }
            </div>
            <div className="h-auto w-auto flex flex-col items-center text-slate-50 border xs:border-x-0 lg:border pt-8 border-slate-500">
                <div className="px-8 pb-8"><ConnectButton chainStatus={"none"} accountStatus={"address"} showBalance={false}/></div>
                <div className="h-full max-h-[620px] w-full border-t-[1px] bg-slate-800 bg-opacity-20 border-collapse border-slate-500 overflow-y-scroll">
                    <table className="w-full text-left">
                        { domLoaded &&
                            <tr className="border-b-[1px] border-slate-500 bg-slate-800 bg-opacity-30 font-semibold">
                                <th className="w-56 sm:w-[500px] md:w-[600px] lg:w-72 px-4 py-2 border-r-[1px] border-slate-500">Raw Tx</th>
                                <th className="px-4 py-2">Details</th>
                            </tr>
                        }
                        { signedTxs.length > 0 &&
                            signedTxs.map((signedTx, index) => {
                                return <tr className="border-b-[1px] border-slate-500 odd:bg-slate-800 odd:bg-opacity-25" key={index}>
                                <td className="w-56 sm:w-[500px] md:w-[600px] lg:w-72 px-4 py-2 border-r-[1px] border-slate-500 flex flex-row items-center">
                                    <p className="w-56 sm:w-[500px] md:w-[600px] lg:w-64 truncate">{signedTx.rawTx}</p>
                                    <svg className="ml-auto opacity-20 hover:opacity-100 active:opacity-50" onClick={()=>navigator.clipboard.writeText(signedTx.rawTx)} fill="#ffffff" width="16px" height="16px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M9.101,7l8.899,0c1.857,-0 3.637,0.737 4.95,2.05c1.313,1.313 2.05,3.093 2.05,4.95l0,8.899c0.953,-0.195 1.837,-0.665 2.536,-1.363c0.937,-0.938 1.464,-2.21 1.464,-3.536c0,-2.977 0,-7.023 0,-10c0,-1.326 -0.527,-2.598 -1.464,-3.536c-0.938,-0.937 -2.21,-1.464 -3.536,-1.464c-2.977,0 -7.023,0 -10,0c-1.326,-0 -2.598,0.527 -3.536,1.464c-0.698,0.699 -1.168,1.583 -1.363,2.536Z"></path><path d="M23,14c0,-1.326 -0.527,-2.598 -1.464,-3.536c-0.938,-0.937 -2.21,-1.464 -3.536,-1.464c-2.977,0 -7.023,0 -10,0c-1.326,-0 -2.598,0.527 -3.536,1.464c-0.937,0.938 -1.464,2.21 -1.464,3.536c0,2.977 0,7.023 0,10c-0,1.326 0.527,2.598 1.464,3.536c0.938,0.937 2.21,1.464 3.536,1.464c2.977,-0 7.023,-0 10,-0c1.326,0 2.598,-0.527 3.536,-1.464c0.937,-0.938 1.464,-2.21 1.464,-3.536l0,-10Zm-15,10l10,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-10,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Zm0,-4l10,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-10,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Zm0,-4l10,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-10,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Z"></path><g id="Icon"></g></g></svg>
                                </td>
                                <td className="px-4 py-2 text-center">view</td>
                            </tr>
                            })
                        }
                    </table>
                    { !signedTxs.length &&
                        <p className="p-6 py-32 text-center text-slate-400">Signed transactions will appear here</p>
                    }
                </div>
            </div>
        </div>
    )
}

export default RawTx
