import { aws_ecs, CfnOutput, Duration, RemovalPolicy } from 'aws-cdk-lib';
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
import {
  ApplicationLoadBalancer,
  ApplicationProtocol,
  ApplicationTargetGroup,
  ListenerAction,
  ListenerCondition,
  Protocol,
  TargetType,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { DnsRecordType, PrivateDnsNamespace } from 'aws-cdk-lib/aws-servicediscovery';
import { Construct } from 'constructs';
import { CamundaPlatformProps } from './camunda-platform-props';

/**
 * A construct pattern to create a Camunda 8 cluster comprising of Zeebe, Operate, Tasklist and Elasticsearch deployed on AWS ECS Fargate with an
 * application loadbalancer allowing http access to Operate and Tasklist.
 *
 */
export class CamundaPlatformCoreFargate extends Construct {

  private CAMUNDA_VERSION: string = 'latest';
  private ELASTIC_VERSION: string = '7.17.0';
  private ECS_CLUSTER_NAME: string = 'camunda-cluster';
  private alb?: ApplicationLoadBalancer;

  private readonly props: CamundaPlatformProps;

  /**
     * A construct pattern to create a Camunda 8 cluster comprising of Zeebe, Operate, Tasklist and Elasticsearch deployed on AWS ECS Fargate with an
     * application loadbalancer allowing http access to Operate and Tasklist.
     *
     */
  constructor(scope: Construct, id: string, properties: CamundaPlatformProps) {
    super(scope, id);
    this.props = this.initProps(properties);

    this.elasticSearchService();
    this.zeebeService();
    this.operateService();
    this.tasklistService();

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
    this.alb = this.createLoadBalancer(defaultVpc);

    const ecsCluster = this.getCluster(defaultVpc);
    const defaultNs = new PrivateDnsNamespace(this, 'camunda-cluster-ns', {
      name: this.ECS_CLUSTER_NAME + '.net',
      description: 'Camunda Cluster Namespace',
      vpc: defaultVpc,
    });
    const defaultFileSystem = this.camundaCoreFileSystem(defaultVpc, this.efsSecurityGroup(defaultVpc));

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
      fileSystem: defaultFileSystem,
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
    let sg = new SecurityGroup(this, 'es-core-sg', {
      vpc: vpc,
      allowAllOutbound: true,
      securityGroupName: 'es-core-sg',
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
    sg.addIngressRule(Peer.anyIpv4(), Port.tcp(8080), 'Operate Http', false);
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

  private createLoadBalancer(vpc: IVpc): ApplicationLoadBalancer {

    const alb = new ApplicationLoadBalancer(this, 'core-alb', { vpc: vpc, internetFacing: true });
    //alb.addListener("tls-listener", {open: true, port: 443, certificates: [cert]});
    alb.addListener('http-listener', { open: true, port: 80, defaultAction: ListenerAction.fixedResponse(404) });


    // use a security group to provide a secure connection between the ALB and the containers
    const albSG = new SecurityGroup(this, 'alb-SG', { vpc: vpc, allowAllOutbound: true });
    albSG.addIngressRule(Peer.anyIpv4(), Port.tcp(443), 'Allow https traffic');
    albSG.addIngressRule(Peer.anyIpv4(), Port.tcp(80), 'Allow http traffic');
    alb.addSecurityGroup(albSG);

    new CfnOutput(this, 'albDNS', { value: alb.loadBalancerDnsName });
    return alb;
  }

  private getCluster(defaultVpc: IVpc): ICluster {
    return new Cluster(this, 'camunda-cluster', {
      clusterName: this.ECS_CLUSTER_NAME,
      vpc: defaultVpc,
    });
  }

  private zeebeService(): FargateService {

    let fservice = new FargateService(this, 'zeebe-service', {
      cluster: this.props.ecsCluster!,
      desiredCount: 1,
      minHealthyPercent: 0,
      maxHealthyPercent: 100,
      serviceName: 'zeebe',
      taskDefinition: this.zeebeTaskDefinition(),
      securityGroups: [this.props.zeebeProps?.securityGroup!],
      vpcSubnets: { subnetType: SubnetType.PUBLIC },
      deploymentController: { type: DeploymentControllerType.ECS },
      cloudMapOptions: {
        name: 'zeebe',
        dnsRecordType: DnsRecordType.A,
        cloudMapNamespace: this.props.namespace,
      },
      assignPublicIp: true,
    });

    return fservice;
  }

  private zeebeTaskDefinition(): FargateTaskDefinition {
    let td = new FargateTaskDefinition(this, 'zeebe-task-def', {
      cpu: this.props.zeebeProps?.cpu! as number,
      memoryLimitMiB: this.props.zeebeProps?.memory! as number,
      family: 'core-zeebe',
    });

    td.addContainer('zeebe', {
      cpu: this.props.zeebeProps?.cpu!,
      memoryLimitMiB: this.props.zeebeProps?.memory!,
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
        ZEEBE_BROKER_EXPORTERS_ELASTICSEARCH_ARGS_URL: 'http://elasticsearch.' + this.props.namespace?.namespaceName + ':9200',
        ZEEBE_BROKER_EXPORTERS_ELASTICSEARCH_ARGS_BULK_SIZE: '1',
        ZEEBE_BROKER_DATA_DISKUSAGECOMMANDWATERMARK: '0.998',
        ZEEBE_BROKER_DATA_DISKUSAGEREPLICATIONWATERMARK: '0.999',
      },
      logging: LogDriver.awsLogs({
        logGroup: new LogGroup(this, 'zeebe-gw-logs', {
          logGroupName: '/ecs/core/zeebe',
          removalPolicy: RemovalPolicy.DESTROY,
          retention: RetentionDays.ONE_MONTH,
        }),
        streamPrefix: 'zeebe',
      }),
    });

    td.applyRemovalPolicy(RemovalPolicy.DESTROY);
    return td;
  }

  private operateService() {

    const targetGroupHttp = new ApplicationTargetGroup(this, 'operate-target-group', {
      targetGroupName: 'core-operate-tg',
      port: 8080,
      vpc: this.props.vpc,
      protocol: ApplicationProtocol.HTTP,
      targetType: TargetType.IP,
      healthCheck: {
        path: '/',
        protocol: Protocol.HTTP,
        healthyHttpCodes: '200-399',
      },
      slowStart: Duration.seconds(90),
      deregistrationDelay: Duration.seconds(30),
    });

    let fservice = new FargateService(this, 'operate-service', {
      cluster: this.props.ecsCluster!,
      desiredCount: 1,
      minHealthyPercent: 0,
      maxHealthyPercent: 100,
      serviceName: 'operate',
      taskDefinition: this.operateTaskDefinition(),
      securityGroups: [this.props.operateProps?.securityGroup!],
      vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_NAT },
      deploymentController: { type: DeploymentControllerType.ECS },
      cloudMapOptions: {
        name: 'operate',
        dnsRecordType: DnsRecordType.A,
        cloudMapNamespace: this.props.namespace,
      },
      assignPublicIp: true,
    });


    this.alb!.listeners[0].addTargetGroups('alb-operate-target-group', {
      conditions: [ListenerCondition.pathPatterns(['/operate*'])],
      priority: 10,
      targetGroups: [targetGroupHttp],
    });


    fservice.attachToApplicationTargetGroup(targetGroupHttp);

    return fservice;
  }

  private operateTaskDefinition() {
    let td = new FargateTaskDefinition(this, 'operate-task-def', {
      cpu: this.props.operateProps?.cpu!,
      memoryLimitMiB: this.props.operateProps?.memory!,
      family: 'core-operate',
    });

    td.addContainer('operate', {
      cpu: this.props.operateProps?.cpu!,
      memoryLimitMiB: this.props.operateProps?.memory!,
      containerName: 'operate',
      image: this.props.operateProps?.image!,
      essential: true,
      portMappings: [
        { containerPort: 8080, hostPort: 8080, protocol: aws_ecs.Protocol.TCP },
      ],
      environment: {
        SERVER_SERVLET_CONTEXT_PATH: '/operate',
        CAMUNDA_OPERATE_ZEEBE_GATEWAYADDRESS: 'zeebe.' + this.props.namespace?.namespaceName + ':26500',
        CAMUNDA_OPERATE_ELASTICSEARCH_URL: 'http://elasticsearch.' + this.props.namespace?.namespaceName + ':9200',
        CAMUNDA_OPERATE_ZEEBEELASTICSEARCH_URL: 'http://elasticsearch.' + this.props.namespace?.namespaceName + ':9200',
      },
      logging: LogDriver.awsLogs({
        logGroup: new LogGroup(this, 'operate-logs', {
          logGroupName: '/ecs/core/operate',
          removalPolicy: RemovalPolicy.DESTROY,
          retention: RetentionDays.ONE_MONTH,
        }),
        streamPrefix: 'operate',
      }),
    });

    td.applyRemovalPolicy(RemovalPolicy.DESTROY);
    return td;
  }

  private elasticsearchTaskDefinition(): FargateTaskDefinition {
    let td = new FargateTaskDefinition(this, 'elasticsearch-task-def', {
      cpu: this.props.elasticSearchProps?.cpu as number,
      memoryLimitMiB: this.props.elasticSearchProps?.memory as number,
      family: 'core-elasticsearch',
    });

    td.addContainer('elasticsearch', {
      cpu: this.props.elasticSearchProps?.cpu as number,
      memoryLimitMiB: this.props.elasticSearchProps?.memory as number,
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
        logGroup: new LogGroup(this, 'elasticsearch-logs', {
          logGroupName: '/ecs/core/elasticsearch',
          removalPolicy: RemovalPolicy.DESTROY,
          retention: RetentionDays.ONE_MONTH,
        }),
        streamPrefix: 'es',
      }),
    });

    td.applyRemovalPolicy(RemovalPolicy.DESTROY);
    return td;
  }

  private elasticSearchService() {
    let fservice = new FargateService(this, 'elasticsearch-service', {
      cluster: this.props.ecsCluster!,
      desiredCount: 1,
      minHealthyPercent: 0,
      maxHealthyPercent: 100,
      serviceName: 'elasticsearch',
      taskDefinition: this.elasticsearchTaskDefinition(),
      securityGroups: [this.props.elasticSearchProps?.securityGroup!],
      vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_NAT },
      deploymentController: { type: DeploymentControllerType.ECS },
      cloudMapOptions: {
        name: 'elasticsearch',
        dnsRecordType: DnsRecordType.A,
        cloudMapNamespace: this.props.namespace,
      },
      assignPublicIp: false,
    });

    return fservice;
  }

  private tasklistService() {

    const targetGroupHttp = new ApplicationTargetGroup(this, 'tasklist-target-group', {
      targetGroupName: 'core-tasklist-tg',
      port: 8080,
      vpc: this.props.vpc,
      protocol: ApplicationProtocol.HTTP,
      targetType: TargetType.IP,
      healthCheck: {
        path: '/',
        protocol: Protocol.HTTP,
        healthyHttpCodes: '200-399',
      },
      deregistrationDelay: Duration.seconds(30),
      slowStart: Duration.seconds(60),
    });

    let fservice = new FargateService(this, 'tasklist-service', {
      cluster: this.props.ecsCluster!,
      desiredCount: 1,
      minHealthyPercent: 0,
      maxHealthyPercent: 100,
      serviceName: 'tasklist',
      taskDefinition: this.tasklistTaskDefinition(),
      securityGroups: [this.props.taskListProps?.securityGroup!],
      vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_NAT },
      deploymentController: { type: DeploymentControllerType.ECS },
      cloudMapOptions: {
        name: 'tasklist',
        dnsRecordType: DnsRecordType.A,
        cloudMapNamespace: this.props.namespace,
      },
      assignPublicIp: false,
    });


    this.alb!.listeners[0].addTargetGroups('alb-tasklist-target-group', {
      targetGroups: [targetGroupHttp],
      priority: 20,
      conditions: [ListenerCondition.pathPatterns(['/tasklist*'])],
    });

    fservice.attachToApplicationTargetGroup(targetGroupHttp);

    return fservice;
  }

  private tasklistTaskDefinition() {

    let td = new FargateTaskDefinition(this, 'tasklist-task-def', {
      cpu: this.props.taskListProps?.cpu!,
      memoryLimitMiB: this.props.taskListProps?.memory!,
      family: 'core-tasklist',
    });

    td.addContainer('tasklist', {
      cpu: this.props.taskListProps?.cpu!,
      memoryLimitMiB: this.props.taskListProps?.memory!,
      containerName: 'tasklist',
      image: this.props.taskListProps?.image!,
      essential: true,
      portMappings: [
        { containerPort: 8080, hostPort: 8080, protocol: aws_ecs.Protocol.TCP },
      ],
      environment: {
        SERVER_SERVLET_CONTEXT_PATH: '/tasklist',
        CAMUNDA_TASKLIST_ZEEBE_GATEWAYADDRESS: 'zeebe.' + this.props.namespace?.namespaceName + ':26500',
        CAMUNDA_TASKLIST_ELASTICSEARCH_URL: 'http://elasticsearch.' + this.props.namespace?.namespaceName + ':9200',
        CAMUNDA_TASKLIST_ZEEBEELASTICSEARCH_URL: 'http://elasticsearch.' + this.props.namespace?.namespaceName + ':9200',
      },
      logging: LogDriver.awsLogs({
        logGroup: new LogGroup(this, 'tasklist-logs', {
          logGroupName: '/ecs/core/tasklist',
          removalPolicy: RemovalPolicy.DESTROY,
          retention: RetentionDays.ONE_MONTH,
        }),
        streamPrefix: 'tl',
      }),
    });

    td.applyRemovalPolicy(RemovalPolicy.DESTROY);
    return td;
  }


}

