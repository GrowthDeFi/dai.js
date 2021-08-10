import Erc20Token from './Erc20Token';
import { MATIC, WMATIC } from '../Currency';

export default class WethToken extends Erc20Token {
  constructor(contract, web3Service, decimals) {
    super(contract, web3Service, decimals, 'WMATIC');
  }

  name() {
    return this._contract.name();
  }

  deposit(amount, { unit = MATIC, ...options } = {}) {
    return this._contract.deposit({
      value: this._valueForContract(amount, unit),
      ...options
    });
  }

  withdraw(amount, { unit = WMATIC, ...options } = {}) {
    const value = this._valueForContract(amount, unit);
    return this._contract.withdraw(value, options);
  }
}
