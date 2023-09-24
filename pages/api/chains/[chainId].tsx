import type { NextApiRequest, NextApiResponse } from 'next'
import { rpcUrls } from '../../_app';

async function createRespBody(chainId: number, method: string, params: [string, object]) {
    interface IBody {
        jsonrpc: string;
        id: number;
        [key: string]: any;
    }
    var respBody: IBody = {
        jsonrpc: "2.0",
        id: 2,
    }
    if (method == "eth_chainId") {
        respBody.result = `0x${chainId.toString(16)}`
        return respBody
    }
    else if (method == "net_version") {
        respBody.result = chainId
        return respBody
    }
    if (method == "eth_getBalance") {
        respBody.result = `0x${(1000 * 10**18).toString(16)}`
        return respBody
    }
    else if (method == "eth_sendRawTransaction") {
        respBody.error = {}
        respBody.error.code = -32601
        respBody.error.message = "Tx signed"
        respBody.error.rawTx = params
        return respBody
    }
    else if (method == "eth_blockNumber" || method == "eth_getBlockByNumber" || method == "eth_getTransactionCount" || method == "eth_gasPrice") {
        const options = {
            method: "POST",
            headers: { accept: "application/json", "content-type": "application/json" },
            body: JSON.stringify({
                id: 1,
                jsonrpc: "2.0",
                method: method,
                params: params
            })
        };
        try {
            const response = await fetch(rpcUrls[chainId], options)
            respBody = await response.json()
        }
        catch {
            respBody.result = ""
        }
        return respBody
    }
    else {
        respBody.result = ""
        return respBody
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const chainId = Number(req.query.chainId)
    const respBody = await createRespBody(chainId, req.body.method, req.body.params)
    res.json(respBody)
}
