import Erc20Token from './Erc20Token';
import { BNB, WBNB } from '../Currency';

export default class WethToken extends Erc20Token {
  constructor(contract, web3Service, decimals) {
    super(contract, web3Service, decimals, 'WBNB');
  }

  name() {
    return this._contract.name();
  }

  deposit(amount, { unit = BNB, ...options } = {}) {
    return this._contract.deposit({
      value: this._valueForContract(amount, unit),
      ...options
    });
  }

  withdraw(amount, { unit = WBNB, ...options } = {}) {
    const value = this._valueForContract(amount, unit);
    return this._contract.withdraw(value, options);
  }
}
