# Zeebe CDK Constructs

This is a library of CDK constructs and patterns for deploying the Camunda Zeebe workflow engine on AWS Fargate.

## Standalone

A single Zeebe instance that is configured as both gateway and broker, deployed as Fargate service Deployed in a public
subnet on AWS default VPC EFS file system is mounted for Zeebe storage /usr/data/local

With the default configuration, the following infrastructure will be created on AWS:

* New VPC on CIDR 10.0.0.0/16
* 1 NAT Gateway
* ECS Cluster - zeebe-standalone
* 1 Zeebe gateway/broker n a public subnet (Public IP4)
* Zeebe node is configured as a Fargate task definition and service
* Ephemeral task storage is mounted at /usr/local/zeebe/data (EFS is an option for persistent storage)

```typescript

import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {ZeebeStandaloneFargateCluster} from "zeebe-cdk-constructs";

export class ZeebeStandaloneFargateStack extends cdk.Stack {

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        new ZeebeStandaloneFargateCluster(this, 'ZeebeStandalone', {});
    }
}


```

## Zeebe Cluster

The `ZeebeFargateCluster` will create the following infrastructure on AWS

With the default configuration, the following infrastructure will be created on AWS:

* New VPC on CIDR 10.0.0.0/16
* 1 NAT Gateway
* 3 Zeebe brokers in a private subnet (IP4)
* 1 Zeebe gateway in a public subnet (Public IP4)
* ECS Cluster
* Each Zeebe node is configured as a Fargate service
* Cloud Map for internal DNS _zeebe-cluster.net_
* EFS with mount points for Zeebe data storage

Using the properties object you can customise the VPC settings, ECS cluster, security groups and Zeebe properties

```typescript
import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {ZeebeFargateCluster} from "zeebe-cdk-constructs";


export class ZeebeFargateClusterStack extends cdk.Stack {

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        new ZeebeFargateCluster(this, 'ZeebeCluster', {});
    }
}

```

### Customise Cluster Settings

```typescript
export class ZeebeFargateClusterStack extends cdk.Stack {

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const myCustomVpc = Vpc.fromLookup(this, 'default', {vpcName: 'my-custom-vpc', vpcId: '1234'})

        new ZeebeFargateCluster(this, 'ZeebeCluster', {
            vpc: myCustomVpc,
            publicGateway: false //keep gateway internal, may need a vpn or bastion/jump server for access
        });
    }
}
```

## Camunda Core (experimental - work in progress)

Deploys Zeebe, Camunda Operate, Camunda This construct aims to deploy the equivalent components of the camunda core
docker compose file on AWS Fargate.

* New VPC on CIDR 10.0.0.0/16
* 1 NAT Gateway
* 3 Zeebe brokers in a private subnet
* 1 Zeebe gateway is in a public subnet
* ECS Cluster
* Each Zeebe node is configured as a Fargate service
* Cloud Map for internal DNS _zeebe-cluster.net_
* EFS with mount points for Zeebe data storage

```typescript
export class CamundaCoreStack extends cdk.Stack {

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const myCustomVpc = Vpc.fromLookup(this, 'default', {vpcName: 'my-custom-vpc', vpcId: '1234'})

        new CamundaPlatformCoreFargate(this, 'camunda-core', {
            vpc: myCustomVpc,
            publicGateway: false //keep gateway internal, may need a vpn or bastion/jump server for access
        });
        //loadbalancer url for tasklist and operate will be available as an output
    }
}
```
