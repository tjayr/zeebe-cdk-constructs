# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### ZeebeFargateCluster <a name="ZeebeFargateCluster" id="zeebe-cdk-constructs.ZeebeFargateCluster"></a>

A construct to create a Zeebe cluster on AWS Fargate.

#### Initializers <a name="Initializers" id="zeebe-cdk-constructs.ZeebeFargateCluster.Initializer"></a>

```typescript
import { ZeebeFargateCluster } from 'zeebe-cdk-constructs'

new ZeebeFargateCluster(scope: Construct, id: string, zeebeProperties: ZeebeClusterProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#zeebe-cdk-constructs.ZeebeFargateCluster.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | CDK scope. |
| <code><a href="#zeebe-cdk-constructs.ZeebeFargateCluster.Initializer.parameter.id">id</a></code> | <code>string</code> | CDK id. |
| <code><a href="#zeebe-cdk-constructs.ZeebeFargateCluster.Initializer.parameter.zeebeProperties">zeebeProperties</a></code> | <code><a href="#zeebe-cdk-constructs.ZeebeClusterProps">ZeebeClusterProps</a></code> | Zeebe cluster properties. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="zeebe-cdk-constructs.ZeebeFargateCluster.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

CDK scope.

---

##### `id`<sup>Required</sup> <a name="id" id="zeebe-cdk-constructs.ZeebeFargateCluster.Initializer.parameter.id"></a>

- *Type:* string

CDK id.

---

##### `zeebeProperties`<sup>Required</sup> <a name="zeebeProperties" id="zeebe-cdk-constructs.ZeebeFargateCluster.Initializer.parameter.zeebeProperties"></a>

- *Type:* <a href="#zeebe-cdk-constructs.ZeebeClusterProps">ZeebeClusterProps</a>

Zeebe cluster properties.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#zeebe-cdk-constructs.ZeebeFargateCluster.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="zeebe-cdk-constructs.ZeebeFargateCluster.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#zeebe-cdk-constructs.ZeebeFargateCluster.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="zeebe-cdk-constructs.ZeebeFargateCluster.isConstruct"></a>

```typescript
import { ZeebeFargateCluster } from 'zeebe-cdk-constructs'

ZeebeFargateCluster.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="zeebe-cdk-constructs.ZeebeFargateCluster.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#zeebe-cdk-constructs.ZeebeFargateCluster.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="zeebe-cdk-constructs.ZeebeFargateCluster.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


### ZeebeStandaloneFargateCluster <a name="ZeebeStandaloneFargateCluster" id="zeebe-cdk-constructs.ZeebeStandaloneFargateCluster"></a>

A construct to create a single standalone Zeebe container (gateway and broker) deployed on AWS Fargate.

#### Initializers <a name="Initializers" id="zeebe-cdk-constructs.ZeebeStandaloneFargateCluster.Initializer"></a>

```typescript
import { ZeebeStandaloneFargateCluster } from 'zeebe-cdk-constructs'

new ZeebeStandaloneFargateCluster(scope: Construct, id: string, zeebeProperties: ZeebeStandaloneProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#zeebe-cdk-constructs.ZeebeStandaloneFargateCluster.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#zeebe-cdk-constructs.ZeebeStandaloneFargateCluster.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#zeebe-cdk-constructs.ZeebeStandaloneFargateCluster.Initializer.parameter.zeebeProperties">zeebeProperties</a></code> | <code><a href="#zeebe-cdk-constructs.ZeebeStandaloneProps">ZeebeStandaloneProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="zeebe-cdk-constructs.ZeebeStandaloneFargateCluster.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="zeebe-cdk-constructs.ZeebeStandaloneFargateCluster.Initializer.parameter.id"></a>

- *Type:* string

---

##### `zeebeProperties`<sup>Required</sup> <a name="zeebeProperties" id="zeebe-cdk-constructs.ZeebeStandaloneFargateCluster.Initializer.parameter.zeebeProperties"></a>

- *Type:* <a href="#zeebe-cdk-constructs.ZeebeStandaloneProps">ZeebeStandaloneProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#zeebe-cdk-constructs.ZeebeStandaloneFargateCluster.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="zeebe-cdk-constructs.ZeebeStandaloneFargateCluster.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#zeebe-cdk-constructs.ZeebeStandaloneFargateCluster.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="zeebe-cdk-constructs.ZeebeStandaloneFargateCluster.isConstruct"></a>

```typescript
import { ZeebeStandaloneFargateCluster } from 'zeebe-cdk-constructs'

