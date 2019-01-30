import { buildTestService } from '../../helpers/serviceBuilders';
import { setProxyAccount } from '../../helpers/proxyHelpers';
import TestAccountProvider from '../../helpers/TestAccountProvider';
import {
  createDai,
  placeLimitOrder,
  transferDaiBalance
} from '../../helpers/oasisHelpers';

let service, proxyAccount;

async function buildTestEth2DaiDirectService() {
  service = buildTestService('exchange', {
    exchange: 'Eth2DaiDirect'
  });
  await service.manager().authenticate();
}

function proxy() {
  return service.get('proxy').currentProxy();
}

const orderKeys = [
  '_logKey',
  '_unit',
  '_contract',
  '_txMgr',
  '_otc',
  'promise',
  '_fillAmount'
];

beforeAll(async () => {
  await buildTestEth2DaiDirectService();
  await createDai(service);
});

beforeEach(async () => {
  jest.setTimeout(15000);
  await buildTestEth2DaiDirectService();
});

describe('format contract call', () => {
  test('set contract method', async () => {
    const proxy = await service.get('proxy').currentProxy();
    const buyEth = service._setMethod('DAI', 'ETH', 'sellAllAmount');
    const payEth = service._setMethod('ETH', 'DAI', 'sellAllAmount', proxy);
    const createAndPayEth = service._setMethod('ETH', 'DAI', 'sellAllAmount');
    const sell = service._setMethod('DAI', 'MKR', 'sellAllAmount');
    expect(buyEth).toEqual('sellAllAmountBuyEth');
    expect(payEth).toEqual('sellAllAmountPayEth');
    expect(createAndPayEth).toEqual('createAndSellAllAmountPayEth');
    expect(sell).toEqual('sellAllAmount');
  });

  test('set contract parameters', async () => {
    const otcAddress = service
      .get('smartContract')
      .getContractByName('MAKER_OTC').address;
    const registryAddress = service
      .get('smartContract')
      .getContractByName('PROXY_REGISTRY').address;
    const daiAddress = service
      .get('token')
      .getToken('DAI')
      .address();
    const wethAddress = service
      .get('token')
      .getToken('WETH')
      .address();
    const normalParams = await service._buildParams(
      'DAI',
      '0.01',
      'WETH',
      service._valueForContract(0, 'WETH'),
      'sellAllAmount'
    );
    const ethParams = await service._buildParams(
      'WETH',
      '0.01',
      'DAI',
      service._valueForContract(100, 'WETH'),
      'sellAllAmountPayEth'
    );
    const buyAndPayEthParams = await service._buildParams(
      'WETH',
      '0.01',
      'DAI',
      service._valueForContract(100, 'WETH'),
      'buyAllAmountPayEth'
    );
    const createParams = await service._buildParams(
      'WETH',
      '0.01',
      'DAI',
      service._valueForContract(100, 'WETH'),
      'createAndSellAllAmountPayEth'
    );

    expect(normalParams.length).toEqual(5);
    expect(normalParams[0]).toEqual(otcAddress);
    expect(normalParams[1]).toEqual(daiAddress);
    expect(Object.keys(normalParams[2])).toEqual(['_bn']);
    expect(normalParams[3]).toEqual(wethAddress);
    expect(Object.keys(normalParams[4])).toEqual(['_bn']);

    expect(ethParams.length).toEqual(4);
    expect(ethParams[0]).toEqual(otcAddress);
    expect(ethParams[1]).toEqual(wethAddress);
    expect(ethParams[2]).toEqual(daiAddress);
    expect(Object.keys(ethParams[3])).toEqual(['_bn']);

    expect(buyAndPayEthParams.length).toEqual(4);
    expect(buyAndPayEthParams[0]).toEqual(otcAddress);
    expect(buyAndPayEthParams[1]).toEqual(daiAddress);
    expect(Object.keys(buyAndPayEthParams[2])).toEqual(['_bn']);
    expect(buyAndPayEthParams[3]).toEqual(wethAddress);

    expect(createParams.length).toEqual(4);
    expect(createParams[0]).toEqual(registryAddress);
    expect(createParams[1]).toEqual(otcAddress);
    expect(createParams[2]).toEqual(daiAddress);
    expect(Object.keys(createParams[3])).toEqual(['_bn']);
  });

  test('set transaction options', () => {
    const normalOptions = service._buildOptions(1, 'DAI', 'method');
    const ethOptions = service._buildOptions(1, 'ETH', 'method');
    const createOptions = service._buildOptions(1, 'ETH', 'create');
    expect(Object.keys(normalOptions)).toEqual(['otc', 'dsProxy']);
    expect(Object.keys(ethOptions)).toEqual(['otc', 'dsProxy', 'value']);
    expect(Object.keys(createOptions)).toEqual(['otc', 'value']);
  });
});

