import {RemovalPolicy} from 'aws-cdk-lib';
import {ISecurityGroup, IVpc, Peer, Port, SecurityGroup, SubnetType, Vpc} from 'aws-cdk-lib/aws-ec2';
import {
  CloudMapOptions,
  Cluster,
  ContainerImage,
  DeploymentControllerType,
  FargateService,
  FargateTaskDefinition,
  ICluster,
  LogDriver,
  Protocol,
} from 'aws-cdk-lib/aws-ecs';
import {FileSystem} from 'aws-cdk-lib/aws-efs';
import {LogGroup, RetentionDays} from 'aws-cdk-lib/aws-logs';
import {DnsRecordType, PrivateDnsNamespace} from 'aws-cdk-lib/aws-servicediscovery';
import {Construct} from 'constructs';
import {ZeebeClusterProps} from './zeebe-cluster-props';

/**
 * A construct to create a Camunda 8 cluster comprising of a number Zeebe brokers and gateways
 * deployed on AWS ECS Fargate.
 *
 */
export class ZeebeFargateCluster extends Construct {

    private CAMUNDA_VERSION: string = 'latest';
    private defaultNumberOfBrokers: number = 3;
    private ECS_CLUSTER_NAME: string = 'zeebe-cluster';

    private readonly props: ZeebeClusterProps;


    /**
     * A construct to create a Camunda 8 cluster comprising of a number Zeebe brokers and gateways
     * deployed on AWS ECS Fargate.
     *
     */
    constructor(scope: Construct, id: string, zeebeProperties: ZeebeClusterProps) {
        super(scope, id);
        this.props = this.initProps(zeebeProperties);
        this.createGateway();

        for (let i = 0; i < this.props.numBrokerNodes!; i++) {
            this.createBroker(i);
        }
    }

    private initProps(options?: Partial<ZeebeClusterProps>): ZeebeClusterProps {
        const defaultVpc = Vpc.fromLookup(this, 'default-vpc', {isDefault: true});
        const securityGroups = this.defaultSecurityGroups(defaultVpc);
        const ecsCluster = this.getCluster(defaultVpc);
        const defaultNs = new PrivateDnsNamespace(this, 'zeebe-default-ns', {
            name: 'zeebe-cluster.net',
            description: 'Zeebe Cluster Namespace',
            vpc: defaultVpc,
        });
        const defaultImage = ContainerImage.fromRegistry('camunda/zeebe:' + this.CAMUNDA_VERSION);

        const defaults = {
            containerImage: defaultImage,
            ecsCluster: ecsCluster,
            cpu: 512,
            memory: 1024,
            gatewayCpu: 512,
            gatewayMemory: 1024,
            namespace: defaultNs,
            numBrokerNodes: this.defaultNumberOfBrokers,
            numGatewayNodes: 1,
            securityGroups: securityGroups,
            vpc: defaultVpc,
            fileSystem: new FileSystem(this, 'zeebe-efs', {
                vpc: defaultVpc,
            }),
        };

        return {
            ...defaults,
            ...options,
        };
    }

    private defaultSecurityGroups(defaultVpc: IVpc): Array<ISecurityGroup> {
        let sg = new SecurityGroup(this, 'default-cluster-security-group', {
            vpc: defaultVpc,
            allowAllOutbound: true,
            securityGroupName: 'zeebe-cluster-sg',
        });
        sg.addIngressRule(Peer.anyIpv4(), Port.tcpRange(26500, 26502), '', false);
        return [sg];
    }

    private createGateway(): FargateService {

        let fservice = new FargateService(this, 'zeebe-gateway', {
            cluster: this.props.ecsCluster!,
            desiredCount: 1,
            minHealthyPercent: 100,
            maxHealthyPercent: 200,
            serviceName: 'gateway',
            taskDefinition: this.gatewayTaskDefinition(),
            securityGroups: this.props.securityGroups,
            vpcSubnets: {subnetType: SubnetType.PUBLIC},
            deploymentController: {type: DeploymentControllerType.ECS},
            cloudMapOptions: this.configureCloudMap(),
            assignPublicIp: false,
        });

        return fservice;
    }


    private createBroker(id: number): FargateService {

        let fservice = new FargateService(this, 'zeebe-broker-' + id, {
            cluster: this.props.ecsCluster!,
            desiredCount: 1,
            minHealthyPercent: 100,
            maxHealthyPercent: 200,
            serviceName: 'zeebe-broker-' + id,
            taskDefinition: this.brokerTaskDefinition(id),
            securityGroups: this.props.securityGroups,
            vpcSubnets: {subnetType: SubnetType.PRIVATE_WITH_NAT},
            deploymentController: {type: DeploymentControllerType.ECS},
            cloudMapOptions: this.configureCloudMap(),
        });

        return fservice;
    }


    private createZeebeContactPoints(port: number): string {
        var s = 'zeebe-broker-';

        for (let i = 0; i < this.props.numBrokerNodes!; i++) {

            s = s + '' + i + '.' + this.props.namespace?.namespaceName + ':' + port;

            if (i < this.props.numBrokerNodes! - 1) {
                s = s + ', ';
            }
        }
        return s;
    }