ZeebeStandaloneFargateCluster.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="zeebe-cdk-constructs.ZeebeStandaloneFargateCluster.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#zeebe-cdk-constructs.ZeebeStandaloneFargateCluster.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="zeebe-cdk-constructs.ZeebeStandaloneFargateCluster.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


## Structs <a name="Structs" id="Structs"></a>

### GlobalProps <a name="GlobalProps" id="zeebe-cdk-constructs.GlobalProps"></a>

#### Initializer <a name="Initializer" id="zeebe-cdk-constructs.GlobalProps.Initializer"></a>

```typescript
import { GlobalProps } from 'zeebe-cdk-constructs'

const globalProps: GlobalProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#zeebe-cdk-constructs.GlobalProps.property.containerImage">containerImage</a></code> | <code>aws-cdk-lib.aws_ecs.ContainerImage</code> | Using this property you can specify a custom container image from a custom registry. |

---

##### `containerImage`<sup>Optional</sup> <a name="containerImage" id="zeebe-cdk-constructs.GlobalProps.property.containerImage"></a>

```typescript
public readonly containerImage: ContainerImage;
```

- *Type:* aws-cdk-lib.aws_ecs.ContainerImage

Using this property you can specify a custom container image from a custom registry.

Defaults to camunda/zeebe:latest from Docker hub if not set.

---

### ZeebeClusterProps <a name="ZeebeClusterProps" id="zeebe-cdk-constructs.ZeebeClusterProps"></a>

#### Initializer <a name="Initializer" id="zeebe-cdk-constructs.ZeebeClusterProps.Initializer"></a>

```typescript
import { ZeebeClusterProps } from 'zeebe-cdk-constructs'

const zeebeClusterProps: ZeebeClusterProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#zeebe-cdk-constructs.ZeebeClusterProps.property.containerImage">containerImage</a></code> | <code>aws-cdk-lib.aws_ecs.ContainerImage</code> | Using this property you can specify a custom container image from a custom registry. |
| <code><a href="#zeebe-cdk-constructs.ZeebeClusterProps.property.cpu">cpu</a></code> | <code>number</code> | The amount of cpu to assign to the broker task. |
| <code><a href="#zeebe-cdk-constructs.ZeebeClusterProps.property.ecsCluster">ecsCluster</a></code> | <code>aws-cdk-lib.aws_ecs.ICluster</code> | The ECS cluster to create the Zeebe nodes in. |
| <code><a href="#zeebe-cdk-constructs.ZeebeClusterProps.property.fileSystem">fileSystem</a></code> | <code>aws-cdk-lib.aws_efs.FileSystem</code> | An elastic file system to store Zeebe broker data. |
| <code><a href="#zeebe-cdk-constructs.ZeebeClusterProps.property.gatewayCpu">gatewayCpu</a></code> | <code>number</code> | The amount of memory to assign to the gateway task. |
| <code><a href="#zeebe-cdk-constructs.ZeebeClusterProps.property.gatewayMemory">gatewayMemory</a></code> | <code>number</code> | The amount of cpu to assign to the gateway task. |
| <code><a href="#zeebe-cdk-constructs.ZeebeClusterProps.property.memory">memory</a></code> | <code>number</code> | The amount of memory to assign to the broker task. |
| <code><a href="#zeebe-cdk-constructs.ZeebeClusterProps.property.namespace">namespace</a></code> | <code>aws-cdk-lib.aws_servicediscovery.INamespace</code> | A CloudMap private name space to be used for service discover. |
| <code><a href="#zeebe-cdk-constructs.ZeebeClusterProps.property.numBrokerNodes">numBrokerNodes</a></code> | <code>number</code> | The number of Zeebe broker nodes to create in the cluster. |
| <code><a href="#zeebe-cdk-constructs.ZeebeClusterProps.property.numGatewayNodes">numGatewayNodes</a></code> | <code>number</code> | The number of Zeebe gateway nodes to create in the cluster. |
| <code><a href="#zeebe-cdk-constructs.ZeebeClusterProps.property.publicGateway">publicGateway</a></code> | <code>boolean</code> | Use this property to control the placement of the Zeebe gateway instance in either a public or private subnet within the VPC. |
| <code><a href="#zeebe-cdk-constructs.ZeebeClusterProps.property.securityGroups">securityGroups</a></code> | <code>aws-cdk-lib.aws_ec2.ISecurityGroup[]</code> | The security groups to assign to the cluster. |
| <code><a href="#zeebe-cdk-constructs.ZeebeClusterProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | The VPC that the cluster will be created in. |

