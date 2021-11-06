// A simple Ethers Signer built directly from a Web3 provider.

import { promisify } from '../../utils';

const CHAIN_ID = {
  '1': '43114', // avaxmain
};

const GAS_PRICE = {
  '1': '25000000000', // avaxmain
  '56': '5000000000', // bscmain
  '43114': '25000000000', // avaxmain
};

export default function makeSigner(web3Service) {
  const netId = web3Service.network;
  const provider = web3Service.web3Provider();
  const call = promisify(web3Service._web3.eth.call);
  return {
    getAddress: () => web3Service.currentAddress(),
    estimateGas: tx => web3Service.estimateGas(tx),
    sendTransaction: tx => {
      return web3Service.sendTransaction({
        ...tx,
        chainId: CHAIN_ID[netId] || netId,
        gasPrice: GAS_PRICE[netId] || '1000000000',
        from: web3Service.currentAddress()
      });
    },
    provider: new Proxy(provider, {
      get(target, key) {
        switch (key) {
          case 'resolveName':
            return address => address;
          case 'call':
            return call;
          default:
            return target[key];
        }
      }
    })
  };
}
