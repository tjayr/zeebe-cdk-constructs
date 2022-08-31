import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Peer, Port, SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster } from 'aws-cdk-lib/aws-ecs';
import { FileSystem } from 'aws-cdk-lib/aws-efs';
import { ZeebeStandaloneFargateCluster } from '../src/standalone';

describe('ZeebeCluster', () => {

  test('Synthesize a standalone zeebe cluster with a custom efs file system', () => {

    const app = new cdk.App();
    const clusterStack = new cdk.Stack(app, 'ZeebeStandaloneStack', {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
      },
    });

    const defaultVpc = new Vpc(clusterStack, 'test-vpc', {});
    const ecsCluster = new Cluster(clusterStack, 'Cluster', { clusterName: 'test-cluster' });
    const sg = new SecurityGroup(clusterStack, 'test-sg', {
      vpc: defaultVpc,
      securityGroupName: 'test-sg',
      allowAllOutbound: true,
    });
    sg.addIngressRule(Peer.anyIpv4(), Port.tcpRange(26500, 26502));

    let fileSystem: FileSystem = new FileSystem(clusterStack, 'efs', {
      vpc: defaultVpc,
    });

    new ZeebeStandaloneFargateCluster(clusterStack, 'ZeebeStandaloneTestCluster', {
      vpc: defaultVpc,
      ecsCluster: ecsCluster,
      securityGroups: [sg],
      fileSystem: fileSystem,
    });

    // Prepare the stack for assertions.
    let template = Template.fromStack(clusterStack);
    template.resourceCountIs('AWS::EFS::FileSystem', 1);
    template.resourceCountIs('AWS::EFS::MountTarget', 3);
    template.resourceCountIs('AWS::ECS::Service', 1);
    template.resourceCountIs('AWS::ECS::TaskDefinition', 1);
    template.resourceCountIs('AWS::ServiceDiscovery::PrivateDnsNamespace', 0);
    template.hasResourceProperties('AWS::ECS::Cluster', {
      ClusterName: 'test-cluster',
    });
  });


  test('Synthesize a standalone zeebe cluster with default settings', () => {

    const app = new cdk.App();
    const clusterStack = new cdk.Stack(app, 'ZeebeStandaloneStack', {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
      },
    });

    const defaultVpc = new Vpc(clusterStack, 'test-vpc', {});
    const sg = new SecurityGroup(clusterStack, 'test-sg', {
      vpc: defaultVpc,
      securityGroupName: 'test-sg',
      allowAllOutbound: true,
    });
    sg.addIngressRule(Peer.anyIpv4(), Port.tcpRange(26500, 26502));

    new ZeebeStandaloneFargateCluster(clusterStack, 'ZeebeStandaloneTestCluster', {
      securityGroups: [sg],
      vpc: defaultVpc,
    });

    // Prepare the stack for assertions.
    let template = Template.fromStack(clusterStack);
    template.resourceCountIs('AWS::EFS::FileSystem', 0);
    template.resourceCountIs('AWS::EFS::MountTarget', 0);
    template.resourceCountIs('AWS::ECS::Service', 1);
    template.resourceCountIs('AWS::ECS::TaskDefinition', 1);
    template.resourceCountIs('AWS::ServiceDiscovery::PrivateDnsNamespace', 0);
    template.hasResourceProperties('AWS::ECS::Cluster', {
      ClusterName: 'zeebe-standalone',
    });
  });

  test('Synthesize a standalone zeebe cluster with default settings and private DNS enabled', () => {

    const app = new cdk.App();
    const clusterStack = new cdk.Stack(app, 'ZeebeStandaloneStack', {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
      },
    });

    const defaultVpc = new Vpc(clusterStack, 'test-vpc', {});
    const sg = new SecurityGroup(clusterStack, 'test-sg', {
      vpc: defaultVpc,
      securityGroupName: 'test-sg',
      allowAllOutbound: true,
    });
    sg.addIngressRule(Peer.anyIpv4(), Port.tcpRange(26500, 26502));

    new ZeebeStandaloneFargateCluster(clusterStack, 'ZeebeStandaloneTestCluster', {
      securityGroups: [sg],
      vpc: defaultVpc,
    });

    // Prepare the stack for assertions.
    let template = Template.fromStack(clusterStack);
    template.resourceCountIs('AWS::EFS::FileSystem', 0);
    template.resourceCountIs('AWS::EFS::MountTarget', 0);
    template.resourceCountIs('AWS::ECS::Service', 1);
    template.resourceCountIs('AWS::ECS::TaskDefinition', 1);
    template.resourceCountIs('AWS::ServiceDiscovery::PrivateDnsNamespace', 0);
    template.hasResourceProperties('AWS::ECS::Cluster', {
      ClusterName: 'zeebe-standalone',
    });
  });


  test('Standalone zeebe cluster using a bind mount volume for storage', () => {

    const app = new cdk.App();
    const clusterStack = new cdk.Stack(app, 'ZeebeStandaloneStack', {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
      },
    });

    const defaultVpc = new Vpc(clusterStack, 'test-vpc', {});
    const ecsCluster = new Cluster(clusterStack, 'Cluster', { clusterName: 'test-cluster' });
    const sg = new SecurityGroup(clusterStack, 'test-sg', {
      vpc: defaultVpc,
      securityGroupName: 'test-sg',
      allowAllOutbound: true,
    });
    sg.addIngressRule(Peer.anyIpv4(), Port.tcpRange(26500, 26502));

    new ZeebeStandaloneFargateCluster(clusterStack, 'ZeebeStandaloneTestCluster', {
      vpc: defaultVpc,
      ecsCluster: ecsCluster,
      securityGroups: [sg],
    });

    // Prepare the stack for assertions.
    let template = Template.fromStack(clusterStack);
    template.resourceCountIs('AWS::EFS::FileSystem', 0);
    template.resourceCountIs('AWS::EFS::MountTarget', 0);
    template.resourceCountIs('AWS::ECS::Service', 1);
    template.resourceCountIs('AWS::ECS::TaskDefinition', 1);
    template.resourceCountIs('AWS::ServiceDiscovery::PrivateDnsNamespace', 0);
    template.hasResourceProperties('AWS::ECS::Cluster', {
      ClusterName: 'test-cluster',
    });
  });


});