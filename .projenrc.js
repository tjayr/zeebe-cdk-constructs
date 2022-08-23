const { awscdk, RenovatebotScheduleInterval } = require('projen');

const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Tony Ayres',
  authorAddress: 'tayres@gmail.com',
  cdkVersion: '2.37.1',
  defaultReleaseBranch: 'main',
  name: 'zeebe-cdk-constructs',
  repositoryUrl: 'https://github.com/tjayr/zeebe-cdk-constructs.git',
  gitignore: ['.idea'],
  keywords: ['cdk', 'aws-cdk', 'awscdk', 'camunda', 'zeebe'],
  //stability: 'experimental',

  //packageManager: NodePackageManager.NPM,

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
  publishToMaven: {
    javaPackage: 'com.github.tjayr.zeebe',
    mavenGroupId: 'com.github.tjayr',
    mavenArtifactId: 'zeebe-cdk-constructs',
  },
  renovatebot: true,
  renovatebotOptions: {
    scheduleInterval: [RenovatebotScheduleInterval.WEEKENDS],
  }, //,
  //docgen: true
  dependabot: false,
  release: false,
  buildWorkflow: false,
});


project.synth();
