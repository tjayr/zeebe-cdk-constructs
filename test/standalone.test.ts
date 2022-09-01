import * as cdk from 'aws-cdk-lib';
import {Match, Template} from 'aws-cdk-lib/assertions';
import {Peer, Port, SecurityGroup, Vpc} from 'aws-cdk-lib/aws-ec2';
import {Cluster} from 'aws-cdk-lib/aws-ecs';
import {FileSystem} from 'aws-cdk-lib/aws-efs';
import {ZeebeStandaloneFargateCluster} from '../src/standalone';

describe('ZeebeCluster', () => {

    test('Synthesize a standalone zeebe cluster with a custom efs file system', () => {

        const app = new cdk.App();
        const clusterStack = new cdk.Stack(app, 'ZeebeStandaloneStack', {
            env: {
                account: '12345',
                region: 'eu-west-1'
            },
        });

        const defaultVpc = new Vpc(clusterStack, 'test-vpc', {});
        const ecsCluster = new Cluster(clusterStack, 'Cluster', {clusterName: 'test-cluster'});
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
        template.hasResourceProperties('AWS::ECS::TaskDefinition', {
            ContainerDefinitions: [{Name: 'zeebe-standalone', Memory: 1024}],
        });
        template.hasResourceProperties('AWS::ECS::TaskDefinition', {
            ContainerDefinitions: [Match.not({Name: 'simple-monitor'})],
        });
    });


    test('Synthesize a standalone zeebe cluster with default settings', () => {

        const app = new cdk.App();
        const clusterStack = new cdk.Stack(app, 'ZeebeStandaloneStack', {
            env: {
                account: '12345',
                region: 'eu-west-1'
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
        template.hasResourceProperties('AWS::ECS::TaskDefinition', {
            ContainerDefinitions: [{Name: 'zeebe-standalone', Memory: 1024}],
        });
        template.hasResourceProperties('AWS::ECS::TaskDefinition', {
            ContainerDefinitions: [Match.not({Name: 'simple-monitor'})],
        });
    });

    test('Synthesize a standalone zeebe cluster with default settings and private DNS enabled', () => {

        const app = new cdk.App();
        const clusterStack = new cdk.Stack(app, 'ZeebeStandaloneStack', {
            env: {
                account: '12345',
                region: 'eu-west-1'
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
        template.hasResourceProperties('AWS::ECS::TaskDefinition', {
            Cpu: '512',
            Memory: '1024',
            ContainerDefinitions: [{Name: 'zeebe-standalone', Memory: 1024}],
        });
        template.hasResourceProperties('AWS::ECS::TaskDefinition', {
            ContainerDefinitions: [Match.not({Name: 'simple-monitor'})],
        });
    });


    test('Standalone zeebe cluster using a bind mount volume for storage', () => {

        const app = new cdk.App();
        const clusterStack = new cdk.Stack(app, 'ZeebeStandaloneStack', {
            env: {
                account: '12345',
                region: 'eu-west-1'
            },
        });

        const defaultVpc = new Vpc(clusterStack, 'test-vpc', {});
        const ecsCluster = new Cluster(clusterStack, 'Cluster', {clusterName: 'test-cluster'});
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
        template.hasResourceProperties('AWS::ECS::TaskDefinition', {
            Cpu: '512',
            Memory: '1024',
            ContainerDefinitions: [{Name: 'zeebe-standalone', Memory: 1024}],
        });
        template.hasResourceProperties('AWS::ECS::TaskDefinition', {
            ContainerDefinitions: [Match.not({Name: 'simple-monitor'})],
        });

    });

    test('Standalone with simple monitor task', () => {

        const app = new cdk.App();
        const clusterStack = new cdk.Stack(app, 'ZeebeStandaloneStack', {
            env: {
                account: '12345',
                region: 'eu-west-1'
            },
        });

        const defaultVpc = new Vpc(clusterStack, 'test-vpc', {});
        const ecsCluster = new Cluster(clusterStack, 'Cluster', {clusterName: 'test-cluster'});
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
            simpleMonitor: true,
            hazelcastExporter: true,
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
        template.hasResourceProperties('AWS::ECS::TaskDefinition', {
            ContainerDefinitions: [
                {
                    Name: 'zeebe-standalone',
                    Memory: 1024,
                    Image: 'ghcr.io/camunda-community-hub/zeebe-with-hazelcast-exporter:8.0.5',
                },
                {
                    Name: 'simple-monitor',
                    Memory: 1024,
                },
            ],
        });

    });


});