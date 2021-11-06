import Erc20Token from './Erc20Token';
import { WAVAX, PETH } from '../Currency';

export default class PethToken extends Erc20Token {
  constructor(contract, web3Service, tub) {
    super(contract, web3Service, 18, 'PETH');
    this._tub = tub;
  }

  join(amount, { unit = WAVAX, promise } = {}) {
    const value = this._valueForContract(amount, unit);
    return this._tub.join(value, { promise });
  }

  exit(amount, { unit = PETH, promise } = {}) {
    const value = this._valueForContract(amount, unit);
    return this._tub.exit(value, { promise });
  }

  async wrapperRatio() {
    return WAVAX.ray(await this._tub.per());
  }

  async joinPrice(amount, unit = WAVAX) {
    const value = this._valueForContract(amount, unit);
    return WAVAX.wei(await this._tub.ask(value));
  }

  async exitPrice(amount, unit = WAVAX) {
    const value = this._valueForContract(amount, unit);
    return WAVAX.wei(await this._tub.bid(value));
  }
}
