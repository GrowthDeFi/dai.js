import tokens from '../../contracts/tokens';
import values from 'lodash/values';

import {
  createCurrency,
  createCurrencyRatio,
  createGetCurrency
} from '@makerdao/currency';

export const currencies = values(tokens).reduce(
  (output, symbol) => {
    output[symbol] = createCurrency(symbol);
    return output;
  },
  {
    USD: createCurrency('USD')
  }
);

export const getCurrency = createGetCurrency(currencies);

// we export both the currencies object and the individual currencies because
// the latter is convenient when you know what you want to use, and the former
// is convenient when you are picking a currency based on a symbol from input

export const BNB = currencies.BNB;
export const MKR = currencies.MKR;
export const PETH = currencies.PETH;
export const WBNB = currencies.WBNB;
export const USD = currencies.USD;

export const USD_BNB = createCurrencyRatio(USD, BNB);
export const USD_MKR = createCurrencyRatio(USD, MKR);
export const USD_PETH = createCurrencyRatio(USD, PETH);
export const USD_WBNB = createCurrencyRatio(USD, WBNB);

Object.assign(currencies, {
  USD_BNB,
  USD_MKR,
  USD_PETH,
  USD_WBNB
});
