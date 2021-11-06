import Erc20Token from './Erc20Token';
import { AVAX, WAVAX } from '../Currency';

export default class WethToken extends Erc20Token {
  constructor(contract, web3Service, decimals) {
    super(contract, web3Service, decimals, 'WAVAX');
  }

  name() {
    return this._contract.name();
  }

  deposit(amount, { unit = AVAX, ...options } = {}) {
    return this._contract.deposit({
      value: this._valueForContract(amount, unit),
      ...options
    });
  }

  withdraw(amount, { unit = WAVAX, ...options } = {}) {
    const value = this._valueForContract(amount, unit);
    return this._contract.withdraw(value, options);
  }
}
