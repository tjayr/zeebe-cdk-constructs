import { ZeebeCdkUtls } from '../src/utils';

describe('Utils', () => {

  test('Create zeebe cluster contact points', () => {
    let utils = new ZeebeCdkUtls();

    var result = utils.createZeebeContactPoints(26502, 'zeebe-cluster.net', 3);
    expect(result).toBe('zeebe-broker-0.zeebe-cluster.net:26502,zeebe-broker-1.zeebe-cluster.net:26502,zeebe-broker-2.zeebe-cluster.net:26502');

    result = utils.createZeebeContactPoints(26502, 'zeebe-cluster.net', 1);
    expect(result).toBe('zeebe-broker-0.zeebe-cluster.net:26502');
  });

});