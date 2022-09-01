import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Peer, Port, SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { Cluster, ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { ZeebeFargateCluster } from '../src';

describe('ZeebeCluster', () => {

  test('Synthesize single node zeebe cluster', () => {

    const app = new cdk.App();
    const clusterStack = new cdk.Stack(app, 'ZeebeClusterStack', {
      env: {
        account: '12345',
        region: 'eu-west-1',
      },
    });

    const defaultVpc = new Vpc(clusterStack, 'test-vpc', {});
    //const ecsCluster = new Cluster(clusterStack, 'Cluster', {clusterName: 'test-cluster'});
    const sg = new SecurityGroup(clusterStack, 'test-sg', {
      vpc: defaultVpc,
      securityGroupName: 'test-sg',
      allowAllOutbound: true,
    });
    sg.addIngressRule(Peer.anyIpv4(), Port.tcpRange(26500, 26502));


    new ZeebeFargateCluster(clusterStack, 'ZeebeTestCluster', {
      numBrokerNodes: 1,
      numGatewayNodes: 1,
    });

    // Prepare the stack for assertions.
    let template = Template.fromStack(clusterStack);
    template.resourceCountIs('AWS::EFS::FileSystem', 1);
    template.resourceCountIs('AWS::EFS::MountTarget', 3);
    template.resourceCountIs('AWS::ECS::Service', 2);
    template.resourceCountIs('AWS::ECS::TaskDefinition', 2);
    template.hasResourceProperties('AWS::ECS::Cluster', {
      ClusterName: 'zeebe-cluster',
    });
  });

  test('Synthesize zeebe cluster with 1 gateway and 2 brokers', () => {
    const app = new cdk.App();
    const clusterStack = new cdk.Stack(app, 'ZeebeClusterStack', {
      env: {
        account: '12345',
        region: 'eu-west-1',
      },
    });

    const defaultVpc = new Vpc(clusterStack, 'test-vpc', {});
    //const ecsCluster = new Cluster(clusterStack, 'Cluster', {clusterName: 'test-cluster'});
    const sg = new SecurityGroup(clusterStack, 'test-sg', {
      vpc: defaultVpc,
      securityGroupName: 'test-sg',
      allowAllOutbound: true,
    });
    sg.addIngressRule(Peer.anyIpv4(), Port.tcpRange(26500, 26502));

    new ZeebeFargateCluster(clusterStack, 'ZeebeTestCluster', { numBrokerNodes: 2, numGatewayNodes: 1 });

    // Prepare the stack for assertions.
    let template = Template.fromStack(clusterStack);
    template.resourceCountIs('AWS::EFS::FileSystem', 1);
    template.resourceCountIs('AWS::EFS::MountTarget', 3);
    template.resourceCountIs('AWS::ECS::Service', 3);
    template.resourceCountIs('AWS::ECS::TaskDefinition', 3);
    template.hasResourceProperties('AWS::ECS::Cluster', {
      ClusterName: 'zeebe-cluster',
    });
  });

  test('Synthesize zeebe cluster with 1 gateway and 2 brokers', () => {
    const app = new cdk.App();
    const clusterStack = new cdk.Stack(app, 'ZeebeClusterStack', {
      env: {
        account: '12345',
        region: 'eu-west-1',
      },
    });

    const defaultVpc = new Vpc(clusterStack, 'test-vpc', {});
    //const ecsCluster = new Cluster(clusterStack, 'Cluster', {clusterName: 'test-cluster'});
    const sg = new SecurityGroup(clusterStack, 'test-sg', {
      vpc: defaultVpc,
      securityGroupName: 'test-sg',
      allowAllOutbound: true,
    });
    sg.addIngressRule(Peer.anyIpv4(), Port.tcpRange(26500, 26502));

    new ZeebeFargateCluster(clusterStack, 'ZeebeTestCluster', { numBrokerNodes: 2, numGatewayNodes: 1 });

    // Prepare the stack for assertions.
    let template = Template.fromStack(clusterStack);
    template.resourceCountIs('AWS::EFS::FileSystem', 1);
    template.resourceCountIs('AWS::EFS::MountTarget', 3);
    template.resourceCountIs('AWS::ECS::Service', 3);
    template.resourceCountIs('AWS::ECS::TaskDefinition', 3);
    template.hasResourceProperties('AWS::ECS::Cluster', {
      ClusterName: 'zeebe-cluster',
    });
  });


  test('Synthesize zeebe cluster with custom ECS cluster', () => {
    const app = new cdk.App();
    const clusterStack = new cdk.Stack(app, 'ZeebeClusterStack', {
      env: {
        account: '12345',
        region: 'eu-west-1',
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

    new ZeebeFargateCluster(clusterStack, 'ZeebeTestCluster', {
      numBrokerNodes: 2,
      numGatewayNodes: 1,
      ecsCluster: ecsCluster,
    });

    // Prepare the stack for assertions.
    let template = Template.fromStack(clusterStack);
    template.resourceCountIs('AWS::EFS::FileSystem', 1);
    template.resourceCountIs('AWS::EFS::MountTarget', 3);
    template.resourceCountIs('AWS::ECS::Service', 3);
    template.resourceCountIs('AWS::ECS::TaskDefinition', 3);
    template.hasResourceProperties('AWS::ECS::Cluster', {
      ClusterName: 'test-cluster',
    });
  });

  test('Synthesize zeebe cluster with custom container image', () => {
    const app = new cdk.App();
    const clusterStack = new cdk.Stack(app, 'ZeebeClusterStack', {
      env: {
        account: '12345',
        region: 'eu-west-1',
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


    let customZeebeImage = ContainerImage.fromDockerImageAsset(new DockerImageAsset(clusterStack, 'custom-zeebe', {
      directory: 'test/docker-image-test',
    }));

    new ZeebeFargateCluster(clusterStack, 'ZeebeTestCluster', {
      numBrokerNodes: 2,
      numGatewayNodes: 1,
      ecsCluster: ecsCluster,
      containerImage: customZeebeImage,
    });

    // Prepare the stack for assertions.
    let template = Template.fromStack(clusterStack);
    template.resourceCountIs('AWS::EFS::FileSystem', 1);
    template.resourceCountIs('AWS::EFS::MountTarget', 3);
    template.resourceCountIs('AWS::ECS::Service', 3);
    template.resourceCountIs('AWS::ECS::TaskDefinition', 3);
    template.hasResourceProperties('AWS::ECS::Cluster', {
      ClusterName: 'test-cluster',
    });
    template.hasResourceProperties('AWS::ECS::TaskDefinition', {
      ContainerDefinitions: [
        Match.objectLike({
          Image: Match.objectLike({ 'Fn::Sub': Match.stringLikeRegexp('12345.dkr.ecr.eu-west-1') }),
        }),
      ],
    });
  })
  ;

});