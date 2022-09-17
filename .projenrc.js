const {awscdk, RenovatebotScheduleInterval} = require('projen');

const project = new awscdk.AwsCdkConstructLibrary({
    author: 'Tony Ayres',
    authorAddress: 'tayres@gmail.com',
    description: 'A collection of constructs for deploying the Camunda Zeebe workflow engine and its associated components on AWS infrastructure',
    cdkVersion: '2.39.1',
    defaultReleaseBranch: 'main',
    name: 'zeebe-cdk-constructs',
    repositoryUrl: 'https://github.com/tjayr/zeebe-cdk-constructs.git',
    gitignore: ['.idea'],
    keywords: ['cdk', 'aws-cdk', 'awscdk', 'camunda', 'zeebe'],
    stability: 'experimental',
    majorVersion: '0',
    npmignoreEnabled: true,


    // deps: [],                /* Runtime dependencies of this module. */
    // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
    // devDeps: [],             /* Build dependencies for this module. */
    // packageName: undefined,  /* The "name" in package.json. */

    releaseBranches: 'main',
    releaseToNpm: true,
    releaseWorkflow: true,

    //releaseTrigger: ReleaseTrigger.manual(),

    // publishToMaven: {
    //   javaPackage: 'com.github.tjayr.zeebe',
    //   mavenGroupId: 'com.github.tjayr',
    //   mavenArtifactId: 'zeebe-cdk-constructs',
    // },
    renovatebot: true,
    renovatebotOptions: {
        scheduleInterval: [RenovatebotScheduleInterval.MONTHLY],
    },
    docgen: true,
    dependabot: false,
    buildWorkflow: false,
    githubOptions: {
        pullRequestLintOptions: {
            semanticTitleOptions: {
                types: ['chore', 'feat', 'fix', 'ci', 'docs', 'build', 'style', 'refactor', 'perf', 'test'],
            },
            semanticTitle: true,
        },
    },

});

project.addPackageIgnore('/diagrams');
project.addPackageIgnore('/benchmark');
project.synth();
