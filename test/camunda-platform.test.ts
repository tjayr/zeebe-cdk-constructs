import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CamundaPlatformCoreFargate } from '../src/camunda-platform';

describe('CamundaPlatform', () => {

  test('Synthesize a camunda core cluster', () => {

    const app = new cdk.App();
    const clusterStack = new cdk.Stack(app, 'CamundaCoreStack', {
      env: {
        account: '12345',
        region: 'eu-west-1',
      },
    });

    new CamundaPlatformCoreFargate(clusterStack, 'CamundaCoreCluster', {});

    // Prepare the stack for assertions.
    let template = Template.fromStack(clusterStack);

    template.resourceCountIs('AWS::EFS::FileSystem', 1);
    template.resourceCountIs('AWS::EFS::MountTarget', 3);
    template.resourceCountIs('AWS::ECS::Service', 4);
    template.resourceCountIs('AWS::ECS::TaskDefinition', 4);

    template.hasResource('AWS::ECS::Service', { Properties: { ServiceName: 'elasticsearch' } });
    template.hasResource('AWS::ECS::Service', { Properties: { ServiceName: 'operate' } });
    template.hasResource('AWS::ECS::Service', { Properties: { ServiceName: 'zeebe' } });
    template.hasResource('AWS::ECS::Service', { Properties: { ServiceName: 'tasklist' } });

    template.hasResource('AWS::EFS::FileSystem', {
      Properties: {
        FileSystemTags: [
          {
            Key: 'Name',
            Value: 'camunda-core-efs',
          },
        ],
      },
    });

    template.hasResource('AWS::EFS::AccessPoint', {
      Properties: {
        RootDirectory: {
          Path: '/broker-data',
        },
      },
    });

    template.hasResource('AWS::EFS::AccessPoint', {
      Properties: {
        RootDirectory: {
          Path: '/elasticsearch',
        },
      },
    });

    template.hasResource('AWS::ServiceDiscovery::PrivateDnsNamespace', {
      Properties: {
        Name: 'camunda-cluster.net',
      },
    });
    template.hasResourceProperties('AWS::ECS::Cluster', {
      ClusterName: 'camunda-cluster',
    });
  });


});