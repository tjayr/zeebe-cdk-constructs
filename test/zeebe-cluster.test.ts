import * as cdk from 'aws-cdk-lib';
import {Template} from 'aws-cdk-lib/assertions';
import {Peer, Port, SecurityGroup, Vpc} from 'aws-cdk-lib/aws-ec2';
import {ZeebeFargateCluster} from '../src';

describe('ZeebeCluster', () => {

    test('Synthesize single node zeebe cluster', () => {

        const app = new cdk.App();
        const clusterStack = new cdk.Stack(app, 'ZeebeClusterStack', {
            env: {
                account: '426272108223', //process.env.CDK_DEFAULT_ACCOUNT,
                region: 'eu-west-1', //process.env.CDK_DEFAULT_REGION
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
        template.resourceCountIs('AWS::EFS::MountTarget', 2);
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
                account: '426272108223', //process.env.CDK_DEFAULT_ACCOUNT,
                region: 'eu-west-1', //process.env.CDK_DEFAULT_REGION
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

        new ZeebeFargateCluster(clusterStack, 'ZeebeTestCluster', {numBrokerNodes: 2, numGatewayNodes: 1});

        // Prepare the stack for assertions.
        let template = Template.fromStack(clusterStack);
        template.resourceCountIs('AWS::EFS::FileSystem', 1);
        template.resourceCountIs('AWS::EFS::MountTarget', 2);
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
                account: '426272108223', //process.env.CDK_DEFAULT_ACCOUNT,
                region: 'eu-west-1', //process.env.CDK_DEFAULT_REGION
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

        new ZeebeFargateCluster(clusterStack, 'ZeebeTestCluster', {numBrokerNodes: 2, numGatewayNodes: 1});

        // Prepare the stack for assertions.
        let template = Template.fromStack(clusterStack);
        template.resourceCountIs('AWS::EFS::FileSystem', 1);
        template.resourceCountIs('AWS::EFS::MountTarget', 2);
        template.resourceCountIs('AWS::ECS::Service', 3);
        template.resourceCountIs('AWS::ECS::TaskDefinition', 3);
        template.hasResourceProperties('AWS::ECS::Cluster', {
            ClusterName: 'zeebe-cluster',
        });
    });

});