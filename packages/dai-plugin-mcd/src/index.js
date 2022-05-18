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

import ftmmainAddresses from '../contracts/addresses/ftmmain.json';

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

          ftmmain: ftmmainAddresses[name]
        }
      };
    }
    return result;
  },
  {}
);

export const FTM = createCurrency('FTM');
export const MKR = createCurrency('MKR');
export const USD = createCurrency('USD');
export const USD_FTM = createCurrencyRatio(USD, FTM);

export const WFTM = createCurrency('WFTM');
export const DAI = createCurrency('DAI');

// Casting for savings dai
export const DSR_DAI = createCurrency('DSR-DAI');
export const GNT = createCurrency('GNT');
export const WETH = createCurrency('WETH');
export const WBTC = createCurrency('WBTC');
export const USDC = createCurrency('USDC');
export const FUSDT = createCurrency('FUSDT');
export const LQDR = createCurrency('LQDR');
export const MIM = createCurrency('MIM');
export const SPIRIT = createCurrency('SPIRIT');
export const FRAX = createCurrency('FRAX');
export const MAI = createCurrency('MAI');
export const BOO = createCurrency('BOO');
export const SUSHI = createCurrency('SUSHI');
export const LINK = createCurrency('LINK');
export const SCREAM = createCurrency('SCREAM');
export const SPIFTMLQDR = createCurrency('SPIFTMLQDR');
export const SPIFTMFUSDT = createCurrency('SPIFTMFUSDT');
export const SPIFTMWBTC = createCurrency('SPIFTMWBTC');
export const SPIFTMUSDC = createCurrency('SPIFTMUSDC');
export const SPIFTMWETH = createCurrency('SPIFTMWETH');
export const SPIFTMMIM = createCurrency('SPIFTMMIM');
export const SPIFTMSPIRIT = createCurrency('SPIFTMSPIRIT');
export const SPIFTMFRAX = createCurrency('SPIFTMFRAX');
export const SPIFTMMAI = createCurrency('SPIFTMMAI');
export const SPOFTMBOO = createCurrency('SPOFTMBOO');
export const SPOFTMUSDC = createCurrency('SPOFTMUSDC');
export const SPOFTMDAI = createCurrency('SPOFTMDAI');
export const SPOFTMSUSHI = createCurrency('SPOFTMSUSHI');
export const SPOFTMLINK = createCurrency('SPOFTMLINK');
export const SPOFTMWETH = createCurrency('SPOFTMWETH');
export const SPOFTMFUSDT = createCurrency('SPOFTMFUSDT');
export const SPOFTMMIM = createCurrency('SPOFTMMIM');
export const SPOFTMSCREAM = createCurrency('SPOFTMSCREAM');
export const STKSPIFTMLQDR = createCurrency('STKSPIFTMLQDR');
export const STKSPIFTMFUSDT = createCurrency('STKSPIFTMFUSDT');
export const STKSPIFTMWBTC = createCurrency('STKSPIFTMWBTC');
export const STKSPIFTMUSDC = createCurrency('STKSPIFTMUSDC');
export const STKSPIFTMWETH = createCurrency('STKSPIFTMWETH');
export const STKSPIFTMMIM = createCurrency('STKSPIFTMMIM');
export const STKSPIFTMSPIRIT = createCurrency('STKSPIFTMSPIRIT');
export const STKSPIFTMFRAX = createCurrency('STKSPIFTMFRAX');
export const STKSPIFTMMAI = createCurrency('STKSPIFTMMAI');
export const STKSPOFTMBOO = createCurrency('STKSPOFTMBOO');
export const STKSPOFTMUSDC = createCurrency('STKSPOFTMUSDC');
export const STKSPOFTMDAI = createCurrency('STKSPOFTMDAI');
export const STKSPOFTMSUSHI = createCurrency('STKSPOFTMSUSHI');
export const STKSPOFTMLINK = createCurrency('STKSPOFTMLINK');
export const STKSPOFTMWETH = createCurrency('STKSPOFTMWETH');
export const STKSPOFTMFUSDT = createCurrency('STKSPOFTMFUSDT');
export const STKSPOFTMMIM = createCurrency('STKSPOFTMMIM');
export const STKSPOFTMSCREAM = createCurrency('STKSPOFTMSCREAM');

export const XBOO = createCurrency('XBOO');
export const STKXBOO = createCurrency('STKXBOO');
export const STKSPOFTMBOOV2 = createCurrency('STKSPOFTMBOOV2');
export const CLQDR = createCurrency('CLQDR');
export const LINSPIRIT = createCurrency('LINSPIRIT');
export const SLINSPIRIT = createCurrency('SLINSPIRIT');