---

##### `containerImage`<sup>Optional</sup> <a name="containerImage" id="zeebe-cdk-constructs.ZeebeClusterProps.property.containerImage"></a>

```typescript
public readonly containerImage: ContainerImage;
```

- *Type:* aws-cdk-lib.aws_ecs.ContainerImage

Using this property you can specify a custom container image from a custom registry.

Defaults to camunda/zeebe:latest from Docker hub if not set.

---

##### `cpu`<sup>Optional</sup> <a name="cpu" id="zeebe-cdk-constructs.ZeebeClusterProps.property.cpu"></a>

```typescript
public readonly cpu: number;
```

- *Type:* number

The amount of cpu to assign to the broker task.

Must be one of the supported Fargate memory configurations. Defaults to 512

---

##### `ecsCluster`<sup>Optional</sup> <a name="ecsCluster" id="zeebe-cdk-constructs.ZeebeClusterProps.property.ecsCluster"></a>

```typescript
public readonly ecsCluster: ICluster;
```

- *Type:* aws-cdk-lib.aws_ecs.ICluster

The ECS cluster to create the Zeebe nodes in.

If not specified a new ECS cluster will be created called zeebe-cluster.

---

##### `fileSystem`<sup>Optional</sup> <a name="fileSystem" id="zeebe-cdk-constructs.ZeebeClusterProps.property.fileSystem"></a>

```typescript
public readonly fileSystem: FileSystem;
```

- *Type:* aws-cdk-lib.aws_efs.FileSystem

An elastic file system to store Zeebe broker data.

If not specified the brokers will use ephemeral Fargate local
storage and data will be lost when a node is restarted.

---

##### `gatewayCpu`<sup>Optional</sup> <a name="gatewayCpu" id="zeebe-cdk-constructs.ZeebeClusterProps.property.gatewayCpu"></a>

```typescript
public readonly gatewayCpu: number;
```

- *Type:* number

The amount of memory to assign to the gateway task.

Must be one of the supported Fargate memory configurations. Defaults to 1024

---

##### `gatewayMemory`<sup>Optional</sup> <a name="gatewayMemory" id="zeebe-cdk-constructs.ZeebeClusterProps.property.gatewayMemory"></a>

```typescript
public readonly gatewayMemory: number;
```

- *Type:* number

The amount of cpu to assign to the gateway task.

Must be one of the supported Fargate memory configurations. Defaults to 1024

---

##### `memory`<sup>Optional</sup> <a name="memory" id="zeebe-cdk-constructs.ZeebeClusterProps.property.memory"></a>

```typescript
public readonly memory: number;
```

- *Type:* number

The amount of memory to assign to the broker task.

Must be one of the supported Fargate memory configurations. Defaults to 1024

---

