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
import avaxmainAddresses from '../contracts/addresses/avaxmain.json';
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
          avaxmain: avaxmainAddresses[name],
          maticmain: maticmainAddresses[name]
        }
      };
    }
    return result;
  },
  {}
);

export const BNB = createCurrency('BNB');
export const AVAX = createCurrency('AVAX');
export const MKR = createCurrency('MKR');
export const USD = createCurrency('USD');
export const USD_BNB = createCurrencyRatio(USD, BNB);
export const USD_AVAX = createCurrencyRatio(USD, AVAX);

export const WBNB = createCurrency('WBNB');
export const WAVAX = createCurrency('WAVAX');
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
export const APEMORBUSD = createCurrency('APEMORBUSD');
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
export const STKAPEMORBUSD = createCurrency('STKAPEMORBUSD');

export const MIM = createCurrency('MIM');
export const JOE = createCurrency('JOE');
export const XJOE = createCurrency('XJOE');
export const JAVAX = createCurrency('JAVAX');
export const JWETH = createCurrency('JWETH');
export const JWBTC = createCurrency('JWBTC');
export const JLINK = createCurrency('JLINK');
export const TDJAVAXJOE = createCurrency('TDJAVAXJOE');
export const TDJAVAXWETH = createCurrency('TDJAVAXWETH');
export const TDJAVAXWBTC = createCurrency('TDJAVAXWBTC');
export const TDJAVAXDAI = createCurrency('TDJAVAXDAI');
export const TDJAVAXUSDC = createCurrency('TDJAVAXUSDC');
export const TDJAVAXUSDT = createCurrency('TDJAVAXUSDT');
export const TDJAVAXLINK = createCurrency('TDJAVAXLINK');
export const TDJAVAXMIM = createCurrency('TDJAVAXMIM');
export const TDJUSDCJOE = createCurrency('TDJUSDCJOE');
export const TDJUSDTJOE = createCurrency('TDJUSDTJOE');
export const STKUSDC = createCurrency('STKUSDC');
export const STKXJOE = createCurrency('STKXJOE');
export const STKJAVAX = createCurrency('STKJAVAX');
export const STKJWETH = createCurrency('STKJWETH');
export const STKJWBTC = createCurrency('STKJWBTC');
export const STKJLINK = createCurrency('STKJLINK');
export const STKTDJAVAXJOE = createCurrency('STKTDJAVAXJOE');
export const STKTDJAVAXWETH = createCurrency('STKTDJAVAXWETH');
export const STKTDJAVAXWBTC = createCurrency('STKTDJAVAXWBTC');
export const STKTDJAVAXDAI = createCurrency('STKTDJAVAXDAI');
export const STKTDJAVAXUSDC = createCurrency('STKTDJAVAXUSDC');
export const STKTDJAVAXUSDT = createCurrency('STKTDJAVAXUSDT');
export const STKTDJAVAXLINK = createCurrency('STKTDJAVAXLINK');
export const STKTDJAVAXMIM = createCurrency('STKTDJAVAXMIM');
export const STKTDJUSDCJOE = createCurrency('STKTDJUSDCJOE');
export const STKTDJUSDTJOE = createCurrency('STKTDJUSDTJOE');

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
  { currency: STKAPEMORBUSD, ilk: 'STKAPEMORBUSD-A' },

  { currency: STKUSDC, ilk: 'STKUSDC-A' },
  { currency: STKXJOE, ilk: 'STKXJOE-A' },
  { currency: STKJAVAX, ilk: 'STKJAVAX-A' },
  { currency: STKJWETH, ilk: 'STKJWETH-A' },
  { currency: STKJWBTC, ilk: 'STKJWBTC-A' },
  { currency: STKJLINK, ilk: 'STKJLINK-A' },
  { currency: STKTDJAVAXJOE, ilk: 'STKTDJAVAXJOE-A' },
  { currency: STKTDJAVAXWETH, ilk: 'STKTDJAVAXWETH-A' },
  { currency: STKTDJAVAXWBTC, ilk: 'STKTDJAVAXWBTC-A' },
  { currency: STKTDJAVAXDAI, ilk: 'STKTDJAVAXDAI-A' },
  { currency: STKTDJAVAXUSDC, ilk: 'STKTDJAVAXUSDC-A' },
  { currency: STKTDJAVAXUSDT, ilk: 'STKTDJAVAXUSDT-A' },
  { currency: STKTDJAVAXLINK, ilk: 'STKTDJAVAXLINK-A' },
  { currency: STKTDJAVAXMIM, ilk: 'STKTDJAVAXMIM-A' },
  { currency: STKTDJUSDCJOE, ilk: 'STKTDJUSDCJOE-A' },
  { currency: STKTDJUSDTJOE, ilk: 'STKTDJUSDTJOE-A' },
];

