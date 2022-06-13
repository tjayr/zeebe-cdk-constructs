import {Construct} from "constructs";
import {ISecurityGroup, IVpc, Peer, Port, SecurityGroup, SubnetType, Vpc} from "aws-cdk-lib/aws-ec2";
import {DnsRecordType, PrivateDnsNamespace} from "aws-cdk-lib/aws-servicediscovery";
import {
    CloudMapOptions,
    Cluster,
    ContainerImage,
    DeploymentControllerType,
    FargateService,
    FargateTaskDefinition,
    ICluster,
    LogDriver,
    Protocol
} from "aws-cdk-lib/aws-ecs";
import {IApplicationLoadBalancer} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import {RemovalPolicy} from "aws-cdk-lib";
import {LogGroup, RetentionDays} from "aws-cdk-lib/aws-logs";
import {FileSystem} from "aws-cdk-lib/aws-efs";

export interface ZeebeClusterProps {

    /**
     * The amount of memory to assign to the broker task
     *
     * Must be one of the supported Fargate memory configurations. Defaults to 1024
     */
    readonly memory?: number;

    /**
     * The amount of cpu to assign to the broker task
     *
     * Must be one of the supported Fargate memory configurations. Defaults to 512
     */
    readonly cpu?: number;

    /**
     * The security groups to assign to the cluster
     *
     */
    securityGroups: Array<SecurityGroup>;

    /**
     * The VPC that the cluster will be created in
     *
     * If not specified, the cluster will be created in the default VPC
     */
    vpc?: IVpc

    /**
     * A CloudMap private name space to be used for service discover. If not specified a private name space
     * called zeebe-cluster.net will be created.
     *
     */
    readonly namespace?: PrivateDnsNamespace

    /**
     * The ECS cluster to create the cluster in
     *
     */
    readonly ecsCluster: ICluster

    /**
     * An application load balancer. If an application loadbalancer is specified, then the Zeebe Gateway will
     * be registered in to the loadbalancer using GRPC. If no loadbalanecr is specified the zeebe gateway will be placed
     * in a public subnet.
     *
     * Defaults is no load balancer
     */
    readonly loadBalancer?: IApplicationLoadBalancer

    /**
     * The number of Zeebe broker nodes to create in the Cluster.
     *
     * Default value is 3
     */
    readonly numBrokerNodes: number,

    /**
     * The number of Zeebe gateway nodes to create in the Cluster.
     *
     * Default value is 1
     */
    readonly numGatewayNodes: number,

    /**
     * An elastic file system to store Zeebe broker data. If not specified the brokers will use ephemeral
     * Fargate local storage and data will be lost when a node is restarted.
     *
     * Default value is 3
     */
    readonly fileSystem: FileSystem

    /**
     * The amount of memory to assign to the gateway task
     *
     * Must be one of the supported Fargate memory configurations. Defaults to 1024
     */
    readonly gatewayCpu: number,

    /**
     * The amount of cpu to assign to the gateway task
     *
     * Must be one of the supported Fargate memory configurations. Defaults to 1024
     */
    readonly gatewayMemory: number

}

export class ZeebeCluster extends Construct {

    private CLUSTER_SIZE: number = 3;
    private ECS_CLUSTER_NAME: string = "zeebe-cluster";

    private targetVpc: IVpc
    private defaultNamespace: PrivateDnsNamespace;
    private props: ZeebeClusterProps;

    constructor(scope: Construct, id: string, zeebeProperties: ZeebeClusterProps) {
        super(scope, id);
        this.props = this.initProps(zeebeProperties);

       this.createGateway()

        for (let i = 0; i < this.getNumberOfBrokers(); i++) {
            this.createBroker(i);
        }
    }

    private initProps(options?: Partial<ZeebeClusterProps>): ZeebeClusterProps {
        const defaults = {
            memory: 1024,
            cpu:512,
            securityGroups: this.defaultSecurityGroups(),
            vpc: Vpc.fromLookup(this, "default-vpc", {isDefault: true}),
            namespace: new PrivateDnsNamespace(this, "zeebe-default-ns", {
                name: "zeebe-cluster.net",
                description: "Zeebe Cluster Namespace",
                vpc: this.targetVpc
            }),
            ecsCluster: new Cluster(this, "zeebe-cluster", {
                clusterName: this.ECS_CLUSTER_NAME,
                vpc: this.targetVpc
            }),
            loadBalancer: undefined,
            numBrokerNodes: 3,
            numGatewayNodes: 1,
            fileSystem: new FileSystem(),
            gatewayCpu: 512,
            gatewayMemory: 1024
        };

        return {
            ...defaults,
            ...options,
        };
    }

