const { awscdk, Renovatebot} = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Tony Ayres',
  authorAddress: 'tayres@gmail.com',
  cdkVersion: '2.28.0',
  defaultReleaseBranch: 'main',
  name: 'zeebe-cdk-constructs',
  repositoryUrl: 'https://github.com/tjayr/zeebe-cdk-constructs.git',
  gitignore: ['.idea'],


  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
  publishToMaven: {
    javaPackage: 'com.github.tjayr.zeebe',
    mavenGroupId: 'com.github.tjayr',
    mavenArtifactId: 'zeebe-cdk-constructs',
  },
  renovatebotOptions: {
    scheduleInterval: ['before 3am on the first day of the month'],
  }
});

project.synth();