describe('values from otc', () => {
  beforeAll(async () => {
    await placeLimitOrder(service);
  });

  test('get buy amount', async () => {
    const buyAmount = await service.getBuyAmount('WETH', 'DAI', '0.01');
    expect(buyAmount.toString()).toEqual('500000000000000');
  });

  test('get minBuyAmount', async () => {
    const limit = await service._minBuyAmount('WETH', 'DAI', '0.01');
    expect(limit.toString()).toEqual('490000000000000');
  });

  test('get pay amount', async () => {
    const payAmount = await service.getPayAmount('DAI', 'WETH', '0.01');
    expect(payAmount.toString()).toEqual('200000000000000000');
  });

  test('get maxPayAmount', async () => {
    const limit = await service._maxPayAmount('DAI', 'WETH', '0.01');
    expect(limit.toString()).toEqual('204000000000000000');
  });
});

describe('trade with existing dsproxy', () => {
  beforeAll(async () => {
    if (!proxyAccount) {
      proxyAccount = TestAccountProvider.nextAccount();
    }
    // await transferDaiBalance(service, proxyAccount.address);
    await setProxyAccount(service, proxyAccount);
    if (!(await proxy())) await service.get('proxy').build();
  });

  describe('sell dai', () => {
    beforeEach(async () => {
      await placeLimitOrder(service);
    });

    test('sell all amount', async () => {
      const order = await service.sell('DAI', 'WETH', '0.01');
      expect(Object.keys(order)).toEqual(orderKeys);
    });

    test('sell all amount, buy eth', async () => {
      const order = await service.sell('DAI', 'ETH', '0.01');
      expect(Object.keys(order)).toEqual(orderKeys);
    });

    test('buy all amount', async () => {
      const order = await service.buy('WETH', 'DAI', '0.01');
      expect(Object.keys(order)).toEqual(orderKeys);
    });

    test('buy all amount, buy eth', async () => {
      const order = await service.buy('ETH', 'DAI', '0.01');
      expect(Object.keys(order)).toEqual(orderKeys);
    });
  });

  describe('buy dai', () => {
    beforeEach(async () => {
      await placeLimitOrder(service, true);
    });

    test('sell all amount, pay eth', async () => {
      const order = await service.sell('ETH', 'DAI', '0.01');
      expect(Object.keys(order)).toEqual(orderKeys);
    });

    test('buy all amount, pay eth', async () => {
      const order = await service.buy('DAI', 'ETH', '0.01');
      expect(Object.keys(order)).toEqual(orderKeys);
    });
  });
});

describe('create dsproxy and execute', () => {
  beforeAll(async () => {
    const newAccount = TestAccountProvider.nextAccount();
    await transferDaiBalance(service, newAccount.address);
    await setProxyAccount(service, newAccount);
    await placeLimitOrder(service, true);
  });

  test('sell all amount, pay eth', async () => {
    const order = await service.sell('ETH', 'DAI', '0.01');
    expect(Object.keys(order)).toEqual(orderKeys);
  });

  test('buy all amount, pay eth', async () => {
    const order = await service.buy('DAI', 'ETH', '0.01');
    expect(Object.keys(order)).toEqual(orderKeys);
  });
});