##### `namespace`<sup>Optional</sup> <a name="namespace" id="zeebe-cdk-constructs.ZeebeClusterProps.property.namespace"></a>

```typescript
public readonly namespace: INamespace;
```

- *Type:* aws-cdk-lib.aws_servicediscovery.INamespace

A CloudMap private name space to be used for service discover.

If not specified a private name space
called zeebe-cluster.net will be created.

---

##### `numBrokerNodes`<sup>Optional</sup> <a name="numBrokerNodes" id="zeebe-cdk-constructs.ZeebeClusterProps.property.numBrokerNodes"></a>

```typescript
public readonly numBrokerNodes: number;
```

- *Type:* number

The number of Zeebe broker nodes to create in the cluster.

Default value is 3

---

##### `numGatewayNodes`<sup>Optional</sup> <a name="numGatewayNodes" id="zeebe-cdk-constructs.ZeebeClusterProps.property.numGatewayNodes"></a>

```typescript
public readonly numGatewayNodes: number;
```

- *Type:* number

The number of Zeebe gateway nodes to create in the cluster.

Default value is 1

---

##### `publicGateway`<sup>Optional</sup> <a name="publicGateway" id="zeebe-cdk-constructs.ZeebeClusterProps.property.publicGateway"></a>

```typescript
public readonly publicGateway: boolean;
```

- *Type:* boolean

Use this property to control the placement of the Zeebe gateway instance in either a public or private subnet within the VPC.

If placed in a private subnet, a VPN or SSH tunnel will be needed to connect to the Gateway. Defaults to true.

---

##### `securityGroups`<sup>Optional</sup> <a name="securityGroups" id="zeebe-cdk-constructs.ZeebeClusterProps.property.securityGroups"></a>

```typescript
public readonly securityGroups: ISecurityGroup[];
```

- *Type:* aws-cdk-lib.aws_ec2.ISecurityGroup[]

The security groups to assign to the cluster.

---

##### `vpc`<sup>Optional</sup> <a name="vpc" id="zeebe-cdk-constructs.ZeebeClusterProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc

The VPC that the cluster will be created in.

If not specified a new VPC will be created using CIDR 10.0.0.0/16

---

### ZeebeStandaloneProps <a name="ZeebeStandaloneProps" id="zeebe-cdk-constructs.ZeebeStandaloneProps"></a>

#### Initializer <a name="Initializer" id="zeebe-cdk-constructs.ZeebeStandaloneProps.Initializer"></a>

