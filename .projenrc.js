const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Tony Ayres',
  authorAddress: 'tayres@gmail.com',
  cdkVersion: '2.25.0',
  defaultReleaseBranch: 'main',
  name: 'zeebe-cdk-constructs',
  repositoryUrl: 'https://github.com/tjayr/zeebe-cdk-constructs.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
  // publishToMaven: {
  //   javaPackage: 'com.github.tjayr.zeebe',
  //   mavenGroupId: 'com.github.tjayr'
  // }
});
project.synth();