export const defaultCdpTypes = [
  { currency: STKSPIFTMLQDR, ilk: 'STKSPIFTMLQDR-A' },
  { currency: STKSPIFTMFUSDT, ilk: 'STKSPIFTMFUSDT-A' },
  { currency: STKSPIFTMWBTC, ilk: 'STKSPIFTMWBTC-A' },
  { currency: STKSPIFTMUSDC, ilk: 'STKSPIFTMUSDC-A' },
  { currency: STKSPIFTMWETH, ilk: 'STKSPIFTMWETH-A' },
  { currency: STKSPIFTMMIM, ilk: 'STKSPIFTMMIM-A' },
  { currency: STKSPIFTMSPIRIT, ilk: 'STKSPIFTMSPIRIT-A' },
  { currency: STKSPIFTMFRAX, ilk: 'STKSPIFTMFRAX-A' },
  { currency: STKSPIFTMMAI, ilk: 'STKSPIFTMMAI-A' },
  { currency: STKSPOFTMBOO, ilk: 'STKSPOFTMBOO-A' },
  { currency: STKSPOFTMUSDC, ilk: 'STKSPOFTMUSDC-A' },
  { currency: STKSPOFTMDAI, ilk: 'STKSPOFTMDAI-A' },
  { currency: STKSPOFTMSUSHI, ilk: 'STKSPOFTMSUSHI-A' },
  { currency: STKSPOFTMLINK, ilk: 'STKSPOFTMLINK-A' },
  { currency: STKSPOFTMWETH, ilk: 'STKSPOFTMWETH-A' },
  { currency: STKSPOFTMFUSDT, ilk: 'STKSPOFTMFUSDT-A' },
  { currency: STKSPOFTMMIM, ilk: 'STKSPOFTMMIM-A' },
  { currency: STKSPOFTMSCREAM, ilk: 'STKSPOFTMSCREAM-A' },

  { currency: STKXBOO, ilk: 'STKXBOO-A' },
  { currency: STKSPOFTMBOOV2, ilk: 'STKSPOFTMBOOV2-A' },
  { currency: CLQDR, ilk: 'CLQDR-A' },
  { currency: SLINSPIRIT, ilk: 'SLINSPIRIT-A' },
];

export const ilkReserveMap = {
  'STKSPIFTMLQDR-A': '0x4Fe6f19031239F105F753D1DF8A0d24857D0cAA2',
  'STKSPIFTMFUSDT-A': '0xd14Dd3c56D9bc306322d4cEa0E1C49e9dDf045D4',
  'STKSPIFTMWBTC-A': '0x279b2c897737a50405ED2091694F225D83F2D3bA',
  'STKSPIFTMUSDC-A': '0xe7E90f5a767406efF87Fdad7EB07ef407922EC1D',
  'STKSPIFTMWETH-A': '0x613BF4E46b4817015c01c6Bb31C7ae9edAadc26e',
  'STKSPIFTMMIM-A': '0xB32b31DfAfbD53E310390F641C7119b5B9Ea0488',
  'STKSPIFTMSPIRIT-A': '0x30748322B6E34545DBe0788C421886AEB5297789',
  'STKSPIFTMFRAX-A': '0x7ed0cdDB9BB6c6dfEa6fB63E117c8305479B8D7D',
  'STKSPIFTMMAI-A': '0x51Eb93ECfEFFbB2f6fE6106c4491B5a0B944E8bd',
  'STKSPOFTMBOO-A': '0xEc7178F4C41f346b2721907F5cF7628E388A7a58',
  'STKSPOFTMUSDC-A': '0x2b4C76d0dc16BE1C31D4C1DC53bF9B45987Fc75c',
  'STKSPOFTMDAI-A': '0xe120ffBDA0d14f3Bb6d6053E90E63c572A66a428',
  'STKSPOFTMSUSHI-A': '0xf84E313B36E86315af7a06ff26C8b20e9EB443C3',
  'STKSPOFTMLINK-A': '0x89d9bC2F2d091CfBFc31e333D6Dc555dDBc2fd29',
  'STKSPOFTMWETH-A': '0xf0702249F4D3A25cD3DED7859a165693685Ab577',
  'STKSPOFTMFUSDT-A': '0x5965E53aa80a0bcF1CD6dbDd72e6A9b2AA047410',
  'STKSPOFTMMIM-A': '0x6f86e65b255c9111109d2D2325ca2dFc82456efc',
  'STKSPOFTMSCREAM-A': '0x30872e4fc4edbFD7a352bFC2463eb4fAe9C09086',

  'STKXBOO': '0xa48d959AE2E88f1dAA7D5F611E01908106dE7598',
  'STKSPOFTMBOOV2': '0xEc7178F4C41f346b2721907F5cF7628E388A7a58',
};

export const SAI = createCurrency('SAI');

export const ALLOWANCE_AMOUNT = BigNumber(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
);

export const defaultTokens = [
  ...new Set([
    ...defaultCdpTypes.map(type => type.currency),
    DAI,
    WFTM,
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
          { currency: WFTM, address: addContracts.FTM.address, abi: wethAbi },
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
