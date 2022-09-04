import { aws_ecs, RemovalPolicy } from 'aws-cdk-lib';
import { ISecurityGroup, IVpc, Peer, Port, SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import {
  Cluster,
  ContainerImage,
  DeploymentControllerType,
  FargateService,
  FargateTaskDefinition,
  ICluster,
  LogDriver,
} from 'aws-cdk-lib/aws-ecs';
import { FileSystem, PerformanceMode } from 'aws-cdk-lib/aws-efs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { PrivateDnsNamespace } from 'aws-cdk-lib/aws-servicediscovery';
import { Construct } from 'constructs';
import { CamundaPlatformProps } from './camunda-platform-props';

/**
 * A construct pattern to create a Camunda 8 cluster comprising of Zeebe, Operate, Tasklist and Elasticsearch deployed on AWS ECS Fargate.
 *
 * The simple version creates all components within a single Fargate task definition and service. This simplifies the networking as each
 * component can refer to other components using localhost/127.0.0.1 (instead of using Cloud Map service discovery) - this approach is also cheaper.
 * The drawback is a lack resilience as all components will be restarted if one container fails or needs to be updated.
 *
 *
 */
export class CamundaPlatformCoreSimple extends Construct {

  private CAMUNDA_VERSION: string = 'latest';
  private ELASTIC_VERSION: string = '7.17.0';
  private ECS_CLUSTER_NAME: string = 'camunda-cluster';
  private efsSecurity: SecurityGroup | undefined = undefined;


  private readonly props: CamundaPlatformProps;
  private logs: LogGroup;

  /**
     * A construct pattern to create a Camunda 8 cluster comprising of Zeebe, Operate, Tasklist and Elasticsearch deployed on AWS ECS Fargate.
     *
     * The simple version creates all components within a single Fargate task definition and service. This simplifies the networking as each
     * component can refer to other components using localhost/127.0.0.1 (instead of using Cloud Map service discovery) - this approach is also cheaper.
     * The drawback is a lack resilience as all components will be restarted if one container fails or needs to be updated.
     *
     */
  constructor(scope: Construct, id: string, properties: CamundaPlatformProps) {
    super(scope, id);
    this.props = this.initProps(properties);
    this.logs = new LogGroup(this, 'zeebe-gw-logs', {
      logGroupName: '/ecs/core/zeebe',
      removalPolicy: RemovalPolicy.DESTROY,
      retention: RetentionDays.ONE_MONTH,
    });

    this.coreSimpleService();
  }

  private initProps(options?: Partial<CamundaPlatformProps>): CamundaPlatformProps {
    const defaultVpc = new Vpc(this, 'camunda-vpc', {
      cidr: '10.0.0.0/16',
      natGateways: 1,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      vpcName: 'camunda-vpc',
      subnetConfiguration: [
        { name: 'Public', subnetType: SubnetType.PUBLIC },
        { name: 'Private', subnetType: SubnetType.PRIVATE_WITH_NAT },
      ],
    });
    this.efsSecurity = this.efsSecurityGroup(defaultVpc);
    const ecsCluster = this.getCluster(defaultVpc);
    const defaultNs = new PrivateDnsNamespace(this, 'camunda-cluster-ns', {
      name: this.ECS_CLUSTER_NAME + '.net',
      description: 'Camunda Cluster Namespace',
      vpc: defaultVpc,
    });

    const defaults: CamundaPlatformProps = {
      zeebeProps: {
        cpu: 512,
        memory: 1024,
        securityGroup: this.zeebeSecurityGroup(defaultVpc),
        image: ContainerImage.fromRegistry('camunda/zeebe:' + this.CAMUNDA_VERSION),
      },
      elasticSearchProps: {
        cpu: 512,
        memory: 1024,
        securityGroup: this.esSecurityGroup(defaultVpc),
        image: ContainerImage.fromRegistry('docker.elastic.co/elasticsearch/elasticsearch:' + this.ELASTIC_VERSION),
      },
      operateProps: {
        cpu: 256,
        memory: 512,
        securityGroup: this.operateSecurityGroup(defaultVpc),
        image: ContainerImage.fromRegistry('camunda/operate:' + this.CAMUNDA_VERSION),
      },
      taskListProps: {
        cpu: 256,
        memory: 512,
        securityGroup: this.tasklistSecurityGroup(defaultVpc),
        image: ContainerImage.fromRegistry('camunda/tasklist:' + this.CAMUNDA_VERSION),
      },
      useEfsStorage: true,
      ecsCluster: ecsCluster,
      namespace: defaultNs,
      vpc: defaultVpc,
      fileSystem: undefined,
    };

    return {
      ...defaults,
      ...options,
    };
  }

  private camundaCoreFileSystem(defaultVpc: IVpc, sg: ISecurityGroup): FileSystem {
    const efs = new FileSystem(this, 'zeebe-efs', {
      vpc: defaultVpc,
      encrypted: false,
      fileSystemName: 'camunda-core-efs',
      enableAutomaticBackups: false,
      removalPolicy: RemovalPolicy.DESTROY,
      performanceMode: PerformanceMode.GENERAL_PURPOSE,
      vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_NAT },
      securityGroup: sg,
    });

    efs.addAccessPoint('core-zeebe-ap', {
      path: '/broker-data',
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

    efs.addAccessPoint('elasticsearch-ap', {
      path: '/elasticsearch',
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

    return efs;
  }

  private zeebeSecurityGroup(vpc: IVpc): ISecurityGroup {
    let sg = new SecurityGroup(this, 'zeebe-core-sg', {
      vpc: vpc,
      allowAllOutbound: true,
      securityGroupName: 'zeebe-core-sg',
    });
    sg.addIngressRule(Peer.anyIpv4(), Port.tcp(9600), 'Zeebe Ports', false);
    sg.addIngressRule(Peer.anyIpv4(), Port.tcpRange(26500, 26503), 'Zeebe Ports', false);
    sg.addIngressRule(Peer.anyIpv4(), Port.tcp(2049), 'EFS Ports', false);
    return sg;
  }

  private esSecurityGroup(vpc: IVpc): ISecurityGroup {
    let sg = new SecurityGroup(this, 'camunda-platform-simple-sg', {
      vpc: vpc,
      allowAllOutbound: true,
      securityGroupName: 'camunda-platform-simple',
    });
    sg.addIngressRule(Peer.anyIpv4(), Port.tcp(2049), 'EFS Ports', false);
    sg.addIngressRule(Peer.anyIpv4(), Port.tcp(9200), 'Elasticsearch', false);
    sg.addIngressRule(Peer.anyIpv4(), Port.tcp(9300), 'Elasticsearch', false);
    return sg;
  }

  private operateSecurityGroup(vpc: IVpc): ISecurityGroup {
    let sg = new SecurityGroup(this, 'operate-core-sg', {
      vpc: vpc,
      allowAllOutbound: true,
      securityGroupName: 'operate-sg',
    });
    sg.addIngressRule(Peer.anyIpv4(), Port.tcp(8000), 'Operate Http', false);
    return sg;
  }

  private tasklistSecurityGroup(vpc: IVpc): ISecurityGroup {
    let sg = new SecurityGroup(this, 'tasklist-core-sg', {
      vpc: vpc,
      allowAllOutbound: true,
      securityGroupName: 'tasklist-sg',
    });
    sg.addIngressRule(Peer.anyIpv4(), Port.tcp(8080), 'Tasklist Http', false);
    return sg;
  }

  private efsSecurityGroup(vpc: IVpc) {
    let efssg = new SecurityGroup(this, 'efs-core-sg', {
      vpc: vpc,
      allowAllOutbound: true,
      securityGroupName: 'efs-core-sg',
    });

    efssg.addIngressRule(Peer.anyIpv4(), Port.tcp(2049), 'EFS Ports', false);
    return efssg;
  }

  private getCluster(defaultVpc: IVpc): ICluster {
    return new Cluster(this, 'camunda-cluster', {
      clusterName: this.ECS_CLUSTER_NAME,
      vpc: defaultVpc,
    });
  }

  private coreSimpleService(): FargateService {

    let sg = [
      this.props.zeebeProps?.securityGroup!,
      this.props.operateProps?.securityGroup!,
      this.props.elasticSearchProps?.securityGroup!,
      this.props.taskListProps?.securityGroup!,
    ];

    if (this.props.useEfsStorage) {
      sg.push(this.efsSecurity!);
    }

    let fservice = new FargateService(this, 'camunda-platform-simple-service', {
      cluster: this.props.ecsCluster!,
      desiredCount: 1,
      minHealthyPercent: 0,
      maxHealthyPercent: 100,
      serviceName: 'camunda-core-service',
      taskDefinition: this.camundaCoreSimpleTaskDefinition(),
      securityGroups: sg,
      vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_NAT },
      deploymentController: { type: DeploymentControllerType.ECS },
      assignPublicIp: false,
    });

    return fservice;
  }

  private camundaCoreSimpleTaskDefinition(): FargateTaskDefinition {
    let td = new FargateTaskDefinition(this, 'camunda-core-simple', {
      cpu: 1024,
      memoryLimitMiB: 3072,
      family: 'simple-camunda-platform',
    });

    td.addContainer('elasticsearch-container', this.elasticSearchContainer());
    td.addContainer('zeebe-container', this.zeebeContainer());
    td.addContainer('tasklist-container', this.tasklistContainer());
    td.addContainer('operate-container', this.operateContainer());

    if (this.props.useEfsStorage) {
      let efs = this.camundaCoreFileSystem(this.props.vpc!, this.efsSecurity!);

      td.addVolume({
        name: 'simple-core-data-volume',
        efsVolumeConfiguration: {
          fileSystemId: efs.fileSystemId!,
          rootDirectory: '/',
        },
      });
    }

    td.applyRemovalPolicy(RemovalPolicy.DESTROY);
    return td;
  }

  private tasklistContainer() {
    return {
      memoryLimitMiB: 600,
      containerName: 'tasklist',
      image: this.props.taskListProps?.image!,
      essential: true,
      portMappings: [
        { containerPort: 8080, hostPort: 8080, protocol: aws_ecs.Protocol.TCP },
      ],
      environment: {
        SERVER_SERVLET_CONTEXT_PATH: '/tasklist',
        CAMUNDA_TASKLIST_ZEEBE_GATEWAYADDRESS: 'localhost:26500',
        CAMUNDA_TASKLIST_ELASTICSEARCH_URL: 'http://localhost:9200',
        CAMUNDA_TASKLIST_ZEEBEELASTICSEARCH_URL: 'http://localhost:9200',
      },
      logging: LogDriver.awsLogs({
        logGroup: this.logs,
        streamPrefix: 'tasklist',
      }),
    };
  }

  private operateContainer() {
    return {
      memoryLimitMiB: 600,
      containerName: 'operate',
      image: this.props.operateProps?.image!,
      essential: true,
      portMappings: [
        { containerPort: 8000, hostPort: 8000, protocol: aws_ecs.Protocol.TCP },
      ],
      environment: {
        SERVER_SERVLET_CONTEXT_PATH: '/operate',
        CAMUNDA_OPERATE_ZEEBE_GATEWAYADDRESS: 'localhost:26500',
        CAMUNDA_OPERATE_ELASTICSEARCH_URL: 'http://localhost:9200',
        CAMUNDA_OPERATE_ZEEBEELASTICSEARCH_URL: 'http://localhost:9200',
        SERVER_PORT: '8000',
      },
      logging: LogDriver.awsLogs({
        logGroup: this.logs,
        streamPrefix: 'operate',
      }),
    };
  }

  private elasticSearchContainer() {
    return {
      memoryLimitMiB: 1200,
      containerName: 'elasticsearch',
      image: this.props.elasticSearchProps?.image!,
      essential: true,
      portMappings: [
        { containerPort: 9200, hostPort: 9200, protocol: aws_ecs.Protocol.TCP },
        { containerPort: 9300, hostPort: 9300, protocol: aws_ecs.Protocol.TCP },
      ],
      environment: {
        'bootstrap.memory_lock': 'true',
        'discovery.type': 'single-node',
        'xpack.security.enabled': 'false',
        'cluster.routing.allocation.disk.threshold_enabled': 'false',
      },
      logging: LogDriver.awsLogs({
        logGroup: this.logs,
        streamPrefix: 'es',
      }),
    };
  }

  private zeebeContainer() {
    return {
      memoryLimitMiB: 650,
      containerName: 'zeebe',
      image: this.props.zeebeProps?.image!,
      essential: true,
      portMappings: [
        { containerPort: 26500, hostPort: 26500, protocol: aws_ecs.Protocol.TCP },
        { containerPort: 26502, hostPort: 26502, protocol: aws_ecs.Protocol.TCP },
        { containerPort: 26501, hostPort: 26501, protocol: aws_ecs.Protocol.TCP },
        { containerPort: 9600, hostPort: 9600, protocol: aws_ecs.Protocol.TCP },
      ],
      environment: {
        JAVA_TOOL_OPTIONS: '-Xms512m -Xmx512m ',
        ZEEBE_BROKER_EXPORTERS_ELASTICSEARCH_CLASSNAME: 'io.camunda.zeebe.exporter.ElasticsearchExporter',
        ZEEBE_BROKER_EXPORTERS_ELASTICSEARCH_ARGS_URL: 'http://localhost:9200',
        ZEEBE_BROKER_EXPORTERS_ELASTICSEARCH_ARGS_BULK_SIZE: '1',
        ZEEBE_BROKER_DATA_DISKUSAGECOMMANDWATERMARK: '0.998',
        ZEEBE_BROKER_DATA_DISKUSAGEREPLICATIONWATERMARK: '0.999',
      },
      logging: LogDriver.awsLogs({
        logGroup: this.logs,
        streamPrefix: 'zeebe',
      }),
    };
  }
}

