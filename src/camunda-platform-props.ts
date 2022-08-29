import { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';
import { ContainerImage, ICluster, PortMapping } from 'aws-cdk-lib/aws-ecs';
import { FileSystem } from 'aws-cdk-lib/aws-efs';
import { INamespace } from 'aws-cdk-lib/aws-servicediscovery';


export interface PlatformBaseProps {

  /**
     * The amount of memory to assign to the task. Must be one of the supported Fargate memory configurations. Defaults to 1024
     */
  readonly memory?: number;

  /**
     * The amount of cpu to assign to the task. Must be one of the supported Fargate memory configurations. Defaults to 512
     */
  readonly cpu?: number;

  /**
     * Override the port mappings of the container. The default port mappings are 26500, 26501, 26502
     */
  readonly portMappings?: Array<PortMapping>;

  /**
     * Environment variables to be passed to components docker container
     */
  readonly environment?: any;

  /**
     * Container image for the component
     */
  readonly image?: ContainerImage;


}

export interface ZeebeProps extends PlatformBaseProps {
  readonly securityGroup?: ISecurityGroup;
}

export interface ElasticsearchProps extends PlatformBaseProps {
  readonly securityGroup?: ISecurityGroup;
}

export interface OperateProps extends PlatformBaseProps {
  readonly securityGroup?: ISecurityGroup;
}

export interface TaskListProps extends PlatformBaseProps {
  readonly securityGroup?: ISecurityGroup;
}

/**
 * Properties for configuraing the CAmunda Core Platform compoennts
 */
export interface CamundaPlatformProps {

  /**
     * Configuration properties for the Zeebe node in the camunda cluster
     */
  zeebeProps?: ZeebeProps;

  /**
     * Configuration properties for the Elasticsearch node in the camunda cluster
     */
  elasticSearchProps?: ElasticsearchProps;

  /**
     * Configuration properties for the Operate node in the camunda cluster
     */
  operateProps?: OperateProps;

  /**
     * Configuration properties for the Tasklist node in the camunda cluster
     */
  taskListProps?: TaskListProps;


  /**
     * If true, store zeebe data on EFS. When false zeebe data is stored on Fargate ephemereal storage and is lost
     * when the service is destroyed. Customise the EFS useing the FileSystem property
     *
     *
     * Default is false
     *
     */
  useEfsStorage?: boolean;

  /**
     * A default EFS will be created if this is not specified
     * Use the fileSystem property to customise a file system
     */
  fileSystem?: FileSystem;


  /**
     * The VPC that the cluster will be created in. If this is not specified, a new VPC will be created on CIDR block 10.0.0.0/16
     * with a public and private subnet and a single NAT gateway.
     */
  readonly vpc?: IVpc;

  /**
     * A CloudMap private name space to be used for service discovery. If not specified a private name space
     * called camunda-cluster.net will be created.
     *
     */
  readonly namespace?: INamespace;

  /**
     * The ECS cluster to create the Zeebe nodes in. If not specified a new ECS cluster will be created called zeebe-cluster.
     *
     */
  readonly ecsCluster?: ICluster;


}
