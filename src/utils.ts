export class ZeebeCdkUtls {

  public createZeebeContactPoints(port: number, namespace: string, brokers: number): string {

    var cp = '';

    for (let i = 0; i < brokers; i++) {
      let contactPoint = `zeebe-broker-${i}.${namespace}:${port}`;

      if (i < brokers - 1) {
        cp = cp.concat(contactPoint, ',');
      } else {
        cp = cp.concat(contactPoint);
      }
    }

    return cp;
  }


}