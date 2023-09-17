import type { NextApiRequest, NextApiResponse } from 'next'

function createRespBody(chainId: number, method: string, params: [string, object]) {
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
    else if (method == "eth_getBalance") {
        respBody.result = `0x${(1000 * 10**18).toString(16)}`
        return respBody
    }
    else if (method == "eth_blockNumber") {
        respBody.result = "0x1"
        return respBody
    }
    else if (method == "eth_getBlockByNumber") {
        respBody.result = {
            "baseFeePerGas": "0x0"
        }
        return respBody
    }
    else if (method == "eth_sendRawTransaction") {
        respBody.error = {}
        respBody.error.code = -32601
        respBody.error.message = "Tx signed"
        respBody.error.rawTx = params
        return respBody
    }
    else {
        respBody.result = ""
        return respBody
    }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const chainId = Number(req.query.chainId)
    const respBody = createRespBody(chainId, req.body.method, req.body.params)
    res.json(respBody)
}
