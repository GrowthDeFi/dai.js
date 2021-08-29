import assert from 'assert';
import mapValues from 'lodash/mapValues';
import reduce from 'lodash/reduce';
import uniqBy from 'lodash/uniqBy';
import { createCurrency, createCurrencyRatio } from '@makerdao/currency';
import testnetAddresses from '../contracts/addresses/testnet.json';
import kovanAddresses from '../contracts/addresses/kovan.json';
import mainnetAddresses from '../contracts/addresses/mainnet.json';
import abiMap from '../contracts/abiMap';
import CdpManager from './CdpManager';
import SavingsService from './SavingsService';
import CdpTypeService from './CdpTypeService';
import AuctionService from './AuctionService';
import SystemDataService from './SystemDataService';
import { ServiceRoles as ServiceRoles_ } from './constants';
import BigNumber from 'bignumber.js';
import wethAbi from '../contracts/abis/WETH9.json';

import bscmainAddresses from '../contracts/addresses/bscmain.json';
import maticmainAddresses from '../contracts/addresses/maticmain.json';

export const ServiceRoles = ServiceRoles_;
const { CDP_MANAGER, CDP_TYPE, SYSTEM_DATA, AUCTION, SAVINGS } = ServiceRoles;

// look up contract ABIs using abiMap.
// if an exact match is not found, prefix-match against keys ending in *, e.g.
// MCD_JOIN_ETH_B matches MCD_JOIN_*
// this implementation assumes that all contracts in kovan.json are also in testnet.json
let addContracts = reduce(
  testnetAddresses,
  (result, testnetAddress, name) => {
    let abi = abiMap[name];
    if (!abi) {
      const prefix = Object.keys(abiMap).find(
        k =>
          k.substring(k.length - 1) == '*' &&
          k.substring(0, k.length - 1) == name.substring(0, k.length - 1)
      );
      if (prefix) abi = abiMap[prefix];
    }
    if (abi) {
      result[name] = {
        abi,
        address: {
          testnet: testnetAddress,
          kovan: kovanAddresses[name],
          mainnet: mainnetAddresses[name],

          bscmain: bscmainAddresses[name],
          maticmain: maticmainAddresses[name]
        }
      };
    }
    return result;
  },
  {}
);

export const BNB = createCurrency('BNB');
export const MKR = createCurrency('MKR');
export const USD = createCurrency('USD');
export const USD_BNB = createCurrencyRatio(USD, BNB);

export const WBNB = createCurrency('WBNB');
export const DAI = createCurrency('DAI');

// Casting for savings dai
export const DSR_DAI = createCurrency('DSR-DAI');

export const GNT = createCurrency('GNT');
export const ETH = createCurrency('ETH');
export const BTCB = createCurrency('BTCB');
export const BUSD = createCurrency('BUSD');
export const USDC = createCurrency('USDC');
export const CAKE = createCurrency('CAKE');
export const BANANA = createCurrency('BANANA');
export const PCSBNBCAKE = createCurrency('PCSBNBCAKE');
export const PCSBNBBUSD = createCurrency('PCSBNBBUSD');
export const PCSBNBETH = createCurrency('PCSBNBETH');
export const PCSBNBBTCB = createCurrency('PCSBNBBTCB');
export const PCSBUSDUSDC = createCurrency('PCSBUSDUSDC');
export const PCSBUSDBTCB = createCurrency('PCSBUSDBTCB');
export const PCSBUSDCAKE = createCurrency('PCSBUSDCAKE');
export const PCSETHBTCB = createCurrency('PCSETHBTCB');
export const PCSETHUSDC = createCurrency('PCSETHUSDC');
export const STKCAKE = createCurrency('STKCAKE');
export const STKBANANA = createCurrency('STKBANANA');
export const STKPCSBNBCAKE = createCurrency('STKPCSBNBCAKE');
export const STKPCSBNBBUSD = createCurrency('STKPCSBNBBUSD');
export const STKPCSBNBETH = createCurrency('STKPCSBNBETH');
export const STKPCSBNBBTCB = createCurrency('STKPCSBNBBTCB');
export const STKPCSBUSDUSDC = createCurrency('STKPCSBUSDUSDC');
export const STKPCSBUSDBTCB = createCurrency('STKPCSBUSDBTCB');
export const STKPCSBUSDCAKE = createCurrency('STKPCSBUSDCAKE');
export const STKPCSETHBTCB = createCurrency('STKPCSETHBTCB');
export const STKPCSETHUSDC = createCurrency('STKPCSETHUSDC');

export const defaultCdpTypes = [
  { currency: STKCAKE, ilk: 'STKCAKE-A' },
  { currency: STKBANANA, ilk: 'STKBANANA-A' },
  { currency: STKPCSBNBCAKE, ilk: 'STKPCSBNBCAKE-A' },
  { currency: STKPCSBNBBUSD, ilk: 'STKPCSBNBBUSD-A' },
  { currency: STKPCSBNBETH, ilk: 'STKPCSBNBETH-A' },
  { currency: STKPCSBNBBTCB, ilk: 'STKPCSBNBBTCB-A' },
  { currency: STKPCSBUSDUSDC, ilk: 'STKPCSBUSDUSDC-A' },
  { currency: STKPCSBUSDBTCB, ilk: 'STKPCSBUSDBTCB-A' },
  { currency: STKPCSBUSDCAKE, ilk: 'STKPCSBUSDCAKE-A' },
  { currency: STKPCSETHBTCB, ilk: 'STKPCSETHBTCB-A' },
  { currency: STKPCSETHUSDC, ilk: 'STKPCSETHUSDC-A' },
];

export const SAI = createCurrency('SAI');

export const ALLOWANCE_AMOUNT = BigNumber(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
);

export const defaultTokens = [
  ...new Set([
    ...defaultCdpTypes.map(type => type.currency),
    DAI,
    WBNB,
    SAI,
    DSR_DAI
  ])
];

export const McdPlugin = {
  addConfig: (
    _,
    { cdpTypes = defaultCdpTypes, addressOverrides, prefetch = true } = {}
  ) => {
    if (addressOverrides) {
      addContracts = mapValues(addContracts, (contractDetails, name) => ({
        ...contractDetails,
        address: addressOverrides[name] || contractDetails.address
      }));
    }
    const tokens = uniqBy(cdpTypes, 'currency').map(
      ({ currency, address, abi, decimals }) => {
        const data =
          address && abi ? { address, abi } : addContracts[currency.symbol];
        assert(data, `No address and ABI found for "${currency.symbol}"`);
        return {
          currency,
          abi: data.abi,
          address: data.address,
          decimals: data.decimals || decimals
        };
      }
    );

    // Set global BigNumber precision to enable exponential operations
    BigNumber.config({ POW_PRECISION: 100 });

    return {
      smartContract: { addContracts },
      token: {
        erc20: [
          { currency: DAI, address: addContracts.MCD_DAI.address },
          { currency: WBNB, address: addContracts.BNB.address, abi: wethAbi },
          ...tokens
        ]
      },
      additionalServices: [
        CDP_MANAGER,
        CDP_TYPE,
        AUCTION,
        SYSTEM_DATA,
        SAVINGS
      ],
      [CDP_TYPE]: [CdpTypeService, { cdpTypes, prefetch }],
      [CDP_MANAGER]: CdpManager,
      [SAVINGS]: SavingsService,
      [AUCTION]: AuctionService,
      [SYSTEM_DATA]: SystemDataService
    };
  }
};

export default McdPlugin;
