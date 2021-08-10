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

export const MATIC = currencies.MATIC;
export const MKR = currencies.MKR;
export const PETH = currencies.PETH;
export const WMATIC = currencies.WMATIC;
export const USD = currencies.USD;

export const USD_MATIC = createCurrencyRatio(USD, MATIC);
export const USD_MKR = createCurrencyRatio(USD, MKR);
export const USD_PETH = createCurrencyRatio(USD, PETH);
export const USD_WMATIC = createCurrencyRatio(USD, WMATIC);

Object.assign(currencies, {
  USD_MATIC,
  USD_MKR,
  USD_PETH,
  USD_WMATIC
});
