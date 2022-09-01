import { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';
import { ICluster, PortMapping } from 'aws-cdk-lib/aws-ecs';
import { FileSystem } from 'aws-cdk-lib/aws-efs';
import { INamespace } from 'aws-cdk-lib/aws-servicediscovery';
import { GlobalProps } from './global-props';

export interface ZeebeStandaloneProps extends GlobalProps {


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
  readonly securityGroups?: Array<ISecurityGroup>;

  /**
     * The VPC that the cluster will be created in
     *
     * If not specified, the cluster will be created in the default VPC
     */
  readonly vpc?: IVpc;

  /**
     * If true, then DNS hostnames will be registered in a Cloud Map to allow for service discovery.
     * If this value is true and a namespace is not provided then a default private name space called zeebe-cluster.net will be created.
     *
     * Default is false
     */
  readonly useNamespace?: boolean;

  /**
     * If specifying a custom namespace, also set useNamespace to true
     *
     */
  readonly namespace?: INamespace;

  /**
     * The ECS cluster to create the Zeebe nodes in. If not specified a new ECS cluster will be created called zeebe-cluster.
     *
     */
  readonly ecsCluster?: ICluster;

  /**
     * An elastic file system to store Zeebe broker data. If not specified ephemeral
     * Fargate storage will be used and data will be lost when a node is restarted/destroyed.
     *
     */
  readonly fileSystem?: FileSystem;

  /**
     * Override the port mappings of the container.
     *
     * The default port mappings are 26500, 26501, 26502
     */
  readonly portMappings?: Array<PortMapping>;


  /**
     * Override the environment variables passed to the Zeebe container.
     *
     * If not specified, then the following default environment is passed to the zeebe container
     *
     *  ```ts
     * {
     *  JAVA_TOOL_OPTIONS: '-Xms512m -Xmx512m ',
     *  ATOMIX_LOG_LEVEL: 'DEBUG',
     *  ZEEBE_BROKER_DATA_DISKUSAGECOMMANDWATERMARK: '0.998',
     *  ZEEBE_BROKER_DATA_DISKUSAGEREPLICATIONWATERMARK: '0.999'
     * }
     *
     * ```
     */
  readonly zeebeEnvironmentVars?: any;

  /**
     * Use this property to control the placement of the Zeebe gateway instance in either a public or private subnet within the VPC.
     *
     * If placed in a private subnet, a VPN or SSH tunnel will be needed to connect to the Gateway.
     *
     * Defaults to true.
     */
  readonly publicGateway?: boolean;

  /**
     * Set to true to deploy the simple monitor instance along side the Zeebe instance to allow monitoring of processes.
     *
     * Defaults to false
     */
  readonly simpleMonitor?: boolean;

  /**
     * Set to true to enable hazelcast exporter on the Zeebe image. Note this will build a custom Zeebe image and deploy it onto AWS ECR.
     *
     * Defaults to false
     */
  readonly hazelcastExporter?: boolean;
}