    private createGateway(): FargateService {

        let fservice = new FargateService(this, "zeebe-gateway", {
            cluster: this.props.ecsCluster,
            desiredCount: 1,
            minHealthyPercent: 100,
            maxHealthyPercent: 200,
            serviceName: "gateway",
            taskDefinition: this.gatewayTaskDefinition(),
            securityGroups: this.props.securityGroups,
            vpcSubnets: {subnetType: SubnetType.PUBLIC},
            deploymentController: {type: DeploymentControllerType.ECS},
            cloudMapOptions: this.configureCloudMap()
        });

        // if(options.loadBalancer  == undefined) {
        //
        //   fservice.vpcSubnets(SubnetSelection.builder().subnetType(SubnetType.PUBLIC).build());
        //   fservice.assignPublicIp(true);
        // } else {
        //   fservice.assignPublicIp(true);
        // }

        // fservice.attachToApplicationTargetGroup({})

        return fservice;
    }


    private createBroker(id: number): FargateService {

        let fservice = new FargateService(this, "zeebe-broker-"+id, {
            cluster: this.props.ecsCluster,
            desiredCount: 1,
            minHealthyPercent: 100,
            maxHealthyPercent: 200,
            serviceName: "zeebe-broker-"+id,
            taskDefinition: this.brokerTaskDefinition(id),
            securityGroups: this.securityGroups(),
            vpcSubnets: {subnetType: SubnetType.PRIVATE_WITH_NAT},
            deploymentController: {type: DeploymentControllerType.ECS},
            cloudMapOptions: this.configureCloudMap()
        });

        return fservice;
    }

    private defaultSecurityGroups(): Array<ISecurityGroup> {
        let sg = new SecurityGroup(this, "default-cluster-security-group", {
            vpc: this.targetVpc,
            allowAllOutbound: true,
            securityGroupName: '',
        })
        sg.addIngressRule(Peer.anyIpv4(), Port.tcpRange(26500, 26502), '', false)
        return [sg];
    }


    private createZeebeContactPoints(clusterSize: number, port: number): string {
        var s = "zeebe-broker-"

        for (let i = 0; i < clusterSize; i++) {

            s = s + "" + i + "." + this.props.namespace?.namespaceName + ":" + port

            if (i < clusterSize - 1) {
                s = s + ", "
            }
        }
        return s;
    }

    private gatewayTaskDefinition(): FargateTaskDefinition {
        let td = new FargateTaskDefinition(this, "zeebe-gw-task-def", {
            cpu: this.props?.cpu == undefined ? 512 : this.props.cpu,
            memoryLimitMiB: this.props?.memory == undefined ? 1024 : this.props.memory,
            family: "zeebe"
        })
        td.applyRemovalPolicy(RemovalPolicy.DESTROY);

        var zeebeContainer = td.addContainer("zeebe-gw", {
            cpu: this.props?.cpu == undefined ? 512 : this.props.cpu,
            memoryLimitMiB: this.props?.memory == undefined ? 1024 : this.props.memory,
            containerName: 'zeebe-gw',
            image: ContainerImage.fromRegistry('camunda/zeebe:8.0.2'),
            portMappings: [
                {containerPort: 26500, hostPort: 26500, protocol: Protocol.TCP},
                {containerPort: 26501, hostPort: 26501, protocol: Protocol.TCP},
                {containerPort: 26502, hostPort: 26502, protocol: Protocol.TCP},
            ],
            environment: {
                "JAVA_TOOL_OPTIONS": "-Xms512m -Xmx512m ",
                "ZEEBE_STANDALONE_GATEWAY": "true",
                "ZEEBE_GATEWAY_NETWORK_HOST": "0.0.0.0",
                "ZEEBE_GATEWAY_NETWORK_PORT": "26500",
                "ZEEBE_GATEWAY_CLUSTER_CONTACTPOINT": "zeebe-broker-0." + this.props.namespace?.namespaceName + ":26502",
                "ZEEBE_GATEWAY_CLUSTER_PORT": "26502",
                "ZEEBE_GATEWAY_CLUSTER_HOST": "zeebe-gateway." + this.props.namespace?.namespaceName,
                "ZEEBE_BROKER_GATEWAY_ENABLE": "true",
                "ATOMIX_LOG_LEVEL": "DEBUG"
            },
            logging: LogDriver.awsLogs({
                logGroup: new LogGroup(this, 'zeebe-gw-logs', {
                    logGroupName: '/ecs/zeebe-gateway',
                    removalPolicy: RemovalPolicy.DESTROY,
                    retention: RetentionDays.ONE_MONTH
                }),
                logRetention: RetentionDays.ONE_MONTH,
                streamPrefix: 'zeebe=gateway'
            })
        });

        return td;
    }

