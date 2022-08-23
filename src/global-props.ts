import { ContainerImage } from 'aws-cdk-lib/aws-ecs';

export interface GlobalProps {

  /**
   * Using this property you can specify a custom container image from a custom registry.
   * Defaults to camunda/zeebe:latest from Docker hub if not set.
   */
  readonly containerImage?: ContainerImage;

}