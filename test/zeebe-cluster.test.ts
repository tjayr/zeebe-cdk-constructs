import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Peer, Port, SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster } from 'aws-cdk-lib/aws-ecs';
import { ZeebeCluster } from '../src';

describe('ZeebeCluster', () => {
  test('synthesizes the way we expect', () => {
    const app = new cdk.App();

    const clusterStack = new cdk.Stack(app, 'ZeebeClusterStack', {
      env: {
        account: '426272108223', //process.env.CDK_DEFAULT_ACCOUNT,
        region: 'eu-west-1', //process.env.CDK_DEFAULT_REGION
      },
    });

    const defaultVpc = new Vpc(clusterStack, 'test-vpc', {});
    const ecsCluster = new Cluster(clusterStack, 'Cluster', { clusterName: 'test-cluster' });
    const sg = new SecurityGroup(clusterStack, 'test-sg', { vpc: defaultVpc, securityGroupName: 'test-sg', allowAllOutbound: true });
    sg.addIngressRule(Peer.anyIpv4(), Port.tcpRange(26500, 26502));

    new ZeebeCluster(clusterStack, 'ZeebeTestCluster', {
      ecsCluster: ecsCluster,
      numBrokerNodes: 1,
      numGatewayNodes: 1,
      securityGroups: [sg],
      vpc: defaultVpc,
    });

    // Prepare the stack for assertions.
    const template = Template.fromStack(clusterStack);
    console.log(template.toJSON());
    template.resourceCountIs('AWS::EFS', 0);
  });
});