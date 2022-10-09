import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { FileSystem } from 'aws-cdk-lib/aws-efs';
import { CamundaPlatformCoreSimple } from '../src/camunda-platform-simple';


describe('CamundaPlatformSimple', () => {

  test('Synthesize a camunda core simple cluster (no EFS)', () => {

    const app = new cdk.App();
    const clusterStack = new cdk.Stack(app, 'CamundaCoreSimpleStack', {
      env: {
        account: '12345',
        region: 'eu-west-1',
      },
    });

    new CamundaPlatformCoreSimple(clusterStack, 'CamundaCoreSimpleCluster', {
      useEfsStorage: false,
    });

    // Prepare the stack for assertions.
    let template = Template.fromStack(clusterStack);
    console.log(template.toJSON());

    template.resourceCountIs('AWS::EFS::FileSystem', 0);
    template.resourceCountIs('AWS::EFS::MountTarget', 0);
    template.resourceCountIs('AWS::ECS::Service', 1);
    template.resourceCountIs('AWS::ECS::TaskDefinition', 1);
    verifyContainers(template);

    template.hasResource('AWS::ServiceDiscovery::PrivateDnsNamespace', {
      Properties: {
        Name: 'camunda-cluster.net',
      },
    });
    template.hasResourceProperties('AWS::ECS::Cluster', {
      ClusterName: 'camunda-cluster',
    });
  });


  test('Synthesize a camunda core simple cluster with an EFS', () => {

    const app = new cdk.App();
    const clusterStack = new cdk.Stack(app, 'CamundaCoreSimpleStack', {
      env: {
        account: '12345',
        region: 'eu-west-1',
      },
    });

    let vpc = new Vpc(clusterStack, 'test-vpc', { vpcName: 'test-vpc' });
    let fs = new FileSystem(clusterStack, 'fs', { vpc: vpc });
    new CamundaPlatformCoreSimple(clusterStack, 'CamundaCoreSimpleCluster', {
      fileSystem: fs,
      useEfsStorage: true,
      vpc: vpc,
    });

    // Prepare the stack for assertions.
    let template = Template.fromStack(clusterStack);
    console.log(JSON.stringify(template));

    template.resourceCountIs('AWS::EFS::FileSystem', 2);
    template.resourceCountIs('AWS::EFS::AccessPoint', 2);
    template.resourceCountIs('AWS::EFS::MountTarget', 6);
    template.resourceCountIs('AWS::ECS::Service', 1);
    template.resourceCountIs('AWS::ECS::TaskDefinition', 1);

    verifyContainers(template);

    template.hasResource('AWS::ServiceDiscovery::PrivateDnsNamespace', {
      Properties: {
        Name: 'camunda-cluster.net',
      },
    });

    template.hasResourceProperties('AWS::ECS::Cluster', {
      ClusterName: 'camunda-cluster',
    });
  });

  function verifyContainers(template: Template) {
    template.hasResource('AWS::ECS::TaskDefinition', {
      Properties: {
        ContainerDefinitions: [
          { Name: 'elasticsearch' },
          { Name: 'zeebe' },
          { Name: 'tasklist' },
          { Name: 'operate' },
        ],
      },
    });
  }

});