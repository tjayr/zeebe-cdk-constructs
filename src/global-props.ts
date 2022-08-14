import { ContainerImage } from 'aws-cdk-lib/aws-ecs';

export interface GlobalProps {

  /**
     * Specify a custom container image from a custom registry. The default will be camunda/zeebe:latest from Docker hub
     */
  readonly containerImage?: ContainerImage;

}