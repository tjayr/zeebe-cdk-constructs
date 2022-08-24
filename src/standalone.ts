import { RemovalPolicy } from 'aws-cdk-lib';
import { ISecurityGroup, IVpc, Peer, Port, SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
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
  Volume,
} from 'aws-cdk-lib/aws-ecs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { DnsRecordType, PrivateDnsNamespace } from 'aws-cdk-lib/aws-servicediscovery';
import { Construct } from 'constructs';
import { ZeebeStandaloneProps } from './standalone-props';

/**
 * A construct to creates a single standalone Zeebe node that is both gateway and broker deployed on AWS ECS Fargate
 */
export class ZeebeStandaloneFargateCluster extends Construct {

  private CAMUNDA_VERSION: string = 'latest';
  private ECS_CLUSTER_NAME: string = 'zeebe-standalone';
  private VOLUME_NAME: string = 'zeebe-standalone-data-volume';

  private props: ZeebeStandaloneProps;

  /**
   * A construct to creates a single standalone Zeebe node that is both gateway and broker deployed on AWS ECS Fargate
   */
  constructor(scope: Construct, id: string, zeebeProperties: ZeebeStandaloneProps) {
    super(scope, id);
    this.props = this.initProps(zeebeProperties);

    this.createStandaloneBroker();
  }

  private initProps(options?: Partial<ZeebeStandaloneProps>): ZeebeStandaloneProps {
    const defaultVpc = Vpc.fromLookup(this, 'default-vpc', { isDefault: true });
    const securityGroups = this.defaultSecurityGroups(defaultVpc);
    const ecsCluster = this.getCluster(defaultVpc);
    const defaultNs = new PrivateDnsNamespace(this, 'zeebe-default-ns', {
      name: 'zeebe-cluster.net',
      description: 'Zeebe Cluster Namespace',
      vpc: defaultVpc,
    });

    const defaults = {
      cpu: 512,
      ecsCluster: ecsCluster,
      memory: 1024,
      namespace: defaultNs,
      securityGroups: securityGroups,
      vpc: defaultVpc,
      fileSystem: undefined,
      usePublicSubnets: true,
      portMappings: [
        { containerPort: 26500, hostPort: 26500, protocol: Protocol.TCP },
        { containerPort: 26501, hostPort: 26501, protocol: Protocol.TCP },
        { containerPort: 26502, hostPort: 26502, protocol: Protocol.TCP },
      ],
      zeebeEnvironmentVars: {
        JAVA_TOOL_OPTIONS: '-Xms512m -Xmx512m ',
        ATOMIX_LOG_LEVEL: 'DEBUG',
        ZEEBE_BROKER_DATA_DISKUSAGECOMMANDWATERMARK: '0.998',
        ZEEBE_BROKER_DATA_DISKUSAGEREPLICATIONWATERMARK: '0.999',
        ZEEBE_GATEWAY_NETWORK_HOST: '0.0.0.0',
        ZEEBE_GATEWAY_NETWORK_PORT: '26500',
      },
      containerImage: ContainerImage.fromRegistry('camunda/zeebe:' + this.CAMUNDA_VERSION),
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
      securityGroupName: 'zeebe-standalone-sg',
    });
    sg.addIngressRule(Peer.anyIpv4(), Port.tcpRange(26500, 26502), '', false);
    return [sg];
  }

  private createStandaloneBroker(): FargateService {

    let fservice = new FargateService(this, 'zeebe-standalone', {
      cluster: this.props.ecsCluster!,
      desiredCount: 1,
      minHealthyPercent: 100,
      maxHealthyPercent: 200,
      serviceName: 'zeebe-standalone',
      taskDefinition: this.standaloneTaskDefinition(),
      securityGroups: this.props.securityGroups,
      assignPublicIp: this.props.usePublicSubnets,
      vpcSubnets: {
        subnetType: this.props.usePublicSubnets == true ? SubnetType.PUBLIC : SubnetType.PRIVATE_WITH_NAT,
      },
      deploymentController: { type: DeploymentControllerType.ECS },
      cloudMapOptions: this.configureCloudMap(),
    });

    return fservice;
  }

  private standaloneTaskDefinition(): FargateTaskDefinition {
    let td = new FargateTaskDefinition(this, 'zeebe-standalone-task-def', {
      cpu: this.props.cpu!,
      memoryLimitMiB: this.props.memory!,
      family: 'zeebe',
    });

    td.applyRemovalPolicy(RemovalPolicy.DESTROY);


    let container = td.addContainer('zeebe-gw', {
      cpu: this.props.cpu!,
      memoryLimitMiB: this.props?.memory!,
      containerName: 'zeebe-standalone',
      image: this.props.containerImage as ContainerImage,
      portMappings: [
        { containerPort: 26500, hostPort: 26500, protocol: Protocol.TCP },
        { containerPort: 26501, hostPort: 26501, protocol: Protocol.TCP },
        { containerPort: 26502, hostPort: 26502, protocol: Protocol.TCP },
      ],
      environment: this.props.zeebeEnvironmentVars,
      logging: LogDriver.awsLogs({
        logGroup: new LogGroup(this, 'zeebe-gw-logs', {
          logGroupName: '/ecs/zeebe-standalone',
          removalPolicy: RemovalPolicy.DESTROY,
          retention: RetentionDays.ONE_MONTH,
        }),
        streamPrefix: 'zeebe-standalone',
      }),
    });

    td.addVolume(this.createZeebeVolume());

    container.addMountPoints({
      containerPath: '/usr/local/zeebe/data',
      sourceVolume: this.VOLUME_NAME,
      readOnly: false,
    });

    return td;
  }

  private createZeebeVolume(): Volume {

    if (this.props.fileSystem == undefined) {
      return {
        name: this.VOLUME_NAME,
      };
    }

    return {
      name: this.VOLUME_NAME,
      efsVolumeConfiguration: {
        fileSystemId: this.props.fileSystem?.fileSystemId!,
        rootDirectory: '/',
      },
    };
  }

  private getCluster(defaultVpc: IVpc): ICluster {
    return new Cluster(this, 'zeebe-standalone-ecs-cluster', {
      clusterName: this.ECS_CLUSTER_NAME,
      vpc: defaultVpc,
    });
  }

  private configureCloudMap(): CloudMapOptions {
    return {
      name: 'zeebe-standalone',
      dnsRecordType: DnsRecordType.A,
      cloudMapNamespace: this.props.namespace,
    };
  }

}
