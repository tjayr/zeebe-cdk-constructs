import { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';
import { ICluster, PortMapping } from 'aws-cdk-lib/aws-ecs';
import { FileSystem } from 'aws-cdk-lib/aws-efs';
import { INamespace } from 'aws-cdk-lib/aws-servicediscovery';
import { GlobalProps } from './global-props';

export interface SimpleMonitorProps extends GlobalProps {


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
     * An elastic file system to store Zeebe broker data. If not specified the brokers will use ephemeral
     * Fargate local storage and data will be lost when a node is restarted.
     *
     * Default value is 3
     */
  readonly fileSystem?: FileSystem;

  /**
     * Override the port mappings of the container.
     *
     * The default port mappings are 26500, 26501, 26502
     */
  readonly portMappings?: Array<PortMapping>;

  /**
     * Deploy the zeebe instance into a public subnet so that it can be accessed remotely with an ip address
     *
     * The default is true
     */
  readonly usePublicSubnets?: boolean;
}