    private configureCloudMap(): CloudMapOptions {
        if (this.props?.namespace == undefined) {
            return {
                name: 'gateway',
                dnsRecordType: DnsRecordType.A,
                cloudMapNamespace: this.defaultNamespace
            }
        } else {
            return {
                name: 'gateway',
                dnsRecordType: DnsRecordType.A,
                cloudMapNamespace: this.props.namespace
            }
        }
    }

    private brokerTaskDefinition(id: number) {
        
        let td = new FargateTaskDefinition(this, "zeebe-broker-task-def-"+id, {
            cpu: this.props?.cpu == undefined ? 512 : this.props.cpu,
            memoryLimitMiB: this.props?.memory == undefined ? 1024 : this.props.memory,
            family: "zeebe"
        })
        td.applyRemovalPolicy(RemovalPolicy.DESTROY);

        var zeebeContainer = td.addContainer("zeebe-broker-"+id, {
            cpu: this.props?.cpu == undefined ? 512 : this.props.cpu,
            memoryLimitMiB: this.props?.memory == undefined ? 1024 : this.props.memory,
            containerName: 'zeebe-broker',
            image: ContainerImage.fromRegistry('camunda/zeebe:8.0.2'),
            portMappings: [
                {containerPort: 26500, hostPort: 26500, protocol: Protocol.TCP},
                {containerPort: 26501, hostPort: 26501, protocol: Protocol.TCP},
                {containerPort: 26502, hostPort: 26502, protocol: Protocol.TCP},
            ],
            environment: {
                "JAVA_TOOL_OPTIONS": "-Xms512m -Xmx512m ",
                "ZEEBE_BROKER_CLUSTER_NODEID": ""+id,
                "ZEEBE_BROKER_DATA_DISKUSAGECOMMANDWATERMARK": "0.998",
                "ZEEBE_BROKER_DATA_DISKUSAGEREPLICATIONWATERMARK": "0.999",
                "ZEEBE_BROKER_NETWORK_HOST": "0.0.0.0",
                "ZEEBE_BROKER_CLUSTER_PARTITIONSCOUNT": "2",
                "ZEEBE_BROKER_CLUSTER_REPLICATIONFACTOR": "3",
                "ZEEBE_BROKER_CLUSTER_CLUSTERSIZE": ""+this.props.numBrokerNodes,
                "ZEEBE_GATEWAY_CLUSTER_CONTACTPOINT": this.createZeebeContactPoints(this.props.numBrokerNodes, 26502),
                "ZEEBE_BROKER_GATEWAY_ENABLE": "false",
                "ZEEBE_LOG_LEVEL": "DEBUG",
                "ZEEBE_DEBUG": "true",
                "ATOMIX_LOG_LEVEL": "DEBUG"
            },
            logging: LogDriver.awsLogs({
                logGroup: new LogGroup(this, 'zeebe-gw-logs', {
                    logGroupName: '/ecs/zeebe-gateway',
                    removalPolicy: RemovalPolicy.DESTROY,
                    retention: RetentionDays.ONE_MONTH
                }),
                logRetention: RetentionDays.ONE_MONTH,
                streamPrefix: 'zeebe=gateway'
            })
        });

        zeebeContainer.addMountPoints( {containerPath: '/usr/local/zeebe/data', sourceVolume:'', readOnly: false})

        return td;
    }

    private getNumberOfBrokers() {
        return this.props?.numBrokerNodes == undefined ? this.CLUSTER_SIZE : this.props.numBrokerNodes;
    }
}