    private gatewayTaskDefinition(): FargateTaskDefinition {
        let td = new FargateTaskDefinition(this, 'zeebe-gw-task-def', {
            cpu: this.props.cpu as number,
            memoryLimitMiB: this.props.memory as number,
            family: 'zeebe',
        });

        td.addContainer('zeebe-gw', {
            cpu: this.props.cpu! as number,
            memoryLimitMiB: this.props.memory!,
            containerName: 'zeebe-gw',
            image: this.props.containerImage!,
            essential: true,
            portMappings: [
                {containerPort: 26500, hostPort: 26500, protocol: Protocol.TCP},
            ],
            environment: {
                JAVA_TOOL_OPTIONS: '-Xms512m -Xmx512m ',
                ZEEBE_STANDALONE_GATEWAY: 'true',
                ZEEBE_GATEWAY_NETWORK_HOST: '0.0.0.0',
                ZEEBE_GATEWAY_NETWORK_PORT: '26500',
                ZEEBE_GATEWAY_CLUSTER_CONTACTPOINT: 'zeebe-broker-0.' + this.props.namespace?.namespaceName + ':26502',
                ZEEBE_GATEWAY_CLUSTER_PORT: '26502',
                ZEEBE_GATEWAY_CLUSTER_HOST: 'zeebe-gateway.' + this.props.namespace?.namespaceName,
                ZEEBE_BROKER_GATEWAY_ENABLE: 'true',
                ATOMIX_LOG_LEVEL: 'DEBUG',
            },
            logging: LogDriver.awsLogs({
                logGroup: new LogGroup(this, 'zeebe-gw-logs', {
                    logGroupName: '/ecs/zeebe-gateway',
                    removalPolicy: RemovalPolicy.DESTROY,
                    retention: RetentionDays.ONE_MONTH,
                }),
                streamPrefix: 'zeebe-gateway',
            }),
        });

        td.applyRemovalPolicy(RemovalPolicy.DESTROY);
        return td;
    }

    private getCluster(defaultVpc: IVpc): ICluster {
        return new Cluster(this, 'zeebe-cluster', {
            clusterName: this.ECS_CLUSTER_NAME,
            vpc: defaultVpc,
        });
    }

    private configureCloudMap(): CloudMapOptions {
        return {
            name: 'gateway',
            dnsRecordType: DnsRecordType.A,
            cloudMapNamespace: this.props.namespace,
        };
    }

    private brokerTaskDefinition(id: number) {

        let td = new FargateTaskDefinition(this, 'zeebe-broker-task-def-' + id, {
            cpu: this.props.cpu,
            memoryLimitMiB: this.props?.memory,
            family: 'zeebe',
        });
        td.applyRemovalPolicy(RemovalPolicy.DESTROY);

        td.addVolume({
            name: 'zeebe-data-volume-' + id,
            efsVolumeConfiguration: {fileSystemId: 'EFS'},
        });


        var zeebeContainer = td.addContainer('zeebe-broker-' + id, {
            cpu: this.props?.cpu,
            memoryLimitMiB: this.props?.memory,
            containerName: 'zeebe-broker',
            image: this.props.containerImage!,
            portMappings: [
                {containerPort: 26500, hostPort: 26500, protocol: Protocol.TCP},
                {containerPort: 26501, hostPort: 26501, protocol: Protocol.TCP},
                {containerPort: 26502, hostPort: 26502, protocol: Protocol.TCP},
            ],
            environment: {
                JAVA_TOOL_OPTIONS: '-Xms512m -Xmx512m ',
                ZEEBE_BROKER_CLUSTER_NODEID: '' + id,
                ZEEBE_BROKER_DATA_DISKUSAGECOMMANDWATERMARK: '0.998',
                ZEEBE_BROKER_DATA_DISKUSAGEREPLICATIONWATERMARK: '0.999',
                ZEEBE_BROKER_NETWORK_HOST: '0.0.0.0',
                ZEEBE_BROKER_CLUSTER_PARTITIONSCOUNT: '2',
                ZEEBE_BROKER_CLUSTER_REPLICATIONFACTOR: '3',
                ZEEBE_BROKER_CLUSTER_CLUSTERSIZE: '' + this.props.numBrokerNodes,
                ZEEBE_GATEWAY_CLUSTER_CONTACTPOINT: this.createZeebeContactPoints(26502),
                ZEEBE_BROKER_GATEWAY_ENABLE: 'false',
                ZEEBE_LOG_LEVEL: 'DEBUG',
                ZEEBE_DEBUG: 'true',
                ATOMIX_LOG_LEVEL: 'DEBUG',
            },
            logging: LogDriver.awsLogs({
                logGroup: new LogGroup(this, 'zeebe-broker-' + id + '-logs', {
                    logGroupName: '/ecs/zeebe-gateway',
                    removalPolicy: RemovalPolicy.DESTROY,
                    retention: RetentionDays.ONE_MONTH,
                }),
                streamPrefix: 'zeebe-broker-' + id,
            }),
        });

        zeebeContainer.addMountPoints({
            containerPath: '/usr/local/zeebe/data',
            sourceVolume: 'zeebe-data-volume-' + id,
            readOnly: false,
        });

        return td;
    }


}