```typescript
import { ZeebeStandaloneProps } from 'zeebe-cdk-constructs'

const zeebeStandaloneProps: ZeebeStandaloneProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#zeebe-cdk-constructs.ZeebeStandaloneProps.property.containerImage">containerImage</a></code> | <code>aws-cdk-lib.aws_ecs.ContainerImage</code> | Using this property you can specify a custom container image from a custom registry. |
| <code><a href="#zeebe-cdk-constructs.ZeebeStandaloneProps.property.cpu">cpu</a></code> | <code>number</code> | The amount of cpu to assign to the broker task. |
| <code><a href="#zeebe-cdk-constructs.ZeebeStandaloneProps.property.ecsCluster">ecsCluster</a></code> | <code>aws-cdk-lib.aws_ecs.ICluster</code> | The ECS cluster to create the Zeebe nodes in. |
| <code><a href="#zeebe-cdk-constructs.ZeebeStandaloneProps.property.fileSystem">fileSystem</a></code> | <code>aws-cdk-lib.aws_efs.FileSystem</code> | An elastic file system to store Zeebe broker data. |
| <code><a href="#zeebe-cdk-constructs.ZeebeStandaloneProps.property.hazelcastExporter">hazelcastExporter</a></code> | <code>boolean</code> | Set to true to enable hazelcast exporter on the Zeebe image. |
| <code><a href="#zeebe-cdk-constructs.ZeebeStandaloneProps.property.memory">memory</a></code> | <code>number</code> | The amount of memory to assign to the broker task. |
| <code><a href="#zeebe-cdk-constructs.ZeebeStandaloneProps.property.namespace">namespace</a></code> | <code>aws-cdk-lib.aws_servicediscovery.INamespace</code> | If specifying a custom namespace, also set useNamespace to true. |
| <code><a href="#zeebe-cdk-constructs.ZeebeStandaloneProps.property.portMappings">portMappings</a></code> | <code>aws-cdk-lib.aws_ecs.PortMapping[]</code> | Override the port mappings of the container. |
| <code><a href="#zeebe-cdk-constructs.ZeebeStandaloneProps.property.publicGateway">publicGateway</a></code> | <code>boolean</code> | Use this property to control the placement of the Zeebe gateway instance in either a public or private subnet within the VPC. |
| <code><a href="#zeebe-cdk-constructs.ZeebeStandaloneProps.property.securityGroups">securityGroups</a></code> | <code>aws-cdk-lib.aws_ec2.ISecurityGroup[]</code> | The security groups to assign to the cluster. |
| <code><a href="#zeebe-cdk-constructs.ZeebeStandaloneProps.property.simpleMonitor">simpleMonitor</a></code> | <code>boolean</code> | Set to true to deploy the simple monitor instance along side the Zeebe instance to allow monitoring of processes. |
| <code><a href="#zeebe-cdk-constructs.ZeebeStandaloneProps.property.useNamespace">useNamespace</a></code> | <code>boolean</code> | If true, then DNS hostnames will be registered in a Cloud Map to allow for service discovery. |
| <code><a href="#zeebe-cdk-constructs.ZeebeStandaloneProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | The VPC that the cluster will be created in. |
| <code><a href="#zeebe-cdk-constructs.ZeebeStandaloneProps.property.zeebeEnvironmentVars">zeebeEnvironmentVars</a></code> | <code>any</code> | Override the environment variables passed to the Zeebe container. |

---

##### `containerImage`<sup>Optional</sup> <a name="containerImage" id="zeebe-cdk-constructs.ZeebeStandaloneProps.property.containerImage"></a>

```typescript
public readonly containerImage: ContainerImage;
```

- *Type:* aws-cdk-lib.aws_ecs.ContainerImage

Using this property you can specify a custom container image from a custom registry.

Defaults to camunda/zeebe:latest from Docker hub if not set.

---

##### `cpu`<sup>Optional</sup> <a name="cpu" id="zeebe-cdk-constructs.ZeebeStandaloneProps.property.cpu"></a>

```typescript
public readonly cpu: number;
```

- *Type:* number

The amount of cpu to assign to the broker task.

Must be one of the supported Fargate memory configurations. Defaults to 512

---

##### `ecsCluster`<sup>Optional</sup> <a name="ecsCluster" id="zeebe-cdk-constructs.ZeebeStandaloneProps.property.ecsCluster"></a>

```typescript
public readonly ecsCluster: ICluster;
```

- *Type:* aws-cdk-lib.aws_ecs.ICluster

The ECS cluster to create the Zeebe nodes in.

If not specified a new ECS cluster will be created called zeebe-cluster.

---

##### `fileSystem`<sup>Optional</sup> <a name="fileSystem" id="zeebe-cdk-constructs.ZeebeStandaloneProps.property.fileSystem"></a>

```typescript
public readonly fileSystem: FileSystem;
```

- *Type:* aws-cdk-lib.aws_efs.FileSystem

An elastic file system to store Zeebe broker data.

If not specified ephemeral
Fargate storage will be used and data will be lost when a node is restarted/destroyed.

---

##### `hazelcastExporter`<sup>Optional</sup> <a name="hazelcastExporter" id="zeebe-cdk-constructs.ZeebeStandaloneProps.property.hazelcastExporter"></a>

```typescript
public readonly hazelcastExporter: boolean;
```

- *Type:* boolean

Set to true to enable hazelcast exporter on the Zeebe image.

Note this will build a custom Zeebe image and deploy it onto AWS ECR.

Defaults to false

---

##### `memory`<sup>Optional</sup> <a name="memory" id="zeebe-cdk-constructs.ZeebeStandaloneProps.property.memory"></a>

```typescript
public readonly memory: number;
```

- *Type:* number

The amount of memory to assign to the broker task.

Must be one of the supported Fargate memory configurations. Defaults to 1024

---

##### `namespace`<sup>Optional</sup> <a name="namespace" id="zeebe-cdk-constructs.ZeebeStandaloneProps.property.namespace"></a>

```typescript
public readonly namespace: INamespace;
```

- *Type:* aws-cdk-lib.aws_servicediscovery.INamespace

If specifying a custom namespace, also set useNamespace to true.

---

##### `portMappings`<sup>Optional</sup> <a name="portMappings" id="zeebe-cdk-constructs.ZeebeStandaloneProps.property.portMappings"></a>

```typescript
public readonly portMappings: PortMapping[];
```

- *Type:* aws-cdk-lib.aws_ecs.PortMapping[]

Override the port mappings of the container.

The default port mappings are 26500, 26501, 26502

---

##### `publicGateway`<sup>Optional</sup> <a name="publicGateway" id="zeebe-cdk-constructs.ZeebeStandaloneProps.property.publicGateway"></a>

```typescript
public readonly publicGateway: boolean;
```

- *Type:* boolean

Use this property to control the placement of the Zeebe gateway instance in either a public or private subnet within the VPC.

If placed in a private subnet, a VPN or SSH tunnel will be needed to connect to the Gateway.

Defaults to true.

---

##### `securityGroups`<sup>Optional</sup> <a name="securityGroups" id="zeebe-cdk-constructs.ZeebeStandaloneProps.property.securityGroups"></a>

```typescript
public readonly securityGroups: ISecurityGroup[];
```

- *Type:* aws-cdk-lib.aws_ec2.ISecurityGroup[]

The security groups to assign to the cluster.

---

##### `simpleMonitor`<sup>Optional</sup> <a name="simpleMonitor" id="zeebe-cdk-constructs.ZeebeStandaloneProps.property.simpleMonitor"></a>

```typescript
public readonly simpleMonitor: boolean;
```

- *Type:* boolean

Set to true to deploy the simple monitor instance along side the Zeebe instance to allow monitoring of processes.

Defaults to false

---

##### `useNamespace`<sup>Optional</sup> <a name="useNamespace" id="zeebe-cdk-constructs.ZeebeStandaloneProps.property.useNamespace"></a>

```typescript
public readonly useNamespace: boolean;
```

- *Type:* boolean

If true, then DNS hostnames will be registered in a Cloud Map to allow for service discovery.

If this value is true and a namespace is not provided then a default private name space called zeebe-cluster.net will be created.

Default is false

---

##### `vpc`<sup>Optional</sup> <a name="vpc" id="zeebe-cdk-constructs.ZeebeStandaloneProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc

The VPC that the cluster will be created in.

If not specified, the cluster will be created in the default VPC

---

##### `zeebeEnvironmentVars`<sup>Optional</sup> <a name="zeebeEnvironmentVars" id="zeebe-cdk-constructs.ZeebeStandaloneProps.property.zeebeEnvironmentVars"></a>

```typescript
public readonly zeebeEnvironmentVars: any;
```

- *Type:* any

Override the environment variables passed to the Zeebe container.

If not specified, then the following default environment is passed to the zeebe container

  ```ts
{
  JAVA_TOOL_OPTIONS: '-Xms512m -Xmx512m ',
  ATOMIX_LOG_LEVEL: 'DEBUG',
  ZEEBE_BROKER_DATA_DISKUSAGECOMMANDWATERMARK: '0.998',
  ZEEBE_BROKER_DATA_DISKUSAGEREPLICATIONWATERMARK: '0.999'
}

```

---



