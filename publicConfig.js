const chainEnv = process.env.NEXT_PUBLIC_CHAIN_ENV
if (!chainEnv) throw "Missing NEXT_PUBLIC_CHAIN_ENV"

const nodeURL = process.env.NEXT_PUBLIC_NODE_URL
if (!nodeURL) throw "Missing NEXT_PUBLIC_NODE_URL"

const appURL = process.env.NEXT_PUBLIC_APP_URL
if (!appURL) throw "Missing NEXT_PUBLIC_APP_URL"

const bayouAddress = process.env.NEXT_PUBLIC_BAYOU_ADDRESS
if (!bayouAddress) throw "Missing NEXT_PUBLIC_BAYOU_ADDRESS"

const explorerURL = process.env.NEXT_PUBLIC_EXPLORER_URL
if (!explorerURL) throw "Missing NEXT_PUBLIC_EXPLORER_URL"

const publicConfig = {
  chainEnv,
  nodeURL,
  appURL,
  bayouAddress,
  explorerURL
}

export default publicConfig
