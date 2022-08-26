import { RemovalPolicy } from 'aws-cdk-lib';
import { ISecurityGroup, IVpc, Peer, Port, SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import {
  Cluster,
  ContainerImage,
  DeploymentControllerType,
  FargateService,
  FargateTaskDefinition,
  ICluster,
  LogDriver,
  Protocol,
} from 'aws-cdk-lib/aws-ecs';
import { FileSystem, PerformanceMode } from 'aws-cdk-lib/aws-efs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { DnsRecordType, PrivateDnsNamespace } from 'aws-cdk-lib/aws-servicediscovery';
import { Construct } from 'constructs';
import { ZeebeClusterProps } from './zeebe-cluster-props';

/**
 * A construct to create a Camunda 8 cluster comprising of a number Zeebe brokers and gateways
 * deployed on AWS ECS Fargate.
 *
 */
export class ZeebeFargateSimpleCluster extends Construct {

  private CAMUNDA_VERSION: string = 'latest';
  private defaultNumberOfBrokers: number = 3;
  private ECS_CLUSTER_NAME: string = 'zeebe-dev-cluster';

  private readonly props: ZeebeClusterProps;
  private accessPointIds: Array<string> = [];

  /**
     * A construct to create a Camunda 8 cluster comprising of a number Zeebe brokers and gateways
     * deployed on AWS ECS Fargate.
     *
     * All of the associated Camunda containers are modeled in a single ECS task definition and service.
     * This simplifies the networking of the Zeebe cluster, but the downside is the entire cluster will need
     * to be restarted if a single component fails
     *
     */
  constructor(scope: Construct, id: string, zeebeProperties: ZeebeClusterProps) {
    super(scope, id);
    this.props = this.initProps(zeebeProperties);
    this.createZeebeClusterService();
  }

  private initProps(options?: Partial<ZeebeClusterProps>): ZeebeClusterProps {
    const defaultVpc = Vpc.fromLookup(this, 'default-vpc', { isDefault: true });
    const securityGroups = this.defaultSecurityGroups(defaultVpc);
    const ecsCluster = this.getCluster(defaultVpc);
    const defaultNs = new PrivateDnsNamespace(this, 'zeebe-default-ns', {
      name: 'zeebe-cluster.net',
      description: 'Zeebe Cluster Namespace',
      vpc: defaultVpc,
    });
    const defaultImage = ContainerImage.fromRegistry('camunda/zeebe:' + this.CAMUNDA_VERSION);
    const defaultFileSystem = this.defaultZeebeEfs(defaultVpc, securityGroups[1]);

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
      fileSystem: defaultFileSystem,
      usePublicSubnets: true,
    };

    return {
      ...defaults,
      ...options,
    };
  }

  private defaultZeebeEfs(defaultVpc: IVpc, sg: ISecurityGroup): FileSystem {
    const efs = new FileSystem(this, 'zeebe-efs', {
      vpc: defaultVpc,
      encrypted: false,
      fileSystemName: 'zeebe-efs',
      enableAutomaticBackups: false,
      removalPolicy: RemovalPolicy.DESTROY,
      performanceMode: PerformanceMode.GENERAL_PURPOSE,
      vpcSubnets: { subnetType: SubnetType.PUBLIC },
      securityGroup: sg,
    });

    for (let i = 0; i < this.defaultNumberOfBrokers; i++) {
      let ap = efs.addAccessPoint('broker-ap-' + i, {
        path: '/broker-data-' + i,
        createAcl: { //ACL with permissions is requried to allow access point create a folder on the EFS
          ownerUid: '1001',
          ownerGid: '1001',
          permissions: '755',
        },
        posixUser: {
          uid: '1001',
          gid: '1001',
        },
      });
      this.accessPointIds.push(ap.accessPointId);
    }

    return efs;
  }

  private defaultSecurityGroups(defaultVpc: IVpc): Array<ISecurityGroup> {
    let sg = new SecurityGroup(this, 'default-cluster-security-group', {
      vpc: defaultVpc,
      allowAllOutbound: true,
      securityGroupName: 'zeebe-dev-cluster-sg',
    });
    sg.addIngressRule(Peer.anyIpv4(), Port.tcp(9600), 'Zeebe Ports', false);
    sg.addIngressRule(Peer.anyIpv4(), Port.tcpRange(26500, 26503), 'Zeebe Ports', false);
    sg.addIngressRule(Peer.anyIpv4(), Port.tcp(2049), 'EFS Ports', false);

    let efssg = new SecurityGroup(this, 'default-efs-security-group', {
      vpc: defaultVpc,
      allowAllOutbound: true,
      securityGroupName: 'efs-sg',
    });

    efssg.addIngressRule(sg, Port.tcp(2049), 'EFS Ports', false);

    return [sg, efssg];
  }

  private createZeebeClusterService(): FargateService {

    let fservice = new FargateService(this, 'zeebe-cluster-service', {
      cluster: this.props.ecsCluster!,
      desiredCount: 1,
      minHealthyPercent: 100,
      maxHealthyPercent: 200,
      serviceName: 'gateway',
      taskDefinition: this.zeebeClusterTaskDefinition(),
      securityGroups: this.props.securityGroups,
      vpcSubnets: { subnetType: SubnetType.PUBLIC },
      deploymentController: { type: DeploymentControllerType.ECS },
      cloudMapOptions: {
        name: 'gateway',
        dnsRecordType: DnsRecordType.A,
        cloudMapNamespace: this.props.namespace,
      },
      assignPublicIp: this.props.usePublicSubnets!,
    });

    return fservice;
  }

  private zeebeClusterTaskDefinition(): FargateTaskDefinition {
    let td = new FargateTaskDefinition(this, 'zeebe-gw-task-def', {
      cpu: this.props.cpu as number,
      memoryLimitMiB: this.props.memory as number,
      family: 'zeebe-dev-cluster',
    });

    td.addContainer('zeebe-dev-gw', {
      cpu: this.props.cpu! as number,
      memoryLimitMiB: this.props.memory!,
      containerName: 'zeebe-gw',
      image: this.props.containerImage!,
      essential: true,
      portMappings: [
        { containerPort: 26500, hostPort: 26500, protocol: Protocol.TCP },
        { containerPort: 26502, hostPort: 26502, protocol: Protocol.TCP },
        { containerPort: 26501, hostPort: 26501, protocol: Protocol.TCP },
        { containerPort: 9600, hostPort: 9600, protocol: Protocol.TCP },
      ],
      environment: {
        JAVA_TOOL_OPTIONS: '-Xms512m -Xmx512m ',
        ZEEBE_STANDALONE_GATEWAY: 'true',
        ZEEBE_BROKER_GATEWAY_ENABLE: 'true',
        ZEEBE_GATEWAY_CLUSTER_CONTACTPOINT: 'zeebe-broker-0.' + this.props.namespace?.namespaceName + ':26502',
        ATOMIX_LOG_LEVEL: 'TRACE',
      },
      logging: LogDriver.awsLogs({
        logGroup: new LogGroup(this, 'zeebe-gw-logs', {
          logGroupName: '/ecs/zeebe-dev-gateway',
          removalPolicy: RemovalPolicy.DESTROY,
          retention: RetentionDays.ONE_MONTH,
        }),
        streamPrefix: 'zeebe-gateway',
      }),
    });

    for (let i = 0; i < this.props.numBrokerNodes!; i++) {

      var zeebeContainer = td.addContainer('zeebe-broker-' + i, {
        cpu: this.props?.cpu,
        memoryLimitMiB: this.props?.memory,
        containerName: 'zeebe-broker',
        image: this.props.containerImage!,
        portMappings: [],
        environment: {
          JAVA_TOOL_OPTIONS: '-Xms512m -Xmx512m ',
          ZEEBE_BROKER_CLUSTER_NODEID: '' + i,
          ZEEBE_BROKER_DATA_DISKUSAGECOMMANDWATERMARK: '0.998',
          ZEEBE_BROKER_DATA_DISKUSAGEREPLICATIONWATERMARK: '0.999',
          ZEEBE_BROKER_NETWORK_HOST: '0.0.0.0',
          ZEEBE_BROKER_NETWORK_PORTOFFSET: '' + i * 100,
          ZEEBE_BROKER_CLUSTER_PARTITIONSCOUNT: '' + this.props.numBrokerNodes,
          ZEEBE_BROKER_CLUSTER_REPLICATIONFACTOR: '' + this.props.numBrokerNodes,
          ZEEBE_BROKER_CLUSTER_CLUSTERSIZE: '' + this.props.numBrokerNodes,
          ZEEBE_BROKER_CLUSTER_INITIALCONTACTPOINTS: 'localhost:26502',
          ZEEBE_BROKER_GATEWAY_ENABLE: 'false',
          ZEEBE_LOG_LEVEL: 'DEBUG',
          ZEEBE_DEBUG: 'true',
          ATOMIX_LOG_LEVEL: 'TRACE',
        },
        logging: LogDriver.awsLogs({
          logGroup: new LogGroup(this, 'zeebe-broker-' + i + '-logs', {
            logGroupName: '/ecs/zeebe-dev-broker' + i,
            removalPolicy: RemovalPolicy.DESTROY,
            retention: RetentionDays.ONE_MONTH,
          }),
          streamPrefix: 'broker-' + i,
        }),
      });

      zeebeContainer.addMountPoints({
        containerPath: '/usr/local/zeebe/data',
        sourceVolume: 'zeebe-data-volume-' + i,
        readOnly: false,
      });
    }


    td.applyRemovalPolicy(RemovalPolicy.DESTROY);
    return td;
  }


  private getCluster(defaultVpc: IVpc): ICluster {
    return new Cluster(this, 'zeebe-dev-cluster', {
      clusterName: this.ECS_CLUSTER_NAME,
      vpc: defaultVpc,
    });
  }

}

