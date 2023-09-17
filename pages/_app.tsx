import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import type { AppProps } from 'next/app';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import * as chainList from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const chainListSorted = Object.values(chainList)

for (let chainIdx in chainListSorted) {
  // chainListSorted[chainIdx].rpcUrls.default.http = [`https://${process.env.VERCEL_URL}/api/chains/${chainListSorted[chainIdx].id}`]
  chainListSorted[chainIdx].rpcUrls.public.http = [`https://${process.env.VERCEL_URL}/api/chains/${chainListSorted[chainIdx].id}`]
}

const { chains, publicClient } = configureChains(
  [
    ...chainListSorted
  ],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'RxCld Web3 Tools',
  projectId: '00317176ebd71cee4451c0535622a97a',
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} modalSize='compact' theme={lightTheme({accentColor: "#4B5563", borderRadius: "medium"})}>
        <div className="bg-gray-800 bg-opacity-95 min-h-screen">
          <nav className="bg-gray-800 h-16 flex justify-between items-center pl-10 pr-10 border-b-2 border-slate-500">
            <div className="w-8 h-8"></div>
            <a href="/" className="justify-items-center focus:ring focus:outline-none">
                <h6 className="text-slate-50 font-mono font-semibold text-2xl sm:text-3xl">RxCld Web3 Tools</h6>
            </a>
            <a href="https://github.com/RexCloud/web3-tools" target="_blank" rel="noopener" className="focus:ring focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" role="img" width="32" height="32" fill="currentColor" viewBox="0 0 16 16" id="IconChangeColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" id="mainIconPathAttribute" fill="#ffffff"></path>
              </svg>
            </a>
          </nav>
          <Component {...pageProps} />
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