export const ilkReserveMap = {
  'STKCAKE-A': '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
  'STKBANANA-A': '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
  'STKPCSBNBCAKE-A': '0x0eD7e52944161450477ee417DE9Cd3a859b14fD0',
  'STKPCSBNBBUSD-A': '0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16',
  'STKPCSBNBETH-A': '0x74E4716E431f45807DCF19f284c7aA99F18a4fbc',
  'STKPCSBNBBTCB-A': '0x61EB789d75A95CAa3fF50ed7E47b96c132fEc082',
  'STKPCSBUSDUSDC-A': '0x2354ef4DF11afacb85a5C7f98B624072ECcddbB1',
  'STKPCSBUSDBTCB-A': '0xF45cd219aEF8618A92BAa7aD848364a158a24F33',
  'STKPCSBUSDCAKE-A': '0x804678fa97d91B974ec2af3c843270886528a9E6',
  'STKPCSETHBTCB-A': '0xD171B26E4484402de70e3Ea256bE5A2630d7e88D',
  'STKPCSETHUSDC-A': '0xEa26B78255Df2bBC31C1eBf60010D78670185bD0',
  'STKAPEMORBUSD-A': '0x33526eD690200663EAAbF28e1D8621e58898c5fd',

  'STKUSDC-A': '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
  'STKXJOE-A': '0x57319d41F71E81F3c65F2a47CA4e001EbAFd4F33',
  'STKJAVAX-A': '0xC22F01ddc8010Ee05574028528614634684EC29e',
  'STKJWETH-A': '0x929f5caB61DFEc79a5431a7734a68D714C4633fa',
  'STKJWBTC-A': '0x3fE38b7b610C0ACD10296fEf69d9b18eB7a9eB1F',
  'STKJLINK-A': '0x585E7bC75089eD111b656faA7aeb1104F5b96c15',
  'STKTDJAVAXJOE-A': '0x454E67025631C065d3cFAD6d71E6892f74487a15',
  'STKTDJAVAXWETH-A': '0xFE15c2695F1F920da45C30AAE47d11dE51007AF9',
  'STKTDJAVAXWBTC-A': '0xd5a37dC5C9A396A03dd1136Fc76A1a02B1c88Ffa',
  'STKTDJAVAXDAI-A': '0x87Dee1cC9FFd464B79e058ba20387c1984aed86a',
  'STKTDJAVAXUSDC-A': '0xA389f9430876455C36478DeEa9769B7Ca4E3DDB1',
  'STKTDJAVAXUSDT-A': '0xeD8CBD9F0cE3C6986b22002F03c6475CEb7a6256',
  'STKTDJAVAXLINK-A': '0x6F3a0C89f611Ef5dC9d96650324ac633D02265D3',
  'STKTDJAVAXMIM-A': '0x781655d802670bbA3c89aeBaaEa59D3182fD755D',
  'STKTDJUSDCJOE-A': '0x67926d973cD8eE876aD210fAaf7DFfA99E414aCf',
  'STKTDJUSDTJOE-A': '0x1643de2efB8e35374D796297a9f95f64C082a8ce',
};

export const SAI = createCurrency('SAI');

export const ALLOWANCE_AMOUNT = BigNumber(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
);

export const defaultTokens = [
  ...new Set([
    ...defaultCdpTypes.map(type => type.currency),
    DAI,
    WBNB,
    WAVAX,
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
          { currency: WAVAX, address: addContracts.AVAX.address, abi: wethAbi },
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
