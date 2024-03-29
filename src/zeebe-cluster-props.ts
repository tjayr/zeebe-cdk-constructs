import { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';
import { ICluster } from 'aws-cdk-lib/aws-ecs';
import { FileSystem } from 'aws-cdk-lib/aws-efs';
import { INamespace } from 'aws-cdk-lib/aws-servicediscovery';
import { GlobalProps } from './global-props';

export interface ZeebeClusterProps extends GlobalProps {

  /**
     * The amount of memory to assign to the broker task. Must be one of the supported Fargate memory configurations. Defaults to 1024
     */
  readonly memory?: number;

  /**
     * The amount of cpu to assign to the broker task. Must be one of the supported Fargate memory configurations. Defaults to 512
     */
  readonly cpu?: number;

  /**
     * The security groups to assign to the cluster
     *
     */
  readonly securityGroups?: Array<ISecurityGroup>;

  /**
     * The VPC that the cluster will be created in. If not specified a new VPC will be created using CIDR 10.0.0.0/16
     */
  readonly vpc?: IVpc;

  /**
     * A CloudMap private name space to be used for service discover. If not specified a private name space
     * called zeebe-cluster.net will be created.
     *
     */
  readonly namespace?: INamespace;

  /**
     * The ECS cluster to create the Zeebe nodes in. If not specified a new ECS cluster will be created called zeebe-cluster.
     *
     */
  readonly ecsCluster?: ICluster;

  /**
     * The number of Zeebe broker nodes to create in the cluster. Default value is 3
     */
  readonly numBrokerNodes?: number;

  /**
     * The number of Zeebe gateway nodes to create in the cluster. Default value is 1
     */
  readonly numGatewayNodes?: number;

  /**
     * An elastic file system to store Zeebe broker data. If not specified the brokers will use ephemeral Fargate local
     * storage and data will be lost when a node is restarted.
     */
  readonly fileSystem?: FileSystem;

  /**
     * The amount of memory to assign to the gateway task. Must be one of the supported Fargate memory configurations. Defaults to 1024
     */
  readonly gatewayCpu?: number;

  /**
     * The amount of cpu to assign to the gateway task. Must be one of the supported Fargate memory configurations. Defaults to 1024
     */
  readonly gatewayMemory?: number;

  /**
     * Use this property to control the placement of the Zeebe gateway instance in either a public or private subnet within the VPC. If placed in a private subnet, a VPN or SSH tunnel will be needed to connect to the Gateway. Defaults to true.
     */
  readonly publicGateway?: boolean;

}